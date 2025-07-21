"""
SEC-058: DoS攻撃対策のテストスクリプト
数値計算における整数オーバーフロー攻撃の防止テスト
"""

import sys
import time
import traceback
from shared.calculations import run_full_simulation
from shared.input_validator import DoSProtectionError


def test_normal_calculation():
    """正常な計算のテスト"""
    print("=== 正常な計算のテスト ===")
    
    normal_data = {
        'monthly_rent': 100,         # 10万円（万円単位）
        'purchase_price': 3000,      # 3000万円
        'loan_amount': 2400,         # 2400万円
        'interest_rate': 2.5,        # 2.5%
        'loan_years': 30,            # 30年
        'holding_years': 10,         # 10年
        'vacancy_rate': 5,           # 5%
        'management_fee': 5,         # 5万円（万円単位）
        'fixed_cost': 1,             # 1万円（万円単位）
        'property_tax': 10,          # 10万円（万円単位）
        'other_costs': 50,           # その他費用
        'renovation_cost': 100,      # リフォーム費用
        'effective_tax_rate': 20,    # 20%
        'building_price': 2000,      # 2000万円
        'depreciation_years': 27,    # 27年
        'exit_cap_rate': 5,          # 5%
        'expected_sale_price': 2800, # 2800万円
        'market_value': 3000,        # 市場価値
        'land_area': 100,            # 土地面積
        'building_area': 80,         # 建物面積
        'road_price': 200000,        # 路線価
        'rent_decline': 1            # 家賃下落率
    }
    
    try:
        start_time = time.time()
        result = run_full_simulation(normal_data)
        end_time = time.time()
        
        print(f"✅ 正常な計算が成功しました")
        print(f"   計算時間: {end_time - start_time:.3f}秒")
        print(f"   年間家賃収入: {result['results']['年間家賃収入（円）']:,}円")
        print(f"   表面利回り: {result['results']['表面利回り（%）']}%")
        
    except Exception as e:
        print(f"❌ 正常な計算でエラー: {e}")
        traceback.print_exc()


def test_extreme_values():
    """極大値によるDoS攻撃のテスト"""
    print("\n=== 極大値DoS攻撃のテスト ===")
    
    attack_scenarios = [
        {
            'name': '極大な物件価格',
            'data': {
                'monthly_rent': 100,
                'purchase_price': 999999999999999999999,  # 極大値
                'loan_amount': 2400,
                'interest_rate': 2.5,
                'loan_years': 30,
                'holding_years': 10
            }
        },
        {
            'name': '極大な金利',
            'data': {
                'monthly_rent': 100,
                'purchase_price': 3000,
                'loan_amount': 2400,
                'interest_rate': 999999999999,  # 極大値
                'loan_years': 30,
                'holding_years': 10
            }
        },
        {
            'name': '極大な保有年数',
            'data': {
                'monthly_rent': 100,
                'purchase_price': 3000,
                'loan_amount': 2400,
                'interest_rate': 2.5,
                'loan_years': 30,
                'holding_years': 999999999999999  # 極大値
            }
        },
        {
            'name': '無限大の値',
            'data': {
                'monthly_rent': float('inf'),
                'purchase_price': 3000,
                'loan_amount': 2400,
                'interest_rate': 2.5,
                'loan_years': 30,
                'holding_years': 10
            }
        },
        {
            'name': 'NaN値',
            'data': {
                'monthly_rent': float('nan'),
                'purchase_price': 3000,
                'loan_amount': 2400,
                'interest_rate': 2.5,
                'loan_years': 30,
                'holding_years': 10
            }
        }
    ]
    
    for scenario in attack_scenarios:
        try:
            print(f"\n--- {scenario['name']} ---")
            start_time = time.time()
            result = run_full_simulation(scenario['data'])
            end_time = time.time()
            
            print(f"❌ 攻撃が成功してしまいました（対策不十分）")
            print(f"   計算時間: {end_time - start_time:.3f}秒")
            
        except DoSProtectionError as e:
            print(f"✅ DoS攻撃を正しく検出: {e}")
        except Exception as e:
            print(f"⚠️  予期しない例外: {type(e).__name__}: {e}")


