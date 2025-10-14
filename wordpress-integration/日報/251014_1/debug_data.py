"""
データ取得のデバッグスクリプト
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'land_price_generator'))

from data_fetcher import LandPriceDataFetcher

def main():
    fetcher = LandPriceDataFetcher()

    print("="*60)
    print("東京都データのデバッグ")
    print("="*60)
    print()

    # 東京都データ取得
    tokyo_data = fetcher.fetch_prefecture_data("13", "東京都", "2024", use_cache=False)

    print(f"✅ 総地点数: {len(tokyo_data['data'])}件")
    print(f"✅ 市区町村数: {len(tokyo_data['municipalities'])}件")
    print()

    # 市区町村別の地点数を表示
    print("市区町村別地点数 TOP10:")
    print("-"*60)

    city_counts = []
    for city_name, city_data in tokyo_data['municipalities'].items():
        city_counts.append((city_name, len(city_data)))

    city_counts.sort(key=lambda x: x[1], reverse=True)

    for i, (city_name, count) in enumerate(city_counts[:10], 1):
        print(f"{i:2d}. {city_name:15s}: {count:4d}件")

    print()

    # サンプルデータ表示
    print("サンプルデータ（最初の5件）:")
    print("-"*60)
    for i, item in enumerate(tokyo_data['data'][:5], 1):
        print(f"{i}. {item.get('full_address', item.get('address', ''))}")
        print(f"   価格: {item.get('price_per_sqm', 0):,}円/㎡")
        print()

    # 千代田区データ取得
    print("="*60)
    print("千代田区データのデバッグ")
    print("="*60)
    print()

    chiyoda_data = fetcher.fetch_city_data("東京都", "千代田区", use_cache=False)

    print(f"✅ 最新データ: {len(chiyoda_data['current_data'])}件")
    print(f"✅ 履歴データ: {len(chiyoda_data['history'])}地点")
    print()

    # サンプルデータ表示
    print("サンプルデータ（最初の5件）:")
    print("-"*60)
    for i, item in enumerate(chiyoda_data['current_data'][:5], 1):
        print(f"{i}. {item.get('full_address', item.get('address', ''))}")
        print(f"   価格: {item.get('price_per_sqm', 0):,}円/㎡")
        print()

if __name__ == "__main__":
    main()
