#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
page_1726.htmlの「基準地価」を「公示地価」に一括置換
"""

import re

# HTMLファイルを読み込み
with open('page_1726.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 置換カウント
count = 0

# 「基準地価」→「公示地価」に置換
content, n = re.subn(r'基準地価', '公示地価', content)
count += n

# 結果を保存
with open('page_1726.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✅ 置換完了: {count}箇所")
print(f"   基準地価 → 公示地価")
