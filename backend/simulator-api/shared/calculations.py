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
    net_yield = (noi - tax) / (purchase_price * 10000) * 100 if purchase_price > 0 else 0  # 実質利回り
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
        'net_yield': net_yield,
        'ccr': ccr,
        'roi': roi,
        'dscr': dscr
    }


def calculate_property_valuation(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """物件評価額を計算（積算法準拠）"""
    exit_cap_rate = property_data.get('exit_cap_rate', 0)
    land_area = property_data.get('land_area', 0)
    road_price = property_data.get('road_price', 0)
    building_area = property_data.get('building_area', 0)
    market_value = property_data.get('market_value', 0)
    
    # 追加パラメータ
    year_built = property_data.get('year_built', 2000)
    property_type = property_data.get('property_type', '木造')
    
    # 基本指標を取得
    basic_metrics = calculate_basic_metrics(property_data)
    noi = basic_metrics['noi']
    
    # 収益還元評価
    if exit_cap_rate > 0:
        cap_rate_eval = noi / (exit_cap_rate / 100) / 10000
    else:
        cap_rate_eval = 0
    
    # 土地評価
    land_eval = land_area * road_price / 10000
    
    # 建物評価（積算法）
    # 構造別の再調達価格（万円/㎡）
    replacement_costs = {
        "木造": 15,
        "軽量鉄骨造": 18,
        "重量鉄骨造": 20,
        "RC造": 22,
        "SRC造": 25
    }
    
    # 法定耐用年数
    legal_useful_life = {
        "木造": 22,
        "軽量鉄骨造": 27,
        "重量鉄骨造": 34,
        "RC造": 47,
        "SRC造": 47
    }
    
    # 再調達価格と耐用年数を取得（デフォルトは木造）
    unit_price = replacement_costs.get(property_type, 15)
    useful_life = legal_useful_life.get(property_type, 22)
    
    # 築年数を計算
    current_year = 2025
    building_age = current_year - year_built
    
    # 新築時の建物価格
    new_building_cost = building_area * unit_price
    
    # 残存年数
    remaining_years = useful_life - building_age
    
    # 建物評価額（積算法）
    if remaining_years <= 0:
        # 耐用年数超過 → 0円
        building_eval = 0
    else:
        # 定額法による残存価値率（最終残存価値10%）
        residual_rate = (remaining_years / useful_life) * 0.9 + 0.1
        building_eval = new_building_cost * residual_rate
    
    # 積算評価合計（リノベーション費用は含めない）
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
    
    # 売却価格評価方法を最初に決定（1年目の評価で判定）
    expected_sale_price = property_data.get('expected_sale_price', property_data.get('market_value', 0))
    exit_cap_rate = property_data.get('exit_cap_rate', 5.0)
    purchase_price = property_data.get('purchase_price', 0)
    land_price = purchase_price - building_price
    
    # 1年目のNOIを計算して評価方法を決定
    first_year_eff = monthly_rent * 12 * (1 - vacancy_rate / 100)
    first_year_expenses = (management_fee + fixed_cost) * 12 + property_tax
    renovation_cost = property_data.get('renovation_cost', 0)
    first_year_noi = first_year_eff - first_year_expenses - renovation_cost * 10000
    
    # 各評価方法の価格を計算
    manual_price = expected_sale_price
    cap_rate_price = first_year_noi / (exit_cap_rate / 100) / 10000 if exit_cap_rate > 0 and first_year_noi > 0 else 0
    
    # 最も高い評価方法を決定
    price_method = 'manual'  # デフォルト
    highest_price = manual_price
    
    if cap_rate_price > highest_price:
        price_method = 'cap_rate'
        highest_price = cap_rate_price
    
    if land_price > highest_price:
        price_method = 'land'
        highest_price = land_price
    
    for i in years_list:
        adjusted_monthly_rent = monthly_rent * (1 - (i - 1) * rent_decline / 100)
        full_annual_rent = adjusted_monthly_rent * 12
        eff = full_annual_rent * (1 - vacancy_rate / 100)
        
        annual_expenses = (management_fee + fixed_cost) * 12 + property_tax
        
        # 大規模修繕（資本的支出対応）
        major_repair_cycle = property_data.get('major_repair_cycle', 10)
        major_repair_cost = property_data.get('major_repair_cost', 200)
        
        # 修繕費の分類（20万円以上は資本的支出、未満は通常修繕）
        capital_repair_threshold = 20  # 20万円
        
        current_year_repair = 0  # 通常修繕（経費）
        capital_repair_amount = 0  # 資本的修繕（今年度実施分）
        
        if i % major_repair_cycle == 0:  # ユーザー指定周期で修繕実施
            if major_repair_cost >= capital_repair_threshold:
                # 20万円以上は資本的支出として処理
                capital_repair_amount = major_repair_cost
                current_year_repair = 0  # 経費としては計上しない
            else:
                # 20万円未満は通常修繕として経費計上
                current_year_repair = major_repair_cost * 10000
                capital_repair_amount = 0
        
        # 改装費の会計処理（常に資本的支出として扱う）
        renovation_cost = property_data.get('renovation_cost', 0)
        
        # 初期リフォーム費用は計上しない（減価償却に含める）
        initial_renovation = 0
        
        # 過去の資本的修繕の累積額を計算
        accumulated_capital_repairs = 0
        for past_year in range(1, i + 1):
            if past_year % major_repair_cycle == 0 and major_repair_cost >= capital_repair_threshold:
                accumulated_capital_repairs += major_repair_cost
        
        # 減価償却費の計算（建物価格 + 改装費 + 累積資本的修繕）
        total_depreciable_amount = building_price + renovation_cost + accumulated_capital_repairs
        depreciation = calculate_depreciation(total_depreciable_amount, depreciation_years, i)
        
        # 不動産所得（税金計算用）
        real_estate_income = eff - annual_expenses - depreciation
        
        # 税金計算
        tax = calculate_tax(real_estate_income, effective_tax_rate)
        
        # ローン関連パラメータの取得
        loan_amount = property_data.get('loan_amount', 0)
        interest_rate = property_data.get('interest_rate', 0)
        loan_years = property_data.get('loan_years', 0)
        loan_type = property_data.get('loan_type', '元利均等')
        
        # 年次ローン返済額を正しく計算（完済後は0）
        remaining_loan = calculate_remaining_loan(
            loan_amount, interest_rate, loan_years, i, loan_type
        )
        
        if i <= loan_years and remaining_loan > 0:
            # ローン返済期間内かつ残高がある場合
            actual_annual_loan = annual_loan
        else:
            # ローン完済後は返済額0
            actual_annual_loan = 0
        
        # キャッシュフロー（税引後）
        # 通常修繕のみ経費計上、資本的修繕は減価償却として処理済み
        cf_i = eff - annual_expenses - actual_annual_loan - current_year_repair - initial_renovation - tax
        cum += cf_i
        
        # NOI（Net Operating Income）計算
        # 通常修繕のみ計上、資本的修繕は含めない
        noi = eff - annual_expenses - current_year_repair - initial_renovation
        
        # DSCR計算
        dscr = noi / actual_annual_loan if actual_annual_loan > 0 else 0
        
        # 売却金額を計算（全年度で同じ評価方法を使用）
        price_decline_rate = property_data.get('price_decline_rate', 0)
        
        if price_method == 'manual':
            # 方法1: ユーザー入力の想定売却価格（価格下落率を適用）
            if expected_sale_price > 0 and price_decline_rate > 0:
                sale_price_current_year = expected_sale_price * pow(1 - price_decline_rate / 100, i - 1)
            else:
                sale_price_current_year = expected_sale_price
        
        elif price_method == 'cap_rate':
            # 方法2: 収益還元法（売却時のNOI ÷ Cap Rate）
            if exit_cap_rate > 0 and noi > 0:
                sale_price_current_year = noi / (exit_cap_rate / 100) / 10000
            else:
                sale_price_current_year = 0
        
        else:  # price_method == 'land'
            # 方法3: 土地価格（積算法の簡易版、変動なし）
            sale_price_current_year = land_price
        
        # 売却価格が0の場合は、最低限購入価格の一定割合で売却できると仮定
        if sale_price_current_year == 0:
            # 価格下落を考慮して購入価格から計算
            if price_decline_rate > 0:
                sale_price_current_year = purchase_price * pow(1 - price_decline_rate / 100, i - 1)
            else:
                # 価格下落率が設定されていない場合は、年1%下落と仮定
                sale_price_current_year = purchase_price * pow(0.99, i - 1)
        
        sale_amount = sale_price_current_year * 10000
        
        
        
        # 元金返済額の計算（年間ローン返済額 - 利息）
        if interest_rate > 0 and i > 0 and actual_annual_loan > 0:
            # 前年のローン残高から利息を計算
            prev_remaining = calculate_remaining_loan(
                loan_amount, interest_rate, loan_years, i-1, loan_type
            )
            annual_interest = prev_remaining * 10000 * (interest_rate / 100)
            principal_payment = actual_annual_loan - annual_interest
        else:
            principal_payment = actual_annual_loan
        
        
        # 自己資金回収率計算
        self_funding = basic_metrics['self_funding']
        recovery_rate = cum / (self_funding * 10000) if self_funding > 0 else 0
        
        # 売却時手取り計算（全年度で計算）
        if sale_amount > 0:
            sale_cost = sale_amount * 0.03  # 売却コスト3%（楽待基準）
            
            # 譲渡所得税の計算
            purchase_price = property_data.get('purchase_price', 0)
            renovation_cost = property_data.get('renovation_cost', 0)
            other_costs = property_data.get('other_costs', 0)
            # 取得費 = 購入価格 + 改装費 + 諸経費
            acquisition_cost = (purchase_price + renovation_cost + other_costs) * 10000
            capital_gain = sale_amount - acquisition_cost - depreciation * i  # 売却益
            
            if capital_gain > 0:
                # 短期譲渡（5年以内）: 40%、長期譲渡（6年以降）: 20%
                if i <= 5:
                    transfer_tax = capital_gain * 0.40
                else:
                    transfer_tax = capital_gain * 0.20
            else:
                transfer_tax = 0
            
            net_sale_proceeds = sale_amount - remaining_loan * 10000 - sale_cost - transfer_tax
        else:
            net_sale_proceeds = 0
        
        # 売却時累計CF（楽待方式）
        # 累計CF + (売却金額 - 売却費用 - 譲渡所得税 - 残存借入額) - 自己資金
        # ただし、グラフ表示用に自己資金の差し引きは別途計算
        sale_cumulative_cf = cum + net_sale_proceeds - basic_metrics['self_funding'] * 10000
        
        # 売却による純利益（売却時累計CF - 累計CF）
        sale_net_profit = sale_cumulative_cf - cum
        
        # グラフ表示用の売却時累計CF（自己資金を差し引かない）
        sale_cumulative_cf_display = cum + net_sale_proceeds
        
        # 修繕費の情報表示（参考値）
        repair_info = 0
        if i == 1 and renovation_cost > 0:
            # 1年目に初期改装費を情報表示
            repair_info = renovation_cost * 10000
        elif i % major_repair_cycle == 0:
            # 大規模修繕発生年に修繕費を情報表示
            repair_info = major_repair_cost * 10000
        
        cf_data.append({
            "年次": f"{i}年目",
            "満室想定収入": int(full_annual_rent),
            "空室率（%）": vacancy_rate,
            "実効収入": int(eff),
            "経費": int(annual_expenses),
            "減価償却": int(depreciation),
            "税金": int(tax),
            "修繕費（参考）": int(repair_info),
            "ローン返済": int(actual_annual_loan),
            "元金返済": int(principal_payment),  # 元金返済額
            "営業CF": int(cf_i),
            "累計CF": int(cum),
            "借入残高": int(max(0, remaining_loan)),  # 借入残高（万円、負の場合は0）
            "自己資金回収率": round(recovery_rate * 100, 1),  # 自己資金回収率（%）
            "DSCR": round(dscr, 2),  # DSCR計算済み
            "売却金額": int(sale_amount),  # 売却金額
            "売却時手取り": int(net_sale_proceeds),  # 売却時手取り
            "売却による純利益": int(sale_net_profit),  # 売却による純利益
            "売却時累計CF": int(sale_cumulative_cf),  # 売却時累計CF（楽待方式）
            "売却価格内訳": {
                "想定価格": int(expected_sale_price * pow(1 - price_decline_rate / 100, i - 1) * 10000) if price_decline_rate > 0 else int(expected_sale_price * 10000),
                "収益還元価格": int(noi / (exit_cap_rate / 100)) if exit_cap_rate > 0 and noi > 0 else 0,
                "土地価格": int(land_price * 10000),
                "採用方法": price_method
            }
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
        "実質利回り（%）": round(basic_metrics['net_yield'], 2),
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