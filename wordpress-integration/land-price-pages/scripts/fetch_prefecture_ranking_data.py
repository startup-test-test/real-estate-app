#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
不動産情報ライブラリAPIから全47都道府県の地価データを取得してランキングHTMLを生成
"""

import sys
import os
import json
from pathlib import Path
from statistics import mean
from typing import Dict, List, Tuple

# 親ディレクトリのreal_estate_client.pyをインポート
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/property-api'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from real_estate_client import RealEstateAPIClient


def calculate_prefecture_average(data: List[Dict]) -> Tuple[float, float]:
    """
    都道府県の平均地価と変動率を計算

    Args:
        data: 公示地価データのリスト

    Returns:
        (平均地価（円/㎡）, 平均変動率（%）)
    """
    if not data:
        return 0, 0

    # 地価データを収集
    prices = []
    change_rates = []

    for item in data:
        price = item.get('price_per_sqm', 0)
        if price > 0:
            prices.append(price)

        # 変動率を取得（文字列から数値に変換）
        change_rate_str = str(item.get('change_rate', '')).strip()
        if change_rate_str:
            try:
                # %を削除して数値に変換
                change_rate = float(change_rate_str.replace('%', '').replace('+', ''))
                change_rates.append(change_rate)
            except:
                pass

    # 平均を計算
    avg_price = mean(prices) if prices else 0
    avg_change_rate = mean(change_rates) if change_rates else 0

    return avg_price, avg_change_rate


def calculate_tsubo_price(price_per_sqm: float) -> float:
    """坪単価を計算（万円/坪）"""
    return round(price_per_sqm * 3.30579 / 10000, 1)


def get_prefecture_slug(prefecture_name: str) -> str:
    """都道府県名からスラッグを生成"""
    slug_map = {
        "北海道": "hokkaido", "青森県": "aomori", "岩手県": "iwate", "宮城県": "miyagi",
        "秋田県": "akita", "山形県": "yamagata", "福島県": "fukushima", "茨城県": "ibaraki",
        "栃木県": "tochigi", "群馬県": "gunma", "埼玉県": "saitama", "千葉県": "chiba",
        "東京都": "tokyo", "神奈川県": "kanagawa", "新潟県": "niigata", "富山県": "toyama",
        "石川県": "ishikawa", "福井県": "fukui", "山梨県": "yamanashi", "長野県": "nagano",
        "岐阜県": "gifu", "静岡県": "shizuoka", "愛知県": "aichi", "三重県": "mie",
        "滋賀県": "shiga", "京都府": "kyoto", "大阪府": "osaka", "兵庫県": "hyogo",
        "奈良県": "nara", "和歌山県": "wakayama", "鳥取県": "tottori", "島根県": "shimane",
        "岡山県": "okayama", "広島県": "hiroshima", "山口県": "yamaguchi", "徳島県": "tokushima",
        "香川県": "kagawa", "愛媛県": "ehime", "高知県": "kochi", "福岡県": "fukuoka",
        "佐賀県": "saga", "長崎県": "nagasaki", "熊本県": "kumamoto", "大分県": "oita",
        "宮崎県": "miyazaki", "鹿児島県": "kagoshima", "沖縄県": "okinawa"
    }
    return slug_map.get(prefecture_name, prefecture_name.lower())


def fetch_all_prefecture_data(year: str = "2024") -> List[Dict]:
    """
    全47都道府県の地価データを取得して平均値を計算

    Args:
        year: 対象年

    Returns:
        都道府県データのリスト（ランキング順）
    """
    client = RealEstateAPIClient()
    prefecture_ranking = []

    print("=" * 80)
    print(f"全国47都道府県の地価データ取得中（{year}年）")
    print("=" * 80)
    print()

    total = len(client.prefecture_codes)

    for i, (pref_name, pref_code) in enumerate(client.prefecture_codes.items(), 1):
        print(f"[{i}/{total}] {pref_name} のデータを取得中...")

        try:
            # 公示地価データを取得
            data = client.search_land_prices(
                prefecture=pref_name,
                year=year
            )

            if data:
                # 平均地価と変動率を計算
                avg_price, avg_change_rate = calculate_prefecture_average(data)

                prefecture_ranking.append({
                    "name": pref_name,
                    "code": pref_code,
                    "slug": get_prefecture_slug(pref_name),
                    "price_per_sqm": int(avg_price),
                    "price_per_tsubo": calculate_tsubo_price(avg_price),
                    "change_rate": round(avg_change_rate, 1),
                    "data_count": len(data)
                })

                print(f"   ✅ {pref_name}: 平均地価 {int(avg_price):,}円/㎡, 変動率 {avg_change_rate:+.1f}%, データ数 {len(data)}件")
            else:
                print(f"   ⚠️  {pref_name}: データなし")

        except Exception as e:
            print(f"   ❌ {pref_name}: エラー - {e}")
            continue

    # 平均地価でソート（降順）
    prefecture_ranking.sort(key=lambda x: x['price_per_sqm'], reverse=True)

    # ランク番号を追加
    for rank, item in enumerate(prefecture_ranking, 1):
        item['rank'] = rank

    print()
    print("=" * 80)
    print(f"データ取得完了: {len(prefecture_ranking)}/{total}都道府県")
    print("=" * 80)
    print()

    return prefecture_ranking


def generate_ranking_html(prefecture_data: List[Dict]) -> str:
    """
    都道府県ランキングHTMLを生成

    Args:
        prefecture_data: 都道府県データのリスト

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

    def get_change_badge(change_rate: float) -> str:
        """変動率のバッジHTMLを生成"""
        if change_rate >= 0:
            return f'<span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: 600; font-size: 13px;">↑ +{change_rate}%</span>'
        else:
            return f'<span style="display: inline-block; padding: 4px 12px; background: #fee2e2; color: #dc2626; border-radius: 4px; font-weight: 600; font-size: 13px;">↓ {change_rate}%</span>'

    # テーブル行を生成
    rows = []
    for item in prefecture_data:
        medal = get_medal_emoji(item['rank'])
        change_badge = get_change_badge(item['change_rate'])

        row = f'''<tr style="border-bottom: 1px solid #e5e7eb; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f0f9ff'" onmouseout="this.style.backgroundColor=''">
<td style="padding: 14px 12px; text-align: center; font-weight: 600;">{medal}{item['rank']}位</td>
<td style="padding: 14px 12px; font-weight: 600; color: #111827;">{item['name']}</td>
<td style="padding: 14px 12px; text-align: right; font-weight: 600; color: #667eea;">{item['price_per_sqm']:,}</td>
<td style="padding: 14px 12px; text-align: right; font-weight: 600;">{item['price_per_tsubo']}</td>
<td style="padding: 14px 12px; text-align: center;">{change_badge}</td>
<td style="padding: 14px 12px; text-align: center;"><a href="/land-price/{item['slug']}/" style="display: inline-block; background: #667eea; color: white; padding: 6px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; transition: background 0.3s;" onmouseover="this.style.backgroundColor='#5568d3'" onmouseout="this.style.backgroundColor='#667eea'">詳細 ▶</a></td>
</tr>'''
        rows.append(row)

    rows_html = '\n'.join(rows)

    html = f'''<!-- 都道府県基準地価ランキングセクション -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
<div style="padding: 20px 24px; border-bottom: 2px solid #e5e7eb; margin: -40px -40px 30px -40px;">
<h2 style="font-size: 24px; font-weight: 700; margin: 0; color: white;">📊 都道府県の基準地価ランキング（2025年最新）</h2>
<p style="font-size: 14px; margin: 8px 0 0 0; color: white;">全国47都道府県の平均地価・坪単価・変動率（国土交通省 不動産情報ライブラリより取得）</p>
</div>
<div style="overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; background: white; font-size: 14px;">
<thead>
<tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
<th style="padding: 16px 12px; text-align: center; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">順位</th>
<th style="padding: 16px 12px; text-align: left; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">都道府県</th>
<th style="padding: 16px 12px; text-align: right; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">平均地価（円/㎡）</th>
<th style="padding: 16px 12px; text-align: right; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">平均坪単価（万円/坪）</th>
<th style="padding: 16px 12px; text-align: center; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">前年比</th>
<th style="padding: 16px 12px; text-align: center; font-weight: 600; color: white; border-bottom: 2px solid #e5e7eb;">詳細</th>
</tr>
</thead>
<tbody>
{rows_html}
</tbody>
</table>
</div>
<div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
<p style="font-size: 14px; color: #6b7280; margin: 0;">※ 基準地価は国土交通省が毎年公表する土地の価格指標です（データ出典: 不動産情報ライブラリ）</p>
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
    # 2025年のデータを取得
    year = "2025"

    # データ取得
    prefecture_data = fetch_all_prefecture_data(year)

    if not prefecture_data:
        print("❌ データ取得に失敗しました")
        sys.exit(1)

    # JSONデータを保存
    save_json_data(prefecture_data, "prefecture_ranking_data.json")
    print()

    # ランキングHTML生成
    print("HTMLを生成中...")
    html = generate_ranking_html(prefecture_data)

    # HTMLを保存
    save_to_file(html, "prefecture-ranking-section.html")
    print()

    # サマリー表示
    print("=" * 80)
    print("トップ10都道府県")
    print("=" * 80)
    for item in prefecture_data[:10]:
        print(f"{item['rank']:2d}位: {item['name']:<8s} {item['price_per_sqm']:>8,d}円/㎡ ({item['change_rate']:+.1f}%)")
    print()

    print("✅ 処理完了")


if __name__ == '__main__':
    main()
