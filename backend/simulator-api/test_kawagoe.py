#!/usr/bin/env python3
"""
川越物件の改装費とCCRテスト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.calculations import run_full_simulation

def test_kawagoe():
    """川越シナリオのテスト（改装費あり）"""
    print("=" * 60)
    print("川越物件 改装費・CCRテスト")
    print("=" * 60)
    
    # 川越シナリオの入力データ
    property_data = {
        'purchase_price': 480,       # 万円
        'monthly_rent': 7,           # 万円
        'loan_amount': 400,          # 万円
        'interest_rate': 1.0,        # %
        'loan_years': 30,
        'loan_type': '元利均等',
        'other_costs': 40,           # 諸経費（万円）
        'renovation_cost': 370,      # 改装費（万円）
        'management_fee': 12500,     # 管理費（円/月）
        'fixed_cost': 20000,         # その他固定費（円/月）
        'property_tax': 50000,       # 固定資産税（円/年）
        'vacancy_rate': 0,           # 空室率（%）
        'building_price': 400,       # 建物価格（万円）
        'depreciation_years': 5,     # 償却年数
        'effective_tax_rate': 20,    # 実効税率（%）
        'holding_years': 5,          # 保有年数
        'expected_sale_price': 450,  # 想定売却価格（万円）
        'exit_cap_rate': 5.0,        # Cap Rate
        'rent_decline': 0,           # 賃料下落率
        'price_decline_rate': 0,     # 価格下落率
        'major_repair_cycle': 0,     # 大規模修繕なし
        'major_repair_cost': 0,
    }
    
    # シミュレーション実行
    result = run_full_simulation(property_data)
    
    print("\n【自己資金計算】")
    print("-" * 40)
    purchase_price = 480
    loan_amount = 400
    other_costs = 40
    renovation_cost = 370
    
    self_funding = purchase_price - loan_amount + other_costs + renovation_cost
    print(f"自己資金 = {purchase_price} - {loan_amount} + {other_costs} + {renovation_cost}")
    print(f"        = {self_funding}万円")
    
    print("\n【NOI計算】")
    print("-" * 40)
    annual_rent = 7 * 12  # 万円
    management_fee = 12500 * 12  # 円
    fixed_cost = 20000 * 12  # 円
    property_tax = 50000  # 円
    
    noi = annual_rent * 10000 - (management_fee + fixed_cost + property_tax)
    print(f"年間賃料: {annual_rent * 10000:,}円 ({7}万円×12ヶ月)")
    print(f"管理費: {management_fee:,}円 ({12500}円×12ヶ月)")
    print(f"その他: {fixed_cost:,}円 ({20000}円×12ヶ月)")
    print(f"固定資産税: {property_tax:,}円")
    print(f"NOI = {annual_rent * 10000:,} - {management_fee + fixed_cost + property_tax:,}")
    print(f"    = {noi:,}円 ({noi/10000:.1f}万円)")
    
    print("\n【改装費の処理】")
    print("-" * 40)
    print(f"改装費（CF）: {renovation_cost}万円を初年度に全額控除")
    building_depreciation = 400 * 10000 / 5
    renovation_depreciation = 370 * 10000 / 5
    total_depreciation = building_depreciation + renovation_depreciation
    print(f"建物減価償却: {building_depreciation:,.0f}円/年")
    print(f"改装費償却: {renovation_depreciation:,.0f}円/年")
    print(f"合計減価償却: {total_depreciation:,.0f}円/年")
    
    print("\n【初年度キャッシュフロー】")
    print("-" * 40)
    if result['cash_flow_table']:
        first_year = result['cash_flow_table'][0]
        operating_cf = first_year['営業CF']
        print(f"営業CF（改装費込み）: {operating_cf:,}円")
        
        # CCR計算
        ccr_expected = (operating_cf / (self_funding * 10000)) * 100
        ccr_actual = result['results']['CCR（初年度）（%）']
        
        print(f"\n【CCR（初年度）】")
        print("-" * 40)
        print(f"計算式: {operating_cf:,}円 ÷ {self_funding}万円 × 100")
        print(f"期待値: {ccr_expected:.2f}%")
        print(f"実際値: {ccr_actual:.2f}%" if ccr_actual is not None else "実際値: N/A")
        
        # 結果確認
        print("\n【結果サマリー】")
        print("-" * 40)
        print(f"NOI: {result['results']['NOI（円）']:,}円")
        print(f"DSCR: {result['results']['DSCR（返済余裕率）']:.2f}")
        print(f"CCR（初年度）: {result['results']['CCR（初年度）（%）']:.2f}%" if result['results']['CCR（初年度）（%）'] is not None else "CCR（初年度）: N/A")
        print(f"CCR（全期間）: {result['results']['CCR（全期間）（%）']:.2f}%" if result['results']['CCR（全期間）（%）'] is not None else "CCR（全期間）: N/A")

if __name__ == "__main__":
    test_kawagoe()