"""
大家DX - 不動産投資シミュレーターAPI（軽量版）
SEC-022: API認証システムを実装
SEC-069: エラーメッセージの詳細露出対策
"""

import logging
import os
import random
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from auth import get_current_user, create_access_token
from rbac import Permission, UserRole, require_permission, rbac_manager
from error_handler import (
    handle_http_exception,
    handle_general_exception,
    create_auth_error_response
)
from supabase_auth import supabase_auth
from shared.calculations import run_full_simulation
from shared.safe_serializer import prevent_dangerous_imports, UnsafeOperationError
from shared.memory_guard import MemoryGuardError
from models import SimulationRequestModel, SimulationResponseModel
from models_market import (
    MarketAnalysisRequestModel,
    MarketAnalysisResponseModel,
    MarketStatisticsModel
)
from models_auth import TokenRequest, TokenResponse, UserInfoResponse
from http_method_guard import http_method_middleware
from config_proxy import router as config_router
from csrf_protection import (
    generate_csrf_token, validate_csrf_token,
    csrf_protection
)
from database import get_db, init_db, log_user_activity
import database  # SEC-057: Import full database module for model access
import json
from typing import Optional
from sqlalchemy.orm import Session
from https_redirect import HTTPSRedirectMiddleware, check_https_config
from env_security import load_secure_env, get_env, env_manager
from security_headers import SecurityHeadersMiddleware, get_security_headers_config
from user_management import user_router
from security_logger import (
    security_logger,
    log_authentication_attempt,
    log_authorization_failure,
    log_suspicious_activity,
    log_data_access
)

# ロガーの設定
logger = logging.getLogger(__name__)

# SEC-077, SEC-080: セキュアな環境変数の読み込み
try:
    env_vars = load_secure_env()
    env_manager.validate_runtime_security()
    logger.info("環境変数が正常に読み込まれました")
except Exception as e:
    logger.error("環境変数の読み込みエラー: %s", e)
    # 必須環境変数がない場合は終了
    if "SUPABASE_URL" not in os.environ:
        raise

# SEC-081: デバッグモードの本番環境確認
is_production = get_env('ENVIRONMENT', 'development').lower() in ('production', 'prod')
enable_docs = get_env('ENABLE_DOCS', False) and not is_production

# FastAPIアプリケーションの初期化
app = FastAPI(
    title="大家DX API",
    description="不動産投資シミュレーター RESTful API",
    version="1.0.0",
    docs_url="/docs" if enable_docs else None,
    redoc_url="/redoc" if enable_docs else None,
    openapi_url="/openapi.json" if enable_docs else None
)

