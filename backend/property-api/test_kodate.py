"""
戸建てデータ取得テスト
"""
import os
from dotenv import load_dotenv
from real_estate_client import RealEstateAPIClient

load_dotenv()

def test_kodate():
    client = RealEstateAPIClient()

    # さいたま市大宮区の戸建てを検索
    results = client.search_real_estate_prices(
        prefecture="埼玉県",
        city="さいたま市大宮区",
        trade_types=["02"],  # 戸建て
        from_year=2023,
        from_quarter=1,
        to_year=2025,
        to_quarter=4
    )

    print(f"検索結果: {results.get('search_count', 0)}件")
    print(f"エラー: {results.get('error', 'なし')}")

    if results.get('results'):
        print("\n最初の5件:")
        for i, item in enumerate(results['results'][:5], 1):
            print(f"{i}. {item['type']} - {item['price_formatted']} - {item['location']}")

    # APIが使用する取引種類を確認
    print("\n取引種類マッピング:")
    for code, name in client.trade_types.items():
        print(f"  {code}: {name}")

    # さいたま市全体で検索（区を指定しない）
    print("\n=== さいたま市全体で検索 ===")
    results2 = client.search_real_estate_prices(
        prefecture="埼玉県",
        city="さいたま市",  # 区を指定しない
        trade_types=["02"],
        from_year=2023,
        from_quarter=1,
        to_year=2025,
        to_quarter=4
    )
    print(f"検索結果: {results2.get('search_count', 0)}件")

if __name__ == "__main__":
    test_kodate()