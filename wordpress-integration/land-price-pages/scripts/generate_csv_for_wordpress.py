#!/usr/bin/env python3
"""
WordPress WP All Import用CSV生成（メタデータ付き）
1,900市区町村の地価データをCSVに出力
"""

import os
import sys
import csv
from pathlib import Path
from statistics import mean
from datetime import datetime

# 親ディレクトリのreal_estate_client.pyをインポート
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/property-api'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from real_estate_client import RealEstateAPIClient


def calculate_tsubo_price(price_per_sqm: float) -> int:
    """坪単価を計算（円/坪）"""
    return int(price_per_sqm * 3.30579)


def fetch_city_data(client, prefecture_name, year="2025"):
    """
    都道府県内の全市区町村データを取得

    Args:
        client: RealEstateAPIClient
        prefecture_name: 都道府県名
        year: 年度

    Returns:
        list: 市区町村ごとのデータリスト
    """
    print(f"\n📍 {prefecture_name}のデータ取得中...")

    # 都道府県全体のデータを取得
    data = client.search_land_prices(
        prefecture=prefecture_name,
        year=year
    )

    if not data:
        print(f"  ⚠️ {prefecture_name}: データなし")
        return []

    # 市区町村ごとにグループ化
    city_groups = {}
    for item in data:
        city_name = item.get('city_name', '').strip()
        if not city_name:
            continue

        if city_name not in city_groups:
            city_groups[city_name] = []

        city_groups[city_name].append(item)

    # 市区町村ごとに平均を計算
    result = []
    for city_name, items in city_groups.items():
        prices = [item.get('price_per_sqm', 0) for item in items if item.get('price_per_sqm', 0) > 0]

        if not prices:
            continue

        # 変動率を取得
        change_rates = []
        for item in items:
            change_rate_str = str(item.get('change_rate', '')).strip()
            if change_rate_str:
                try:
                    change_rate = float(change_rate_str.replace('%', '').replace('+', ''))
                    change_rates.append(change_rate)
                except:
                    pass

        # 平均計算
        avg_price = int(mean(prices))
        avg_tsubo_price = calculate_tsubo_price(avg_price)
        avg_change_rate = round(mean(change_rates), 1) if change_rates else 0

        # データを追加
        result.append({
            'post_title': f"{prefecture_name}{city_name}",
            'heikin_chika': avg_price,
            'tsubo_tanka': avg_tsubo_price,
            'hendo_ritsu': avg_change_rate,
            'data_source': '国土交通省 不動産情報ライブラリAPI',
            'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'data_count': len(items),
            'api_endpoint': f'https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?prefecture={prefecture_name}&year={year}'
        })

    print(f"  ✅ {prefecture_name}: {len(result)}市区町村")
    return result


def generate_csv_for_all_cities():
    """全1,900市区町村のデータをCSV生成"""

    print("=" * 80)
    print("📊 全国1,900市区町村 地価データCSV生成")
    print("=" * 80)

    client = RealEstateAPIClient()
    all_data = []

    # 全都道府県のデータを取得
    for i, pref_name in enumerate(client.prefecture_codes.keys(), 1):
        print(f"\n[{i}/47] {pref_name}")

        try:
            city_data = fetch_city_data(client, pref_name, year="2025")
            all_data.extend(city_data)
        except Exception as e:
            print(f"  ❌ エラー: {e}")
            continue

    if not all_data:
        print("\n❌ データ取得に失敗しました")
        return False

    # CSV保存
    output_file = '../data/cities_with_metadata.csv'
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = [
            'post_title',      # WordPressの投稿タイトル
            'heikin_chika',    # ACFフィールド: 平均地価
            'tsubo_tanka',     # ACFフィールド: 坪単価
            'hendo_ritsu',     # ACFフィールド: 変動率
            'data_source',     # ACFフィールド: データソース
            'updated_at',      # ACFフィールド: 最終更新日時
            'data_count',      # ACFフィールド: データ件数
            'api_endpoint'     # ACFフィールド: API URL
        ]

        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_data)

    print("\n" + "=" * 80)
    print(f"✅ CSV生成完了！")
    print(f"   ファイル: {output_file}")
    print(f"   データ件数: {len(all_data):,}件")
    print("=" * 80)

    # サンプルデータを表示
    print("\n📄 サンプルデータ（最初の5件）:")
    print("-" * 80)
    for i, row in enumerate(all_data[:5], 1):
        print(f"{i}. {row['post_title']}")
        print(f"   平均地価: {row['heikin_chika']:,}円/㎡")
        print(f"   坪単価: {row['tsubo_tanka']:,}円/坪")
        print(f"   変動率: {row['hendo_ritsu']:+.1f}%")
        print(f"   データ件数: {row['data_count']}件")
        print()

    print("\n🔄 次のステップ:")
    print("1. WordPressでCustom Post Type UIを設定")
    print("2. Advanced Custom Fieldsでフィールドを作成")
    print("3. WP All ImportでこのCSVをインポート")

    return True


def generate_sample_csv():
    """
    テスト用に5件だけのサンプルCSVを生成
    """
    print("📝 サンプルCSV生成（5件のみ）")

    client = RealEstateAPIClient()
    all_data = []

    # 北海道だけ取得
    city_data = fetch_city_data(client, "北海道", year="2025")
    all_data.extend(city_data[:5])  # 最初の5件だけ

    if not all_data:
        print("❌ データ取得に失敗しました")
        return False

    # CSV保存
    output_file = '../data/sample_5cities.csv'
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = [
            'post_title',
            'heikin_chika',
            'tsubo_tanka',
            'hendo_ritsu',
            'data_source',
            'updated_at',
            'data_count',
            'api_endpoint'
        ]

        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_data)

    print(f"\n✅ サンプルCSV生成完了: {output_file}")
    print(f"   データ件数: {len(all_data)}件")

    # 内容を表示
    print("\n📄 生成されたデータ:")
    for i, row in enumerate(all_data, 1):
        print(f"{i}. {row['post_title']}: {row['heikin_chika']:,}円/㎡")

    return True


def main():
    """メイン処理"""

    print("\n📋 CSV生成モードを選択してください:")
    print("1. サンプルCSV生成（5件のみ・テスト用）")
    print("2. 全データCSV生成（1,900件・本番用）")

    choice = input("\n選択 (1 or 2): ").strip()

    if choice == "1":
        success = generate_sample_csv()
    elif choice == "2":
        print("\n⚠️ 全データ取得には約2時間かかります。続行しますか？ (y/n): ", end="")
        confirm = input().strip().lower()
        if confirm == 'y':
            success = generate_csv_for_all_cities()
        else:
            print("❌ キャンセルしました")
            return False
    else:
        print("❌ 無効な選択です")
        return False

    return success


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
