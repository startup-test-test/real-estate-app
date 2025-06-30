"""
CCRとROI計算の詳細デバッグ
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.calculations import run_full_simulation, calculate_basic_metrics

def debug_ccr_roi():
    """CCRとROI計算の詳細デバッグ"""
    
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
    
    print("🔍 CCR・ROI計算の詳細デバッグ")
    print("=" * 50)
    
    # システム内部の基本計算を取得
    basic_metrics = calculate_basic_metrics(test_data)
    result = run_full_simulation(test_data)
    
    print("\n📊 システム内部の計算値:")
    print(f"annual_rent: {basic_metrics['annual_rent']:,}円")
    print(f"annual_cf: {basic_metrics['annual_cf']:,}円")
    print(f"self_funding: {basic_metrics['self_funding']:,}万円")
    print(f"annual_loan: {basic_metrics['annual_loan']:,}円")
    print(f"noi: {basic_metrics['noi']:,}円")
    
    print(f"\n📊 システム結果:")
    print(f"CCR: {result['results']['CCR（%）']}%")
    print(f"ROI: {result['results']['ROI（%）']}%")
    
    # 手動計算（段階的に）
    print(f"\n🧮 手動計算（段階的）:")
    
    # Step 1: 基本値
    annual_rent = 100000 * 12  # 120万円
    annual_expenses = (5000 + 3000) * 12 + 100000  # 19.6万円
    annual_cf = annual_rent - annual_expenses  # 100.4万円
    self_funding = 2000 - 1600 + 100 + 100  # 600万円
    annual_loan = basic_metrics['annual_loan']  # システムから
    
    print(f"Step 1 - 基本キャッシュフロー:")
    print(f"  年間家賃収入: {annual_rent:,}円")
    print(f"  年間経費: {annual_expenses:,}円") 
    print(f"  税引前CF: {annual_cf:,}円")
    print(f"  自己資金: {self_funding:,}万円")
    print(f"  年間ローン返済: {annual_loan:,}円")
    
    # Step 2: 税金計算
    annual_depreciation = 1500 * 10000 / 30  # 50万円
    real_estate_income = annual_cf - annual_depreciation  # 50.4万円
    tax = real_estate_income * 0.20  # 10.08万円
    tax_after_cf = annual_cf - tax  # 90.32万円
    
    print(f"\nStep 2 - 税金計算:")
    print(f"  減価償却: {annual_depreciation:,}円")
    print(f"  不動産所得: {real_estate_income:,}円")
    print(f"  税金: {tax:,}円")
    print(f"  税引後CF: {tax_after_cf:,}円")
    
    # Step 3: CCR・ROI計算
    ccr_manual = ((tax_after_cf - annual_loan) / (self_funding * 10000)) * 100
    roi_manual = (tax_after_cf / (self_funding * 10000)) * 100
    
    print(f"\nStep 3 - CCR・ROI計算:")
    print(f"  CCR分子: {tax_after_cf:,} - {annual_loan:,} = {tax_after_cf - annual_loan:,}円")
    print(f"  CCR分母: {self_funding:,}万円 = {self_funding * 10000:,}円")
    print(f"  CCR手動: {ccr_manual:.2f}%")
    print(f"  CCRシステム: {result['results']['CCR（%）']}%")
    print(f"  CCR差分: {abs(ccr_manual - result['results']['CCR（%）']):.2f}%")
    
    print(f"\n  ROI分子: {tax_after_cf:,}円")
    print(f"  ROI分母: {self_funding * 10000:,}円")
    print(f"  ROI手動: {roi_manual:.2f}%")
    print(f"  ROIシステム: {result['results']['ROI（%）']}%")
    print(f"  ROI差分: {abs(roi_manual - result['results']['ROI（%）']):.2f}%")
    
    print(f"\n🎯 結論:")
    if abs(ccr_manual - result['results']['CCR（%）']) < 0.1:
        print("✅ CCR計算は正確")
    else:
        print("❌ CCR計算に問題がある可能性")
        
    if abs(roi_manual - result['results']['ROI（%）']) < 0.1:
        print("✅ ROI計算は正確")
    else:
        print("❌ ROI計算に問題がある可能性")

if __name__ == "__main__":
    debug_ccr_roi()