"""
大家DX - 不動産投資シミュレーターAPI（軽量版）
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import random
from shared.calculations import run_full_simulation
from validations import validate_simulator_input, validate_market_analysis_input, create_validation_error_response

# .envファイルの読み込み
load_dotenv()

# FastAPIアプリケーションの初期化
app = FastAPI(
    title="大家DX API",
    description="不動産投資シミュレーター RESTful API",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    # 入力値のバリデーション
    validation_errors = validate_simulator_input(property_data)
    
    if validation_errors:
        # バリデーションエラーの場合、統一フォーマットでレスポンス
        error_response = create_validation_error_response(validation_errors)
        return JSONResponse(
            status_code=400,
            content=error_response
        )
    
    try:
        # 共通計算ロジックを使用してシミュレーション実行
        return run_full_simulation(property_data)
        
    except Exception as e:
        # デバッグ用にエラー詳細を出力
        import traceback
        print(f"Simulation error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        
        # その他のエラーの場合（詳細は隠蔽）
        return JSONResponse(
            status_code=500,
            content={
                "error": "シミュレーションの実行中にエラーが発生しました",
                "details": ["システムエラーが発生しました。しばらく時間をおいて再度お試しください。"],
                "debug_info": str(e),  # デバッグ用
                "status_code": 500
            }
        )

# 市場分析エンドポイント
@app.post("/api/market-analysis")
def market_analysis(request: dict):
    """類似物件の市場分析を実行"""
    # 入力値のバリデーション
    validation_errors = validate_market_analysis_input(request)
    
    if validation_errors:
        # バリデーションエラーの場合、統一フォーマットでレスポンス
        error_response = create_validation_error_response(validation_errors)
        return JSONResponse(
            status_code=400,
            content=error_response
        )
    
    try:
        location = request.get('location', '')
        land_area = request.get('land_area', 0)
        year_built = request.get('year_built', 2000)
        purchase_price = request.get('purchase_price', 0)
    
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
    except Exception:
        # その他のエラーの場合（詳細は隠蔽）
        return JSONResponse(
            status_code=500,
            content={
                "error": "市場分析の実行中にエラーが発生しました",
                "details": ["システムエラーが発生しました。しばらく時間をおいて再度お試しください。"],
                "status_code": 500
            }
        )

# APIドキュメントの自動生成
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)