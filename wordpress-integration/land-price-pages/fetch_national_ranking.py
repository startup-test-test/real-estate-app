#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全国の地価データから高価格地点トップ10を取得してランキングHTMLを生成
"""

import sys
import os
import json
from pathlib import Path
from typing import Dict, List

# 親ディレクトリのreal_estate_client.pyをインポート
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/property-api'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from real_estate_client import RealEstateAPIClient


def calculate_tsubo_price(price_per_sqm: float) -> float:
    """坪単価を計算（万円/坪）"""
    return round(price_per_sqm * 3.30579 / 10000, 1)


def fetch_national_top_ranking(year: str = "2025", limit: int = 10) -> List[Dict]:
    """
    全国の地価データから高価格地点トップ10を取得

    Args:
        year: 対象年
        limit: 取得件数

    Returns:
        地点データのリスト（ランキング順）
    """
    client = RealEstateAPIClient()
    all_data = []

    print("=" * 80)
    print(f"全国の地価データ取得中（{year}年）")
    print("=" * 80)
    print()

    total = len(client.prefecture_codes)

    # 全都道府県のデータを取得
    for i, (pref_name, pref_code) in enumerate(client.prefecture_codes.items(), 1):
        print(f"[{i}/{total}] {pref_name} のデータを取得中...")

        try:
            data = client.search_land_prices(
                prefecture=pref_name,
                year=year
            )

            if data:
                # 都道府県名を追加
                for item in data:
                    item['prefecture'] = pref_name
                    item['prefecture_code'] = pref_code

                all_data.extend(data)
                print(f"   ✅ {len(data)}件取得")
            else:
                print(f"   ⚠️  データなし")

        except Exception as e:
            print(f"   ❌ エラー - {e}")
            continue

    print()
    print("=" * 80)
    print(f"全データ取得完了: 合計 {len(all_data):,}件")
    print("=" * 80)
    print()

    # 価格でソート（降順）
    all_data.sort(key=lambda x: x.get('price_per_sqm', 0), reverse=True)

    # トップN件を取得
    top_ranking = all_data[:limit]

    # ランク番号を追加
    for rank, item in enumerate(top_ranking, 1):
        item['rank'] = rank
        item['price_per_tsubo'] = calculate_tsubo_price(item.get('price_per_sqm', 0))

    return top_ranking


def generate_national_ranking_html(ranking_data: List[Dict]) -> str:
    """
    全国地点ランキングHTMLを生成

    Args:
        ranking_data: 地点データのリスト

    Returns:
        HTMLコンテンツ
    """

    def get_medal_emoji(rank: int) -> str:
        """順位に応じたメダル絵文字を取得"""
        if rank == 1:
            return '<span style="font-size: 18px;">🥇</span> '
        elif rank == 2:
            return '<span style="font-size: 18px;">🥈</span> '
        elif rank == 3:
            return '<span style="font-size: 18px;">🥉</span> '
        return ''

    def get_change_badge(change_rate_str: str) -> str:
        """変動率のバッジHTMLを生成"""
        try:
            # 文字列から数値を抽出
            change_rate_clean = str(change_rate_str).replace('%', '').replace('+', '').strip()
            change_rate = float(change_rate_clean)

            if change_rate >= 0:
                return f'<span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +{change_rate}%</span>'
            else:
                return f'<span style="display: inline-block; padding: 4px 12px; background: #fee2e2; color: #dc2626; border-radius: 4px; font-weight: 600; font-size: 13px;">↓ {change_rate}%</span>'
        except:
            return f'<span style="display: inline-block; padding: 4px 12px; background: #f3f4f6; color: #6b7280; border-radius: 4px; font-weight: 600; font-size: 13px;">-</span>'

    # テーブル行を生成
    rows = []
    for item in ranking_data:
        medal = get_medal_emoji(item['rank'])
        change_badge = get_change_badge(item.get('change_rate', ''))

        # 住所を短縮（長すぎる場合）
        address = item.get('address', '')
        if len(address) > 50:
            address = address[:50] + '...'

        # 用途地域や最寄駅などの情報
        region = item.get('region', '')
        nearest_station = item.get('nearest_station', '')

        row = f'''<tr style="border-bottom: 1px solid #e5e7eb; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f0f9ff'" onmouseout="this.style.backgroundColor=''">
<td style="padding: 14px 12px; text-align: center; font-weight: 600;">{medal}{item['rank']}位</td>
<td style="padding: 14px 12px; font-weight: 600; color: #111827;">{item.get('prefecture', '')}</td>
<td style="padding: 14px 12px; color: #374151;">{address}</td>
<td style="padding: 14px 12px; text-align: right; font-weight: 600; color: #667eea; font-size: 15px;">{item.get('price_per_sqm', 0):,}</td>
<td style="padding: 14px 12px; text-align: right; font-weight: 600; font-size: 15px;">{item.get('price_per_tsubo', 0)}</td>
<td style="padding: 14px 12px; text-align: center;">{change_badge}</td>
</tr>'''
        rows.append(row)

    rows_html = '\n'.join(rows)

    html = f'''<!-- 全国地点ランキングセクション -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
<div style="padding: 20px 24px; border-bottom: 2px solid #e5e7eb; margin: -40px -40px 30px -40px;">
<h2 style="font-size: 24px; font-weight: 700; margin: 0; color: white;">🏆 日本全国の地価ランキング トップ10（2025年最新）</h2>
<p style="font-size: 14px; margin: 8px 0 0 0; color: white;">全国で最も地価が高い地点のランキング（国土交通省 不動産情報ライブラリより取得）</p>
</div>
<div style="overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; background: white; font-size: 14px;">
<thead>
<tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
<th style="padding: 16px 12px; text-align: center; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">順位</th>
<th style="padding: 16px 12px; text-align: left; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">都道府県</th>
<th style="padding: 16px 12px; text-align: left; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">所在地</th>
<th style="padding: 16px 12px; text-align: right; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">地価（円/㎡）</th>
<th style="padding: 16px 12px; text-align: right; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">坪単価（万円/坪）</th>
<th style="padding: 16px 12px; text-align: center; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">前年比</th>
</tr>
</thead>
<tbody>
{rows_html}
</tbody>
</table>
</div>
<div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
<p style="font-size: 14px; color: #6b7280; margin: 0;">※ 地価は国土交通省が毎年公表する土地の価格指標です（データ出典: 不動産情報ライブラリ）</p>
</div>
</section>
'''

    return html


def save_to_file(content: str, filename: str):
    """HTMLをファイルに保存"""
    output_file = Path(__file__).parent / filename

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ HTMLファイルを保存しました: {filename}")


def save_json_data(data: List[Dict], filename: str):
    """JSONデータをファイルに保存"""
    output_file = Path(__file__).parent / filename

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✅ JSONデータを保存しました: {filename}")


def main():
    """メイン処理"""
    year = "2025"

    # データ取得
    ranking_data = fetch_national_top_ranking(year, limit=10)

    if not ranking_data:
        print("❌ データ取得に失敗しました")
        sys.exit(1)

    # JSONデータを保存
    save_json_data(ranking_data, "national_ranking_data.json")
    print()

    # ランキングHTML生成
    print("HTMLを生成中...")
    html = generate_national_ranking_html(ranking_data)

    # HTMLを保存
    save_to_file(html, "national-ranking-section.html")
    print()

    # サマリー表示
    print("=" * 80)
    print("全国地価ランキング トップ10")
    print("=" * 80)
    for item in ranking_data:
        print(f"{item['rank']:2d}位: {item['prefecture']:<8s} {item.get('address', '')[:30]:<30s} {item.get('price_per_sqm', 0):>10,d}円/㎡ ({item.get('change_rate', 'N/A')})")
    print()

    print("✅ 処理完了")


if __name__ == '__main__':
    main()
