#!/usr/bin/env python3
"""全TSVに戦略4列を追加: トピカル貢献, ツール導線, 会員登録, 競合勝率"""
import glob, os, re

TSV_DIR = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(TSV_DIR, '*_判定済み.tsv')))

# カテゴリのCV距離分類
A_CATS = {'IRR','NOI','NPV','DSCR','DCF法','キャッシュフロー','表面利回り','実質利回り',
           '収益還元','積算評価','再調達価格','自己資金配当率','投資利益率','内部収益率',
           '正味現在価値','不動産投資','不動産投資計算','デッドクロス','借入比率'}
B_CATS = {'減価償却','仲介手数料','法人税','売却','不動産売却','譲渡所得税','登録免許税',
           '不動産取得税','印紙税','繰上返済','借入可能額','固定資産税精算金','建物消費税'}
# C_CATS = everything else

# トピカル貢献: 必須/補足/不要
TOPICAL_ESSENTIAL = re.compile(r'基礎|解説|相場|法律|上限|規制|制度|概要|定義|仕組み|売買|不動産')

total_files = 0
stats = {col: {} for col in ['トピカル貢献','ツール導線','会員登録','競合勝率']}

for fpath in files:
    cat_name = os.path.basename(fpath).replace('_判定済み.tsv', '')

    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    if not lines:
        continue

    new_lines = []
    for i, line in enumerate(lines):
        line = line.rstrip('\n')
        cols = line.split('\t')

        if i == 0:
            # Header - pad to 12 if needed, then add 4 new columns
            while len(cols) < 12:
                cols.append('')
            # Remove old extra columns if re-running
            cols = cols[:12]
            cols.extend(['トピカル貢献', 'ツール導線', '会員登録', '競合勝率'])
            new_lines.append('\t'.join(cols))
            continue

        # Pad to 12 columns
        while len(cols) < 12:
            cols.append('')
        cols = cols[:12]  # trim if re-running

        hantei = cols[5].strip()
        intent = cols[6].strip()
        topic = cols[8].strip()
        kd_str = cols[3].strip()
        vol = int(cols[4]) if cols[4].strip().isdigit() else 0

        # --- トピカル貢献 ---
        if hantei == '計算ページ':
            topical = '必須'
        elif hantei == '削除':
            topical = '不要'
        elif hantei == '記事':
            if TOPICAL_ESSENTIAL.search(topic):
                topical = '必須'
            else:
                topical = '補足'
        else:
            topical = ''

        # --- ツール導線 ---
        if hantei == '計算ページ':
            flow = '自然'
        elif hantei == '削除':
            flow = '弱い'
        elif hantei == '記事':
            if 'Do' in intent:
                flow = '自然'
            elif any(k in topic for k in ['基礎', '解説', '相場', '金額', '売買']):
                flow = '自然'
            elif any(k in topic for k in ['賃貸', '値引き', '無料', '比較']):
                flow = '弱い'
            else:
                flow = 'やや'
        else:
            flow = ''

        # --- 会員登録 (CV距離) ---
        if hantei == '計算ページ':
            cv = '近い'
        elif hantei == '削除':
            cv = '遠い'
        elif cat_name in A_CATS:
            cv = '近い'
        elif cat_name in B_CATS:
            cv = '中'
        else:
            cv = '遠い'

        # --- 競合勝率 ---
        if hantei == '削除':
            compete = ''
        else:
            kd = None
            if kd_str not in ('', 'N/A'):
                try:
                    kd = int(kd_str)
                except ValueError:
                    pass
            if kd is not None:
                if kd <= 15:
                    compete = '高'
                elif kd <= 30:
                    compete = '中'
                else:
                    compete = '低'
            elif vol > 0:
                # KD不明だが検索ありの場合、N/AはKDデータなし=競合少ない可能性
                compete = '中'
            else:
                compete = ''

        cols.extend([topical, flow, cv, compete])
        new_lines.append('\t'.join(cols))

        for col_name, val in [('トピカル貢献',topical),('ツール導線',flow),('会員登録',cv),('競合勝率',compete)]:
            stats[col_name][val] = stats[col_name].get(val, 0) + 1

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines) + '\n')
    total_files += 1

print(f'Updated {total_files} files')
for col_name in ['トピカル貢献','ツール導線','会員登録','競合勝率']:
    print(f'\n{col_name}:')
    for k, v in sorted(stats[col_name].items(), key=lambda x: -x[1]):
        print(f'  {k or "（空）"}: {v}')
