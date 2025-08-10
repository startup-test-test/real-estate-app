#!/usr/bin/env python3
"""
NOI計算修正テスト（キャメルケース変換後）
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.calculations import run_full_simulation

def test_noi_with_conversion():
    """キャメルケース変換後のNOI計算テスト"""
    print("=" * 60)
    print("NOI計算修正テスト（変換処理適用）")
    print("=" * 60)
    
    # フロントエンドから送信される形式（キャメルケース）
    property_data = {
        'purchasePrice': 6980,
        'monthlyRent': 25,  # 万円（バックエンドの期待値）
        'loanAmount': 7500,
        'interestRate': 0.9,
        'loanYears': 35,
        'loanType': '元利均等',
        'otherCosts': 100,
        'renovationCost': 370,
        'managementFee': 12500,  # 円/月
        'fixedCost': 0,
        'propertyTax': 150000,  # 円/年
        'vacancyRate': 0,
        'buildingPrice': 3000,
        'depreciationYears': 35,
        'effectiveTaxRate': 20,
        'holdingYears': 35,
        'expectedSalePrice': 6980,
    }
    
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
    
    print("\n【変換後のキー確認】")
    print("-" * 40)
    print(f"property_tax（変換後）: {property_data.get('property_tax', 'なし')}")
    print(f"propertyTax（元のキー）: {property_data.get('propertyTax', 'なし')}")
    
    # シミュレーション実行
    result = run_full_simulation(property_data)
    
    print("\n【NOI計算結果】")
    print("-" * 40)
    noi = result['results']['NOI（円）']
    print(f"NOI: {noi:,}円 ({noi/10000:.0f}万円)")
    
    print("\n【期待値との比較】")
    print("-" * 40)
    expected_noi = 25 * 12 * 10000 - (12500 * 12 + 150000)
    print(f"期待値: {expected_noi:,}円 ({expected_noi/10000:.0f}万円)")
    
    if noi == expected_noi:
        print("✅ NOI計算が正しく行われています（固定資産税が反映）")
    else:
        print(f"❌ NOI計算に誤差があります（差額: {noi - expected_noi:,}円）")
    
    # DSCR確認
    dscr = result['results']['DSCR（返済余裕率）']
    print(f"\nDSCR: {dscr:.2f}")
    print(f"期待値: 約1.08（NOI 270万円 ÷ 年間返済額 約250万円）")

if __name__ == "__main__":
    test_noi_with_conversion()