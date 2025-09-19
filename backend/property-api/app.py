"""
FastAPI REST API Server for Real Estate Property Search
不動産取引価格検索システムのREST API
"""

import os
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# ローカルモジュールのインポート
from real_estate_client import RealEstateAPIClient

# 環境変数の読み込み
load_dotenv()

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPIアプリケーションの初期化
app = FastAPI(
    title="不動産価格検索API",
    description="国土交通省の不動産情報ライブラリAPIを利用した不動産価格検索システム",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では具体的なオリジンを指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIクライアントの初期化
try:
    client = RealEstateAPIClient()
    logger.info("RealEstateAPIClient initialized successfully")
except Exception as e:
    logger.error("Failed to initialize RealEstateAPIClient: %s", str(e))
    client = None

# レスポンスモデル
class PropertySearchResponse(BaseModel):
    status: str = Field(..., description="レスポンスステータス")
    data: List[Dict[str, Any]] = Field(default=[], description="検索結果データ")
    count: int = Field(default=0, description="検索結果件数")
    message: Optional[str] = Field(None, description="メッセージ")

class LandPriceResponse(BaseModel):
    status: str = Field(..., description="レスポンスステータス")
    data: List[Dict[str, Any]] = Field(default=[], description="公示地価データ")
    count: int = Field(default=0, description="データ件数")
    message: Optional[str] = Field(None, description="メッセージ")

class AreaListResponse(BaseModel):
    status: str = Field(..., description="レスポンスステータス")
    data: List[Dict[str, str]] = Field(default=[], description="地域リスト")
    message: Optional[str] = Field(None, description="メッセージ")

class ErrorResponse(BaseModel):
    status: str = "error"
    error_code: str = Field(..., description="エラーコード")
    message: str = Field(..., description="エラーメッセージ")
    detail: Optional[str] = Field(None, description="詳細情報")

# ヘルスチェックエンドポイント
@app.get("/")
async def root():
    """APIヘルスチェック"""
    return {
        "status": "healthy",
        "service": "Real Estate Property API",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """詳細なヘルスチェック"""
    api_key_status = "configured" if os.getenv("VITE_REAL_ESTATE_API_KEY") else "not_configured"
    client_status = "initialized" if client else "failed"

    return {
        "status": "healthy" if client else "degraded",
        "checks": {
            "api_key": api_key_status,
            "client": client_status
        },
        "timestamp": datetime.now().isoformat()
    }

# 都道府県リスト取得
@app.get("/api/prefectures", response_model=AreaListResponse)
async def get_prefectures():
    """都道府県リストを取得"""
    try:
        if not client:
            raise HTTPException(status_code=503, detail="APIクライアントが初期化されていません")

        prefectures = client.get_prefectures()
        return AreaListResponse(
            status="success",
            data=prefectures,
            message=f"{len(prefectures)}件の都道府県を取得しました"
        )
    except Exception as e:
        logger.error(f"Error fetching prefectures: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 市区町村リスト取得
@app.get("/api/cities/{prefecture_code}", response_model=AreaListResponse)
async def get_cities(prefecture_code: str):
    """指定都道府県の市区町村リストを取得"""
    try:
        if not client:
            raise HTTPException(status_code=503, detail="APIクライアントが初期化されていません")

        cities = client.get_cities(prefecture_code)
        return AreaListResponse(
            status="success",
            data=cities,
            message=f"{len(cities)}件の市区町村を取得しました"
        )
    except Exception as e:
        logger.error(f"Error fetching cities for prefecture {prefecture_code}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 地区リスト取得
@app.get("/api/districts/{prefecture_code}", response_model=AreaListResponse)
async def get_districts(
    prefecture_code: str,
    municipality_code: Optional[str] = None
):
    """指定地域の地区リストを取得"""
    try:
        if not client:
            raise HTTPException(status_code=503, detail="APIクライアントが初期化されていません")

        districts = client.get_districts(prefecture_code, municipality_code)
        # 文字列のリストを辞書のリストに変換
        district_data = [{"name": d, "code": d} for d in districts]

        return AreaListResponse(
            status="success",
            data=district_data,
            message=f"{len(districts)}件の地区を取得しました"
        )
    except Exception as e:
        logger.error(f"Error fetching districts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 不動産取引価格検索
@app.get("/api/search", response_model=PropertySearchResponse)
async def search_properties(
    prefecture: str = Query(..., description="都道府県コード"),
    city: Optional[str] = Query(None, description="市区町村コード"),
    district: Optional[str] = Query(None, description="地区名"),
    property_type: str = Query("マンション", description="物件種別（マンション/戸建/土地）"),
    year: int = Query(2024, description="取引年"),
    quarter: int = Query(1, description="四半期（1-4）", ge=1, le=4),
    min_area: Optional[float] = Query(None, description="最小面積（㎡）"),
    max_area: Optional[float] = Query(None, description="最大面積（㎡）"),
    min_year: Optional[int] = Query(None, description="最小建築年"),
    max_year: Optional[int] = Query(None, description="最大建築年")
):
    """不動産取引価格を検索"""
    try:
        if not client:
            raise HTTPException(status_code=503, detail="APIクライアントが初期化されていません")

        logger.info(f"Search request: prefecture={prefecture}, city={city}, type={property_type}")

        results = client.search_real_estate_prices(
            prefecture=prefecture,
            city=city,
            district=district,
            property_type=property_type,
            year=year,
            quarter=quarter,
            min_area=min_area,
            max_area=max_area,
            min_year=min_year,
            max_year=max_year
        )

        return PropertySearchResponse(
            status="success",
            data=results,
            count=len(results),
            message=f"{len(results)}件の物件が見つかりました"
        )

    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 公示地価データ取得
@app.get("/api/land-prices", response_model=LandPriceResponse)
async def get_land_prices(
    prefecture: str = Query(..., description="都道府県コード"),
    city: Optional[str] = Query(None, description="市区町村名"),
    district: Optional[str] = Query(None, description="地区名"),
    year: str = Query("2024", description="年度")
):
    """公示地価データを取得"""
    try:
        if not client:
            raise HTTPException(status_code=503, detail="APIクライアントが初期化されていません")

        logger.info(f"Land price request: prefecture={prefecture}, city={city}, year={year}")

        results = client.search_land_prices(
            prefecture=prefecture,
            city=city,
            district=district,
            year=year
        )

        return LandPriceResponse(
            status="success",
            data=results,
            count=len(results),
            message=f"{len(results)}件の公示地価データを取得しました"
        )

    except Exception as e:
        logger.error(f"Land price error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 公示地価履歴データ取得
@app.get("/api/land-price-history", response_model=Dict[str, Any])
async def get_land_price_history(
    prefecture: str = Query(..., description="都道府県コード"),
    city: Optional[str] = Query(None, description="市区町村名"),
    district: Optional[str] = Query(None, description="地区名"),
    start_year: str = Query("2021", description="開始年"),
    end_year: str = Query("2024", description="終了年")
):
    """公示地価の履歴データを取得"""
    try:
        if not client:
            raise HTTPException(status_code=503, detail="APIクライアントが初期化されていません")

        logger.info(f"Land price history: prefecture={prefecture}, {start_year}-{end_year}")

        results = client.search_land_price_history(
            prefecture=prefecture,
            city=city,
            district=district,
            start_year=start_year,
            end_year=end_year
        )

        return {
            "status": "success",
            "data": results,
            "message": f"{start_year}年から{end_year}年の履歴データを取得しました"
        }

    except Exception as e:
        logger.error(f"Land price history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# エラーハンドラー
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """HTTPエラーハンドラー"""
    error_code = f"E{exc.status_code}"

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "error_code": error_code,
            "message": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """一般的なエラーハンドラー"""
    logger.error(f"Unhandled exception: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error_code": "E500",
            "message": "内部サーバーエラーが発生しました",
            "detail": str(exc) if os.getenv("DEBUG") else None,
            "timestamp": datetime.now().isoformat()
        }
    )

# Renderデプロイ用の設定
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )