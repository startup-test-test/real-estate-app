#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
page_1726.htmlの既存グラフをFlexboxグラフに置き換え
"""

import re

# HTMLファイルを読み込み
with open('page_1726.html', 'r', encoding='utf-8') as f:
    content = f.read()

# flex_chart_section.htmlを読み込み
with open('flex_chart_section.html', 'r', encoding='utf-8') as f:
    flex_chart_html = f.read()

# 既存のグラフセクション全体を削除（<!-- 日本全国の地価推移グラフ --> から次のコメントタグの前まで）
pattern = r'<!-- 日本全国の地価推移グラフ -->.*?(?=<!-- データについて --|$)'
match = re.search(pattern, content, re.DOTALL)

if match:
    # 既存グラフを削除
    content = re.sub(pattern, flex_chart_html + '\n', content, flags=re.DOTALL)

    # ファイルに保存
    with open('page_1726.html', 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ グラフを置き換えました")
    print("   CSSグラフ → Flexboxグラフ（横並び）")
    print()
    print("次のステップ:")
    print("  python quick_edit.py 1726 page_1726.html")
else:
    print("❌ 既存のグラフセクションが見つかりませんでした")
