#!/usr/bin/env python3
"""
木崎物件のシナリオテスト
期待値との比較を行い、計算ロジックの正確性を検証
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.calculations import run_full_simulation

def test_kizaki_scenario():
    """木崎シナリオのテスト"""
    print("=" * 60)
    print("木崎物件シナリオテスト")
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
    
    # 結果の表示
    print("\n【基本指標】")
    print(f"自己資金: {result['results']['自己資金（万円）']:.2f}万円")
    print(f"  期待値: 600万円（1350-1350+500+100）")
    print(f"  差異: {result['results']['自己資金（万円）'] - 600:.2f}万円")
    
    print(f"\n年間家賃収入: {result['results']['年間家賃収入（円）']:,}円")
    print(f"  期待値: 1,800,000円（15万×12ヶ月）")
    
    print(f"\nNOI: {result['results']['NOI（円）']:,}円")
    noi_expected = 15 * 12 * 10000 - (7500 * 12 + 50000)
    print(f"  期待値: {noi_expected:,}円")
    print(f"  差異: {result['results']['NOI（円）'] - noi_expected:,}円")
    
    print(f"\nDSCR: {result['results']['DSCR（返済余裕率）']:.2f}")
    
    # キャッシュフロー分析
    if result['cash_flow_table']:
        first_year = result['cash_flow_table'][0]
        print(f"\n【初年度キャッシュフロー】")
        print(f"営業CF: {first_year['営業CF']:,}円")
        print(f"  内訳:")
        print(f"    実効収入: {first_year['実効収入']:,}円")
        print(f"    経費: {first_year['経費']:,}円")
        print(f"    ローン返済: {first_year['ローン返済']:,}円")
        print(f"    税金: {first_year['税金']:,}円")
        print(f"    修繕費（参考）: {first_year['修繕費（参考）']:,}円")
        
        # CCR計算の検証
        ccr_first = result['results']['CCR（初年度）（%）']
        print(f"\nCCR（初年度）: {ccr_first:.2f}%")
        
        # 手動計算での検証
        self_funding = result['results']['自己資金（万円）']
        first_year_cf = first_year['営業CF']
        ccr_manual = (first_year_cf / (self_funding * 10000)) * 100 if self_funding > 0 else 0
        print(f"  手動計算: {ccr_manual:.2f}%")
        print(f"  計算式: {first_year_cf:,}円 ÷ {self_funding:.0f}万円 × 100")
        
        # 期待値との比較
        ccr_expected = -13.1  # 課題管理表の期待値
        print(f"  期待値: {ccr_expected:.1f}%")
        print(f"  差異: {ccr_first - ccr_expected:.2f}%")
        
        # CCR（全期間）の検証
        ccr_full = result['results']['CCR（全期間）（%）']
        print(f"\nCCR（全期間）: {ccr_full:.2f}%")
        
        # 最終年の累計CF
        final_year = result['cash_flow_table'][-1]
        cumulative_cf = final_year['累計CF']
        years = len(result['cash_flow_table'])
        ccr_full_manual = (cumulative_cf / (self_funding * 10000) / years) * 100 if self_funding > 0 else 0
        print(f"  手動計算: {ccr_full_manual:.2f}%")
        print(f"  計算式: {cumulative_cf:,}円 ÷ {self_funding:.0f}万円 ÷ {years}年 × 100")
        
        # ROI検証
        roi_first = result['results']['ROI（初年度）（%）']
        total_investment = 1350 + 500 + 100  # 購入価格+諸経費+改装費
        roi_manual = (first_year_cf / (total_investment * 10000)) * 100
        print(f"\nROI（初年度）: {roi_first:.2f}%")
        print(f"  手動計算: {roi_manual:.2f}%")
        print(f"  期待値: -4.04%（課題管理表より）")
        
    # 判定
    print("\n" + "=" * 60)
    print("【テスト結果判定】")
    
    # 自己資金の判定
    self_funding_ok = abs(result['results']['自己資金（万円）'] - 600) < 1
    print(f"自己資金計算: {'✅ OK' if self_funding_ok else '❌ NG'}")
    
    # CCRの判定（許容誤差±1%）
    ccr_ok = abs(ccr_first - ccr_expected) < 1.0
    print(f"CCR（初年度）: {'✅ OK' if ccr_ok else '❌ NG'}")
    
    # NOIの判定
    noi_ok = abs(result['results']['NOI（円）'] - noi_expected) < 10000
    print(f"NOI計算: {'✅ OK' if noi_ok else '❌ NG'}")
    
    overall_ok = self_funding_ok and ccr_ok and noi_ok
    print(f"\n総合判定: {'✅ すべてのテストが合格' if overall_ok else '❌ 一部のテストが不合格'}")
    
    return overall_ok

if __name__ == "__main__":
    success = test_kizaki_scenario()
    sys.exit(0 if success else 1)