#!/usr/bin/env python3
"""
天沼物件のAPI経由テスト（キャメルケース送信）
"""

import sys
import os
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import requests
import json

# ローカルAPIのURL
API_URL = "http://localhost:8000"

def test_amanuma_with_camelcase():
    """天沼物件をキャメルケースで送信してテスト"""
    print("=" * 60)
    print("天沼物件API経由テスト（キャメルケース）")
    print("=" * 60)
    
    # フロントエンドから送信される形式（キャメルケース）
    property_data = {
        'property_name': '天沼物件',  # 必須フィールド
        'location': '東京都杉並区',   # 必須フィールド
        'purchasePrice': 6980,      # 万円
        'monthlyRent': 25,          # 万円（バックエンドの期待値）
        'loanAmount': 7500,         # 万円
        'interestRate': 0.9,        # %
        'loanYears': 35,
        'loanType': '元利均等',
        'otherCosts': 100,          # 諸経費（万円）
        'renovationCost': 370,      # 改装費（万円）
        'managementFee': 12500,     # 管理費（円/月）
        'fixedCost': 0,             # その他固定費（円/月）
        'propertyTax': 150000,      # 固定資産税（円/年）重要！
        'vacancyRate': 0,           # 空室率（%）
        'buildingPrice': 3000,      # 建物価格（万円）
        'depreciationYears': 35,    # 償却年数
        'effectiveTaxRate': 20,     # 実効税率（%）
        'holdingYears': 35,         # 保有年数
        'expectedSalePrice': 6980,  # 想定売却価格（万円）
        
        # これらのフィールドも追加（フロントエンドが送信する可能性）
        'exitCapRate': 6.0,         # Cap Rate
        'rentDecline': 0,           # 賃料下落率
        'priceDeclineRate': 0,      # 価格下落率
        'majorRepairCycle': 10,     # 大規模修繕サイクル
        'majorRepairCost': 200,     # 大規模修繕費用
    }
    
    print("\n【送信データ（キャメルケース）】")
    print("-" * 40)
    print(f"propertyTax: {property_data.get('propertyTax', 'なし')}")
    print(f"managementFee: {property_data.get('managementFee', 'なし')}")
    print(f"fixedCost: {property_data.get('fixedCost', 'なし')}")
    
    # APIエンドポイントを呼び出し
    response = requests.post(f"{API_URL}/api/simulate", json=property_data)
    
    print("\n【APIレスポンス】")
    print("-" * 40)
    
    if response.status_code == 200:
        result = response.json()
        
        # NOI確認
        noi = result['results']['NOI（円）']
        print(f"NOI: {noi:,}円 ({noi/10000:.0f}万円)")
        
        expected_noi = 25 * 12 * 10000 - (12500 * 12 + 150000)
        print(f"期待値: {expected_noi:,}円 ({expected_noi/10000:.0f}万円)")
        
        if noi == expected_noi:
            print("✅ NOIが正しく計算されています（固定資産税が反映）")
        else:
            print(f"❌ NOI計算に誤差があります（差額: {noi - expected_noi:,}円）")
            if noi - expected_noi == 150000:
                print("   → 固定資産税15万円が引かれていない")
        
        # CCR確認
        ccr_first = result['results'].get('CCR（初年度）（%）')
        ccr_full = result['results'].get('CCR（全期間）（%）')
        
        print(f"\nCCR（初年度）: {ccr_first}")
        print(f"CCR（全期間）: {ccr_full}")
        
        if ccr_first is None:
            print("✅ CCR（初年度）は正しくNone（N/A）")
        
        # その他の指標
        print(f"\nDSCR: {result['results']['DSCR（返済余裕率）']:.2f}")
        print(f"LTV: {result['results']['LTV（%）']:.2f}%")
        
    else:
        print(f"エラー: ステータスコード {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_amanuma_with_camelcase()