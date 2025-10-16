#!/usr/bin/env python3
"""
WP All Import用のCSVを生成（3ページ版）

1. 全国平均
2. 東京都
3. 大阪府
"""

import sys
import csv

# Backend pathを追加
sys.path.insert(0, '/workspaces/real-estate-app/backend/property-api')
from real_estate_client import RealEstateAPIClient

from statistics import mean


def fetch_national_average():
    """全国平均データ取得"""
    print("📊 全国平均データを取得中...")

    client = RealEstateAPIClient()
    all_prices = []
    all_change_rates = []

    for i, (pref_name, _) in enumerate(client.prefecture_codes.items(), 1):
        print(f"[{i}/47] {pref_name}...", end=" ", flush=True)

        try:
            data = client.search_land_prices(prefecture=pref_name, year="2025")

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

                print(f"✅")
            else:
                print("⚠️")

        except Exception:
            print("❌")
            continue

    avg_price = int(mean(all_prices))
    avg_change_rate = round(mean(all_change_rates), 1) if all_change_rates else 0
    avg_tsubo_price = int(avg_price * 3.30579)

    print(f"   → 平均地価: {avg_price:,}円/㎡, 変動率: {avg_change_rate:+.1f}%\n")

    return {
        'average_price': avg_price,
        'tsubo_price': avg_tsubo_price,
        'change_rate': avg_change_rate,
        'data_count': len(all_prices)
    }


def fetch_prefecture_data(pref_name):
    """都道府県別データ取得"""
    print(f"📊 {pref_name}のデータを取得中...")

    client = RealEstateAPIClient()

    try:
        data = client.search_land_prices(prefecture=pref_name, year="2025")

        if not data:
            raise Exception(f"{pref_name}のデータが見つかりません")

        prices = []
        change_rates = []

        for item in data:
            price = item.get('price_per_sqm', 0)
            if price > 0:
                prices.append(price)

            change_rate_str = str(item.get('change_rate', '')).strip()
            if change_rate_str:
                try:
                    change_rate = float(change_rate_str.replace('%', '').replace('+', ''))
                    change_rates.append(change_rate)
                except:
                    pass

        avg_price = int(mean(prices))
        avg_change_rate = round(mean(change_rates), 1) if change_rates else 0
        avg_tsubo_price = int(avg_price * 3.30579)

        print(f"   → 平均地価: {avg_price:,}円/㎡, 変動率: {avg_change_rate:+.1f}%")
        print(f"   → データ件数: {len(prices):,}件\n")

        return {
            'average_price': avg_price,
            'tsubo_price': avg_tsubo_price,
            'change_rate': avg_change_rate,
            'data_count': len(prices)
        }

    except Exception as e:
        print(f"   ❌ エラー: {e}\n")
        return None


def generate_html(area_name, data):
    """HTMLコンテンツを生成"""

    arrow = "↑" if data['change_rate'] >= 0 else "↓"
    sign = "+" if data['change_rate'] >= 0 else ""

    html = f"""<section style="margin-bottom: 60px;">
<h2 style="margin-bottom: 30px;">📊 {area_name}2025年［令和7年］公示地価</h2>
<div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
<div style="text-align: center;">
<p style="font-size: 20px; margin: 0 0 8px 0; color: #000000; font-weight: 700;">平均地価</p>
<p style="font-size: 48px; font-weight: 700; margin: 0; color: #111827;">{data['average_price']:,}<span style="font-size: 24px; font-weight: 400;">円/㎡</span></p>
</div>
<div style="text-align: center;">
<p style="font-size: 20px; margin: 0 0 8px 0; color: #000000; font-weight: 700;">変動率</p>
<p style="font-size: 48px; font-weight: 700; margin: 0; color: #111827;">{arrow}{sign}{data['change_rate']}<span style="font-size: 24px; font-weight: 400;">%</span></p>
</div>
<div style="text-align: center;">
<p style="font-size: 20px; margin: 0 0 8px 0; color: #000000; font-weight: 700;">坪単価</p>
<p style="font-size: 48px; font-weight: 700; margin: 0; color: #111827;">{data['tsubo_price']:,}<span style="font-size: 24px; font-weight: 400;">円/坪</span></p>
</div>
</div>
</section>

<section style="background: #f9fafb; padding: 30px; border-radius: 12px; margin-bottom: 40px;">
<h3 style="font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">データ概要</h3>
<ul style="margin: 0; padding-left: 20px;">
<li>データソース: 国土交通省 不動産情報ライブラリAPI</li>
<li>対象データ: 2025年（令和7年）公示地価</li>
<li>集計件数: {data['data_count']:,}件</li>
</ul>
</section>"""

    return html


def generate_csv(output_file='wp_all_import_3pages.csv'):
    """WP All Import用CSV（3ページ）を生成"""

    print("=" * 80)
    print("3ページ分のデータを取得します")
    print("=" * 80 + "\n")

    # データ取得
    national_data = fetch_national_average()
    tokyo_data = fetch_prefecture_data('東京都')
    osaka_data = fetch_prefecture_data('大阪府')

    if not all([national_data, tokyo_data, osaka_data]):
        print("❌ データ取得に失敗しました")
        return False

    # CSVに書き込み
    with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)

        # ヘッダー
        writer.writerow([
            'post_id',
            'post_title',
            'post_content',
            'post_status'
        ])

        # 1. 全国平均
        writer.writerow([
            1726,
            '日本全国2025年公示地価',
            generate_html('日本全国', national_data),
            'draft'
        ])

        # 2. 東京都
        writer.writerow([
            1727,
            '東京都2025年公示地価',
            generate_html('東京都', tokyo_data),
            'draft'
        ])

        # 3. 大阪府
        writer.writerow([
            1728,
            '大阪府2025年公示地価',
            generate_html('大阪府', osaka_data),
            'draft'
        ])

    print("=" * 80)
    print(f"✅ 3ページ分のCSVを生成しました: {output_file}")
    print("=" * 80)

    import os
    size = os.path.getsize(output_file)
    print(f"\n📄 ファイルサイズ: {size:,} bytes ({size/1024:.1f} KB)")

    print(f"\n📋 生成されたページ:")
    print(f"   1. ID: 1726 - 日本全国2025年公示地価")
    print(f"   2. ID: 1727 - 東京都2025年公示地価")
    print(f"   3. ID: 1728 - 大阪府2025年公示地価")

    print("\n次のステップ:")
    print("1. wp_all_import_3pages.csv を WP All Import でアップロード")
    print("2. フィールドマッピング確認")
    print("3. インポート実行")
    print("4. 下書きで3ページ確認後、公開")

    return True


if __name__ == '__main__':
    success = generate_csv()
    sys.exit(0 if success else 1)
