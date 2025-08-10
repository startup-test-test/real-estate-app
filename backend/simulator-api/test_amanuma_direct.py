#!/usr/bin/env python3
"""
天沼物件の直接テスト（キャメルケース変換確認）
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.calculations import run_full_simulation

def test_amanuma_camelcase_conversion():
    """天沼物件でキャメルケース変換をテスト"""
    print("=" * 60)
    print("天沼物件キャメルケース変換テスト")
    print("=" * 60)
    
    # フロントエンドから送信される形式（キャメルケース）
    property_data = {
        'purchasePrice': 6980,      # 万円
        'monthlyRent': 25,          # 万円
        'loanAmount': 7500,         # 万円
        'interestRate': 0.9,        # %
        'loanYears': 35,
        'loanType': '元利均等',
        'otherCosts': 100,          # 諸経費（万円）
        'renovationCost': 370,      # 改装費（万円）
        'managementFee': 12500,     # 管理費（円/月）
        'fixedCost': 0,             # その他固定費（円/月）
        'propertyTax': 150000,      # 固定資産税（円/年）
        'vacancyRate': 0,           # 空室率（%）
        'buildingPrice': 3000,      # 建物価格（万円）
        'depreciationYears': 35,    # 償却年数
        'effectiveTaxRate': 20,     # 実効税率（%）
        'holdingYears': 35,         # 保有年数
        'expectedSalePrice': 6980,  # 想定売却価格（万円）
    }
    
    print("\n【テスト1: 変換なし（キャメルケースのまま）】")
    print("-" * 40)
    
    # 変換なしでテスト
    try:
        result1 = run_full_simulation(property_data)
        noi1 = result1['results']['NOI（円）']
        print(f"NOI: {noi1:,}円 ({noi1/10000:.0f}万円)")
        
        if noi1 == 2850000:  # 285万円
            print("⚠️ 固定資産税が反映されていない（285万円）")
        elif noi1 == 2700000:  # 270万円
            print("✅ 固定資産税が正しく反映されている（270万円）")
    except Exception as e:
        print(f"エラー: {e}")
    
    print("\n【テスト2: 手動で変換（APIと同じ処理）】")
    print("-" * 40)
    
    # APIで行われる変換処理を模倣
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
    
    print(f"property_tax: {property_data.get('property_tax', 'なし')}")
    print(f"propertyTax: {property_data.get('propertyTax', 'なし')}")
    
    result2 = run_full_simulation(property_data)
    noi2 = result2['results']['NOI（円）']
    print(f"\nNOI: {noi2:,}円 ({noi2/10000:.0f}万円)")
    
    expected_noi = 25 * 12 * 10000 - (12500 * 12 + 150000)
    print(f"期待値: {expected_noi:,}円 ({expected_noi/10000:.0f}万円)")
    
    if noi2 == expected_noi:
        print("✅ NOIが正しく計算されています（固定資産税が反映）")
    else:
        print(f"❌ NOI計算に誤差があります（差額: {noi2 - expected_noi:,}円）")
        if noi2 - expected_noi == 150000:
            print("   → 固定資産税15万円が引かれていない")
    
    # その他の確認
    print(f"\nDSCR: {result2['results']['DSCR（返済余裕率）']:.2f}")
    print(f"LTV: {result2['results']['LTV（%）']:.2f}%")
    print(f"CCR（初年度）: {result2['results'].get('CCR（初年度）（%）')}")

if __name__ == "__main__":
    test_amanuma_camelcase_conversion()