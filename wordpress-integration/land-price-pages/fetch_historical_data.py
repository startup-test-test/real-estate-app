#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
過去5年分の全国平均公示地価データを取得
"""

import sys
import os
from pathlib import Path
from statistics import mean
from typing import Dict, List

# 親ディレクトリのreal_estate_client.pyをインポート
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/property-api'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from real_estate_client import RealEstateAPIClient


def calculate_tsubo_price(price_per_sqm: float) -> float:
    """坪単価を計算（万円/坪）"""
    return round(price_per_sqm * 3.30579 / 10000, 1)


def fetch_year_data(client: RealEstateAPIClient, year: str) -> Dict:
    """
    指定年の全国平均データを取得

    Args:
        client: APIクライアント
        year: 対象年

    Returns:
        年次データの辞書
    """
    print(f"\n{'='*80}")
    print(f"{year}年のデータ取得中")
    print(f"{'='*80}")

    all_prices = []
    all_change_rates = []
    total_count = 0

    # 全都道府県のデータを取得
    for i, (pref_name, pref_code) in enumerate(client.prefecture_codes.items(), 1):
        print(f"[{i}/47] {pref_name}...", end=" ")

        try:
            data = client.search_land_prices(
                prefecture=pref_name,
                year=year
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
            print(f"❌ エラー: {e}")
            continue

    # 平均を計算
    avg_price = int(mean(all_prices)) if all_prices else 0
    avg_change_rate = round(mean(all_change_rates), 1) if all_change_rates else 0
    avg_tsubo_price = calculate_tsubo_price(avg_price)

    print(f"\n📊 {year}年 集計結果:")
    print(f"   平均地価: {avg_price:,}円/㎡")
    print(f"   平均坪単価: {avg_tsubo_price}万円/坪")
    print(f"   平均変動率: {avg_change_rate:+.1f}%")
    print(f"   データ件数: {total_count:,}件")

    return {
        "year": year,
        "avg_price": avg_price,
        "avg_tsubo_price": avg_tsubo_price,
        "avg_change_rate": avg_change_rate,
        "data_count": total_count
    }


def generate_history_html(history_data: List[Dict]) -> str:
    """
    過去推移HTMLセクションを生成

    Args:
        history_data: 年次データのリスト

    Returns:
        HTMLコンテンツ
    """

    # テーブル行を生成
    rows = []
    for data in history_data:
        year = data['year']
        avg_price = data['avg_price']
        avg_tsubo_price = data['avg_tsubo_price']
        avg_change_rate = data['avg_change_rate']

        # 変動率のバッジ
        if avg_change_rate > 0:
            change_badge = f'<span style="color: #16a34a; font-weight: 600;">↑ +{avg_change_rate}%</span>'
        elif avg_change_rate < 0:
            change_badge = f'<span style="color: #dc2626; font-weight: 600;">↓ {avg_change_rate}%</span>'
        else:
            change_badge = f'<span style="color: #6b7280; font-weight: 600;">→ {avg_change_rate}%</span>'

        row = f'''<tr style="border-bottom: 1px solid #e5e7eb;">
    <td style="padding: 6px 12px; text-align: center; font-weight: 600;">{year}年</td>
    <td style="padding: 6px 12px; text-align: right; font-weight: 600; color: #667eea;">{avg_price:,}</td>
    <td style="padding: 6px 12px; text-align: right; font-weight: 600;">{avg_tsubo_price}</td>
    <td style="padding: 6px 12px; text-align: center;">{change_badge}</td>
</tr>'''
        rows.append(row)

    rows_html = '\n'.join(rows)

    html = f'''
<!-- 日本全国の公示地価 過去の推移 -->
<section style="margin-bottom: 60px;">
    <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">📈 日本全国の公示地価　過去の推移</h3>

    <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; background: white; font-size: 14px; border: 1px solid #e5e7eb;">
            <thead>
                <tr style="background: #f9fafb; border-bottom: 2px solid #667eea;">
                    <th style="padding: 12px; text-align: center; font-weight: 600;">年度</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600;">公示地価平均（円/㎡）</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600;">坪単価平均（万円/坪）</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600;">変動率</th>
                </tr>
            </thead>
            <tbody>
{rows_html}
            </tbody>
        </table>
    </div>

    <p style="font-size: 13px; color: #6b7280; margin: 12px 0 0 0;">※ 全国47都道府県の公示地価データから算出した平均値です。</p>
</section>
'''

    return html


def main():
    """メイン処理"""
    print("="*80)
    print("過去5年分の全国平均公示地価データ取得")
    print("="*80)

    client = RealEstateAPIClient()

    # 過去5年分のデータを取得（2021-2025）
    years = ["2021", "2022", "2023", "2024", "2025"]
    history_data = []

    for year in years:
        year_data = fetch_year_data(client, year)
        history_data.append(year_data)

    # 新しい順（2025→2021）に並び替え
    history_data.reverse()

    # HTML生成
    print(f"\n{'='*80}")
    print("HTMLセクション生成中")
    print(f"{'='*80}")

    html = generate_history_html(history_data)

    # ファイルに保存
    output_file = "history_section.html"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"\n✅ HTMLファイルを保存しました: {output_file}")
    print()
    print("="*80)
    print("完了")
    print("="*80)
    print()
    print("次のステップ:")
    print("  1. history_section.html の内容を確認")
    print("  2. page_1726.html の「📋 データについて」の上に挿入")
    print("  3. python quick_edit.py 1726 page_1726.html でアップロード")


if __name__ == '__main__':
    main()
