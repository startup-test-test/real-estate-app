#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全国平均の地価サマリーセクションを生成
"""

import json
from pathlib import Path
from statistics import mean


def calculate_tsubo_price(price_per_sqm: float) -> int:
    """坪単価を計算（円/坪）"""
    return int(price_per_sqm * 3.30579)


def generate_national_summary_html(avg_price: int, avg_change_rate: float, tsubo_price: int) -> str:
    """
    全国平均サマリーHTMLを生成

    Args:
        avg_price: 全国平均地価（円/㎡）
        avg_change_rate: 全国平均変動率（%）
        tsubo_price: 全国平均坪単価（円/坪）

    Returns:
        HTMLコンテンツ
    """

    # 変動状態の判定
    if avg_change_rate > 0:
        status = "上昇"
        status_color = "#16a34a"
        status_bg = "#dcfce7"
        arrow = "↑"
    elif avg_change_rate < 0:
        status = "下落"
        status_color = "#dc2626"
        status_bg = "#fee2e2"
        arrow = "↓"
    else:
        status = "横ばい"
        status_color = "#6b7280"
        status_bg = "#f3f4f6"
        arrow = "→"

    html = f'''<!-- 全国平均地価サマリーセクション -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
<div style="text-align: center;">
<h2 style="font-size: 28px; font-weight: 700; margin: 0 0 24px 0; color: white;">📊 日本全国2025年［令和7年］基準地価</h2>
<div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
<div style="text-align: center;">
<p style="font-size: 14px; margin: 0 0 8px 0; color: #6b7280;">平均地価</p>
<p style="font-size: 36px; font-weight: 700; margin: 0; color: #111827;">{avg_price:,}<span style="font-size: 18px; font-weight: 400;">円/㎡</span></p>
</div>
<div style="text-align: center;">
<p style="font-size: 14px; margin: 0 0 8px 0; color: #6b7280;">変動率</p>
<p style="font-size: 36px; font-weight: 700; margin: 0; color: #111827;">{arrow}{avg_change_rate:+.2f}<span style="font-size: 18px; font-weight: 400;">%</span></p>
<p style="display: inline-block; margin-top: 8px; padding: 6px 16px; background: {status_bg}; color: {status_color}; border-radius: 20px; font-weight: 600; font-size: 14px;">{status}</p>
</div>
<div style="text-align: center;">
<p style="font-size: 14px; margin: 0 0 8px 0; color: #6b7280;">坪単価</p>
<p style="font-size: 36px; font-weight: 700; margin: 0; color: #111827;">{tsubo_price:,}<span style="font-size: 18px; font-weight: 400;">円/坪</span></p>
</div>
</div>
<p style="font-size: 13px; margin: 24px 0 0 0; color: #6b7280;">※ 全国47都道府県の基準地価データから算出（データ出典: 国土交通省 不動産情報ライブラリ）</p>
</div>
</section>
'''

    return html


def main():
    """メイン処理"""
    print("=" * 80)
    print("全国平均地価サマリーセクション生成")
    print("=" * 80)
    print()

    # 都道府県ランキングデータを読み込み
    data_file = Path(__file__).parent / 'prefecture_ranking_data.json'

    print(f"データ読み込み中: {data_file.name}")
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            prefecture_data = json.load(f)
    except Exception as e:
        print(f"❌ ファイル読み込みエラー: {str(e)}")
        return

    print(f"✅ データ読み込み完了（{len(prefecture_data)}都道府県）")
    print()

    # 全国平均を計算
    print("全国平均を計算中...")
    prices = [item['price_per_sqm'] for item in prefecture_data]
    change_rates = [item['change_rate'] for item in prefecture_data]

    avg_price = int(mean(prices))
    avg_change_rate = mean(change_rates)
    tsubo_price = calculate_tsubo_price(avg_price)

    print(f"✅ 全国平均地価: {avg_price:,}円/㎡")
    print(f"✅ 全国平均変動率: {avg_change_rate:+.2f}%")
    print(f"✅ 全国平均坪単価: {tsubo_price:,}円/坪")
    print()

    # サマリーHTML生成
    print("HTMLを生成中...")
    html = generate_national_summary_html(avg_price, avg_change_rate, tsubo_price)

    # HTMLを保存
    output_file = Path(__file__).parent / 'national-summary-section.html'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"✅ HTMLファイルを保存しました: {output_file.name}")
    print()

    print("✅ 処理完了")


if __name__ == '__main__':
    main()
