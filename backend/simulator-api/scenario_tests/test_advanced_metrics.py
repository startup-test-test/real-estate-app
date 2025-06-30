"""
CCR、IRR、NOI、DSCR等の高度指標の計算検証
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.calculations import run_full_simulation
import math

def test_advanced_metrics():
    """高度指標の詳細検証"""
    
    # テストデータ
    test_data = {
        'monthly_rent': 100000,      # 月間家賃10万円
        'vacancy_rate': 0,           # 空室率0%
        'management_fee': 5000,      # 管理費5千円/月
        'fixed_cost': 3000,          # 固定費3千円/月  
        'property_tax': 100000,      # 固定資産税10万円/年
        'purchase_price': 2000,      # 購入価格2000万円
        'loan_amount': 1600,         # 融資1600万円
        'other_costs': 100,          # 諸費用100万円
        'renovation_cost': 100,      # リフォーム100万円
        'interest_rate': 2.0,        # 金利2%
        'loan_years': 30,           # 融資期間30年
        'loan_type': '元利均等',
        'exit_cap_rate': 5.0,
        'land_area': 100,
        'road_price': 200000,
        'building_area': 80,
        'market_value': 2000,
        'holding_years': 10,         # 10年で検証
        'rent_decline': 0,           # 家賃下落なし
        'ownership_type': '個人',
        'effective_tax_rate': 20,    # 実効税率20%
        'major_repair_cycle': 10,    # 大規模修繕10年周期
        'major_repair_cost': 200,    # 大規模修繕200万円
        'building_price': 1500,      # 建物価格1500万円
        'depreciation_years': 30     # 償却年数30年
    }
    
    print("🎯 高度指標の詳細検証")
    print("=" * 60)
    
    result = run_full_simulation(test_data)
    
    # 手動計算による期待値
    print("\n📋 手動計算による各指標:")
    
    # 基本数値
    annual_rent = 100000 * 12  # 120万円
    annual_expenses = (5000 + 3000) * 12 + 100000  # 19.6万円
    annual_depreciation = 1500 * 10000 / 30  # 50万円
    real_estate_income = annual_rent - annual_expenses - annual_depreciation  # 50.4万円
    tax = real_estate_income * 0.20  # 10.08万円
    annual_cf = annual_rent - annual_expenses - tax  # 108.912万円
    self_funding = 2000 - 1600 + 100 + 100  # 600万円
    annual_loan = 709669  # システムから取得した値
    
    print(f"年間家賃収入: {annual_rent:,}円")
    print(f"年間経費: {annual_expenses:,}円")
    print(f"年間減価償却: {annual_depreciation:,}円")
    print(f"年間税金: {tax:,}円")
    print(f"年間キャッシュフロー: {annual_cf:,}円")
    print(f"自己資金: {self_funding:,}万円")
    print(f"年間ローン返済: {annual_loan:,}円")
    
    # 1. 表面利回り
    gross_yield_manual = (annual_rent / (2000 * 10000)) * 100
    print(f"\n📊 1. 表面利回り:")
    print(f"  計算式: {annual_rent:,} ÷ {2000 * 10000:,} × 100")
    print(f"  手動計算: {gross_yield_manual:.2f}%")
    print(f"  システム: {result['results']['表面利回り（%）']}%")
    print(f"  判定: {'✅ 一致' if abs(gross_yield_manual - result['results']['表面利回り（%）']) < 0.01 else '❌ 不一致'}")
    
    # 2. NOI (Net Operating Income)
    noi_manual = annual_rent - annual_expenses
    print(f"\n📊 2. NOI (純営業収益):")
    print(f"  計算式: {annual_rent:,} - {annual_expenses:,}")
    print(f"  手動計算: {noi_manual:,}円")
    print(f"  システム: {result['results']['NOI（円）']:,}円")
    print(f"  判定: {'✅ 一致' if noi_manual == result['results']['NOI（円）'] else '❌ 不一致'}")
    
    # 3. CCR (Cash on Cash Return)
    tax_after_cf = annual_cf - annual_loan - tax  # 税引後キャッシュフロー
    ccr_manual = (tax_after_cf / (self_funding * 10000)) * 100
    print(f"\n📊 3. CCR (自己資金利回り):")
    print(f"  税引後CF: {annual_cf:,} - {annual_loan:,} - {tax:,} = {tax_after_cf:,}円")
    print(f"  計算式: {tax_after_cf:,} ÷ {self_funding * 10000:,} × 100")
    print(f"  手動計算: {ccr_manual:.2f}%")
    print(f"  システム: {result['results']['CCR（%）']}%")
    print(f"  判定: {'✅ 一致' if abs(ccr_manual - result['results']['CCR（%）']) < 0.1 else '❌ 不一致'}")
    
    # 4. ROI (Return on Investment)
    roi_manual = (annual_cf / (self_funding * 10000)) * 100
    print(f"\n📊 4. ROI (投資収益率):")
    print(f"  計算式: {annual_cf:,} ÷ {self_funding * 10000:,} × 100")
    print(f"  手動計算: {roi_manual:.2f}%")
    print(f"  システム: {result['results']['ROI（%）']}%")
    print(f"  判定: {'✅ 一致' if abs(roi_manual - result['results']['ROI（%）']) < 0.1 else '❌ 不一致'}")
    
    # 5. DSCR (Debt Service Coverage Ratio)
    dscr_manual = noi_manual / annual_loan
    print(f"\n📊 5. DSCR (返済余裕率):")
    print(f"  計算式: {noi_manual:,} ÷ {annual_loan:,}")
    print(f"  手動計算: {dscr_manual:.2f}")
    print(f"  システム: {result['results']['DSCR（返済余裕率）']}")
    print(f"  判定: {'✅ 一致' if abs(dscr_manual - result['results']['DSCR（返済余裕率）']) < 0.01 else '❌ 不一致'}")
    
    # 6. LTV (Loan to Value)
    assessed_total = (100 * 200000 / 10000) + (80 * 20)  # 土地評価 + 建物評価
    ltv_manual = (1600 / assessed_total) * 100
    print(f"\n📊 6. LTV (融資比率):")
    print(f"  積算評価: 土地{100 * 200000 / 10000:,}万円 + 建物{80 * 20:,}万円 = {assessed_total:,}万円")
    print(f"  計算式: {1600:,} ÷ {assessed_total:,} × 100")
    print(f"  手動計算: {ltv_manual:.2f}%")
    print(f"  システム: {result['results']['LTV（%）']}%")
    print(f"  判定: {'✅ 一致' if abs(ltv_manual - result['results']['LTV（%）']) < 0.1 else '❌ 不一致'}")
    
    # 7. IRR (Internal Rate of Return) - 簡易検証
    print(f"\n📊 7. IRR (内部収益率):")
    print(f"  システム: {result['results']['IRR（%）']}%")
    print(f"  判定: IRRは複雑な計算のため、妥当性の範囲チェック")
    irr_value = result['results']['IRR（%）']
    if irr_value is not None and -20 <= irr_value <= 50:
        print(f"  ✅ 妥当な範囲内 ({irr_value}%)")
    else:
        print(f"  ❌ 異常値の可能性 ({irr_value}%)")
    
    # 8. 売却時の計算
    print(f"\n📊 8. 売却時分析:")
    print(f"  売却価格: {result['results']['実勢価格（万円）']:,}万円")
    print(f"  残債: {result['results']['残債（万円）']:,}万円")
    print(f"  売却コスト: {result['results']['売却コスト（万円）']:,}万円")
    print(f"  売却益: {result['results']['売却益（万円）']:,}万円")
    
    # 売却益の手動計算
    sale_profit_manual = 2000 - result['results']['残債（万円）'] - 100
    print(f"  手動計算売却益: {2000:,} - {result['results']['残債（万円）']:,} - {100:,} = {sale_profit_manual:.2f}万円")
    print(f"  判定: {'✅ 一致' if abs(sale_profit_manual - result['results']['売却益（万円）']) < 0.1 else '❌ 不一致'}")
    
    print(f"\n🎉 高度指標検証完了")

if __name__ == "__main__":
    test_advanced_metrics()