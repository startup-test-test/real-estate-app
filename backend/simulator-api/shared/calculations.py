"""
不動産投資シミュレーター計算ロジック
Streamlit開発版とFastAPI本番版で共通使用
"""

from math import pow
from typing import Dict, List, Optional, Any


def calculate_remaining_loan(loan_amount: float, interest_rate: float, loan_years: int, 
                           elapsed_years: int, loan_type: str = "元利均等") -> float:
    """ローン残高を計算"""
    r = interest_rate / 100 / 12
    n = loan_years * 12
    m = elapsed_years * 12
    P = loan_amount * 10000
    
    if loan_type == "元利均等":
        if r == 0:
            remaining = P * (n - m) / n
        else:
            remaining = P * (pow(1 + r, n) - pow(1 + r, m)) / (pow(1 + r, n) - 1)
    else:
        monthly_principal = P / n
        remaining = P - (monthly_principal * m)
    
    return remaining / 10000


def calculate_irr(annual_cf: float, years: int, sale_profit: float, 
                 self_funding: float, annual_loan: float) -> Optional[float]:
    """IRR計算（簡単な近似）"""
    try:
        annual_cf_after_debt = annual_cf - annual_loan
        total_cf = annual_cf_after_debt * years + sale_profit * 10000
        initial_investment = self_funding * 10000
        
        if initial_investment <= 0:
            return None
            
        # 簡単な近似計算
        total_return = total_cf / initial_investment
        irr_approx = (pow(total_return, 1 / years) - 1) * 100
        
        return irr_approx if irr_approx > -100 and irr_approx < 1000 else None
    except:
        return None


def calculate_monthly_loan_payment(loan_amount: float, interest_rate: float, 
                                 loan_years: int) -> float:
    """月間ローン返済額を計算"""
    if interest_rate > 0:
        r = interest_rate / 100 / 12
        n = loan_years * 12
        monthly_loan = loan_amount * 10000 * (r * pow(1 + r, n)) / (pow(1 + r, n) - 1)
    else:
        monthly_loan = loan_amount * 10000 / (loan_years * 12)
    
    return monthly_loan