def test_memory_bomb():
    """メモリ爆弾攻撃のテスト"""
    print("\n=== メモリ爆弾攻撃のテスト ===")
    
    memory_attack_data = {
        'monthly_rent': 100,
        'purchase_price': 3000,
        'loan_amount': 2400,
        'interest_rate': 2.5,
        'loan_years': 30,
        'holding_years': 50,  # 長期間（メモリ消費増加）
        'vacancy_rate': 5,
        'management_fee': 5,
        'fixed_cost': 1,
        'property_tax': 10,
        'major_repair_cycle': 1,  # 毎年修繕（配列サイズ増加）
        'major_repair_cost': 200
    }
    
    try:
        print("メモリ爆弾攻撃を実行中...")
        start_time = time.time()
        result = run_full_simulation(memory_attack_data)
        end_time = time.time()
        
        print(f"⚠️  攻撃が完了（対策確認が必要）")
        print(f"   計算時間: {end_time - start_time:.3f}秒")
        print(f"   キャッシュフロー表の行数: {len(result['cash_flow_table'])}")
        
    except DoSProtectionError as e:
        print(f"✅ メモリ爆弾攻撃を正しく検出: {e}")
    except Exception as e:
        print(f"❌ 予期しない例外: {type(e).__name__}: {e}")


def test_computation_bomb():
    """計算爆弾攻撃のテスト"""
    print("\n=== 計算爆弾攻撃のテスト ===")
    
    computation_attack_data = {
        'monthly_rent': 100,
        'purchase_price': 3000,
        'loan_amount': 2400,
        'interest_rate': 25.0,  # 高金利で指数計算を重くする
        'loan_years': 50,       # 長期間
        'holding_years': 50,    # 長期間
        'vacancy_rate': 5,
        'management_fee': 5,
        'fixed_cost': 1,
        'property_tax': 10
    }
    
    try:
        print("計算爆弾攻撃を実行中...")
        start_time = time.time()
        result = run_full_simulation(computation_attack_data)
        end_time = time.time()
        
        print(f"⚠️  攻撃が完了（対策確認が必要）")
        print(f"   計算時間: {end_time - start_time:.3f}秒")
        
    except DoSProtectionError as e:
        print(f"✅ 計算爆弾攻撃を正しく検出: {e}")
    except Exception as e:
        print(f"❌ 予期しない例外: {type(e).__name__}: {e}")


def test_string_injection():
    """文字列インジェクション攻撃のテスト"""
    print("\n=== 文字列インジェクション攻撃のテスト ===")
    
    injection_data = {
        'monthly_rent': 100000,
        'purchase_price': 3000,
        'loan_amount': 2400,
        'interest_rate': 2.5,
        'loan_years': 30,
        'holding_years': 10,
        'property_name': '<script>alert("XSS")</script>' * 1000,  # 長大な文字列
        'location': '"><img src=x onerror=alert(1)>',
        'property_type': 'eval("malicious code")'
    }
    
    try:
        print("文字列インジェクション攻撃を実行中...")
        result = run_full_simulation(injection_data)
        
        # サニタイズされた結果をチェック
        if '<script>' in str(result):
            print("❌ 文字列サニタイズが不十分")
        else:
            print("✅ 文字列インジェクション攻撃を正しく防御")
        
    except DoSProtectionError as e:
        print(f"✅ 攻撃を検出: {e}")
    except Exception as e:
        print(f"❌ 予期しない例外: {type(e).__name__}: {e}")


def main():
    """テスト実行メイン関数"""
    print("SEC-058: DoS攻撃対策テスト開始")
    print("=" * 50)
    
    # 各テストを実行
    test_normal_calculation()
    test_extreme_values()
    test_memory_bomb()
    test_computation_bomb()
    test_string_injection()
    
    print("\n" + "=" * 50)
    print("SEC-058: DoS攻撃対策テスト完了")
    print("\n✅ = 攻撃を正しく検出・防御")
    print("❌ = 対策不十分または予期しないエラー")
    print("⚠️  = 攻撃が成功（要対策強化）")


if __name__ == "__main__":
    main()