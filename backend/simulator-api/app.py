"""
大家DX - 不動産投資シミュレーターAPI（軽量版）
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
import requests
import time
import re
import random
from shared.calculations import run_full_simulation

# .envファイルの読み込み
load_dotenv()

# FastAPIアプリケーションの初期化
app = FastAPI(
    title="大家DX API",
    description="不動産投資シミュレーター RESTful API",
    version="1.0.0"
)

# CORS設定
# 環境変数から許可するオリジンを取得
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:4173").split(",")

# 本番環境では厳格なオリジン設定を使用
if os.getenv("ENV", "development") == "production":
    # 本番環境では環境変数で明示的に設定されたオリジンのみ許可
    if not os.getenv("ALLOWED_ORIGINS"):
        # 本番環境でオリジンが設定されていない場合はエラー
        raise ValueError("本番環境ではALLOWED_ORIGINSの設定が必須です")
else:
    # 開発環境ではlocalhostと開発サーバーを許可
    allowed_origins.extend([
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173"
    ])
    # 重複を除去
    allowed_origins = list(set(allowed_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["Content-Length", "Content-Range"]
)

# APIキーの取得
openai_api_key = os.getenv("OPENAI_API_KEY", "")
real_estate_api_key = os.getenv("REAL_ESTATE_API_KEY", "")

# データ型定義（Pydanticなしのシンプル版）
# リクエストはJSONとして直接受け取る

# ヘルスチェックエンドポイント
@app.get("/")
def read_root():
    return {
        "message": "大家DX API",
        "version": "1.0.0",
        "status": "running"
    }

# 古い計算関数は削除し、shared.calculations.pyの関数を使用

# シミュレーションエンドポイント
@app.post("/api/simulate")
def run_simulation(property_data: dict):
    """収益シミュレーションを実行 - 新機能対応版"""
    # 共通計算ロジックを使用してシミュレーション実行
    return run_full_simulation(property_data)

# 市場分析エンドポイント
@app.post("/api/market-analysis")
def market_analysis(request: dict):
    """類似物件の市場分析を実行"""
    location = request.get('location', '')
    land_area = request.get('land_area', 0)
    year_built = request.get('year_built', 2000)
    purchase_price = request.get('purchase_price', 0)
    
    # ユーザー物件の平米単価を計算
    user_unit_price = purchase_price * 10000 / land_area / 10000 if land_area > 0 else 0
    
    # サンプルデータを生成（実際のAPIは後で実装）
    similar_properties = []
    for i in range(15):
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
    
    return {
        "similar_properties": similar_properties,
        "statistics": {
            "median_price": round(median_price, 2),
            "mean_price": round(mean_price, 2),
            "std_price": round(std_price, 2),
            "user_price": round(user_unit_price, 2),
            "deviation": round(deviation, 1),
            "evaluation": evaluation
        }
    }

# APIドキュメントの自動生成
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)