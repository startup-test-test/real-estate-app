#!/usr/bin/env python3
"""企業名入りキーワードを削除対象に変更"""
import re

FILEPATH = '/Users/tetzlow/real-estate-app/ooya-dx_2026/docs/100_SEOキーワード/キーワード分類/仲介手数料_判定済み.tsv'

BRAND_PATTERNS = [
    'ピタットハウス', 'lakia', 'アパマン', 'エイブル', 'ミニミニ',
    'スーモ', 'suumo', 'ホームズ', 'homes', 'ライフルホームズ',
    'レオパレス', '大東建託', '積水', '三井', '住友',
    '東急', '野村', 'センチュリー', 'イエウール', 'アットホーム',
    'パナソニックホームズ', 'グランホームズ',
]

brand_re = re.compile('|'.join(BRAND_PATTERNS), re.IGNORECASE)

with open(FILEPATH, 'r', encoding='utf-8') as f:
    lines = f.readlines()

header = lines[0].strip().split('\t')
# 列インデックス取得
idx = {name: i for i, name in enumerate(header)}

count = 0
new_lines = [lines[0]]

for line in lines[1:]:
    cols = line.strip().split('\t')
    kw = cols[idx['キーワード']] if 'キーワード' in idx else ''

    if brand_re.search(kw):
        cols[idx['判定']] = '削除'
        cols[idx['テーマ']] = '特定企業'
        cols[idx['トピカル貢献']] = '不要'
        count += 1
        print(f'  削除: {kw} (vol: {cols[idx["月間検索数"]]})')

    new_lines.append('\t'.join(cols) + '\n')

with open(FILEPATH, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f'\n合計: {count}件を削除に変更')