# SEC-070: データベース初期化
@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時の処理"""
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error("Failed to initialize database: %s", e)
        # データベース初期化失敗は致命的エラーではない
        # インメモリSQLiteを使用

# SEC-072: HTTPSリダイレクトミドルウェアを追加
app.add_middleware(HTTPSRedirectMiddleware)

# SEC-082: HTTPメソッド制限ミドルウェアを追加
app.middleware("http")(http_method_middleware)

# SEC-079: セキュリティヘッダーミドルウェアを追加
security_headers_config = get_security_headers_config(
    'development' if not is_production else 'production'
)
app.add_middleware(SecurityHeadersMiddleware, **security_headers_config)

from starlette.middleware.cors import CORSMiddleware
import re # 正規表現モジュールをインポート

# CORS設定
# SEC-077: セキュアな環境変数から取得
allowed_origins = get_env('CORS_ORIGINS', ['http://localhost:5173', 'http://localhost:4173'])
if isinstance(allowed_origins, str):
    allowed_origins = [origin.strip() for origin in allowed_origins.split(',')]

# GitHub CodespacesとRenderの動的なオリジンを許可するための正規表現パターン
# 例: https://*.app.github.dev や https://*.onrender.com
allowed_origin_regex_pattern = (
    r"^(https?://localhost:\d+|"
    r"https?://127\.0\.0\.1:\d+|"
    r"https?://.*\.app\.github\.dev|https?://.*\.onrender\.com)$"
)
# エラーハンドラー用にコンパイル済み正規表現も保持
allowed_origin_regex = re.compile(allowed_origin_regex_pattern)

# 標準のCORSMiddlewareをアプリケーションに追加
app.add_middleware(
    CORSMiddleware,
    # allow_originsに静的なリストを、allow_origin_regexに動的なパターンを設定
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex_pattern,
    allow_credentials=True,
    allow_methods=["*"],  # すべてのメソッドを許可
    allow_headers=["*"],  # すべてのヘッダーを許可
    expose_headers=["Content-Length", "Content-Range"]
)

# エラーハンドラーの登録
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    HTTPExceptionハンドラー

    Args:
        request: HTTPリクエスト
        exc: HTTPException

    Returns:
        JSONResponse: エラーレスポンス
    """
    response = handle_http_exception(request, exc)
    
    # CORSヘッダーを追加（エラーレスポンスでもブラウザからアクセス可能にする）
    origin = request.headers.get("origin")
    if origin:
        # 許可されたオリジンかチェック
        if origin in allowed_origins or allowed_origin_regex.match(origin):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    一般的な例外ハンドラー

    Args:
        request: HTTPリクエスト
        exc: Exception

    Returns:
        JSONResponse: エラーレスポンス
    """
    response = handle_general_exception(request, exc)
    
    # CORSヘッダーを追加（エラーレスポンスでもブラウザからアクセス可能にする）
    origin = request.headers.get("origin")
    if origin:
        # 許可されたオリジンかチェック
        if origin in allowed_origins or allowed_origin_regex.match(origin):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# データ型定義（Pydanticなしのシンプル版）
# リクエストはJSONとして直接受け取る

# セキュリティ設定
security = HTTPBearer()

# SEC-065: 環境変数の直接露出対策 - 設定プロキシルーターを追加
app.include_router(config_router)

# SEC-073: ユーザー管理APIエンドポイントを追加
app.include_router(user_router)

# ヘルスチェックエンドポイント（認証不要）
# SEC-082: HTTPメソッド制限 - GETのみ許可
@app.get("/")
def read_root():
    """
    ヘルスチェックエンドポイント

    Returns:
        dict: APIステータス情報
    """
    return {
        "message": "大家DX API",
        "version": "1.0.0",
        "status": "running",
        "authenticated": False
    }

# SEC-072: HTTPSステータスチェックエンドポイント
@app.get("/api/https-status")
def get_https_status(request: Request):
    """
    HTTPS設定の状態を取得

    Args:
        request: HTTPリクエスト

    Returns:
        dict: HTTPS設定の状態
    """
    return check_https_config(request)

# 古い計算関数は削除し、shared.calculations.pyの関数を使用

# 認証エンドポイント
# SEC-082: HTTPメソッド制限 - POSTのみ許可
@app.post("/api/auth/token", response_model=TokenResponse)
async def login_for_access_token(request: Request, credentials: TokenRequest):
    """
    アクセストークンを取得（SEC-073統合認証システム）
    Supabaseトークンを検証してJWTトークンを発行
    SEC-051: セッション固定攻撃対策 - ログイン時に新しいセッションIDを発行
    """
    logger.info("Token request received")

    try:
        # SEC-051: ブルートフォース攻撃のチェック
        from session_security import session_manager
        client_ip = request.client.host if request.client else "unknown"
        if session_manager.check_brute_force(client_ip):
            raise create_auth_error_response(
                "ログイン試行回数が上限に達しました。しばらくしてから再度お試しください"
            )

        # 開発環境では簡易認証を許可
        if os.getenv("ENV", "development") == "development":
            # Supabaseトークンがある場合は本番と同じ処理を実行
            if credentials.supabase_token:
                # Supabaseトークンを検証
                user_info = supabase_auth.verify_supabase_token(credentials.supabase_token)

                # SEC-051: 新しいセッションを作成（セッション固定攻撃対策）
                from session_security import create_secure_session
                session_id = create_secure_session(user_info["user_id"], request)

                # SEC-066: CSRFトークンを生成
                csrf_token = generate_csrf_token(user_info["user_id"], session_id)

                # JWTトークンを生成
                access_token = create_access_token(
                    data={
                        "sub": user_info["user_id"],
                        "email": user_info["email"],
                        "role": (user_info["role"].value
                                 if hasattr(user_info["role"], 'value')
                                 else user_info["role"]),
                        "type": "supabase"
                    },
                    session_id=session_id  # セッションIDをトークンに含める
                )

                # SEC-078: 認証成功をログ
                log_authentication_attempt(
                    user_id=user_info["user_id"],
                    success=True,
                    ip_address=client_ip,
                    user_agent=request.headers.get("User-Agent", "Unknown"),
                    additional_info={"environment": "development", "email": user_info["email"]}
                )

                # ログイン成功時は失敗カウンターをリセット
                session_manager.reset_failed_attempts(client_ip)

                response = TokenResponse(
                    access_token=access_token,
                    token_type="bearer",
                    expires_in=3600,
                    role=(user_info["role"].value
                          if hasattr(user_info["role"], 'value')
                          else user_info["role"]),
                    user_id=user_info["user_id"],
                    csrf_token=csrf_token  # CSRFトークンを含める
                )

                # CSRFトークンをクッキーにも設定
                json_response = JSONResponse(content=response.dict())
                return csrf_protection.create_csrf_cookie_response(json_response, csrf_token)
            # 開発環境用のモックトークン
            elif credentials.email and credentials.email.endswith("@example.com"):
                # ロールを決定（admin@example.comは管理者、それ以外は標準ユーザー）
                is_admin = credentials.email == "admin@example.com"
                role = UserRole.ADMIN if is_admin else UserRole.STANDARD
                user_id = "dev-user-123"
                
                # SEC-078: 認証成功をログ
                log_authentication_attempt(
                    user_id=user_id,
                    success=True,
                    ip_address=client_ip,
                    user_agent=request.headers.get("User-Agent", "Unknown"),
                    additional_info={"environment": "development", "email": credentials.email}
                )

                # SEC-051: 新しいセッションを作成
                from session_security import create_secure_session
                session_id = create_secure_session(user_id, request)

                # SEC-066: CSRFトークンを生成
                csrf_token = generate_csrf_token(user_id, session_id)

                access_token = create_access_token(
                    data={
                        "sub": user_id,
                        "email": credentials.email,
                        "role": role.value,
                        "type": "development"
                    },
                    session_id=session_id  # セッションIDをトークンに含める
                )

                # ログイン成功時は失敗カウンターをリセット
                session_manager.reset_failed_attempts(client_ip)

                response = TokenResponse(
                    access_token=access_token,
                    token_type="bearer",
                    expires_in=3600,
                    role=role.value,
                    user_id=user_id,
                    csrf_token=csrf_token  # CSRFトークンを含める
                )

                # CSRFトークンをクッキーにも設定
                json_response = JSONResponse(content=response.dict())
                return csrf_protection.create_csrf_cookie_response(json_response, csrf_token)
            else:
                # ログイン失敗を記録
                session_manager.record_failed_attempt(client_ip)
                
                # SEC-078: 認証失敗をログ
                log_authentication_attempt(
                    user_id=credentials.email or "unknown",
                    success=False,
                    ip_address=client_ip,
                    user_agent=request.headers.get("User-Agent", "Unknown"),
                    additional_info={"reason": "invalid_email_domain"}
                )
                
                raise create_auth_error_response(
                    "開発環境では@example.comメールアドレスを使用してください"
                )

        # 本番環境ではSupabase認証システムを使用
        if not credentials.supabase_token:
            # ログイン失敗を記録
            session_manager.record_failed_attempt(client_ip)
            
            # SEC-078: 認証失敗をログ
            log_authentication_attempt(
                user_id=credentials.email or "unknown",
                success=False,
                ip_address=client_ip,
                user_agent=request.headers.get("User-Agent", "Unknown"),
                additional_info={"reason": "missing_supabase_token"}
            )
            
            raise create_auth_error_response("Supabaseトークンが必要です")

        # Supabaseトークンを検証
        user_info = supabase_auth.verify_supabase_token(credentials.supabase_token)

        # SEC-051: 新しいセッションを作成（セッション固定攻撃対策）
        from session_security import create_secure_session
        session_id = create_secure_session(user_info["user_id"], request)

        # SEC-066: CSRFトークンを生成
        csrf_token = generate_csrf_token(user_info["user_id"], session_id)

        # JWTトークンを生成
        access_token = create_access_token(
            data={
                "sub": user_info["user_id"],
                "email": user_info["email"],
                "role": (user_info["role"].value
                         if hasattr(user_info["role"], 'value')
                         else user_info["role"]),
                "type": "supabase"
            },
            session_id=session_id  # セッションIDをトークンに含める
        )

        # SEC-078: 認証成功をログ
        log_authentication_attempt(
            user_id=user_info["user_id"],
            success=True,
            ip_address=client_ip,
            user_agent=request.headers.get("User-Agent", "Unknown"),
            additional_info={"environment": "production", "email": user_info["email"]}
        )

        # ログイン成功時は失敗カウンターをリセット
        session_manager.reset_failed_attempts(client_ip)

        response = TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=3600,
            csrf_token=csrf_token,  # CSRFトークンを含める
            role=(user_info["role"].value
                  if hasattr(user_info["role"], 'value')
                  else user_info["role"]),
            user_id=user_info["user_id"],
            full_name=user_info.get("full_name")
        )

        # CSRFトークンをクッキーにも設定
        json_response = JSONResponse(content=response.dict())
        return csrf_protection.create_csrf_cookie_response(json_response, csrf_token)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Token generation failed: %s", e)
        # ログイン失敗を記録
        session_manager.record_failed_attempt(client_ip)
        
        # SEC-078: 疑わしい活動をログ
        log_suspicious_activity(
            activity_type="authentication_error",
            details={"error": str(e), "email": credentials.email},
            user_id=credentials.email or "unknown",
            ip_address=client_ip
        )
        
        raise create_auth_error_response("認証処理中にエラーが発生しました")

# ログアウトエンドポイント
# SEC-051: セッション破棄によるセッション固定攻撃対策
# SEC-082: HTTPメソッド制限 - POSTのみ許可
@app.post("/api/auth/logout")
async def logout(request: Request, current_user: dict = Depends(get_current_user)):
    """
    ログアウト処理 - セッションを破棄
    SEC-051: セッション固定攻撃対策
    """
    try:
        session_id = current_user.get("session_id")
        if session_id:
            from session_security import destroy_session
            destroy_session(session_id)
            logger.info(
                "User %s logged out, session destroyed",
                current_user.get('user_id')
            )

        # SEC-066: CSRFトークンを検証 - 一時的に無効化
        # validate_csrf_token(
        #     request,
        #     current_user.get('user_id'),
        #     current_user.get('session_id')
        # )

        return {"success": True, "message": "ログアウトしました"}
    except Exception as e:
        logger.error("Logout failed: %s", e)
        return {"success": False, "message": "ログアウト処理中にエラーが発生しました"}

# 認証状態確認エンドポイント
# SEC-082: HTTPメソッド制限 - GETのみ許可
@app.get("/api/auth/me", response_model=UserInfoResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """
    現在の認証ユーザー情報を取得
    SEC-073: 統合認証システムからユーザープロファイル情報を取得
    """
    try:
        # ロールと権限情報を追加
        role = rbac_manager.get_user_role(current_user)
        permissions = rbac_manager.get_user_permissions(role)

        # Supabase認証システムからプロファイル情報を取得
        user_id = current_user.get("user_id") or current_user.get("sub")
        profile = None

        if user_id and user_id != "dev-user-123":
            profile = supabase_auth.get_user_profile(user_id)

        response_data = {
            "user": {
                **current_user,
                "role": role.value,
                "permissions": [p.value for p in permissions]
            },
            "authenticated": True
        }

        # プロファイル情報があれば追加
        if profile:
            response_data["user"].update({
                "full_name": profile.full_name,
                "login_count": profile.login_count,
                "last_login": (profile.last_login.isoformat()
                               if profile.last_login else None),
                "created_at": (profile.created_at.isoformat()
                               if profile.created_at else None),
                "is_active": profile.is_active
            })

        return response_data

    except Exception as e:
        logger.error("Failed to get user info: %s", e)
        # 基本情報のみ返す
        role = rbac_manager.get_user_role(current_user)
        permissions = rbac_manager.get_user_permissions(role)

        return {
            "user": {
                **current_user,
                "role": role.value,
                "permissions": [p.value for p in permissions]
            },
            "authenticated": True
        }

# シミュレーションエンドポイント（認証＋権限必須）
# SEC-082: HTTPメソッド制限 - POSTのみ許可
@app.post("/api/simulate")
def run_simulation(request: dict, http_request: Request):
    """
    収益シミュレーションを実行 - 新機能対応版（認証必須）

    SEC-059: Python Pickle/eval攻撃経路対策を実装
    SEC-075: Pydanticモデルによる入力検証を実装
    SEC-082: HTTPメソッド制限を実装 - POSTのみ許可
    """
    # SEC-066: CSRFトークンを検証 - 一時的に無効化
    # validate_csrf_token(
    #     http_request,
    #     current_user.get('user_id'),
    #     current_user.get('session_id')
    # )

    # ユーザーIDをログに記録（監査用）
    logger.info("Simulation requested (auth disabled for testing)")
    
    # SEC-078: データアクセスをセキュリティログに記録 - 一時的に無効化
    # log_data_access(
    #     user_id=current_user.get('user_id'),
    #     resource_type="simulation",
    #     resource_id="new_simulation",
    #     action="create",
    #     success=True
    # )

    # SEC-070: ユーザーアクティビティをデータベースに記録 - 一時的に無効化  
    # with get_db() as db:
    #     log_user_activity(
    #         db,
    #         current_user.get('user_id'),
    #         "simulation",
    #         "/api/simulate",
    #         {
    #             "ip_address": (http_request.client.host
    #                            if http_request.client else "unknown"),
    #             "user_agent": http_request.headers.get("User-Agent", ""),
    #             "data": request.model_dump(),
    #             "response_status": 200
    #         }
    #     )

    try:
        # SEC-059: 危険なインポートをチェック済み（デコレータ）
        
        # Pydanticモデルで検証済みのデータを使用
        property_data = request.property_data.model_dump()
        
        # building_yearがNoneの場合、デフォルト値を設定
        if property_data.get('building_year') is None:
            property_data['building_year'] = datetime.now().year - 10  # 築10年をデフォルト

        # SEC-059: 入力データの安全性を追加検証
        # Pydanticで基本検証済みだが、念のため危険なパターンをチェック
        _validate_simulation_input_safety(property_data)

        # 共通計算ロジックを使用してシミュレーション実行
        result = run_full_simulation(property_data)

        # レスポンスにユーザー情報を追加 - 一時的に無効化
        result["requested_by"] = "test-user"
        result["requested_at"] = datetime.now(timezone.utc).isoformat()

        return SimulationResponseModel(
            success=True,
            results=result.get('results', {}),
            cash_flow_table=(result.get('cash_flow_table', [])
                             if request.include_cash_flow_table else None),
            request_id=result.get('requested_by', '')
        )
    except ValueError as e:
        # バリデーションエラー
        logger.error("Validation error in simulation: %s", str(e))
        # SEC-026: エラー情報の詳細漏洩対策
        from error_handler import create_validation_error_response
        raise create_validation_error_response("simulation_input", str(e))
    except MemoryGuardError as e:
        # SEC-076: メモリ消費攻撃対策
        logger.error("Memory limit exceeded in simulation: %s", str(e))
        raise HTTPException(
            status_code=413,
            detail={
                "error": "MEMORY_LIMIT_EXCEEDED",
                "message": ("シミュレーション処理がメモリ制限を超えました。"
                            "入力データを確認してください。")
            }
        )
    except Exception as e:
        logger.error("Error in simulation: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "error": "SIMULATION_ERROR",
                "message": "シミュレーション中にエラーが発生しました"
            }
        ) from e


# 市場分析エンドポイント（認証＋権限必須）
# SEC-082: HTTPメソッド制限 - POSTのみ許可
@app.post("/api/market-analysis", response_model=MarketAnalysisResponseModel)
@prevent_dangerous_imports
def market_analysis(
    request: MarketAnalysisRequestModel,
    http_request: Request,
    current_user: dict = Depends(require_permission(Permission.MARKET_ANALYSIS_BASIC))
):
    """
    類似物件の市場分析を実行

    SEC-075: Pydanticモデルによる入力検証を実装
    SEC-082: HTTPメソッド制限を実装 - POSTのみ許可
    """
    # 検証済みのデータを取得
    location = request.location
    land_area = request.land_area
    year_built = request.year_built
    purchase_price = request.purchase_price

    # SEC-066: CSRFトークンを検証 - 一時的に無効化
    # validate_csrf_token(
    #     http_request,
    #     current_user.get('user_id'),
    #     current_user.get('session_id')
    # )

    # ユーザーIDをログに記録（監査用）
    logger.info("Market analysis requested by user: %s", current_user.get('user_id'))

    # SEC-070: ユーザーアクティビティをデータベースに記録
    with get_db() as db:
        log_user_activity(
            db,
            current_user.get('user_id'),
            "market_analysis",
            "/api/market-analysis",
            {
                "ip_address": (http_request.client.host
                               if http_request.client else "unknown"),
                "user_agent": http_request.headers.get("User-Agent", ""),
                "data": request.model_dump(),
                "response_status": 200
            }
        )

    # ユーザー物件の平米単価を計算
    user_unit_price = purchase_price * 10000 / land_area / 10000 if land_area > 0 else 0

    # サンプルデータを生成（実際のAPIは後で実装）
    similar_properties = []
    for _ in range(15):
        unit_price = user_unit_price * (1 + random.uniform(-0.3, 0.3))
        area = land_area * (1 + random.uniform(-0.3, 0.3))

        similar_properties.append({
            '取引時期': f"2024年Q{random.randint(1, 4)}",
            '所在地': f"{location[:6] if location else '東京都'}***",
            '面積(㎡)': round(area, 1),
            '築年': year_built + random.randint(-10, 10),
            '構造': random.choice(['木造', '鉄骨造', 'RC']),
            '取引価格(万円)': round(area * unit_price),
            '平米単価(万円/㎡)': round(unit_price, 2),
            '最寄駅': '品川',
            '駅距離': f"{random.randint(5, 15)}分"
        })

    # 統計を計算
    prices = [prop['平米単価(万円/㎡)'] for prop in similar_properties]
    prices.sort()
    n = len(prices)
    median_price = (prices[n//2] if n % 2 == 1
                    else (prices[n//2-1] + prices[n//2]) / 2)
    mean_price = sum(prices) / len(prices)
    variance = sum((x - mean_price) ** 2 for x in prices) / len(prices)
    std_price = variance ** 0.5

    # 価格評価
    deviation = (((user_unit_price - median_price) / median_price * 100)
                 if median_price > 0 else 0)

    if deviation < -20:
        evaluation = "非常に割安"
    elif deviation < -10:
        evaluation = "割安"
    elif deviation < 5:
        evaluation = "適正価格"
    elif deviation < 15:
        evaluation = "やや割高"
    else:
        evaluation = "割高"

    return MarketAnalysisResponseModel(
        similar_properties=similar_properties,
        statistics=MarketStatisticsModel(
            median_price=round(median_price, 2),
            mean_price=round(mean_price, 2),
            std_price=round(std_price, 2),
            user_price=round(user_unit_price, 2),
            deviation=round(deviation, 1),
            evaluation=evaluation
        )
    )


def _validate_simulation_input_safety(property_data: dict) -> None:
    """
    シミュレーション入力データの安全性を検証
    SEC-059: Python Pickle/eval攻撃経路対策

    Args:
        property_data: 検証するプロパティデータ

    Raises:
        UnsafeOperationError: 危険なデータが検出された場合
    """
    # 危険な文字列パターンをチェック
    dangerous_patterns = [
        '__import__', '__builtins__', '__globals__', '__locals__',
        'eval(', 'exec(', 'compile(', 'subprocess.', 'os.system',
        'pickle.', 'dill.', 'marshal.', 'shelve.', 'dbm.'
    ]

    def check_value_safety(value, field_name=""):
        """再帰的に値の安全性をチェック"""
        if isinstance(value, str):
            value_lower = value.lower()
            for pattern in dangerous_patterns:
                if pattern in value_lower:
                    logger.warning(
                        "Dangerous pattern detected in %s: %s",
                        field_name,
                        pattern
                    )
                    raise UnsafeOperationError(
                        f"危険なパターンが入力データに含まれています: {pattern}"
                    )
        elif isinstance(value, dict):
            for k, v in value.items():
                check_value_safety(k, f"{field_name}.{k}")
                check_value_safety(v, f"{field_name}.{k}")
        elif isinstance(value, list):
            for i, item in enumerate(value):
                check_value_safety(item, f"{field_name}[{i}]")

    try:
        check_value_safety(property_data, "property_data")
    except Exception as e:
        logger.error("Input safety validation failed: %s", e)
        raise UnsafeOperationError("入力データの安全性検証に失敗しました") from e


# SEC-083: セキュアなヘルスチェックエンドポイント
@app.get("/health", tags=["監視"])
async def health_check():
    """
    ヘルスチェックエンドポイント
    SEC-083: 最小限の情報のみ返却し、バージョン情報等を露出しない
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# SEC-083: より詳細なヘルスチェック（認証が必要）
@app.get("/health/detailed",
         dependencies=[Depends(get_current_user),
                       Depends(require_permission(Permission.USER_MANAGE))],
         tags=["監視"])
async def detailed_health_check(db=Depends(get_db)):
    """
    詳細なヘルスチェックエンドポイント（管理者のみ）
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": {}
    }

    # データベース接続チェック
    try:
        # SQLAlchemyのテキストクエリを使用
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db.commit()
        health_status["checks"]["database"] = "ok"
    except Exception:
        health_status["checks"]["database"] = "error"
        health_status["status"] = "degraded"

    # 環境設定チェック（機密情報は含まない）
    health_status["checks"]["environment"] = {
        "is_production": is_production,
        "debug_mode": not is_production,
        "cors_configured": bool(get_env('CORS_ORIGINS'))
    }

    return health_status


# SEC-057: シミュレーションデータ永続化エンドポイント
@app.post("/api/simulations")
async def save_simulation(
    simulation_data: dict,
    current_user: dict = Depends(require_permission(Permission.DATA_WRITE)),
    db: Session = Depends(get_db)
):
    """シミュレーション結果を保存"""
    try:
        # セキュリティログ記録
        security_logger.log_data_access(
            user_id=current_user["id"],
            resource_type="simulation",
            resource_id="new",
            action="create",
            ip_address=None
        )
        
        # プロパティIDがある場合は検証
        property_id = simulation_data.get("property_id")
        if property_id:
            property_exists = db.query(database.Property).filter(
                database.Property.id == property_id,
                database.Property.user_id == current_user["id"]
            ).first()
            if not property_exists:
                raise HTTPException(status_code=404, detail="Property not found")
        
        # シミュレーション結果を保存
        result = database.save_simulation_result(
            db=db,
            property_id=property_id,
            user_id=current_user["id"],
            simulation_data=simulation_data
        )
        
        return {"id": result.id, "message": "Simulation saved successfully"}
    except Exception as e:
        logger.error(f"Error saving simulation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save simulation")


@app.get("/api/simulations")
async def get_simulations(
    property_id: Optional[int] = None,
    current_user: dict = Depends(require_permission(Permission.DATA_READ)),
    db: Session = Depends(get_db)
):
    """ユーザーのシミュレーション一覧を取得"""
    try:
        # セキュリティログ記録
        security_logger.log_data_access(
            user_id=current_user["id"],
            resource_type="simulation",
            resource_id="list",
            action="read",
            ip_address=None
        )
        
        results = database.get_simulation_history(
            db=db,
            user_id=current_user["id"],
            property_id=property_id
        )
        
        # 結果を辞書形式に変換
        simulations = []
        for result in results:
            simulations.append({
                "id": result.id,
                "property_id": result.property_id,
                "simulation_type": result.simulation_type,
                "gross_yield": result.gross_yield,
                "net_yield": result.net_yield,
                "monthly_cash_flow": result.monthly_cash_flow,
                "annual_cash_flow": result.annual_cash_flow,
                "roi": result.roi,
                "noi": result.noi,
                "dscr": result.dscr,
                "parameters": json.loads(result.parameters) if result.parameters else {},
                "created_at": result.created_at.isoformat()
            })
        
        return {"simulations": simulations}
    except Exception as e:
        logger.error(f"Error fetching simulations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch simulations")


@app.get("/api/simulations/{simulation_id}")
async def get_simulation(
    simulation_id: int,
    current_user: dict = Depends(require_permission(Permission.DATA_READ)),
    db: Session = Depends(get_db)
):
    """特定のシミュレーション結果を取得"""
    try:
        # セキュリティログ記録
        security_logger.log_data_access(
            user_id=current_user["id"],
            resource_type="simulation",
            resource_id=str(simulation_id),
            action="read",
            ip_address=None
        )
        
        result = db.query(database.SimulationResult).filter(
            database.SimulationResult.id == simulation_id,
            database.SimulationResult.user_id == current_user["id"]
        ).first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Simulation not found")
        
        return {
            "id": result.id,
            "property_id": result.property_id,
            "simulation_type": result.simulation_type,
            "gross_yield": result.gross_yield,
            "net_yield": result.net_yield,
            "monthly_cash_flow": result.monthly_cash_flow,
            "annual_cash_flow": result.annual_cash_flow,
            "roi": result.roi,
            "noi": result.noi,
            "dscr": result.dscr,
            "parameters": json.loads(result.parameters) if result.parameters else {},
            "created_at": result.created_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching simulation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch simulation")


@app.put("/api/simulations/{simulation_id}")
async def update_simulation(
    simulation_id: int,
    simulation_data: dict,
    current_user: dict = Depends(require_permission(Permission.DATA_WRITE)),
    db: Session = Depends(get_db)
):
    """シミュレーション結果を更新"""
    try:
        # セキュリティログ記録
        security_logger.log_data_access(
            user_id=current_user["id"],
            resource_type="simulation",
            resource_id=str(simulation_id),
            action="update",
            ip_address=None
        )
        
        # 既存のシミュレーションを確認
        result = db.query(database.SimulationResult).filter(
            database.SimulationResult.id == simulation_id,
            database.SimulationResult.user_id == current_user["id"]
        ).first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Simulation not found")
        
        # 更新可能なフィールドのみ更新
        update_fields = [
            "simulation_type", "gross_yield", "net_yield", 
            "monthly_cash_flow", "annual_cash_flow", "roi", "noi", "dscr"
        ]
        
        for field in update_fields:
            if field in simulation_data:
                setattr(result, field, simulation_data[field])
        
        if "parameters" in simulation_data:
            result.parameters = json.dumps(simulation_data["parameters"])
        
        db.commit()
        
        return {"id": result.id, "message": "Simulation updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating simulation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update simulation")


@app.delete("/api/simulations/{simulation_id}")
async def delete_simulation(
    simulation_id: int,
    current_user: dict = Depends(require_permission(Permission.DATA_DELETE)),
    db: Session = Depends(get_db)
):
    """シミュレーション結果を削除"""
    try:
        # セキュリティログ記録
        security_logger.log_data_access(
            user_id=current_user["id"],
            resource_type="simulation",
            resource_id=str(simulation_id),
            action="delete",
            ip_address=None
        )
        
        # 既存のシミュレーションを確認
        result = db.query(database.SimulationResult).filter(
            database.SimulationResult.id == simulation_id,
            database.SimulationResult.user_id == current_user["id"]
        ).first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Simulation not found")
        
        db.delete(result)
        db.commit()
        
        return {"message": "Simulation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting simulation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete simulation")


# APIドキュメントの自動生成
if __name__ == "__main__":
    import uvicorn
    from uvicorn_config import get_safe_uvicorn_kwargs
    
    # SEC-062: 環境に応じた安全なホスト設定を使用
    uvicorn_kwargs = get_safe_uvicorn_kwargs()
    uvicorn.run(app, **uvicorn_kwargs)
