"""
大家DX - 不動産投資シミュレーターAPI
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Tuple
import numpy_financial as npf
from math import pow
from datetime import datetime
import os
from dotenv import load_dotenv
from openai import OpenAI
import requests
import time
import re
import random
import pandas as pd

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

# OpenAI クライアントの初期化
client = None
if openai_api_key:
    try:
        client = OpenAI(api_key=openai_api_key)
    except Exception as e:
        print(f"OpenAI APIの初期化に失敗しました: {str(e)}")

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

class AIAnalysisRequest(BaseModel):
    property_data: PropertyData
    simulation_results: Dict[str, Optional[float]]

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
    """IRR計算"""
    try:
        annual_cf_after_debt = annual_cf - annual_loan
        cashflows = [-self_funding * 10000]
        
        for i in range(years - 1):
            cashflows.append(annual_cf_after_debt)
        cashflows.append(annual_cf_after_debt + sale_profit * 10000)
        
        irr = npf.irr(cashflows)
        return irr * 100 if irr is not None else None
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
    
    # 実際のAPIを使用するかチェック
    if real_estate_api_key and real_estate_api_key != "your-real-estate-api-key-here":
        try:
            # APIエンドポイント
            API_URL = "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001"
            headers = {"Ocp-Apim-Subscription-Key": real_estate_api_key}
            
            # 都道府県コードの完全版
            prefecture_codes = {
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
            
            # 所在地から都道府県を抽出
            prefecture = None
            for pref, code in prefecture_codes.items():
                if pref in location:
                    prefecture = code
                    break
            
            if not prefecture:
                raise Exception("都道府県を特定できませんでした")
            
            # 最新の取引データを取得
            current_year = datetime.now().year
            current_quarter = (datetime.now().month - 1) // 3 + 1
            
            transactions = []
            for year in range(current_year, current_year - 2, -1):
                for quarter in range(current_quarter, 0, -1):
                    if year == current_year and quarter > current_quarter:
                        continue
                    
                    params = {
                        "year": str(year),
                        "quarter": str(quarter),
                        "area": prefecture
                    }
                    
                    try:
                        response = requests.get(API_URL, params=params, headers=headers, timeout=30)
                        
                        if response.status_code == 200:
                            data = response.json()
                            trans_data = data.get("data", [])
                            if trans_data:
                                transactions.extend(trans_data)
                                if len(transactions) >= 20:
                                    break
                    except Exception as e:
                        continue
                    
                    time.sleep(0.5)  # API制限対策
                
                if len(transactions) >= 20:
                    break
            
            if not transactions:
                raise Exception("取引データが見つかりませんでした")
            
            # 類似物件をフィルタリング
            similar_properties = []
            user_building_age = datetime.now().year - year_built
            
            for trans in transactions:
                if trans.get("Type") == "宅地(土地と建物)":
                    try:
                        # 面積の取得と比較
                        area_str = str(trans.get("Area", "0")).replace(",", "")
                        area = float(area_str)
                        area_diff = abs(area - land_area) / land_area if land_area > 0 else 1
                        
                        # 面積が±30%以内かチェック
                        if area_diff > 0.3:
                            continue
                        
                        # 築年数の処理
                        building_year_str = trans.get("BuildingYear", "")
                        building_year = None
                        building_age = None
                        
                        if building_year_str and building_year_str != "":
                            # 和暦から西暦に変換
                            if "令和" in building_year_str:
                                year_num = int(re.search(r'\d+', building_year_str).group())
                                building_year = 2018 + year_num
                            elif "平成" in building_year_str:
                                year_num = int(re.search(r'\d+', building_year_str).group())
                                building_year = 1988 + year_num
                            elif "昭和" in building_year_str:
                                year_num = int(re.search(r'\d+', building_year_str).group())
                                building_year = 1925 + year_num
                            else:
                                building_year = int(re.search(r'\d+', building_year_str).group())
                            
                            building_age = datetime.now().year - building_year
                            
                            # 築年数が±10年以内かチェック
                            if abs(building_age - user_building_age) > 10:
                                continue
                        
                        # 価格の処理
                        price_str = str(trans.get("TradePrice", "0"))
                        price = float(price_str.replace(",", ""))
                        unit_price = price / area / 10000 if area > 0 else 0
                        
                        # 類似物件として追加
                        similar_properties.append({
                            '取引時期': f"{trans.get('Year', '')}年Q{trans.get('Quarter', '')}",
                            '所在地': f"{trans.get('Prefecture', '')}{trans.get('Municipality', '')}{trans.get('DistrictName', '')}",
                            '面積(㎡)': round(area, 1),
                            '面積差': f"{area_diff*100:.1f}%",
                            '築年': building_year if building_year else None,
                            '築年数': f"{building_age}年" if building_age else None,
                            '構造': trans.get('Structure', ''),
                            '取引価格(万円)': round(price / 10000),
                            '平米単価(万円/㎡)': round(unit_price, 2),
                            '最寄駅': trans.get('NearestStation', ''),
                            '駅距離': trans.get('TimeToNearestStation', '')
                        })
                        
                    except Exception as e:
                        continue
            
            if not similar_properties:
                raise Exception("類似物件が見つかりませんでした")
                
        except Exception as e:
            # エラー時はサンプルデータを生成
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
    else:
        # APIキーがない場合はサンプルデータ
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
    median_price = pd.Series(prices).median()
    mean_price = pd.Series(prices).mean()
    std_price = pd.Series(prices).std()
    
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

# AI診断エンドポイント
@app.post("/api/ai-analysis")
def ai_analysis(request: AIAnalysisRequest):
    """AI投資診断を実行"""
    if not client:
        raise HTTPException(status_code=503, detail="OpenAI APIが利用できません")
    
    property_data = request.property_data
    simulation_results = request.simulation_results
    
    # プロンプトの構築
    prompt = f"""
    以下の不動産投資物件について、プロの投資アドバイザーとして詳細な診断を行ってください。

    ## 物件情報
    - 物件名: {property_data.property_name}
    - 所在地: {property_data.location}
    - 築年数: {datetime.now().year - property_data.year_built}年
    - 構造: {property_data.property_type}
    - 総戸数: 1戸
    - 専有面積: {property_data.building_area}㎡
    
    ## 投資条件
    - 物件価格: {property_data.purchase_price:,}万円
    - 初期費用: {property_data.other_costs:,}万円
    - 自己資金: {property_data.purchase_price - property_data.loan_amount:,}万円
    - 借入金額: {property_data.loan_amount:,}万円
    - 金利: {property_data.interest_rate}%
    - 返済期間: {property_data.loan_years}年
    
    ## 収支予想
    - 想定家賃: {property_data.monthly_rent:,}円/月
    - 管理費等: {property_data.management_fee + property_data.fixed_cost:,}円/月
    - 固定資産税: {property_data.property_tax:,}円/年
    - 空室率: {property_data.vacancy_rate}%
    
    ## シミュレーション結果
    - 表面利回り: {simulation_results.get('表面利回り（%）', 0):.2f}%
    - CCR: {simulation_results.get('CCR（%）', 0):.2f}%
    - 月間キャッシュフロー: {simulation_results.get('月間キャッシュフロー（円）', 0):,}円
    - 年間キャッシュフロー: {simulation_results.get('年間キャッシュフロー（円）', 0):,}円
    
    以下の形式で診断結果を作成してください：
    
    ## 🎯 投資判断: ★の数で5段階評価（例：★★★☆☆（3/5））
    
    ### 💪 強み
    1. 具体的な強みを3つ
    
    ### ⚠️ リスク
    1. 具体的なリスクを3つ
    
    ### 🔧 改善提案
    1. 具体的な改善案を3つ
    
    ### 📝 総合アドバイス
    この物件への投資について、総合的なアドバイスを記載
    """
    
    try:
        # OpenAI APIを呼び出し
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "あなたは経験豊富な不動産投資アドバイザーです。客観的で実践的なアドバイスを提供してください。"},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        
        return {"analysis": response.choices[0].message.content}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI診断エラー: {str(e)}")

# APIドキュメントの自動生成
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)