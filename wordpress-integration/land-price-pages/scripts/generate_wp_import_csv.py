#!/usr/bin/env python3
"""
WP All Import用のCSVを生成

CSVにHTML本文を含めて、そのままWordPressにインポート可能にする
"""

import sys
import csv

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


def generate_html(data):
    """HTMLコンテンツを生成"""

    # 変動率の矢印
    arrow = "↑" if data['change_rate'] >= 0 else "↓"
    sign = "+" if data['change_rate'] >= 0 else ""

    html = f"""<section style="margin-bottom: 60px;">
<h2 style="margin-bottom: 30px;">📊 日本全国2025年［令和7年］公示地価</h2>
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
<li>集計件数: {data['data_count']:,}件（全国47都道府県）</li>
</ul>
</section>"""

    return html


def generate_csv(output_file='wp_all_import.csv'):
    """WP All Import用CSVを生成"""

    # データ取得
    data = fetch_national_average_2025()

    # HTML生成
    html_content = generate_html(data)

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

        # データ行（HTMLを含む）
        writer.writerow([
            1726,
            '日本全国2025年公示地価',
            html_content,
            'draft'  # draft状態でインポート（確認後に公開）
        ])

    print(f"\n✅ WP All Import用CSVを生成しました: {output_file}")
    print(f"\n📄 CSVファイルサイズ:")

    import os
    size = os.path.getsize(output_file)
    print(f"   {size:,} bytes ({size/1024:.1f} KB)")

    print("\n次のステップ:")
    print("1. wp_all_import.csv を確認")
    print("2. WordPressの WP All Import プラグインで:")
    print("   - New Import を選択")
    print("   - Upload a file を選択して wp_all_import.csv をアップロード")
    print("   - 'post_id' を ID にマッピング")
    print("   - 'post_title' を Title にマッピング")
    print("   - 'post_content' を Content にマッピング")
    print("   - 'post_status' を Status にマッピング")
    print("3. インポート実行")
    print("4. 下書きで確認後、公開")


if __name__ == '__main__':
    generate_csv()
