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
from auth import get_current_user, create_access_token
from rbac import Permission, UserRole, require_permission, rbac_manager
from error_handler import (
    handle_http_exception,
    handle_general_exception,
    create_auth_error_response
)
from shared.calculations import run_full_simulation
from models import PropertyInputModel, SimulationRequestModel, SimulationResponseModel
from models_market import MarketAnalysisRequestModel, MarketAnalysisResponseModel, MarketStatisticsModel
from http_method_guard import http_method_middleware
from config_proxy import router as config_router

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
                "Content-Type, Authorization, X-Requested-With"
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
@app.post("/api/auth/token")
def login_for_access_token(credentials: dict):
    """
    アクセストークンを取得（SEC-022対策）
    Supabaseからの認証情報を受け取ってJWTトークンを発行
    """
    # 開発環境では簡易認証を許可
    if os.getenv("ENV", "development") == "development":
        # 開発環境用のモックトークン
        if credentials.get("email", "").endswith("@example.com"):
            # ロールを決定（admin@example.comは管理者、それ以外は標準ユーザー）
            is_admin = credentials.get("email") == "admin@example.com"
            role = UserRole.ADMIN if is_admin else UserRole.STANDARD

            access_token = create_access_token(
                data={
                    "sub": "dev-user-123",
                    "email": credentials.get("email"),
                    "role": role.value,
                    "type": "development"
                }
            )
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": 3600,
                "role": role.value
            }

    # 本番環境では実際の認証を必須とする
    # ここではSupabaseのセッショントークンを検証する想定
    supabase_token = credentials.get("supabase_token")
    if not supabase_token:
        raise create_auth_error_response("認証情報が不正です")

    # TODO: Supabaseトークンの検証を実装  # pylint: disable=fixme
    # 現在は仮実装として、トークンが存在すればOKとする
    user_id = credentials.get("user_id", "unknown")
    email = credentials.get("email", "unknown@example.com")

    # 本番環境でのロール決定（実際にはデータベースから取得すべき）
    # 現在は仮実装として、メールアドレスで判定
    role = UserRole.STANDARD  # デフォルトは標準ユーザー
    if email.endswith("@admin.com"):
        role = UserRole.ADMIN
    elif credentials.get("is_premium", False):
        role = UserRole.PREMIUM

    access_token = create_access_token(
        data={
            "sub": user_id,
            "email": email,
            "role": role.value,
            "type": "production"
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 3600,
        "role": role.value
    }

# 認証状態確認エンドポイント
# SEC-082: HTTPメソッド制限 - GETのみ許可
@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """現在の認証ユーザー情報を取得"""
    # ロールと権限情報を追加
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
def run_simulation(
    request: SimulationRequestModel,
    current_user: dict = Depends(require_permission(Permission.SIMULATE_BASIC))
):
    """
    収益シミュレーションを実行 - 新機能対応版（認証必須）
    
    SEC-075: Pydanticモデルによる入力検証を実装
    SEC-082: HTTPメソッド制限を実装 - POSTのみ許可
    """
    # ユーザーIDをログに記録（監査用）
    logger.info("Simulation requested by user: %s", current_user.get('user_id'))

    try:
        # Pydanticモデルで検証済みのデータを使用
        property_data = request.property_data.dict()
        
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
        raise HTTPException(
            status_code=400,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "入力データに不正な値が含まれています",
                "details": str(e)
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
        )


# 市場分析エンドポイント（認証＋権限必須）
# SEC-082: HTTPメソッド制限 - POSTのみ許可
@app.post("/api/market-analysis", response_model=MarketAnalysisResponseModel)
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

# APIドキュメントの自動生成
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
