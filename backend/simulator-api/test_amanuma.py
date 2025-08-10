#!/usr/bin/env python3
"""
天沼物件のCCR N/A表示テスト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.calculations import run_full_simulation

def test_amanuma():
    """天沼シナリオのテスト（自己資金がマイナス）"""
    print("=" * 60)
    print("天沼物件 CCR N/A表示テスト")
    print("=" * 60)
    
    # 天沼シナリオの入力データ
    property_data = {
        'purchase_price': 6980,      # 万円
        'monthly_rent': 30,          # 万円
        'loan_amount': 7500,         # 万円（購入価格を超える借入）
        'interest_rate': 1.0,        # %
        'loan_years': 30,
        'loan_type': '元利均等',
        'other_costs': 200,          # 諸経費（万円）
        'renovation_cost': 0,        # 改装費なし
        'management_fee': 15000,     # 管理費（円/月）
        'fixed_cost': 0,             # その他固定費（円/月）
        'property_tax': 150000,      # 固定資産税（円/年）
        'vacancy_rate': 5,           # 空室率（%）
        'building_price': 2000,      # 建物価格（万円）
        'depreciation_years': 20,    # 償却年数
        'effective_tax_rate': 30,    # 実効税率（%）
        'holding_years': 5,          # 保有年数
        'expected_sale_price': 6500, # 想定売却価格（万円）
        'exit_cap_rate': 5.0,        # Cap Rate
        'rent_decline': 1,           # 賃料下落率
        'price_decline_rate': 2,     # 価格下落率
        'major_repair_cycle': 0,     # 大規模修繕なし
        'major_repair_cost': 0,
    }
    
    # シミュレーション実行
    result = run_full_simulation(property_data)
    
    print("\n【自己資金計算】")
    print("-" * 40)
    purchase_price = 6980
    loan_amount = 7500
    other_costs = 200
    renovation_cost = 0
    
    self_funding = purchase_price - loan_amount + other_costs + renovation_cost
    print(f"自己資金 = 購入価格 - 借入額 + 諸経費 + 改装費")
    print(f"        = {purchase_price} - {loan_amount} + {other_costs} + {renovation_cost}")
    print(f"        = {self_funding}万円")
    
    print("\n【CCR結果】")
    print("-" * 40)
    ccr_first = result['results'].get('CCR（初年度）（%）')
    ccr_full = result['results'].get('CCR（全期間）（%）')
    
    print(f"CCR（初年度）: {ccr_first}")
    print(f"CCR（全期間）: {ccr_full}")
    
    if ccr_first is None:
        print("✅ CCR（初年度）は正しくNone（N/A）を返しています")
    else:
        print(f"❌ CCR（初年度）は{ccr_first}を返しています（期待値: None）")
    
    if ccr_full is None:
        print("✅ CCR（全期間）は正しくNone（N/A）を返しています")
    else:
        print(f"❌ CCR（全期間）は{ccr_full}を返しています（期待値: None）")
    
    # その他の指標も確認
    print("\n【その他の指標】")
    print("-" * 40)
    print(f"NOI: {result['results'].get('NOI（円）'):,}円")
    print(f"LTV: {result['results'].get('LTV（%）'):.2f}%")
    print(f"DSCR: {result['results'].get('DSCR（返済余裕率）'):.2f}")

if __name__ == "__main__":
    test_amanuma()