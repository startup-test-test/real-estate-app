#!/usr/bin/env python3
"""ページ役割列を追加: ピラーページ / 計算ツール / 解説記事"""
import glob, os

TSV_DIR = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(TSV_DIR, '*_判定済み.tsv')))

total_files = 0
stats = {}

for fpath in files:
    cat = os.path.basename(fpath).replace('_判定済み.tsv', '')

    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    if not lines:
        continue

    # Phase 1: ページグループごとの情報を集計
    pg_info = {}  # pg -> {topical, has_calc, has_kiso, vol}
    for line in lines[1:]:
        cols = line.strip().split('\t')
        if len(cols) < 13: continue
        pg = cols[9].strip()
        hantei = cols[5].strip()
        topical = cols[12].strip()
        vol = int(cols[4]) if cols[4].strip().isdigit() else 0
        if not pg: continue
        if pg not in pg_info:
            pg_info[pg] = {'topical': topical, 'has_calc': False, 'has_kiso': False, 'vol': 0}
        if hantei == '計算ページ':
            pg_info[pg]['has_calc'] = True
        if '基礎解説' in pg:
            pg_info[pg]['has_kiso'] = True
        pg_info[pg]['vol'] += vol

    # Phase 2: ページグループ → ページ役割を決定
    pg_role = {}
    for pg, info in pg_info.items():
        if info['topical'] != '必須':
            pg_role[pg] = ''
            continue

        if info['has_calc']:
            pg_role[pg] = '計算ツール'
        elif info['has_kiso']:
            pg_role[pg] = 'ピラーページ'
        else:
            pg_role[pg] = '解説記事'

    # Phase 3: TSV更新
    new_lines = []
    for i, line in enumerate(lines):
        line = line.rstrip('\n')
        cols = line.split('\t')

        if i == 0:
            while len(cols) < 13:
                cols.append('')
            cols = cols[:13]
            cols.append('ページ役割')
            new_lines.append('\t'.join(cols))
            continue

        while len(cols) < 13:
            cols.append('')
        cols = cols[:13]

        pg = cols[9].strip()
        role = pg_role.get(pg, '')
        cols.append(role)
        new_lines.append('\t'.join(cols))

        if role:
            stats[role] = stats.get(role, 0) + 1

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines) + '\n')
    total_files += 1

    # 表示
    roles = {}
    for pg, role in pg_role.items():
        if role:
            if role not in roles:
                roles[role] = []
            roles[role].append(pg)

    if roles:
        print(f'\n=== {cat} ===')
        for role in ['ピラーページ', '計算ツール', '解説記事']:
            if role in roles:
                for pg in sorted(roles[role]):
                    print(f'  [{role}] {pg}')

print(f'\n合計: {total_files}ファイル')
for k, v in sorted(stats.items()):
    print(f'  {k}: {v:,}')
