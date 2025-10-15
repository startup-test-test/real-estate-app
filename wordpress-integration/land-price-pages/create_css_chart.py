#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSSのみで表現する地価推移グラフを生成
"""

# グラフデータ
chart_data = {
    "years": ["2021年", "2022年", "2023年", "2024年", "2025年"],
    "prices": [119943, 121428, 124919, 129895, 136982],
    "tsubo_prices": [39.7, 40.1, 41.3, 42.9, 45.3],
    "change_rates": [-0.4, 0.5, 1.4, 1.9, 2.1]
}

# 最大値を取得（バーの高さ計算用）
max_price = max(chart_data["prices"])

# HTML生成
html = '''
<!-- 日本全国の地価推移グラフ -->
<section style="margin-bottom: 60px;">
    <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">📊 日本全国の地価推移グラフ</h3>

    <div style="background: white; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
'''

# 各年のバーを生成
for i, year in enumerate(chart_data["years"]):
    price = chart_data["prices"][i]
    tsubo_price = chart_data["tsubo_prices"][i]
    change_rate = chart_data["change_rates"][i]

    # バーの高さ（最大値を100%として相対的に計算）
    bar_height = (price / max_price) * 100

    # 変動率の色
    if change_rate > 0:
        change_color = "#16a34a"
        change_icon = "↑"
    elif change_rate < 0:
        change_color = "#dc2626"
        change_icon = "↓"
    else:
        change_color = "#6b7280"
        change_icon = "→"

    html += f'''
        <!-- {year} -->
        <div style="display: inline-block; width: 18%; margin: 0 1%; vertical-align: bottom; text-align: center;">
            <!-- 数値表示 -->
            <div style="margin-bottom: 8px;">
                <div style="font-size: 15px; font-weight: 700; color: #667eea; margin-bottom: 2px;">{price:,}円</div>
                <div style="font-size: 13px; color: #6b7280;">{tsubo_price}万円/坪</div>
                <div style="font-size: 12px; color: {change_color}; font-weight: 600; margin-top: 4px;">{change_icon} {change_rate:+.1f}%</div>
            </div>

            <!-- バー -->
            <div style="height: 250px; display: flex; align-items: flex-end; justify-content: center;">
                <div style="width: 80%; background: linear-gradient(180deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0; height: {bar_height}%; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); transition: all 0.3s;"></div>
            </div>

            <!-- 年度ラベル -->
            <div style="margin-top: 12px; font-size: 14px; font-weight: 600; color: #111827;">{year}</div>
        </div>
'''

html += '''
    </div>

    <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #667eea;">
        <div style="font-size: 13px; color: #374151; line-height: 1.8;">
            <strong style="color: #111827;">📈 5年間の推移まとめ</strong><br>
            <span style="margin-left: 4px;">• 2021年から2025年にかけて約17,000円/㎡（約14.2%）上昇</span><br>
            <span style="margin-left: 4px;">• 2022年以降、連続して上昇傾向が続いています</span><br>
            <span style="margin-left: 4px;">• 2025年の上昇率は+2.1%で、前年から加速</span>
        </div>
    </div>

    <p style="font-size: 13px; color: #6b7280; margin: 12px 0 0 0;">※ 全国47都道府県、約18,000地点の公示地価データから算出した平均値です。</p>
</section>
'''

# ファイルに保存
with open('css_chart_section.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ CSSグラフセクションを生成しました: css_chart_section.html")
print()
print("グラフの特徴:")
print("  - JavaScriptを使わないCSS専用グラフ")
print("  - 5年分の棒グラフ（グラデーション表示）")
print("  - 各バーに円/㎡、万円/坪、変動率を表示")
print("  - レスポンシブ対応")
print()
print("次のステップ:")
print("  1. css_chart_section.html の内容を確認")
print("  2. page_1726.html の既存グラフセクションと置き換え")
