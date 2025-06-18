from fastapi import FastAPI, Query
from typing import List, Dict, Optional
import requests
from datetime import datetime
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
api_key = os.getenv("REAL_ESTATE_API_KEY")

app = FastAPI()

# CORS対応
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番はドメイン限定すべき
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/city-list")
def get_city_list(pref_code: str):
    res = requests.get(
        "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002",
        headers={"Ocp-Apim-Subscription-Key": api_key},
        params={"area": pref_code, "language": "ja"}
    )
    if res.status_code == 200:
        return [city["name"] for city in res.json().get("data", [])]
    return []

@app.get("/transaction-data")
def get_transaction_data(pref_code: str, city_name: str):
    city_code = ""
    res_city = requests.get(
        "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002",
        headers={"Ocp-Apim-Subscription-Key": api_key},
        params={"area": pref_code, "language": "ja"}
    )
    for city in res_city.json().get("data", []):
        if city_name in city["name"]:
            city_code = city["id"]
            break
    if not city_code:
        return {"error": "City code not found"}

    base_url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001"
    now = datetime.now()
    results = []
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
                    "priceClassification": "01",
                    "format": "json"
                }
            )
            if res.status_code == 200 and "data" in res.json():
                results.extend(res.json()["data"])
    return results