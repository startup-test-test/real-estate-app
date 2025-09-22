"""
FastAPI REST API Server for Real Estate Property Search
不動産取引価格検索システムのREST API
"""

import os
import logging
import json
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import json as json_module
import openai

# ローカルモジュールのインポート
from real_estate_client import RealEstateAPIClient
from ml_analysis import PropertyMLAnalyzer, simple_ml_analysis

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

# CORS設定 - 特定のドメインのみ許可（セキュリティ向上）
# 許可するドメイン: localhost, 127.0.0.1, Codespaces (*.app.github.dev), dev.ooya.tech, ooya.tech
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^(https?://localhost(:[0-9]+)?|https?://127\.0\.0\.1(:[0-9]+)?|https?://[a-z0-9-]+\.app\.github\.dev|https://dev\.ooya\.tech|https://ooya\.tech)$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# APIクライアントの初期化
try:
    client = RealEstateAPIClient()
    logger.info("RealEstateAPIClient initialized successfully")
except Exception as e:
    logger.error("Failed to initialize RealEstateAPIClient: %s", str(e))
    client = None

# OpenAI APIキーの設定
# CHATGPT_REAL_ESTATE_250922 または OPENAI_API_KEY をチェック
openai_api_key = os.getenv("CHATGPT_REAL_ESTATE_250922") or os.getenv("OPENAI_API_KEY")
if openai_api_key:
    openai.api_key = openai_api_key
    logger.info("OpenAI API key configured")
else:
    logger.warning("OpenAI API key not configured")

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

class MarketAnalysisSummaryRequest(BaseModel):
    market_data: Dict[str, Any] = Field(..., description="市場分析データ")
    similar_properties: List[Dict[str, Any]] = Field(default=[], description="類似物件データ")
    land_price_data: Optional[List[Dict[str, Any]]] = Field(None, description="公示地価データ")
    target_area: Optional[float] = Field(None, description="希望延床面積")
    target_year: Optional[int] = Field(None, description="希望建築年")

class MarketAnalysisSummaryResponse(BaseModel):
    status: str = Field(..., description="レスポンスステータス")
    summary: str = Field(..., description="AI生成サマリー")
    key_insights: List[str] = Field(default=[], description="主要な洞察")
    recommendations: List[str] = Field(default=[], description="推奨事項")
    message: Optional[str] = Field(None, description="メッセージ")

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

        # Map prefecture code to name
        prefecture_map = {
            "01": "北海道", "02": "青森県", "03": "岩手県", "04": "宮城県",
            "05": "秋田県", "06": "山形県", "07": "福島県", "08": "茨城県",
            "09": "栃木県", "10": "群馬県", "11": "埼玉県", "12": "千葉県",
            "13": "東京都", "14": "神奈川県", "15": "新潟県", "16": "富山県",
            "17": "石川県", "18": "福井県", "19": "山梨県", "20": "長野県",
            "21": "岐阜県", "22": "静岡県", "23": "愛知県", "24": "三重県",
            "25": "滋賀県", "26": "京都府", "27": "大阪府", "28": "兵庫県",
            "29": "奈良県", "30": "和歌山県", "31": "鳥取県", "32": "島根県",
            "33": "岡山県", "34": "広島県", "35": "山口県", "36": "徳島県",
            "37": "香川県", "38": "愛媛県", "39": "高知県", "40": "福岡県",
            "41": "佐賀県", "42": "長崎県", "43": "熊本県", "44": "大分県",
            "45": "宮崎県", "46": "鹿児島県", "47": "沖縄県"
        }

        # Convert prefecture code to name
        prefecture_name = prefecture_map.get(prefecture, prefecture)

        # Get city name from code
        city_name = city  # Default to code if name not found
        if city:
            try:
                # Get list of cities for this prefecture
                cities = client.get_cities(prefecture)
                # Find the city name from the code
                for city_data in cities:
                    if city_data.get('code') == city:
                        city_name = city_data.get('name', city)
                        break
            except:
                pass  # If error, use city code as-is

        # Map property type to trade type code
        trade_type_map = {
            'マンション': ['07'],  # マンションは07
            '戸建': ['02'],  # 宅地(建物付き)
            '戸建て': ['02'],
            '土地': ['01']  # 宅地(土地)
        }
        trade_types = trade_type_map.get(property_type, ['02'])  # Default to 宅地(建物付き)

        # Call the method with correct parameters
        response = client.search_real_estate_prices(
            prefecture=prefecture_name,  # Use prefecture name instead of code
            city=city_name,  # Use city name instead of code
            district=district,
            trade_types=trade_types,
            from_year=year,
            from_quarter=quarter,
            to_year=year,
            to_quarter=quarter
        )

        # Extract results list from response dictionary
        results = response.get('results', []) if isinstance(response, dict) else []

        # Filter results by area and year if specified
        if results and isinstance(results, list):
            filtered = []
            for item in results:
                # Check area range
                if min_area or max_area:
                    try:
                        area = float(item.get('面積', 0) or item.get('Area', 0) or 0)
                        if min_area and area < min_area:
                            continue
                        if max_area and area > max_area:
                            continue
                    except:
                        pass

                # Check building year range
                if min_year or max_year:
                    try:
                        build_year_str = item.get('建築年', '') or item.get('BuildingYear', '')
                        if build_year_str:
                            # Extract year from various formats
                            import re
                            match = re.search(r'\d{4}', build_year_str)
                            if match:
                                build_year = int(match.group())
                                if min_year and build_year < min_year:
                                    continue
                                if max_year and build_year > max_year:
                                    continue
                    except:
                        pass

                filtered.append(item)
            results = filtered

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

# AI市場分析サマリー生成エンドポイント
@app.post("/api/market-analysis-summary", response_model=MarketAnalysisSummaryResponse)
async def generate_market_analysis_summary(request: MarketAnalysisSummaryRequest):
    """AI市場分析サマリーを生成"""
    try:
        if not openai_api_key:
            raise HTTPException(
                status_code=503,
                detail="OpenAI APIキーが設定されていません"
            )

        # 分析データの準備
        market_data = request.market_data
        similar_properties = request.similar_properties
        land_price_data = request.land_price_data or []

        # 安全なプロンプトの構築
        prompt = _build_safe_analysis_prompt(
            market_data,
            similar_properties,
            land_price_data,
            request.target_area,
            request.target_year
        )

        # OpenAI APIを呼び出し
        try:
            # OpenAI APIクライアントは既に設定済み

            # テンプレート型の安全なシステムプロンプト
            system_prompt = (
                "不動産市場データの分析を行います。"
                "JSON形式で数値と選択肢のみを返してください。"
                "文章や説明は含めないでください。"
                "投資判断や購入推奨は行わないでください。"
            )

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # 低温度で保守的な出力
                max_tokens=500  # JSONのみなので少なめ
            )

            # JSONレスポンスの解析
            try:
                ai_data = json_module.loads(response['choices'][0]['message']['content'])
            except json_module.JSONDecodeError:
                # JSONパースエラーの場合はデフォルト値
                ai_data = {
                    "price_trend": "不明",
                    "market_strength_score": 5,
                    "recommended_action": "検討中"
                }

            # 固定テンプレートにデータを埋め込み
            summary_text = _generate_safe_report(market_data, ai_data)
            insights = _generate_fixed_insights(market_data, ai_data)
            recommendations = _generate_fixed_recommendations(ai_data)

            return MarketAnalysisSummaryResponse(
                status="success",
                summary=summary_text,
                key_insights=insights,
                recommendations=recommendations,
                message="AI分析サマリーを生成しました"
            )

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"AI分析生成中にエラーが発生しました: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Market analysis summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _build_safe_analysis_prompt(
    market_data: Dict[str, Any],
    similar_properties: List[Dict[str, Any]],
    land_price_data: List[Dict[str, Any]],
    target_area: Optional[float],
    target_year: Optional[int]
) -> str:
    """安全なテンプレート型分析プロンプトを構築"""

    prompt_parts = []

    # 基本的な市場データ
    if market_data:
        location = f"{market_data.get('prefecture', '')} {market_data.get('city', '')} {market_data.get('district', '')}".strip()
        prompt_parts.append(f"【対象地域】{location}")

        if 'averagePrice' in market_data:
            prompt_parts.append(f"【平均価格】{market_data['averagePrice']:,}万円")

        if 'totalTransactions' in market_data:
            prompt_parts.append(f"【取引件数】{market_data['totalTransactions']}件")

        if all(k in market_data for k in ['q25', 'q50', 'q75']):
            prompt_parts.append(
                f"【価格分布】\n"
                f"- 第1四分位: {market_data['q25']:,}万円\n"
                f"- 中央値: {market_data['q50']:,}万円\n"
                f"- 第3四分位: {market_data['q75']:,}万円"
            )

    # 条件設定
    if target_area or target_year:
        conditions = []
        if target_area:
            conditions.append(f"希望延床面積: {target_area}㎡")
        if target_year:
            conditions.append(f"希望建築年: {target_year}年")
        prompt_parts.append(f"【検索条件】{', '.join(conditions)}")

    # 類似物件データ
    if similar_properties and len(similar_properties) > 0:
        prompt_parts.append(f"\n【類似物件データ】{len(similar_properties)}件")

        # 最新5件の物件情報
        for i, prop in enumerate(similar_properties[:5], 1):
            price = prop.get('取引価格（万円）', prop.get('price', 0))
            area = prop.get('延べ床面積（㎡）', prop.get('building_area', 0))
            year = prop.get('建築年', prop.get('build_year', '不明'))
            period = prop.get('取引時期', prop.get('trade_period', '不明'))

            if price and area:
                price_per_sqm = price / area if area > 0 else 0
                prompt_parts.append(
                    f"{i}. 価格: {price:,.0f}万円, "
                    f"面積: {area:.0f}㎡, "
                    f"㎡単価: {price_per_sqm:,.0f}万円, "
                    f"建築年: {year}, "
                    f"取引時期: {period}"
                )

    # 公示地価データ
    if land_price_data and len(land_price_data) > 0:
        prompt_parts.append(f"\n【公示地価データ】{len(land_price_data)}地点")
        avg_land_price = sum(item.get('price_per_sqm', 0) for item in land_price_data) / len(land_price_data)
        prompt_parts.append(f"平均公示地価: {avg_land_price:,.0f}円/㎡")

    # JSON形式でデータのみ返すよう指示
    prompt_parts.append(
        "\n上記データを分析し、以下のJSON形式で返してください：\n"
        "{\n"
        '  "price_trend": "上昇" or "横ばい" or "下降",\n'
        '  "market_strength_score": 1-10の整数,\n'
        '  "supply_demand_balance": "供給不足" or "均衡" or "供給過多",\n'
        '  "recommended_action": "様子見" or "検討可" or "要注意"\n'
        "}\n\n"
        "JSONのみを返し、他の文章は含めないでください。"
    )

    return "\n".join(prompt_parts)

