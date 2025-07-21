"""
大家DX - 不動産投資シミュレーターAPI（軽量版）
SEC-022: API認証システムを実装
SEC-069: エラーメッセージの詳細露出対策
"""

import logging
import os
import random
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from auth import get_current_user, create_access_token
from rbac import Permission, UserRole, require_permission, rbac_manager
from error_handler import (
    handle_http_exception,
    handle_general_exception,
    create_auth_error_response
)
from supabase_auth import supabase_auth, get_authenticated_user
from shared.calculations import run_full_simulation
from shared.safe_serializer import prevent_dangerous_imports, safe_json_parse, UnsafeOperationError
from models import PropertyInputModel, SimulationRequestModel, SimulationResponseModel
from models_market import MarketAnalysisRequestModel, MarketAnalysisResponseModel, MarketStatisticsModel
from models_auth import TokenRequest, TokenResponse, UserInfoResponse
from models_extended import SimulationRequestModelV2
from http_method_guard import http_method_middleware
from config_proxy import router as config_router
from csrf_protection import (
    generate_csrf_token, validate_csrf_token, 
    csrf_protection, CSRF_HEADER_NAME
)

# ロガーの設定
logger = logging.getLogger(__name__)

# .envファイルの読み込み
load_dotenv()

# FastAPIアプリケーションの初期化
app = FastAPI(
    title="大家DX API",
    description="不動産投資シミュレーター RESTful API",
    version="1.0.0"
)

# SEC-082: HTTPメソッド制限ミドルウェアを追加
app.middleware("http")(http_method_middleware)

# CORS設定
# 環境変数から許可するオリジンを取得
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:4173"
).split(",")

# 本番環境では厳格なオリジン設定を使用
if os.getenv("ENV", "development") == "production":
    # 本番環境では環境変数で明示的に設定されたオリジンのみ許可
    if not os.getenv("ALLOWED_ORIGINS"):
        # 本番環境でオリジンが設定されていない場合はエラー
        raise ValueError("本番環境ではALLOWED_ORIGINSの設定が必須です")
    # 本番環境では明示的に指定されたオリジンのみ使用
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        expose_headers=["Content-Length", "Content-Range"]
    )
else:
    # 開発環境ではより柔軟なCORS設定を使用
    allowed_origins.extend([
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173"
    ])
    # 重複を除去
    allowed_origins = list(set(allowed_origins))

    # 開発環境では、GitHub Codespacesのオリジンも許可するカスタムミドルウェアを使用
    @app.middleware("http")
    async def cors_middleware(request, call_next):
        """
        GitHub Codespacesも許可するCORSミドルウェア
        
        Args:
            request: HTTPリクエスト
            call_next: 次のミドルウェア
            
        Returns:
            Response: HTTPレスポンス
        """
        origin = request.headers.get("origin", "")

        # 許可されたオリジンか、GitHub Codespacesのパターンにマッチするかチェック
        if origin in allowed_origins or origin.endswith(".app.github.dev"):
            response = await call_next(request)
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = (
                "GET, POST, PUT, DELETE, OPTIONS"
            )
            response.headers["Access-Control-Allow-Headers"] = (
                "Content-Type, Authorization, X-Requested-With, X-CSRF-Token"
            )
            response.headers["Access-Control-Expose-Headers"] = "Content-Length, Content-Range"
            return response
        # 標準のCORSミドルウェアの動作にフォールバック
        return await call_next(request)

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
    return handle_http_exception(request, exc)

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
    return handle_general_exception(request, exc)

# APIキーの取得
openai_api_key = os.getenv("OPENAI_API_KEY", "")
real_estate_api_key = os.getenv("REAL_ESTATE_API_KEY", "")

# データ型定義（Pydanticなしのシンプル版）
# リクエストはJSONとして直接受け取る

# セキュリティ設定
security = HTTPBearer()

# SEC-065: 環境変数の直接露出対策 - 設定プロキシルーターを追加
app.include_router(config_router)

# SEC-073: ユーザー管理APIエンドポイントを追加
from user_management import user_router
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
            raise create_auth_error_response("ログイン試行回数が上限に達しました。しばらくしてから再度お試しください")
        
        # 開発環境では簡易認証を許可
        if os.getenv("ENV", "development") == "development":
            # 開発環境用のモックトークン
            if credentials.email and credentials.email.endswith("@example.com"):
                # ロールを決定（admin@example.comは管理者、それ以外は標準ユーザー）
                is_admin = credentials.email == "admin@example.com"
                role = UserRole.ADMIN if is_admin else UserRole.STANDARD
                user_id = "dev-user-123"
                
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
                raise create_auth_error_response("開発環境では@example.comメールアドレスを使用してください")

        # 本番環境ではSupabase認証システムを使用
        if not credentials.supabase_token:
            # ログイン失敗を記録
            session_manager.record_failed_attempt(client_ip)
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
                "role": user_info["role"].value if hasattr(user_info["role"], 'value') else user_info["role"],
                "type": "supabase"
            },
            session_id=session_id  # セッションIDをトークンに含める
        )
        
        # ログイン成功時は失敗カウンターをリセット
        session_manager.reset_failed_attempts(client_ip)

        response = TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=3600,
            csrf_token=csrf_token,  # CSRFトークンを含める
            role=user_info["role"].value if hasattr(user_info["role"], 'value') else user_info["role"],
            user_id=user_info["user_id"],
            full_name=user_info.get("full_name")
        )
        
        # CSRFトークンをクッキーにも設定
        json_response = JSONResponse(content=response.dict())
        return csrf_protection.create_csrf_cookie_response(json_response, csrf_token)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token generation failed: {e}")
        # ログイン失敗を記録
        session_manager.record_failed_attempt(client_ip)
        raise create_auth_error_response("認証処理中にエラーが発生しました")

