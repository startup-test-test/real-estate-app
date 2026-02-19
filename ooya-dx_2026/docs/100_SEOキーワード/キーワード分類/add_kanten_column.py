#!/usr/bin/env python3
"""全41 TSVファイルに「観点」列を追加するスクリプト。

自動判定ルール:
  判定=計算ページ → ツール集客
  判定=削除       → 対象外
  判定=記事       → 権威構築
  それ以外/空     → （空欄）
"""
import glob, os

TSV_DIR = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(TSV_DIR, '*_判定済み.tsv')))

total_files = 0
total_rows = 0
stats = {'ツール集客': 0, '権威構築': 0, '対象外': 0, '': 0}

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    if not lines:
        continue

    new_lines = []
    for i, line in enumerate(lines):
        line = line.rstrip('\n')
        cols = line.split('\t')

        if i == 0:
            # Header row - add 観点 column
            if '観点' not in cols:
                cols.append('観点')
            new_lines.append('\t'.join(cols))
            continue

        # Data row
        if len(cols) < 11:
            # Pad to 11 columns if needed
            cols.extend([''] * (11 - len(cols)))

        # Column 5 = 判定
        hantei = cols[5].strip() if len(cols) > 5 else ''

        # Auto-assign 観点
        if hantei == '計算ページ':
            kanten = 'ツール集客'
        elif hantei == '削除':
            kanten = '対象外'
        elif hantei == '記事':
            kanten = '権威構築'
        else:
            kanten = ''

        # Add or update column 11
        if len(cols) <= 11:
            cols.append(kanten)
        else:
            cols[11] = kanten

        stats[kanten] = stats.get(kanten, 0) + 1
        total_rows += 1
        new_lines.append('\t'.join(cols))

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines) + '\n')

    total_files += 1

print(f'Updated {total_files} files, {total_rows} rows')
for k, v in sorted(stats.items(), key=lambda x: -x[1]):
    label = k if k else '（空欄）'
    print(f'  {label}: {v}')
