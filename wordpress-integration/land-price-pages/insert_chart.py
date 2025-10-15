#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
page_1726.htmlにグラフセクションを挿入
"""

# HTMLファイルを読み込み
with open('page_1726.html', 'r', encoding='utf-8') as f:
    content = f.read()

# chart_section.htmlを読み込み
with open('chart_section.html', 'r', encoding='utf-8') as f:
    chart_html = f.read()

# 「📈 日本全国の公示地価　過去の推移」セクションの終了タグを検索
# このセクションは </section> で終わるので、その直後に挿入
marker = '※ 全国47都道府県の公示地価データから算出した平均値です。</p>\n</section>'

if marker in content:
    # マーカーの直後に挿入
    parts = content.split(marker, 1)

    # 新しいコンテンツを組み立て
    new_content = parts[0] + marker + '\n' + chart_html + parts[1]

    # ファイルに保存
    with open('page_1726.html', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("✅ グラフセクションを挿入しました")
    print(f"   挿入位置: 「📈 日本全国の公示地価　過去の推移」の直後")
    print()
    print("次のステップ:")
    print("  python quick_edit.py 1726 page_1726.html")
else:
    print("❌ 挿入位置が見つかりませんでした")
    print("   マーカー:", marker[:50] + "...")