# ログアウトエンドポイント
# SEC-051: セッション破棄によるセッション固定攻撃対策
# SEC-082: HTTPメソッド制限 - POSTのみ許可
@app.post("/api/auth/logout")
def logout(request: Request, current_user: dict = Depends(get_current_user)):
    """
    ログアウト処理 - セッションを破棄
    SEC-051: セッション固定攻撃対策
    """
    try:
        session_id = current_user.get("session_id")
        if session_id:
            from session_security import destroy_session
            destroy_session(session_id)
            logger.info(f"User {current_user.get('user_id')} logged out, session destroyed")
        
        return {"success": True, "message": "ログアウトしました"}
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        return {"success": False, "message": "ログアウト処理中にエラーが発生しました"}

# 認証状態確認エンドポイント
# SEC-082: HTTPメソッド制限 - GETのみ許可
@app.get("/api/auth/me", response_model=UserInfoResponse)
def get_me(request: Request, current_user: dict = Depends(get_current_user)):
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
                "last_login": profile.last_login.isoformat() if profile.last_login else None,
                "created_at": profile.created_at.isoformat() if profile.created_at else None,
                "is_active": profile.is_active
            })
        
        return response_data
        
    except Exception as e:
        logger.error(f"Failed to get user info: {e}")
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
@app.post("/api/simulate", response_model=SimulationResponseModel)
@prevent_dangerous_imports
def run_simulation(
    request: SimulationRequestModel,
    current_user: dict = Depends(require_permission(Permission.SIMULATE_BASIC))
):
    """
    収益シミュレーションを実行 - 新機能対応版（認証必須）
    
    SEC-059: Python Pickle/eval攻撃経路対策を実装
    SEC-075: Pydanticモデルによる入力検証を実装
    SEC-082: HTTPメソッド制限を実装 - POSTのみ許可
    """
    # ユーザーIDをログに記録（監査用）
    logger.info("Simulation requested by user: %s", current_user.get('user_id'))

    try:
        # SEC-059: 危険なインポートをチェック済み（デコレータ）
        
        # Pydanticモデルで検証済みのデータを使用
        property_data = request.property_data.model_dump()
        
        # SEC-059: 入力データの安全性を追加検証
        # Pydanticで基本検証済みだが、念のため危険なパターンをチェック
        _validate_simulation_input_safety(property_data)
        
        # 共通計算ロジックを使用してシミュレーション実行
        result = run_full_simulation(property_data)
        
        # レスポンスにユーザー情報を追加
        result["requested_by"] = current_user.get("user_id")
        result["requested_at"] = datetime.now(timezone.utc).isoformat()
        
        return SimulationResponseModel(
            success=True,
            results=result.get('results', {}),
            cash_flow_table=result.get('cash_flow_table', []) if request.include_cash_flow_table else None,
            request_id=result.get('requested_by', '')
        )
    except ValueError as e:
        # バリデーションエラー
        logger.error("Validation error in simulation: %s", str(e))
        # SEC-026: エラー情報の詳細漏洩対策
        from error_handler import create_validation_error_response
        raise create_validation_error_response("simulation_input", str(e))
    except Exception as e:
        logger.error("Error in simulation: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "error": "SIMULATION_ERROR",
                "message": "シミュレーション中にエラーが発生しました"
            }
        )


# 市場分析エンドポイント（認証＋権限必須）
# SEC-082: HTTPメソッド制限 - POSTのみ許可
@app.post("/api/market-analysis", response_model=MarketAnalysisResponseModel)
@prevent_dangerous_imports
def market_analysis(
    request: MarketAnalysisRequestModel,
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

    # ユーザーIDをログに記録（監査用）
    logger.info("Market analysis requested by user: %s", current_user.get('user_id'))

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
    median_price = prices[n//2] if n % 2 == 1 else (prices[n//2-1] + prices[n//2]) / 2
    mean_price = sum(prices) / len(prices)
    variance = sum((x - mean_price) ** 2 for x in prices) / len(prices)
    std_price = variance ** 0.5

    # 価格評価
    deviation = ((user_unit_price - median_price) / median_price * 100) if median_price > 0 else 0

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
                    logger.warning(f"Dangerous pattern detected in {field_name}: {pattern}")
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
        logger.error(f"Input safety validation failed: {e}")
        raise UnsafeOperationError("入力データの安全性検証に失敗しました")


# APIドキュメントの自動生成
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