def calculate_basic_metrics(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """基本的な収益指標を計算"""
    # 基本データの取得
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
    
    # キャッシュフロー計算
    annual_rent = monthly_rent * 12 * (1 - vacancy_rate / 100)
    monthly_cf = monthly_rent - management_fee - fixed_cost
    annual_cf = monthly_cf * 12
    
    # 自己資金
    self_funding = purchase_price - loan_amount + other_costs + renovation_cost
    
    # ローン返済
    monthly_loan = calculate_monthly_loan_payment(loan_amount, interest_rate, loan_years)
    annual_loan = monthly_loan * 12
    
    # NOI
    noi = annual_rent - (management_fee * 12 + fixed_cost * 12 + property_tax)
    
    # 税金計算用パラメータ（CCR/ROI計算のため）
    effective_tax_rate = property_data.get('effective_tax_rate', 20)
    building_price = property_data.get('building_price', 2000)
    depreciation_years = property_data.get('depreciation_years', 27)
    
    # 減価償却費（1年目）
    annual_depreciation = calculate_depreciation(building_price, depreciation_years, 1)
    
    # 不動産所得と税金
    real_estate_income = annual_rent - (management_fee * 12 + fixed_cost * 12 + property_tax) - annual_depreciation
    tax = calculate_tax(real_estate_income, effective_tax_rate)
    
    # 税引後キャッシュフロー（正確な計算）
    tax_after_cf = noi - tax
    
    # 各種比率（税引後ベース）
    gross_yield = annual_rent / (purchase_price * 10000) * 100 if purchase_price > 0 else 0
    ccr = ((tax_after_cf - annual_loan) / (self_funding * 10000)) * 100 if self_funding > 0 else 0
    roi = (tax_after_cf / (self_funding * 10000)) * 100 if self_funding > 0 else 0
    dscr = noi / annual_loan if annual_loan > 0 else 0
    
    return {
        'annual_rent': annual_rent,
        'annual_cf': annual_cf,
        'monthly_cf': monthly_cf,
        'self_funding': self_funding,
        'annual_loan': annual_loan,
        'noi': noi,
        'gross_yield': gross_yield,
        'ccr': ccr,
        'roi': roi,
        'dscr': dscr
    }


def calculate_property_valuation(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """物件評価額を計算"""
    exit_cap_rate = property_data.get('exit_cap_rate', 0)
    land_area = property_data.get('land_area', 0)
    road_price = property_data.get('road_price', 0)
    building_area = property_data.get('building_area', 0)
    market_value = property_data.get('market_value', 0)
    
    # 基本指標を取得
    basic_metrics = calculate_basic_metrics(property_data)
    noi = basic_metrics['noi']
    
    # 評価額計算
    if exit_cap_rate > 0:
        cap_rate_eval = noi / (exit_cap_rate / 100) / 10000
    else:
        cap_rate_eval = 0
    
    land_eval = land_area * road_price / 10000
    building_eval = building_area * 20
    assessed_total = land_eval + building_eval
    
    return {
        'cap_rate_eval': cap_rate_eval,
        'land_eval': land_eval,
        'building_eval': building_eval,
        'assessed_total': assessed_total,
        'market_value': market_value
    }


def calculate_sale_analysis(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """売却分析を計算"""
    loan_amount = property_data.get('loan_amount', 0)
    interest_rate = property_data.get('interest_rate', 0)
    loan_years = property_data.get('loan_years', 0)
    loan_type = property_data.get('loan_type', '元利均等')
    holding_years = property_data.get('holding_years', 0)
    # 想定売却価格を優先、なければ市場価格を使用
    expected_sale_price = property_data.get('expected_sale_price', property_data.get('market_value', 0))
    
    # 売却時のローン残高
    remaining_loan = calculate_remaining_loan(
        loan_amount, interest_rate, loan_years, holding_years, loan_type
    )
    
    # 売却コスト（5%）
    sale_cost = expected_sale_price * 0.05
    
    # 売却益
    sale_profit = expected_sale_price - remaining_loan - sale_cost
    
    return {
        'remaining_loan': remaining_loan,
        'sale_cost': sale_cost,
        'sale_profit': sale_profit
    }


def calculate_cash_flow_table(property_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """年次キャッシュフロー表を生成"""
    monthly_rent = property_data.get('monthly_rent', 0)
    vacancy_rate = property_data.get('vacancy_rate', 0)
    management_fee = property_data.get('management_fee', 0)
    fixed_cost = property_data.get('fixed_cost', 0)
    property_tax = property_data.get('property_tax', 0)
    holding_years = property_data.get('holding_years', 0)
    rent_decline = property_data.get('rent_decline', 0)
    building_area = property_data.get('building_area', 0)
    
    # 基本指標を取得
    basic_metrics = calculate_basic_metrics(property_data)
    annual_loan = basic_metrics['annual_loan']
    
    years_list = list(range(1, holding_years + 1))
    cum = 0
    cf_data = []
    
    # 税金計算用パラメータ
    effective_tax_rate = property_data.get('effective_tax_rate', 20)
    building_price = property_data.get('building_price', 2000)
    depreciation_years = property_data.get('depreciation_years', 27)
    
    for i in years_list:
        adjusted_monthly_rent = monthly_rent * (1 - (i - 1) * rent_decline / 100)
        full_annual_rent = adjusted_monthly_rent * 12
        eff = full_annual_rent * (1 - vacancy_rate / 100)
        
        annual_expenses = (management_fee + fixed_cost) * 12 + property_tax
        
        # 大規模修繕（カスタマイズ対応）
        major_repair_cycle = property_data.get('major_repair_cycle', 10)
        major_repair_cost = property_data.get('major_repair_cost', 200)
        
        repair = 0
        if i % major_repair_cycle == 0:  # ユーザー指定周期で大規模修繕
            repair = major_repair_cost * 10000
        
        # 初期リフォーム費用（1年目のみ）
        initial_renovation = 0
        if i == 1:
            renovation_cost = property_data.get('renovation_cost', 0)
            initial_renovation = renovation_cost * 10000
        
        # 減価償却費
        depreciation = calculate_depreciation(building_price, depreciation_years, i)
        
        # 不動産所得（税金計算用）
        real_estate_income = eff - annual_expenses - depreciation
        
        # 税金計算
        tax = calculate_tax(real_estate_income, effective_tax_rate)
        
        # キャッシュフロー（税引後）
        cf_i = eff - annual_expenses - annual_loan - repair - initial_renovation - tax
        cum += cf_i
        
        # NOI（Net Operating Income）計算
        noi = eff - annual_expenses - repair - initial_renovation
        
        # DSCR計算
        dscr = noi / annual_loan if annual_loan > 0 else 0
        
        # 売却金額を計算（想定売却価格または市場価値）
        expected_sale_price = property_data.get('expected_sale_price', property_data.get('market_value', 0))
        sale_amount = expected_sale_price * 10000 if i == holding_years else 0
        
        # ローン残高計算
        loan_amount = property_data.get('loan_amount', 0)
        interest_rate = property_data.get('interest_rate', 0)
        loan_years = property_data.get('loan_years', 0)
        loan_type = property_data.get('loan_type', '元利均等')
        
        remaining_loan = calculate_remaining_loan(
            loan_amount, interest_rate, loan_years, i, loan_type
        )
        
        
        # 元金返済額の計算（年間ローン返済額 - 利息）
        if interest_rate > 0 and i > 0:
            # 前年のローン残高から利息を計算
            prev_remaining = calculate_remaining_loan(
                loan_amount, interest_rate, loan_years, i-1, loan_type
            )
            annual_interest = prev_remaining * 10000 * (interest_rate / 100)
            principal_payment = annual_loan - annual_interest
        else:
            principal_payment = annual_loan
        
        
        # 自己資金回収率計算
        self_funding = basic_metrics['self_funding']
        recovery_rate = cum / (self_funding * 10000) if self_funding > 0 else 0
        
        # 売却時手取り計算（最終年度のみ）
        if i == holding_years and sale_amount > 0:
            sale_cost = sale_amount * 0.05  # 売却コスト5%
            net_sale_proceeds = sale_amount - remaining_loan * 10000 - sale_cost
        else:
            net_sale_proceeds = 0
        
        cf_data.append({
            "年次": f"{i}年目",
            "満室想定収入": int(full_annual_rent),
            "空室率（%）": vacancy_rate,
            "実効収入": int(eff),
            "経費": int(annual_expenses),
            "減価償却": int(depreciation),
            "税金": int(tax),
            "大規模修繕": int(repair),
            "初期リフォーム": int(initial_renovation),
            "ローン返済": int(annual_loan),
            "元金返済": 0,  # TODO: 元金返済額の計算
            "営業CF": int(cf_i),
            "累計CF": int(cum),
            "借入残高": 0,  # TODO: 借入残高の計算
            "自己資金回収率": 0,  # TODO: 自己資金回収率の計算
            "DSCR": round(dscr, 2),  # DSCR計算済み
            "売却金額": int(sale_amount),  # 売却金額
            "売却時手取り": 0  # TODO: 売却時手取りの計算
        })
    
    return cf_data


def calculate_depreciation(building_price: float, depreciation_years: int, year: int) -> float:
    """減価償却費を計算（定額法）"""
    annual_depreciation = building_price * 10000 / depreciation_years
    return annual_depreciation if year <= depreciation_years else 0


def calculate_tax(income: float, effective_tax_rate: float) -> float:
    """実効税率による税金計算（シンプル方式）"""
    if income <= 0:
        return 0
    return income * (effective_tax_rate / 100)


def run_full_simulation(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """完全なシミュレーションを実行"""
    # 基本指標
    basic_metrics = calculate_basic_metrics(property_data)
    
    # 物件評価
    valuation = calculate_property_valuation(property_data)
    
    # 売却分析
    sale_analysis = calculate_sale_analysis(property_data)
    
    # IRR計算
    irr = calculate_irr(
        basic_metrics['annual_cf'],
        property_data.get('holding_years', 0),
        sale_analysis['sale_profit'],
        basic_metrics['self_funding'],
        basic_metrics['annual_loan']
    )
    
    # LTV計算
    loan_amount = property_data.get('loan_amount', 0)
    ltv = loan_amount / valuation['assessed_total'] * 100 if valuation['assessed_total'] > 0 else 0
    
    # 結果をまとめる
    results = {
        "年間家賃収入（円）": int(basic_metrics['annual_rent']),
        "表面利回り（%）": round(basic_metrics['gross_yield'], 2),
        "月間キャッシュフロー（円）": int(basic_metrics['monthly_cf']),
        "年間キャッシュフロー（円）": int(basic_metrics['annual_cf']),
        "CCR（%）": round(basic_metrics['ccr'], 2),
        "ROI（%）": round(basic_metrics['roi'], 2),
        "IRR（%）": round(irr, 2) if irr is not None else None,
        "年間ローン返済額（円）": int(basic_metrics['annual_loan']),
        "NOI（円）": int(basic_metrics['noi']),
        "収益還元評価額（万円）": round(valuation['cap_rate_eval'], 2),
        "実勢価格（万円）": valuation['market_value'],
        "想定売却価格（万円）": property_data.get('expected_sale_price', valuation['market_value']),
        "土地積算評価（万円）": round(valuation['land_eval'], 2),
        "建物積算評価（万円）": round(valuation['building_eval'], 2),
        "積算評価合計（万円）": round(valuation['assessed_total'], 2),
        "売却コスト（万円）": round(sale_analysis['sale_cost'], 2),
        "残債（万円）": round(sale_analysis['remaining_loan'], 2),
        "売却益（万円）": round(sale_analysis['sale_profit'], 2),
        "LTV（%）": round(ltv, 2),
        "DSCR（返済余裕率）": round(basic_metrics['dscr'], 2),
        "自己資金（万円）": round(basic_metrics['self_funding'], 2)
    }
    
    # キャッシュフロー表
    cash_flow_table = calculate_cash_flow_table(property_data)
    
    return {
        "results": results,
        "cash_flow_table": cash_flow_table
    }