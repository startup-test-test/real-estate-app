
#!/usr/bin/env python3
"""
トップページ（ID: 1726）を動的データから完全自動生成
すべてのデータはAPIから取得し、静的データは一切含まない
"""

import os
import sys
from pathlib import Path
from statistics import mean
from datetime import datetime

# 親ディレクトリのreal_estate_client.pyをインポート
backend_path = '/workspaces/real-estate-app/backend/property-api'
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from real_estate_client import RealEstateAPIClient

def calculate_tsubo_price(price_per_sqm: float) -> float:
    """坪単価を計算（万円/坪）"""
    return round(price_per_sqm * 3.30579 / 10000, 1)


def fetch_national_average_2025():
    """
    2025年全国平均地価を取得（全都道府県から算出）

    Returns:
        dict: {
            'average_price': 平均地価（円/㎡）,
            'tsubo_price': 坪単価（円/坪）,
            'change_rate': 変動率（%）,
            'data_count': データ件数,
            'updated_at': 更新日時
        }
    """
    print("📊 2025年 全国平均地価データを取得中...")
    print("=" * 80)

    client = RealEstateAPIClient()
    all_prices = []
    all_change_rates = []
    total_count = 0

    # 全都道府県のデータを取得
    for i, (pref_name, pref_code) in enumerate(client.prefecture_codes.items(), 1):
        print(f"[{i}/47] {pref_name}...", end=" ")

        try:
            data = client.search_land_prices(
                prefecture=pref_name,
                year="2025"
            )

            if data:
                # 地価データを収集
                for item in data:
                    price = item.get('price_per_sqm', 0)
                    if price > 0:
                        all_prices.append(price)
                        total_count += 1

                    # 変動率を取得
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

        except Exception as e:
            print(f"❌ エラー - スキップ")
            continue

    if not all_prices:
        raise Exception("データ取得に失敗しました")

    # 平均を計算
    avg_price = int(mean(all_prices))
    avg_change_rate = round(mean(all_change_rates), 1) if all_change_rates else 0
    avg_tsubo_price_man = calculate_tsubo_price(avg_price)  # 万円/坪
    avg_tsubo_price_yen = int(avg_tsubo_price_man * 10000)  # 円/坪

    print(f"\n📊 2025年 集計結果:")
    print(f"   平均地価: {avg_price:,}円/㎡")
    print(f"   平均坪単価: {avg_tsubo_price_man}万円/坪 ({avg_tsubo_price_yen:,}円/坪)")
    print(f"   平均変動率: {avg_change_rate:+.1f}%")
    print(f"   データ件数: {total_count:,}件")

    return {
        'average_price': avg_price,
        'tsubo_price': avg_tsubo_price_yen,
        'change_rate': avg_change_rate,
        'data_count': total_count,
        'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }


def generate_html(data):
    """
    HTMLを生成

    Args:
        data (dict): 全国平均データ

    Returns:
        str: 生成されたHTML
    """

    # 変動率の矢印と色
    arrow = "↑" if data['change_rate'] >= 0 else "↓"
    sign = "+" if data['change_rate'] >= 0 else ""

    # 坪単価を万円単位に変換
    tsubo_price_man = int(data['tsubo_price'] / 10000)

    html = f"""<!-- 全国平均地価サマリーセクション -->
<!-- データソース: 国土交通省 不動産情報ライブラリAPI -->
<!-- 最終更新: {data['updated_at']} -->
<!-- データ件数: {data['data_count']:,}件 -->
<section style="margin-bottom: 60px;">
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
"""
    return html


def main():
    """メイン処理"""
    try:
        # データ取得
        data = fetch_national_average_2025()

        print("\n📈 取得データ:")
        print(f"  平均地価: {data['average_price']:,} 円/㎡")
        print(f"  坪単価: {data['tsubo_price']:,} 円/坪")
        print(f"  変動率: {data['change_rate']:+.2f}%")
        print(f"  データ件数: {data['data_count']:,}件")

        # HTML生成
        html = generate_html(data)

        # ファイル保存
        output_file = 'page_1726_summary_section.html'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html)

        print(f"\n✅ HTMLを生成しました: {output_file}")
        print("\n次のステップ:")
        print("1. page_1726.html の該当セクションをこのHTMLで置き換え")
        print("2. update_title_style.py でWordPressに反映")

        return True

    except Exception as e:
        print(f"\n❌ エラー: {e}")
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
