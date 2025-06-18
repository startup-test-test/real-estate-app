from fastapi import FastAPI, Query
from typing import List, Dict, Optional
from fastapi.middleware.cors import CORSMiddleware
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