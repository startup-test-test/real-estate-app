"""
APIの生データを確認するスクリプト
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..', 'backend/property-api'))

from real_estate_client import RealEstateAPIClient

def main():
    client = RealEstateAPIClient()

    print("="*60)
    print("東京都の公示地価APIレスポンスの確認")
    print("="*60)
    print()

    # 東京都データ取得
    result = client.search_land_prices(prefecture="東京都", year="2024")

    print(f"取得件数: {len(result)}件")
    print()

    # 最初の10件を詳細表示
    print("最初の10件のデータ構造:")
    print("-"*60)

    for i, item in enumerate(result[:10], 1):
        print(f"\n{i}. データ:")
        print(f"   region: {item.get('region', '')}")
        print(f"   address: {item.get('address', '')}")
        print(f"   full_address: {item.get('full_address', '')}")
        print(f"   price_per_sqm: {item.get('price_per_sqm', 0):,}円/㎡")
        print(f"   station: {item.get('station', '')}")

    # regionフィールドに何が入っているか確認
    print()
    print("="*60)
    print("regionフィールドの重複除去一覧（最初の30件）:")
    print("="*60)

    regions = set()
    for item in result:
        region = item.get('region', '').strip()
        if region:
            regions.add(region)

    for i, region in enumerate(sorted(list(regions))[:30], 1):
        print(f"{i:2d}. {region}")

if __name__ == "__main__":
    main()
