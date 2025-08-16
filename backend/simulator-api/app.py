"""
大家DX - 不動産投資シミュレーターAPI（軽量版）
"""

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
import random
import traceback
from shared.calculations import run_full_simulation
from validations import validate_simulator_input, validate_market_analysis_input, create_validation_error_response
from error_codes import ErrorCode, SimulatorError, create_error_response

# .envファイルの読み込み
load_dotenv()

# FastAPIアプリケーションの初期化
app = FastAPI(
    title="大家DX API",
    description="不動産投資シミュレーター RESTful API",
    version="1.0.0"
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
        # キャメルケースからスネークケースへの変換
        # フロントエンドから送信される propertyTax を property_tax に変換
        if 'propertyTax' in property_data:
            property_data['property_tax'] = property_data.get('propertyTax', 0)
        if 'fixedCost' in property_data:
            property_data['fixed_cost'] = property_data.get('fixedCost', 0)
        if 'managementFee' in property_data:
            property_data['management_fee'] = property_data.get('managementFee', 0)
        if 'renovationCost' in property_data:
            property_data['renovation_cost'] = property_data.get('renovationCost', 0)
        if 'monthlyRent' in property_data:
            property_data['monthly_rent'] = property_data.get('monthlyRent', 0)
        if 'purchasePrice' in property_data:
            property_data['purchase_price'] = property_data.get('purchasePrice', 0)
        if 'loanAmount' in property_data:
            property_data['loan_amount'] = property_data.get('loanAmount', 0)
        if 'interestRate' in property_data:
            property_data['interest_rate'] = property_data.get('interestRate', 0)
        if 'loanYears' in property_data:
            property_data['loan_years'] = property_data.get('loanYears', 0)
        if 'loanType' in property_data:
            property_data['loan_type'] = property_data.get('loanType', '元利均等')
        if 'otherCosts' in property_data:
            property_data['other_costs'] = property_data.get('otherCosts', 0)
        if 'vacancyRate' in property_data:
            property_data['vacancy_rate'] = property_data.get('vacancyRate', 0)
        if 'buildingPrice' in property_data:
            property_data['building_price'] = property_data.get('buildingPrice', 0)
        if 'depreciationYears' in property_data:
            property_data['depreciation_years'] = property_data.get('depreciationYears', 0)
        if 'effectiveTaxRate' in property_data:
            property_data['effective_tax_rate'] = property_data.get('effectiveTaxRate', 0)
        if 'holdingYears' in property_data:
            property_data['holding_years'] = property_data.get('holdingYears', 0)
        if 'expectedSalePrice' in property_data:
            property_data['expected_sale_price'] = property_data.get('expectedSalePrice', 0)
        if 'buildingPriceForDepreciation' in property_data:
            property_data['building_price'] = property_data.get('buildingPriceForDepreciation', 0)
        if 'exitCapRate' in property_data:
            property_data['exit_cap_rate'] = property_data.get('exitCapRate', 0)
        if 'priceDeclineRate' in property_data:
            property_data['price_decline_rate'] = property_data.get('priceDeclineRate', 0)
        if 'rentDecline' in property_data:
            property_data['rent_decline'] = property_data.get('rentDecline', 0)
        if 'majorRepairCycle' in property_data:
            property_data['major_repair_cycle'] = property_data.get('majorRepairCycle', 0)
        if 'majorRepairCost' in property_data:
            property_data['major_repair_cost'] = property_data.get('majorRepairCost', 0)
        
        # 共通計算ロジックを使用してシミュレーション実行
        return run_full_simulation(property_data)
        
    except SimulatorError as e:
        # カスタムエラーの場合
        return JSONResponse(
            status_code=500,
            content=e.to_dict()
        )
    except ZeroDivisionError:
        # ゼロ除算エラー
        error_response = create_error_response(
            ErrorCode.CALC_DIVISION_BY_ZERO,
            status_code=500
        )
        return JSONResponse(
            status_code=500,
            content=error_response
        )
    except OverflowError:
        # オーバーフローエラー
        error_response = create_error_response(
            ErrorCode.CALC_OVERFLOW,
            status_code=500
        )
        return JSONResponse(
            status_code=500,
            content=error_response
        )
    except ValueError as e:
        # 値エラー
        error_response = create_error_response(
            ErrorCode.CALC_INVALID_PARAMETER,
            status_code=500,
            detail=str(e)
        )
        return JSONResponse(
            status_code=500,
            content=error_response
        )
    except Exception as e:
        # その他のエラーの場合
        # エラー詳細をログ出力（本番環境でも一時的に有効化）
        print(f"[ERROR] Simulation error: {str(e)}")
        print(f"[ERROR] Error type: {type(e).__name__}")
        print(f"[ERROR] Stack trace:\n{traceback.format_exc()}")
        
        # エラーメッセージをより具体的に
        error_detail = f"{type(e).__name__}: {str(e)}"
        
        error_response = create_error_response(
            ErrorCode.SYSTEM_GENERAL,
            status_code=500,
            detail=error_detail if os.getenv("ENV") == "development" else "予期しないエラーが発生しました"
        )
        return JSONResponse(
            status_code=500,
            content=error_response
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
    except Exception as e:
        # その他のエラーの場合
        if os.getenv("ENV") == "development":
            print(f"Error: {str(e)}")
            print(traceback.format_exc())
        
        error_response = create_error_response(
            ErrorCode.SYSTEM_GENERAL,
            status_code=500,
            detail="市場分析の実行中にエラーが発生しました"
        )
        return JSONResponse(
            status_code=500,
            content=error_response
        )

# APIドキュメントの自動生成
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)