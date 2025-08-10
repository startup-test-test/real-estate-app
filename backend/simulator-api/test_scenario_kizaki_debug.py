#!/usr/bin/env python3
"""
木崎物件のデバッグ用詳細テスト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.calculations import run_full_simulation

def test_kizaki_debug():
    """木崎シナリオの詳細デバッグ"""
    print("=" * 60)
    print("木崎物件 詳細デバッグ")
    print("=" * 60)
    
    # 木崎シナリオの入力データ
    property_data = {
        'purchase_price': 1350,  # 万円
        'monthly_rent': 15,      # 万円
        'loan_amount': 1350,     # 万円（フルローン）
        'interest_rate': 1.0,    # %
        'loan_years': 30,
        'loan_type': '元利均等',
        'other_costs': 500,      # 諸経費（万円）
        'renovation_cost': 100,  # 改装費（万円）
        'management_fee': 7500,  # 管理費（円/月）
        'fixed_cost': 0,         # その他固定費（円/月）
        'property_tax': 50000,   # 固定資産税（円/年）
        'vacancy_rate': 0,       # 空室率（%）
        'building_price': 400,   # 建物価格（万円）
        'depreciation_years': 5, # 償却年数
        'effective_tax_rate': 20,  # 実効税率（%）
        'holding_years': 5,      # 保有年数
        'expected_sale_price': 1350,  # 想定売却価格（万円）
        'exit_cap_rate': 5.0,    # Cap Rate
        'rent_decline': 0,       # 賃料下落率
        'price_decline_rate': 0, # 価格下落率
        'major_repair_cycle': 0, # 大規模修繕なし
        'major_repair_cost': 0,
    }
    
    # シミュレーション実行
    result = run_full_simulation(property_data)
    
    print("\n【初年度の詳細計算】")
    print("-" * 40)
    
    # 収入
    monthly_rent = 15  # 万円
    annual_rent = monthly_rent * 12  # 万円
    annual_rent_yen = annual_rent * 10000  # 円
    print(f"賃料収入: {annual_rent_yen:,}円 ({monthly_rent}万円×12ヶ月)")
    
    # 経費
    management_fee_annual = 7500 * 12
    property_tax = 50000
    total_expenses = management_fee_annual + property_tax
    print(f"\n経費合計: {total_expenses:,}円")
    print(f"  管理費: {management_fee_annual:,}円 (7,500円×12ヶ月)")
    print(f"  固定資産税: {property_tax:,}円")
    
    # NOI
    noi = annual_rent_yen - total_expenses
    print(f"\nNOI: {noi:,}円")
    print(f"  計算: {annual_rent_yen:,} - {total_expenses:,}")
    
    # ローン返済
    loan_payment = result['results']['年間ローン返済額（円）']
    print(f"\n年間ローン返済: {loan_payment:,}円")
    
    # 減価償却
    building_depreciation = 400 * 10000 / 5  # 建物
    renovation_depreciation = 100 * 10000 / 5  # 改装費
    total_depreciation = building_depreciation + renovation_depreciation
    print(f"\n減価償却費合計: {total_depreciation:,}円")
    print(f"  建物: {building_depreciation:,}円 (400万円÷5年)")
    print(f"  改装費: {renovation_depreciation:,}円 (100万円÷5年)")
    
    # 税務所得
    taxable_income = annual_rent_yen - total_expenses - total_depreciation
    print(f"\n税務所得: {taxable_income:,}円")
    print(f"  計算: {annual_rent_yen:,} - {total_expenses:,} - {total_depreciation:,}")
    
    # 税金
    tax = taxable_income * 0.2 if taxable_income > 0 else 0
    print(f"\n税金: {tax:,}円 (税務所得×20%)")
    
    # 改装費の現金支出（初年度のみ）
    renovation_cash = 100 * 10000
    print(f"\n改装費支出（初年度）: {renovation_cash:,}円")
    
    # キャッシュフロー計算
    print(f"\n【初年度キャッシュフロー計算】")
    print("-" * 40)
    cf_before_renovation = annual_rent_yen - total_expenses - loan_payment - tax
    print(f"改装費控除前CF: {cf_before_renovation:,}円")
    print(f"  計算: {annual_rent_yen:,} - {total_expenses:,} - {loan_payment:,} - {tax:,}")
    
    cf_after_renovation = cf_before_renovation - renovation_cash
    print(f"\n改装費控除後CF: {cf_after_renovation:,}円")
    print(f"  計算: {cf_before_renovation:,} - {renovation_cash:,}")
    
    # 実際の結果と比較
    if result['cash_flow_table']:
        first_year = result['cash_flow_table'][0]
        actual_cf = first_year['営業CF']
        print(f"\n実際の営業CF: {actual_cf:,}円")
        print(f"差異: {actual_cf - cf_after_renovation:,}円")
        
        # CCR計算
        self_funding = 600  # 万円
        ccr_expected = (cf_after_renovation / (self_funding * 10000)) * 100
        ccr_actual = result['results']['CCR（初年度）（%）']
        
        print(f"\n【CCR検証】")
        print("-" * 40)
        print(f"期待されるCCR: {ccr_expected:.2f}%")
        print(f"  計算: {cf_after_renovation:,}円 ÷ 600万円 × 100")
        print(f"実際のCCR: {ccr_actual:.2f}%")
        print(f"差異: {ccr_actual - ccr_expected:.2f}%")

if __name__ == "__main__":
    test_kizaki_debug()