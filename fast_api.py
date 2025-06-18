from fastapi import FastAPI, Query, Request
from typing import List, Dict, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from datetime import datetime
import requests
import os

# 環境変数の読み込み（.envファイルから）
load_dotenv()
api_key = os.getenv("REAL_ESTATE_API_KEY")

# FastAPI アプリケーションの作成
app = FastAPI(
    title="不動産情報ライブラリAPI連携",
    description="国土交通省APIを使った市区町村リストと取引データ取得",
    version="1.0.0"
)

# CORSミドルウェア設定（本番では allow_origins を制限すべき）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 例: ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# テンプレートディレクトリを指定
templates = Jinja2Templates(directory="templates")

# 都道府県マッピング
pref_map = {
    "北海道": "01", "青森県": "02", "岩手県": "03", "宮城県": "04", "秋田県": "05",
    "山形県": "06", "福島県": "07", "茨城県": "08", "栃木県": "09", "群馬県": "10",
    "埼玉県": "11", "千葉県": "12", "東京都": "13", "神奈川県": "14", "新潟県": "15",
    "富山県": "16", "石川県": "17", "福井県": "18", "山梨県": "19", "長野県": "20",
    "岐阜県": "21", "静岡県": "22", "愛知県": "23", "三重県": "24", "滋賀県": "25",
    "京都府": "26", "大阪府": "27", "兵庫県": "28", "奈良県": "29", "和歌山県": "30",
    "鳥取県": "31", "島根県": "32", "岡山県": "33", "広島県": "34", "山口県": "35",
    "徳島県": "36", "香川県": "37", "愛媛県": "38", "高知県": "39", "福岡県": "40",
    "佐賀県": "41", "長崎県": "42", "熊本県": "43", "大分県": "44", "宮崎県": "45",
    "鹿児島県": "46", "沖縄県": "47"
}

# ----------------------
# 市区町村リスト取得API
# ----------------------
@app.get("/city-list", summary="市区町村リスト取得")
def get_city_list(pref_code: str):
    """
    指定された都道府県コードに対応する市区町村名の一覧を取得します。
    """
    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002"
    headers = {"Ocp-Apim-Subscription-Key": api_key}
    params = {"area": pref_code, "language": "ja"}

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json().get("data", [])
        return [city["name"] for city in data]
    except Exception as e:
        return {"error": f"市区町村の取得に失敗しました: {str(e)}"}

# ----------------------
# 取引価格情報取得API
# ----------------------
@app.get("/transaction-data", summary="取引データ取得")
def get_transaction_data(pref_code: str, city_name: str):
    """
    指定された都道府県コードと市区町村名に対応する不動産取引価格データを直近3年分取得します。
    """
    # 市区町村コード取得
    city_code = ""
    try:
        city_response = requests.get(
            "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002",
            headers={"Ocp-Apim-Subscription-Key": api_key},
            params={"area": pref_code, "language": "ja"}
        )
        for city in city_response.json().get("data", []):
            if city_name in city["name"]:
                city_code = city["id"]
                break
        if not city_code:
            return {"error": f"市区町村コードが見つかりません: {city_name}"}
    except Exception as e:
        return {"error": f"市区町村コード取得エラー: {str(e)}"}

    # 取引価格データ取得
    base_url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001"
    now = datetime.now()
    results = []

    try:
        for y in range(now.year - 3, now.year + 1):
            for q in range(1, 5):
                if y == now.year and q > (now.month - 1) // 3 + 1:
                    break
                res = requests.get(
                    base_url,
                    headers={"Ocp-Apim-Subscription-Key": api_key},
                    params={
                        "year": y,
                        "quarter": q,
                        "city": city_code,
                        "priceClassification": "01",  # 宅地（住宅地）
                        "format": "json"
                    }
                )
                if res.status_code == 200 and "data" in res.json():
                    results.extend(res.json()["data"])
        return results
    except Exception as e:
        return {"error": f"取引データ取得エラー: {str(e)}"}

# ----------------------
# 都道府県リスト取得API
# ----------------------
@app.get("/prefecture-list", summary="都道府県リスト取得")
def get_prefecture_list():
    """
    都道府県名とコードの一覧を取得します。
    """
    return [{"name": name, "code": code} for name, code in pref_map.items()]

# ----------------------
# 取引データ分析API
# ----------------------
@app.get("/transaction-analysis", summary="取引データ分析")
def analyze_transaction_data(
    pref_code: str,
    city_name: str,
    age_filter: Optional[str] = Query(None, description="築年フィルター: 〜10年, 〜20年, 20年以上")
):
    """
    取引データを取得し、平均価格と築年数分布を分析します。
    """
    # 取引データを取得
    transaction_data = get_transaction_data(pref_code, city_name)
    
    # エラーチェック
    if isinstance(transaction_data, dict) and "error" in transaction_data:
        return transaction_data
    
    # 築年フィルター適用
    if age_filter:
        now = datetime.now().year
        filtered_data = []
        
        for item in transaction_data:
            building_year = item.get("BuildingYear", "")
            if not building_year or "年以前" in building_year:
                continue
            
            try:
                year = int(building_year.replace("年", ""))
                age = now - year
                
                if age_filter == "〜10年" and age <= 10:
                    filtered_data.append(item)
                elif age_filter == "〜20年" and age <= 20:
                    filtered_data.append(item)
                elif age_filter == "20年以上" and age > 20:
                    filtered_data.append(item)
            except:
                continue
    else:
        filtered_data = transaction_data
    
    # 価格データ分析
    trade_prices = []
    for item in filtered_data:
        try:
            price_str = item.get("TradePrice", "")
            # カンマと"万円"を除去して数値に変換
            price = int(price_str.replace(",", "").replace("万円", ""))
            trade_prices.append(price)
        except:
            continue
    
    # 築年数分布データ作成
    building_ages = []
    now = datetime.now().year
    
    for item in filtered_data:
        building_year = item.get("BuildingYear", "")
        if building_year and "年" in building_year and "年以前" not in building_year:
            try:
                year = int(building_year.replace("年", ""))
                age = now - year
                if 0 <= age <= 100:  # 現実的な築年数のみ
                    building_ages.append(age)
            except:
                continue
    
    # 築年数分布を5年ごとにグループ化
    age_distribution = {}
    for age in building_ages:
        group = f"{(age // 5) * 5}〜{(age // 5) * 5 + 4}年"
        age_distribution[group] = age_distribution.get(group, 0) + 1
    
    # 結果を返す
    return {
        "total_count": len(transaction_data),
        "filtered_count": len(filtered_data),
        "average_price": round(sum(trade_prices) / len(trade_prices)) if trade_prices else 0,
        "price_count": len(trade_prices),
        "age_distribution": age_distribution,
        "data": filtered_data
    }

# ----------------------
# HTMLページ表示エンドポイント
# ----------------------
@app.get("/", response_class=HTMLResponse)
async def show_home_page(request: Request):
    """
    メインページ（test.html）を表示します。
    """
    return templates.TemplateResponse("test.html", {"request": request})

@app.get("/test", response_class=HTMLResponse)
async def show_test_page(request: Request):
    """
    テストページ（test.html）を表示します。
    """
    return templates.TemplateResponse("test.html", {"request": request})