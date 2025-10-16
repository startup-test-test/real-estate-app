#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
page_1726.htmlに過去推移セクションを挿入
"""

# HTMLファイルを読み込み
with open('page_1726.html', 'r', encoding='utf-8') as f:
    content = f.read()

# history_section.htmlを読み込み
with open('history_section.html', 'r', encoding='utf-8') as f:
    history_html = f.read()

# 「📋 データについて」セクションを検索
marker = '<!-- データについて -->'

if marker in content:
    # マーカーの位置を特定して、その直前に挿入
    parts = content.split(marker, 1)

    # 新しいコンテンツを組み立て
    new_content = parts[0] + history_html + '\n' + marker + parts[1]

    # ファイルに保存
    with open('page_1726.html', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("✅ 過去推移セクションを挿入しました")
    print(f"   挿入位置: 「📋 データについて」の直前")
    print()
    print("次のステップ:")
    print("  python quick_edit.py 1726 page_1726.html")
else:
    print("❌ 「📋 データについて」セクションが見つかりませんでした")
    print("   マーカー:", marker)