def _generate_safe_report(market_data: Dict[str, Any], ai_data: Dict[str, Any]) -> str:
    """固定テンプレートを使用した安全なレポート生成"""

    # 都道府県コードから名前への変換
    prefecture_map = {
        "01": "北海道", "02": "青森県", "03": "岩手県", "04": "宮城県",
        "05": "秋田県", "06": "山形県", "07": "福島県", "08": "茨城県",
        "09": "栃木県", "10": "群馬県", "11": "埼玉県", "12": "千葉県",
        "13": "東京都", "14": "神奈川県", "15": "新潟県", "16": "富山県",
        "17": "石川県", "18": "福井県", "19": "山梨県", "20": "長野県",
        "21": "岐阜県", "22": "静岡県", "23": "愛知県", "24": "三重県",
        "25": "滋賀県", "26": "京都府", "27": "大阪府", "28": "兵庫県",
        "29": "奈良県", "30": "和歌山県", "31": "鳥取県", "32": "島根県",
        "33": "岡山県", "34": "広島県", "35": "山口県", "36": "徳島県",
        "37": "香川県", "38": "愛媛県", "39": "高知県", "40": "福岡県",
        "41": "佐賀県", "42": "長崎県", "43": "熊本県", "44": "大分県",
        "45": "宮崎県", "46": "鹿児島県", "47": "沖縄県"
    }

    # 都道府県名を取得
    prefecture_raw = market_data.get('prefecture', '')
    prefecture_name = prefecture_map.get(prefecture_raw, prefecture_raw) if prefecture_raw else ''

    # 市区町村名を取得（コードの場合は空に）
    city_raw = market_data.get('city', '')
    if city_raw and city_raw.isdigit():
        city_name = ''  # コードの場合は表示しない
    else:
        city_name = city_raw

    # 地区名を取得
    district_raw = market_data.get('district', '')
    district_name = '' if district_raw == '全体' else district_raw

    # 固定テンプレート
    template = """
{prefecture}{city}{district}エリアの不動産市場について、データに基づく分析結果をご報告いたします。

現在の市場動向として、統計上「{price_trend}」傾向が見られます。
平均取引価格は{average_price:,}万円で、中央値は{median_price:,}万円となっています。

市場強度スコアは{market_strength_score}/10で、需給バランスは「{supply_demand_balance}」の状態です。
データ分析の結果、現在の市場環境は「{recommended_action}」の状況と考えられます。

ただし、不動産市場は金利動向、経済情勢、地域開発計画等の外部要因により変動する可能性があります。

※本分析は公開統計データに基づく参考情報です。
※実際の不動産取引をご検討の際は、宅地建物取引士等の専門家にご相談ください。
    """.strip()

    return template.format(
        prefecture=prefecture_name,
        city=city_name,
        district=district_name,
        price_trend=ai_data.get('price_trend', '不明'),
        average_price=market_data.get('averagePrice', 0),
        median_price=market_data.get('q50', 0),
        market_strength_score=ai_data.get('market_strength_score', 5),
        supply_demand_balance=ai_data.get('supply_demand_balance', '均衡'),
        recommended_action=ai_data.get('recommended_action', '検討中')
    )

