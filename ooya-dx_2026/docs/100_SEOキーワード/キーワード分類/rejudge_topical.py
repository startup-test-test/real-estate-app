#!/usr/bin/env python3
"""ページグループ単位でトピカル貢献を再判定するスクリプト。

ルール:
1. 計算グループ → 必須（ツール本体）
2. 基礎解説グループ（Vol上位2つ）→ 必須
3. Vol上位グループの中から、投資家に関連するもの → 必須（最大5グループ）
4. CV的に遠いグループ → 補足に降格
5. 「対象外」を含むグループ → 不要
6. 判定=削除 のキーワード → 不要
"""
import glob, os, re

TSV_DIR = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(TSV_DIR, '*_判定済み.tsv')))

# CV距離が遠い（投資家に関係薄い）パターン → 補足に降格
DEMOTE_PATTERNS = re.compile(
    r'賃貸|値引き|車・動産|金融商品|投資信託|対象外|企業価値|書式|特定企業|'
    r'保険|非課税世帯|給与所得|賞与|通知書|徴収方法|退職|'
    r'銀行別|おすすめ|審査|借り換え'
)

# トピカルオーソリティに重要なパターン → 必須候補
PROMOTE_PATTERNS = re.compile(
    r'基礎解説|計算|相場|法律|上限|規制|制度|不動産|売買|税率|'
    r'利回り|投資|控除|軽減|申告|評価'
)

MAX_ESSENTIAL = 5  # 計算グループ除く必須の上限

total_files = 0
total_updated = 0
stats = {'必須': 0, '補足': 0, '不要': 0}

for fpath in files:
    cat_name = os.path.basename(fpath).replace('_判定済み.tsv', '')

    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    if not lines:
        continue

    # Phase 1: ページグループごとのVol集計
    pg_vol = {}  # page_group -> total_vol
    pg_hantei = {}  # page_group -> set of hantei values
    for line in lines[1:]:
        cols = line.strip().split('\t')
        if len(cols) < 10:
            continue
        hantei = cols[5].strip()
        if hantei == '削除':
            continue
        vol = int(cols[4]) if cols[4].strip().isdigit() else 0
        pg = cols[9].strip()
        if not pg:
            continue
        pg_vol[pg] = pg_vol.get(pg, 0) + vol
        if pg not in pg_hantei:
            pg_hantei[pg] = set()
        pg_hantei[pg].add(hantei)

    # Phase 2: ページグループの必須/補足を判定
    sorted_pgs = sorted(pg_vol.items(), key=lambda x: -x[1])
    pg_decision = {}  # page_group -> 必須/補足/不要

    essential_count = 0

    for pg, vol in sorted_pgs:
        # 計算グループ → 必須（カウント外）
        if '計算' in pg and '計算ページ' in pg_hantei.get(pg, set()):
            pg_decision[pg] = '必須'
            continue

        # 対象外を含む → 不要
        if '対象外' in pg:
            pg_decision[pg] = '不要'
            continue

        # 降格パターンに該当 → 補足
        if DEMOTE_PATTERNS.search(pg):
            pg_decision[pg] = '補足'
            continue

        # 基礎解説グループ（Vol上位2つまで必須）
        if '基礎解説' in pg:
            if essential_count < MAX_ESSENTIAL:
                pg_decision[pg] = '必須'
                essential_count += 1
                continue

        # 昇格パターンに該当 + 必須枠に空きあり → 必須
        if essential_count < MAX_ESSENTIAL and PROMOTE_PATTERNS.search(pg):
            pg_decision[pg] = '必須'
            essential_count += 1
            continue

        # それ以外 → 補足
        pg_decision[pg] = '補足'

    # Phase 3: TSV書き換え
    new_lines = []
    for i, line in enumerate(lines):
        line = line.rstrip('\n')
        cols = line.split('\t')

        if i == 0:
            new_lines.append(line)
            continue

        # Ensure we have enough columns
        while len(cols) < 16:
            cols.append('')

        hantei = cols[5].strip()
        pg = cols[9].strip()

        # トピカル貢献（col 12）を上書き
        if hantei == '削除':
            cols[12] = '不要'
        elif pg in pg_decision:
            cols[12] = pg_decision[pg]
        elif hantei == '計算ページ':
            cols[12] = '必須'
        else:
            cols[12] = '補足'

        stats[cols[12]] = stats.get(cols[12], 0) + 1
        new_lines.append('\t'.join(cols))
        total_updated += 1

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines) + '\n')
    total_files += 1

    # Show per-category summary
    essential_pgs = [pg for pg, d in pg_decision.items() if d == '必須']
    print(f'{cat_name}: 必須グループ {len(essential_pgs)}個')
    for pg in essential_pgs:
        print(f'  ✓ {pg} (Vol:{pg_vol[pg]:,})')

print(f'\n=== 合計 ===')
print(f'{total_files} files, {total_updated} rows updated')
for k in ['必須', '補足', '不要']:
    print(f'  {k}: {stats.get(k, 0):,}')
