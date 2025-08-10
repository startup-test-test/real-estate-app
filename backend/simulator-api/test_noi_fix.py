#!/usr/bin/env python3
"""
NOI計算修正テスト（キャメルケース対応）
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import run_simulation

def test_noi_with_camel_case():
    """キャメルケースでのNOI計算テスト"""
    print("=" * 60)
    print("NOI計算修正テスト（キャメルケース対応）")
    print("=" * 60)
    
    # フロントエンドから送信される形式（キャメルケース）
    property_data = {
        'purchasePrice': 6980,
        'monthlyRent': 250000,  # 円
        'loanAmount': 7500,
        'interestRate': 0.9,
        'loanYears': 35,
        'loanType': '元利均等',
        'otherCosts': 100,
        'renovationCost': 370,
        'managementFee': 12500,  # 円/月
        'fixedCost': 0,
        'propertyTax': 150000,  # 円/年（重要：これが正しく変換されるか）
        'vacancyRate': 0,
        'buildingPrice': 3000,
        'depreciationYears': 35,
        'effectiveTaxRate': 20,
        'holdingYears': 35,
        'expectedSalePrice': 6980,
    }
    
    # シミュレーション実行
    result = run_simulation(property_data)
    
    print("\n【入力データ（キャメルケース）】")
    print("-" * 40)
    print(f"月額賃料: {property_data['monthlyRent']:,}円")
    print(f"管理費: {property_data['managementFee']:,}円/月")
    print(f"固定資産税: {property_data['propertyTax']:,}円/年")
    
    print("\n【NOI計算結果】")
    print("-" * 40)
    noi = result['results']['NOI（円）']
    print(f"NOI: {noi:,}円 ({noi/10000:.0f}万円)")
    
    print("\n【期待値との比較】")
    print("-" * 40)
    expected_noi = 250000 * 12 - (12500 * 12 + 150000)
    print(f"期待値: {expected_noi:,}円 ({expected_noi/10000:.0f}万円)")
    
    if noi == expected_noi:
        print("✅ NOI計算が正しく行われています")
    else:
        print(f"❌ NOI計算に誤差があります（差額: {noi - expected_noi:,}円）")
    
    # DSCR・収益還元価額も確認
    print("\n【連動指標の確認】")
    print("-" * 40)
    dscr = result['results']['DSCR（返済余裕率）']
    print(f"DSCR: {dscr:.2f}")
    print(f"期待値: 約1.08（NOI 270万円 ÷ 年間返済額 約250万円）")
    
    # 収益還元価額 = NOI ÷ Cap Rate
    # Cap Rate 6%の場合: 270万円 ÷ 0.06 = 4500万円
    revenue_value = result['results'].get('収益還元価額（万円）', 0)
    if revenue_value:
        print(f"収益還元価額: {revenue_value}万円")
        print(f"期待値: 4500万円（NOI 270万円 ÷ Cap Rate 6%）")

if __name__ == "__main__":
    test_noi_with_camel_case()