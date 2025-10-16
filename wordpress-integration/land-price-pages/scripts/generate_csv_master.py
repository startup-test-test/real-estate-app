#!/usr/bin/env python3
"""
1ページ分のマスターCSVを生成（テスト用）

生成されるCSV形式：
post_id,post_title,area_name,heikin_chika,tsubo_tanka,hendo_ritsu,data_count
"""

import sys
import csv
from pathlib import Path

# Backend pathを追加
sys.path.insert(0, '/workspaces/real-estate-app/backend/property-api')
from real_estate_client import RealEstateAPIClient

from statistics import mean


def fetch_national_average_2025():
    """全国平均データ取得"""
    print("📊 2025年 全国平均地価データを取得中...")

    client = RealEstateAPIClient()
    all_prices = []
    all_change_rates = []

    # 全都道府県のデータを取得
    for i, (pref_name, _) in enumerate(client.prefecture_codes.items(), 1):
        print(f"[{i}/47] {pref_name}...", end=" ")

        try:
            data = client.search_land_prices(
                prefecture=pref_name,
                year="2025"
            )

            if data:
                for item in data:
                    price = item.get('price_per_sqm', 0)
                    if price > 0:
                        all_prices.append(price)

                    change_rate_str = str(item.get('change_rate', '')).strip()
                    if change_rate_str:
                        try:
                            change_rate = float(change_rate_str.replace('%', '').replace('+', ''))
                            all_change_rates.append(change_rate)
                        except:
                            pass

                print(f"✅ {len(data)}件")
            else:
                print("⚠️ データなし")

        except Exception:
            print("❌ エラー")
            continue

    if not all_prices:
        raise Exception("データ取得に失敗しました")

    # 平均を計算
    avg_price = int(mean(all_prices))
    avg_change_rate = round(mean(all_change_rates), 1) if all_change_rates else 0
    avg_tsubo_price = int(avg_price * 3.30579)

    print(f"\n📊 集計結果:")
    print(f"   平均地価: {avg_price:,}円/㎡")
    print(f"   平均坪単価: {avg_tsubo_price:,}円/坪")
    print(f"   平均変動率: {avg_change_rate:+.1f}%")
    print(f"   データ件数: {len(all_prices):,}件")

    return {
        'average_price': avg_price,
        'tsubo_price': avg_tsubo_price,
        'change_rate': avg_change_rate,
        'data_count': len(all_prices)
    }


def generate_csv(output_file='land_price_master.csv'):
    """CSVを生成"""

    # データ取得
    data = fetch_national_average_2025()

    # CSVに書き込み
    with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)

        # ヘッダー
        writer.writerow([
            'post_id',
            'post_title',
            'area_name',
            'heikin_chika',
            'tsubo_tanka',
            'hendo_ritsu',
            'data_count'
        ])

        # データ行
        writer.writerow([
            1726,
            '日本全国2025年公示地価',
            '日本全国',
            f"{data['average_price']:,}",
            f"{data['tsubo_price']:,}",
            f"{data['change_rate']:+.1f}%",
            f"{data['data_count']:,}"
        ])

    print(f"\n✅ CSVを生成しました: {output_file}")
    print(f"\n📋 CSVの内容:")
    print("-" * 80)

    # CSVを表示
    with open(output_file, 'r', encoding='utf-8-sig') as f:
        for line in f:
            print(line.strip())

    print("-" * 80)
    print("\n次のステップ:")
    print("1. このCSVをExcelで開いて確認")
    print("2. WordPressの管理画面でインポート")
    print("   （または WP All Import プラグインを使用）")


if __name__ == '__main__':
    generate_csv()
