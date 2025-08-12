#!/usr/bin/env python3
"""
木崎物件CCR（初年度）問題の詳細調査
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.calculations import run_full_simulation, calculate_basic_metrics

def test_kizaki_ccr_issue():
    """木崎物件のCCR計算問題を詳細調査"""
    print("=" * 60)
    print("木崎物件CCR（初年度）問題の詳細調査")
    print("=" * 60)
    
    # 木崎シナリオの入力データ
    property_data = {
        'purchase_price': 1350,  # 万円
        'monthly_rent': 15,      # 万円
        'loan_amount': 1350,     # 万円（フルローン）
        'interest_rate': 2.875,  # %（画面表示と同じ）
        'loan_years': 15,        # 年（画面表示と同じ）
        'loan_type': '元利均等',
        'other_costs': 500,      # 諸経費（万円）
        'renovation_cost': 100,  # 改装費（万円）
        'management_fee': 7500,  # 管理費（円/月）
        'fixed_cost': 0,         # その他固定費（円/月）
        'property_tax': 50000,   # 固定資産税（円/年）
        'vacancy_rate': 0,       # 空室率（%）
        'building_price': 700,   # 建物価格（万円）- 画面表示と同じ
        'depreciation_years': 15, # 償却年数 - 画面表示と同じ
        'effective_tax_rate': 30,  # 実効税率（%）- 法人
        'holding_years': 15,      # 保有年数
        'expected_sale_price': 1800,  # 想定売却価格（万円）
        'exit_cap_rate': 7.0,    # Cap Rate
        'rent_decline': 1,       # 賃料下落率
        'price_decline_rate': 1, # 価格下落率
        'major_repair_cycle': 10, # 大規模修繕サイクル
        'major_repair_cost': 100, # 大規模修繕費用
        'owner_type': '法人',
    }
    
    # 基本指標を計算
    basic_metrics = calculate_basic_metrics(property_data)
    
    print("\n【自己資金計算】")
    print("-" * 40)
    purchase = property_data['purchase_price']
    loan = property_data['loan_amount']
    other = property_data['other_costs']
    renovation = property_data['renovation_cost']
    
    self_funding = purchase - loan + other + renovation
    print(f"購入価格: {purchase}万円")
    print(f"借入額: {loan}万円")
    print(f"諸経費: {other}万円")
    print(f"改装費: {renovation}万円")
    print(f"自己資金 = {purchase} - {loan} + {other} + {renovation}")
    print(f"        = {self_funding}万円")
    print(f"basic_metrics['self_funding'] = {basic_metrics['self_funding']}万円")
    
    # シミュレーション実行
    result = run_full_simulation(property_data)
    
    print("\n【キャッシュフロー分析】")
    print("-" * 40)
    
    # 年次CFの詳細
    if result['cash_flow_table']:
        first_year = result['cash_flow_table'][0]
        print(f"1年目の営業CF: {first_year['営業CF']:,}円")
        if '年次CF' in first_year:
            print(f"1年目の年次CF: {first_year['年次CF']:,}円")
        if '改装費・修繕費' in first_year:
            print(f"改装費・修繕費: {first_year['改装費・修繕費']:,}円")
        
        # 利用可能なキーを確認
        print(f"\n利用可能なキー: {list(first_year.keys())}")
        
        # 画面表示の年次CFと比較
        screen_cf = -67.1  # 万円（画面表示値）
        screen_cf_yen = screen_cf * 10000  # 円
        print(f"\n画面表示の年次CF: {screen_cf_yen:,}円 ({screen_cf}万円)")
        print(f"差異: {first_year['営業CF'] - screen_cf_yen:,}円")
    
    print("\n【CCR計算】")
    print("-" * 40)
    ccr_result = result['results']['CCR（初年度）（%）']
    ccr_screen = -67.06  # 画面表示値
    
    print(f"計算結果のCCR: {ccr_result:.2f}%")
    print(f"画面表示のCCR: {ccr_screen}%")
    
    # 逆算
    if ccr_result is not None and ccr_result != 0:
        # CCR = CF / 自己資金 * 100
        # 自己資金 = CF / (CCR / 100)
        first_cf = first_year['営業CF'] if result['cash_flow_table'] else 0
        implied_self_funding = abs(first_cf / (ccr_result / 100)) / 10000  # 万円
        
        print(f"\nCCRから逆算した自己資金: {implied_self_funding:.1f}万円")
        print(f"実際の自己資金: {self_funding}万円")
        
        if abs(implied_self_funding - renovation) < 10:
            print(f"⚠️ 改装費({renovation}万円)のみを分母にしている可能性が高い")
        elif abs(implied_self_funding - self_funding) < 10:
            print(f"✅ 正しい自己資金を使用している")
    
    # basic_metricsのCCRも確認
    print(f"\n【basic_metricsのCCR】")
    print(f"basic_metrics['ccr'] = {basic_metrics.get('ccr')}%")
    
    # 手動計算
    if self_funding > 0:
        manual_ccr = (first_year['営業CF'] / (self_funding * 10000)) * 100
        print(f"手動計算CCR = {first_year['営業CF']:,}円 ÷ {self_funding}万円 × 100")
        print(f"           = {manual_ccr:.2f}%")

if __name__ == "__main__":
    test_kizaki_ccr_issue()