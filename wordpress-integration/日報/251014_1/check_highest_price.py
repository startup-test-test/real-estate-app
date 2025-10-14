"""
東京都の最高額地点を確認
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'land_price_generator'))

from data_fetcher import LandPriceDataFetcher

def main():
    fetcher = LandPriceDataFetcher()
    tokyo_data = fetcher.fetch_prefecture_data("13", "東京都", "2024")

    # 価格でソート
    sorted_data = sorted(tokyo_data['data'], key=lambda x: x.get('price_per_sqm', 0), reverse=True)

    print("="*60)
    print("東京都の地価 TOP10（最高額）")
    print("="*60)
    print()

    for i, item in enumerate(sorted_data[:10], 1):
        price = item.get('price_per_sqm', 0)
        address = item.get('full_address', item.get('address', ''))
        region = item.get('region', '')
        station = item.get('station', '-')

        print(f"{i}位: {price:,}円/㎡ ({price/10000:.1f}万円/㎡)")
        print(f"    住所: {address}")
        print(f"    地域: {region}")
        print(f"    最寄駅: {station}")
        print()

    print("="*60)
    print("東京都の地価 BOTTOM10（最低額）")
    print("="*60)
    print()

    for i, item in enumerate(sorted_data[-10:][::-1], 1):
        price = item.get('price_per_sqm', 0)
        address = item.get('full_address', item.get('address', ''))
        region = item.get('region', '')

        print(f"{i}位: {price:,}円/㎡ ({price/10000:.1f}万円/㎡)")
        print(f"    住所: {address}")
        print(f"    地域: {region}")
        print()

if __name__ == "__main__":
    main()