def _generate_fixed_insights(market_data: Dict[str, Any], ai_data: Dict[str, Any]) -> List[str]:
    """固定フォーマットの洞察を生成"""
    insights = []

    # 価格傾向
    price_trend = ai_data.get('price_trend', '不明')
    insights.append(f"統計データ上、市場価格は{price_trend}傾向")

    # 取引件数
    if 'totalTransactions' in market_data:
        insights.append(f"直近の取引件数は{market_data['totalTransactions']}件")

    # 市場強度
    score = ai_data.get('market_strength_score', 5)
    if score >= 7:
        insights.append("市場活況度が高い状態")
    elif score >= 4:
        insights.append("市場活況度は標準的")
    else:
        insights.append("市場活況度が低い状態")

    return insights[:5]  # 最大5つまで

def _generate_fixed_recommendations(ai_data: Dict[str, Any]) -> List[str]:
    """固定フォーマットの推奨事項を生成"""
    action = ai_data.get('recommended_action', '検討中')

    if action == '検討可':
        return [
            "詳細な物件情報の確認をお勧めします",
            "専門家による個別査定の実施をご検討ください",
            "市場動向は変動するため定期的な情報更新を推奨"
        ]
    elif action == '要注意':
        return [
            "市場動向を慎重に見守ることを推奨",
            "複数の専門家の意見を参考にすることをお勧め",
            "リスク要因を十分に検討した上でご判断ください"
        ]
    else:  # 様子見
        return [
            "当面は市場動向の観察を続けることを推奨",
            "詳細な分析には追加データの収集が必要",
            "専門家への相談をご検討ください"
        ]


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

