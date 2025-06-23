"""
大家DX - 不動産投資シミュレーターAPI（軽量版）
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
from math import pow
from datetime import datetime
import os
from dotenv import load_dotenv
import requests
import time
import re
import random

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

# 計算関数
def calculate_remaining_loan(loan_amount, interest_rate, loan_years, elapsed_years, loan_type="元利均等"):
    """ローン残高を計算"""
    r = interest_rate/100/12
    n = loan_years*12
    m = elapsed_years*12
    P = loan_amount*10000
    
    if loan_type == "元利均等":
        if r == 0:
            remaining = P * (n - m) / n
        else:
            remaining = P * (pow(1+r,n) - pow(1+r,m)) / (pow(1+r,n) - 1)
    else:
        monthly_principal = P / n
        remaining = P - (monthly_principal * m)
    
    return remaining / 10000

def calculate_irr(annual_cf, years, sale_profit, self_funding, annual_loan):
    """IRR計算（簡単な近似）"""
    try:
        annual_cf_after_debt = annual_cf - annual_loan
        total_cf = annual_cf_after_debt * years + sale_profit * 10000
        initial_investment = self_funding * 10000
        
        if initial_investment <= 0:
            return None
            
        # 簡単な近似計算
        total_return = total_cf / initial_investment
        irr_approx = (pow(total_return, 1/years) - 1) * 100
        
        return irr_approx if irr_approx > -100 and irr_approx < 1000 else None
    except:
        return None

# シミュレーションエンドポイント
@app.post("/api/simulate")
def run_simulation(property_data: dict):
    """収益シミュレーションを実行"""
    # プロパティデータから値を取得
    monthly_rent = property_data.get('monthly_rent', 0)
    vacancy_rate = property_data.get('vacancy_rate', 0)
    management_fee = property_data.get('management_fee', 0)
    fixed_cost = property_data.get('fixed_cost', 0)
    property_tax = property_data.get('property_tax', 0)
    purchase_price = property_data.get('purchase_price', 0)
    loan_amount = property_data.get('loan_amount', 0)
    other_costs = property_data.get('other_costs', 0)
    renovation_cost = property_data.get('renovation_cost', 0)
    interest_rate = property_data.get('interest_rate', 0)
    loan_years = property_data.get('loan_years', 0)
    loan_type = property_data.get('loan_type', '元利均等')
    exit_cap_rate = property_data.get('exit_cap_rate', 0)
    land_area = property_data.get('land_area', 0)
    road_price = property_data.get('road_price', 0)
    building_area = property_data.get('building_area', 0)
    market_value = property_data.get('market_value', 0)
    holding_years = property_data.get('holding_years', 0)
    rent_decline = property_data.get('rent_decline', 0)
    
    # キャッシュフロー計算
    annual_rent = monthly_rent * 12 * (1 - vacancy_rate/100)
    monthly_cf = monthly_rent - management_fee - fixed_cost
    annual_cf = monthly_cf * 12
    
    # 自己資金
    self_funding = purchase_price - loan_amount + other_costs + renovation_cost
    
    # ローン返済
    if interest_rate > 0:
        r = interest_rate/100/12
        n = loan_years*12
        monthly_loan = loan_amount*10000 * (r*pow(1+r,n)) / (pow(1+r,n)-1)
    else:
        monthly_loan = loan_amount*10000 / (loan_years*12)
    annual_loan = monthly_loan * 12
    
    # NOI, 評価等
    noi = annual_rent - (management_fee*12 + fixed_cost*12 + property_tax)
    
    # 評価額計算
    if exit_cap_rate > 0:
        cap_rate_eval = noi / (exit_cap_rate/100) / 10000
    else:
        cap_rate_eval = 0
    
    land_eval = land_area * road_price / 10000
    building_eval = building_area * 20
    assessed_total = land_eval + building_eval
    sale_cost = market_value * 0.05
    
    # 売却時のローン残高
    remaining_loan = calculate_remaining_loan(
        loan_amount, interest_rate, loan_years, holding_years, loan_type
    )
    sale_profit = market_value - remaining_loan - sale_cost
    
    # IRR計算
    irr = calculate_irr(annual_cf, holding_years, sale_profit, self_funding, annual_loan)
    
    # 各種比率
    gross_yield = annual_rent / (purchase_price*10000) * 100
    ccr = ((annual_cf - annual_loan) / (self_funding*10000)) * 100 if self_funding > 0 else 0
    roi = (annual_cf / (self_funding*10000)) * 100 if self_funding > 0 else 0
    dscr = noi / annual_loan if annual_loan else 0
    ltv = loan_amount / assessed_total * 100 if assessed_total > 0 else 0
    
    # 結果
    results = {
        "年間家賃収入（円）": int(annual_rent),
        "表面利回り（%）": round(gross_yield, 2),
        "月間キャッシュフロー（円）": int(monthly_cf),
        "年間キャッシュフロー（円）": int(annual_cf),
        "CCR（%）": round(ccr, 2),
        "ROI（%）": round(roi, 2),
        "IRR（%）": round(irr, 2) if irr is not None else None,
        "年間ローン返済額（円）": int(annual_loan),
        "NOI（円）": int(noi),
        "収益還元評価額（万円）": round(cap_rate_eval, 2),
        "実勢価格（万円）": market_value,
        "土地積算評価（万円）": round(land_eval, 2),
        "建物積算評価（万円）": round(building_eval, 2),
        "積算評価合計（万円）": round(assessed_total, 2),
        "売却コスト（万円）": round(sale_cost, 2),
        "残債（万円）": round(remaining_loan, 2),
        "売却益（万円）": round(sale_profit, 2),
        "LTV（%）": round(ltv, 2),
        "DSCR（返済余裕率）": round(dscr, 2),
        "自己資金（万円）": round(self_funding, 2)
    }
    
    # 年次キャッシュフロー表
    years_list = list(range(1, holding_years + 1))
    cum = 0
    cf_data = []
    
    for i in years_list:
        adjusted_monthly_rent = monthly_rent * (1 - (i-1) * rent_decline/100)
        full_annual_rent = adjusted_monthly_rent * 12
        eff = full_annual_rent * (1 - vacancy_rate/100)
        
        annual_expenses = (management_fee + fixed_cost) * 12 + property_tax
        
        repair = 0
        if i % 10 == 0:  # 10年ごとに大規模修繕
            repair = building_area * 10000
        
        cf_i = eff - annual_expenses - annual_loan - repair
        cum += cf_i
        
        cf_data.append({
            "年次": f"{i}年目",
            "満室想定収入": int(full_annual_rent),
            "空室率（%）": vacancy_rate,
            "実効収入": int(eff),
            "経費": int(annual_expenses),
            "大規模修繕": int(repair),
            "ローン返済": int(annual_loan),
            "営業CF": int(cf_i),
            "累計CF": int(cum)
        })
    
    return {"results": results, "cash_flow_table": cf_data}

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