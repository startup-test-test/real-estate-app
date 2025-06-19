"""
大家DX - 不動産投資シミュレーターAPI（軽量版）
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
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

# リクエスト・レスポンスモデル
class PropertyData(BaseModel):
    property_name: str = Field(..., description="物件名")
    location: str = Field(..., description="所在地")
    year_built: int = Field(..., description="建築年")
    property_type: str = Field(..., description="物件種別")
    land_area: float = Field(..., description="土地面積(㎡)")
    building_area: float = Field(..., description="建物面積(㎡)")
    road_price: int = Field(..., description="路線価(円/㎡)")
    purchase_price: float = Field(..., description="購入価格(万円)")
    building_price: float = Field(..., description="建物価格(万円)")
    other_costs: float = Field(..., description="諸経費(万円)")
    renovation_cost: float = Field(..., description="改装費(万円)")
    monthly_rent: int = Field(..., description="月額賃料(円)")
    management_fee: int = Field(..., description="管理費(月額円)")
    fixed_cost: int = Field(..., description="その他固定費(月額円)")
    property_tax: int = Field(..., description="固定資産税(円/年)")
    vacancy_rate: float = Field(..., description="空室率(%)")
    rent_decline: float = Field(..., description="家賃下落率(%/年)")
    loan_type: str = Field(..., description="借入形式")
    loan_amount: float = Field(..., description="借入額(万円)")
    interest_rate: float = Field(..., description="金利(%)")
    loan_years: int = Field(..., description="返済年数")
    holding_years: int = Field(..., description="保有年数(年)")
    exit_cap_rate: float = Field(..., description="売却CapRate(%)")
    market_value: float = Field(..., description="想定売却価格(万円)")

class SimulationResult(BaseModel):
    results: Dict[str, Optional[float]]
    cash_flow_table: List[Dict[str, Optional[float]]]

class MarketAnalysisRequest(BaseModel):
    location: str = Field(..., description="所在地")
    land_area: float = Field(..., description="土地面積(㎡)")
    year_built: int = Field(..., description="建築年")
    purchase_price: float = Field(..., description="購入価格(万円)")

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
@app.post("/api/simulate", response_model=SimulationResult)
def run_simulation(property_data: PropertyData):
    """収益シミュレーションを実行"""
    # プロパティデータから値を取得
    monthly_rent = property_data.monthly_rent
    vacancy_rate = property_data.vacancy_rate
    management_fee = property_data.management_fee
    fixed_cost = property_data.fixed_cost
    property_tax = property_data.property_tax
    purchase_price = property_data.purchase_price
    loan_amount = property_data.loan_amount
    other_costs = property_data.other_costs
    renovation_cost = property_data.renovation_cost
    interest_rate = property_data.interest_rate
    loan_years = property_data.loan_years
    loan_type = property_data.loan_type
    exit_cap_rate = property_data.exit_cap_rate
    land_area = property_data.land_area
    road_price = property_data.road_price
    building_area = property_data.building_area
    market_value = property_data.market_value
    holding_years = property_data.holding_years
    rent_decline = property_data.rent_decline
    
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
    years_list = list(range(1, min(holding_years + 1, 11)))
    cum = 0
    cf_data = []
    
    for i in years_list:
        adjusted_monthly_rent = monthly_rent * (1 - (i-1) * rent_decline/100)
        full_annual_rent = adjusted_monthly_rent * 12
        eff = full_annual_rent * (1 - vacancy_rate/100)
        
        annual_expenses = (management_fee + fixed_cost) * 12 + property_tax
        
        repair = 0
        if i % 5 == 0:
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
    
    return SimulationResult(results=results, cash_flow_table=cf_data)

# 市場分析エンドポイント
@app.post("/api/market-analysis")
def market_analysis(request: MarketAnalysisRequest):
    """類似物件の市場分析を実行"""
    location = request.location
    land_area = request.land_area
    year_built = request.year_built
    purchase_price = request.purchase_price
    
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