# ========================================
# 機械学習分析エンドポイント
# ========================================

class MLAnalysisRequest(BaseModel):
    """機械学習分析リクエスト"""
    properties: List[Dict[str, Any]] = Field(..., description="分析対象の物件データリスト")
    analysis_type: str = Field('full', description="分析タイプ: full, clustering, regression, anomaly")

@app.post("/api/ml/analyze")
async def analyze_properties_ml(request: MLAnalysisRequest):
    """
    機械学習を使用した物件データの分析

    - K-meansクラスタリング: 価格帯の自動グループ化
    - 線形回帰: 価格予測モデルの構築
    - 異常検知: Isolation Forestによる異常物件の検出
    """
    try:
        logger.info(f"ML分析リクエスト: {len(request.properties)}件, タイプ: {request.analysis_type}")

        # ML分析の実行
        analyzer = PropertyMLAnalyzer()
        result = analyzer.analyze(request.properties, request.analysis_type)

        logger.info(f"ML分析完了: ステータス={result.get('status')}")

        return JSONResponse(
            status_code=200,
            content=result
        )

    except Exception as e:
        logger.error(f"ML分析エラー: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "機械学習分析中にエラーが発生しました",
                "detail": str(e)
            }
        )

@app.post("/api/ml/simple-analysis")
async def simple_ml_analysis_endpoint(request: MLAnalysisRequest):
    """
    シンプルなML分析API（フロントエンド連携用）
    """
    try:
        logger.info(f"シンプルML分析リクエスト: {len(request.properties)}件")

        # シンプルな分析の実行
        result = simple_ml_analysis(request.properties)

        return JSONResponse(
            status_code=200,
            content=result
        )

    except Exception as e:
        logger.error(f"シンプルML分析エラー: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "分析処理中にエラーが発生しました",
                "detail": str(e)
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