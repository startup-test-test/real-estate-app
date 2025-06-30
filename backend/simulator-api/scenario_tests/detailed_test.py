"""
詳細な計算検証テスト
"""

from shared.calculations import run_full_simulation

def detailed_verification():
    """詳細な計算検証"""
    
    # シンプルなテストケース
    test_data = {
        'monthly_rent': 100000,      # 月間家賃10万円
        'vacancy_rate': 0,           # 空室率0%
        'management_fee': 5000,      # 管理費5千円/月
        'fixed_cost': 3000,          # 固定費3千円/月  
        'property_tax': 100000,      # 固定資産税10万円/年
        'purchase_price': 2000,      # 購入価格2000万円
        'loan_amount': 1600,         # 融資1600万円
        'other_costs': 100,          # 諸費用100万円
        'renovation_cost': 100,      # リフォーム100万円
        'interest_rate': 2.0,        # 金利2%
        'loan_years': 30,           # 融資期間30年
        'loan_type': '元利均等',
        'exit_cap_rate': 5.0,
        'land_area': 100,
        'road_price': 200000,
        'building_area': 80,
        'market_value': 2000,
        'holding_years': 3,          # 3年で検証
        'rent_decline': 0,           # 家賃下落なし
        'ownership_type': '個人',
        'effective_tax_rate': 20,    # 実効税率20%
        'major_repair_cycle': 10,    # 大規模修繕10年周期
        'major_repair_cost': 200,    # 大規模修繕200万円
        'building_price': 1500,      # 建物価格1500万円
        'depreciation_years': 30     # 償却年数30年
    }
    
    print("🔍 詳細計算検証")
    print("=" * 50)
    
    result = run_full_simulation(test_data)
    cf_table = result['cash_flow_table']
    
    # 手動計算での期待値
    print("\n📋 手動計算による期待値:")
    print(f"年間家賃収入: {100000 * 12:,}円")
    print(f"年間経費: {(5000 + 3000) * 12 + 100000:,}円")
    print(f"年間減価償却: {1500 * 10000 / 30:,.0f}円")
    print(f"自己資金: {2000 - 1600 + 100 + 100:,}万円")
    
    # 不動産所得計算
    annual_income = 100000 * 12  # 120万円
    annual_expenses = (5000 + 3000) * 12 + 100000  # 19.6万円
    annual_depreciation = 1500 * 10000 / 30  # 50万円
    real_estate_income = annual_income - annual_expenses - annual_depreciation  # 50.4万円
    tax = real_estate_income * 0.20  # 10.08万円
    
    print(f"不動産所得: {real_estate_income:,.0f}円")
    print(f"税金: {tax:,.0f}円")
    
    print("\n📊 シミュレーション結果:")
    for key, value in result['results'].items():
        print(f"{key}: {value}")
    
    print(f"\n📅 年次キャッシュフロー:")
    for i, row in enumerate(cf_table):
        print(f"\n{i+1}年目:")
        for key, value in row.items():
            if key != '年次':
                print(f"  {key}: {value:,}" + ("円" if isinstance(value, int) else ""))
    
    # 各年の営業CFの内訳確認
    print(f"\n🧮 各年の営業CF計算確認:")
    for i, row in enumerate(cf_table):
        year = i + 1
        calculated_cf = (row['実効収入'] - row['経費'] - row['ローン返済'] - 
                        row['税金'] - row['大規模修繕'] - row['初期リフォーム'])
        print(f"{year}年目 営業CF:")
        print(f"  計算式: {row['実効収入']:,} - {row['経費']:,} - {row['ローン返済']:,} - {row['税金']:,} - {row['大規模修繕']:,} - {row['初期リフォーム']:,}")
        print(f"  手動計算: {calculated_cf:,}円")
        print(f"  システム: {row['営業CF']:,}円")
        print(f"  差分: {abs(calculated_cf - row['営業CF']):,}円")
        
        if calculated_cf == row['営業CF']:
            print("  ✅ 一致")
        else:
            print("  ❌ 不一致")

if __name__ == "__main__":
    detailed_verification()