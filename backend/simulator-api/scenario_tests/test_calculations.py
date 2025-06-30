"""
不動産シミュレーター計算ロジックのユニットテスト
"""

from shared.calculations import (
    run_full_simulation,
    calculate_depreciation,
    calculate_tax,
    calculate_remaining_loan
)

class TestSimpleScenario:
    """シンプルシナリオのテスト"""
    
    def setup_method(self):
        """テストデータ設定"""
        self.test_data = {
            # 物件基本情報
            'monthly_rent': 100000,          # 月間家賃10万円
            'vacancy_rate': 0,               # 空室率0%（計算簡素化）
            'management_fee': 5000,          # 管理費5千円/月
            'fixed_cost': 3000,              # 固定費3千円/月
            'property_tax': 100000,          # 固定資産税10万円/年
            'purchase_price': 2000,          # 購入価格2000万円
            'loan_amount': 1600,             # 融資1600万円
            'other_costs': 100,              # 諸費用100万円
            'renovation_cost': 100,          # リフォーム100万円
            'interest_rate': 2.0,            # 金利2%
            'loan_years': 30,                # 融資期間30年
            'loan_type': '元利均等',
            'exit_cap_rate': 5.0,            # 売却時利回り5%
            'land_area': 100,                # 土地面積100㎡
            'road_price': 200000,            # 路線価20万円/㎡
            'building_area': 80,             # 建物面積80㎡
            'market_value': 2000,            # 実勢価格2000万円
            'holding_years': 3,              # 保有3年（検証しやすい）
            'rent_decline': 0,               # 家賃下落率0%（計算簡素化）
            
            # 新機能
            'ownership_type': '個人',
            'effective_tax_rate': 20,        # 実効税率20%
            'major_repair_cycle': 10,        # 大規模修繕10年周期
            'major_repair_cost': 200,        # 大規模修繕200万円
            'building_price': 1500,          # 建物価格1500万円
            'depreciation_years': 30         # 償却年数30年
        }
    
    def test_basic_metrics_manual_calculation(self):
        """基本指標の手動計算検証"""
        data = self.test_data
        
        # 期待値を手動計算
        annual_rent = 100000 * 12 * (1 - 0/100)  # 120万円
        monthly_cf = 100000 - 5000 - 3000  # 9.2万円
        annual_cf = monthly_cf * 12  # 110.4万円
        self_funding = 2000 - 1600 + 100 + 100  # 600万円
        
        # シミュレーション実行
        result = run_full_simulation(data)
        
        # 検証
        assert result['results']['年間家賃収入（円）'] == 1200000
        assert result['results']['月間キャッシュフロー（円）'] == 92000
        assert result['results']['年間キャッシュフロー（円）'] == 1104000
        assert result['results']['自己資金（万円）'] == 600.0
        
        print("✅ 基本指標計算: OK")
    
    def test_depreciation_calculation(self):
        """減価償却計算の検証"""
        # 建物価格1500万円、償却年数30年の場合
        # 年間減価償却費 = 1500万円 ÷ 30年 = 50万円
        
        annual_depreciation = calculate_depreciation(1500, 30, 1)
        expected = 1500 * 10000 / 30  # 500,000円
        
        assert annual_depreciation == expected
        print(f"✅ 減価償却計算: {annual_depreciation:,.0f}円 (期待値: {expected:,.0f}円)")
    
    def test_tax_calculation(self):
        """税金計算の検証"""
        # 不動産所得100万円、実効税率20%の場合
        # 税金 = 100万円 × 20% = 20万円
        
        tax = calculate_tax(1000000, 20)
        expected = 1000000 * 0.20  # 200,000円
        
        assert tax == expected
        print(f"✅ 税金計算: {tax:,.0f}円 (期待値: {expected:,.0f}円)")
    
    def test_loan_calculation(self):
        """ローン計算の検証"""
        # 1600万円、金利2%、30年、3年経過後の残債
        
        remaining = calculate_remaining_loan(1600, 2.0, 30, 3, '元利均等')
        
        # 大まかな検証（詳細な手計算は複雑なので範囲チェック）
        assert 1400 < remaining < 1550  # 残債は1400-1550万円の範囲
        print(f"✅ ローン残債計算: {remaining:.2f}万円")
    
    def test_cash_flow_table_structure(self):
        """キャッシュフロー表の構造検証"""
        result = run_full_simulation(self.test_data)
        cf_table = result['cash_flow_table']
        
        # テーブル構造の検証
        assert len(cf_table) == 3  # 3年分
        
        # 必要な列の存在確認
        required_columns = [
            '年次', '満室想定収入', '実効収入', '経費', 
            '減価償却', '税金', '大規模修繕', '初期リフォーム', 
            'ローン返済', '営業CF', '累計CF'
        ]
        
        for column in required_columns:
            assert column in cf_table[0], f"列 '{column}' が見つかりません"
        
        print("✅ キャッシュフロー表構造: OK")
    
    def test_first_year_renovation_cost(self):
        """1年目のリフォーム費用検証"""
        result = run_full_simulation(self.test_data)
        cf_table = result['cash_flow_table']
        
        # 1年目のみリフォーム費用が計上されているか
        assert cf_table[0]['初期リフォーム'] == 1000000  # 100万円
        assert cf_table[1]['初期リフォーム'] == 0         # 2年目は0
        assert cf_table[2]['初期リフォーム'] == 0         # 3年目は0
        
        print("✅ 初期リフォーム費用: OK")
    
    def test_manual_cash_flow_calculation(self):
        """1年目キャッシュフローの詳細手動計算"""
        data = self.test_data
        result = run_full_simulation(data)
        cf_table = result['cash_flow_table']
        
        # 1年目の手動計算
        # 実効収入: 100,000円 × 12ヶ月 = 1,200,000円
        # 経費: (5,000 + 3,000) × 12 + 100,000 = 196,000円
        # 減価償却: 1,500万円 ÷ 30年 = 500,000円
        # 不動産所得: 1,200,000 - 196,000 - 500,000 = 504,000円
        # 税金: 504,000 × 20% = 100,800円
        # ローン返済: 約74万円/年（概算）
        # 初期リフォーム: 1,000,000円
        # 営業CF: 1,200,000 - 196,000 - 740,000 - 100,800 - 1,000,000 = -836,800円（概算）
        
        year1 = cf_table[0]
        
        print(f"📊 1年目詳細:")
        print(f"  実効収入: {year1['実効収入']:,}円")
        print(f"  経費: {year1['経費']:,}円") 
        print(f"  減価償却: {year1['減価償却']:,}円")
        print(f"  税金: {year1['税金']:,}円")
        print(f"  初期リフォーム: {year1['初期リフォーム']:,}円")
        print(f"  ローン返済: {year1['ローン返済']:,}円")
        print(f"  営業CF: {year1['営業CF']:,}円")
        
        # 基本的な妥当性チェック
        assert year1['実効収入'] == 1200000
        assert year1['経費'] == 196000
        assert year1['減価償却'] == 500000
        assert year1['初期リフォーム'] == 1000000
        
        print("✅ 1年目キャッシュフロー詳細: OK")

def run_tests():
    """テスト実行"""
    test = TestSimpleScenario()
    test.setup_method()
    
    print("🧪 不動産シミュレーター計算テスト開始\n")
    
    try:
        test.test_basic_metrics_manual_calculation()
        test.test_depreciation_calculation()
        test.test_tax_calculation()
        test.test_loan_calculation()
        test.test_cash_flow_table_structure()
        test.test_first_year_renovation_cost()
        test.test_manual_cash_flow_calculation()
        
        print("\n🎉 全テスト合格！")
        
    except AssertionError as e:
        print(f"\n❌ テスト失敗: {e}")
        return False
    except Exception as e:
        print(f"\n💥 エラー発生: {e}")
        return False
    
    return True

if __name__ == "__main__":
    run_tests()