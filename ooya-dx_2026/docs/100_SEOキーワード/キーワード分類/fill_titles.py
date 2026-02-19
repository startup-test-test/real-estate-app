#!/usr/bin/env python3
"""補足キーワードに想定ページタイトルを割り当てるスクリプト

サイト設計.md の11ページ構成に基づき、ページグループ・キーワード内容から
適切な想定ページタイトルを設定する。
"""
import re

FILEPATH = '/Users/tetzlow/real-estate-app/ooya-dx_2026/docs/100_SEOキーワード/キーワード分類/仲介手数料_判定済み.tsv'

# サイト設計.md の11ページ → 想定ページタイトル
TITLES = {
    'calc':    '仲介手数料 計算ツール',
    'pillar':  '仲介手数料とは？仕組み・計算・相場を完全ガイド',
    'realestate': '不動産売買の仲介手数料はいくら？マンション・戸建・土地の計算方法',
    'rental':  '賃貸の仲介手数料はいくら？相場・上限・交渉・無料物件の見つけ方',
    'free':    '仲介手数料無料の仕組みとからくり｜メリット・デメリットを解説',
    'market':  '仲介手数料の相場はいくら？売買価格帯別の金額一覧',
    'nego':    '仲介手数料の交渉・値引き方法｜成功する言い方・タイミング',
    'legal':   '仲介手数料の上限はいくら？宅建業法の規定と2024年改正',
    'acct':    '仲介手数料の勘定科目・仕訳｜個人事業主・法人の経費処理',
    'tax':     '仲介手数料に消費税はかかる？土地・建物の計算方法',
    'price':   '仲介手数料の具体例｜800万円・400万円・3000万円の計算',
}

# ページグループ → ページキー のマッピング
PG_MAP = {
    '仲介手数料_基礎解説': 'pillar',
    '仲介手数料_計算ツール': 'calc',
    '仲介手数料計算': 'calc',
    '仲介手数料_不動産売買': 'realestate',
    '仲介手数料賃貸': 'rental',
    '仲介手数料_交渉ガイド': 'nego',
    '仲介手数料_相場': 'market',
    '仲介手数料_法律・規制': 'legal',
    '仲介手数料_法改正': 'legal',
    '仲介手数料_会計処理': 'acct',
    '仲介手数料_消費税解説': 'tax',
    '仲介手数料_金額別': 'price',
    '仲介手数料_具体例・ケース': 'price',
    '仲介手数料住宅': 'realestate',
    '仲介手数料_期間別': 'pillar',
}

# 仲介手数料値引き → キーワード内容で ⑤無料 or ⑦交渉 に振り分け
NEGO_RE = re.compile(r'交渉|値引き|値切|安くする|半額|言い方|タイミング|仕方')
FREE_RE = re.compile(r'無料|からくり|なぜ|デメリット|安い|なし')


def classify_nebiki(kw):
    """値引きグループのキーワードを無料 or 交渉に振り分け"""
    if NEGO_RE.search(kw):
        return 'nego'
    if FREE_RE.search(kw):
        return 'free'
    return 'free'


def get_title_for_row(kw, pg):
    """キーワードとページグループから想定ページタイトルを決定"""
    # 値引きグループは特別処理
    if pg == '仲介手数料値引き':
        key = classify_nebiki(kw)
        return TITLES[key]

    # ページグループから直接マッピング
    if pg in PG_MAP:
        key = PG_MAP[pg]
        return TITLES[key]

    # キーワード内容からフォールバック
    if re.search(r'賃貸', kw):
        return TITLES['rental']
    if re.search(r'計算|シミュレーション', kw):
        return TITLES['calc']
    if re.search(r'無料|安い|なし', kw):
        return TITLES['free']
    if re.search(r'交渉|値引|値切|半額', kw):
        return TITLES['nego']
    if re.search(r'相場|いくら|平均', kw):
        return TITLES['market']
    if re.search(r'上限|法律|宅建|違法|法改正|改正|改定', kw):
        return TITLES['legal']
    if re.search(r'勘定科目|仕訳|経費|科目', kw):
        return TITLES['acct']
    if re.search(r'消費税|税金|税込|課税', kw):
        return TITLES['tax']
    if re.search(r'万円|パーセント|高い|高すぎ', kw):
        return TITLES['price']
    if re.search(r'不動産|売買|マンション|土地|戸建|建売', kw):
        return TITLES['realestate']

    # 最終フォールバック: ピラーページ
    return TITLES['pillar']


def main():
    with open(FILEPATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    header = lines[0].strip().split('\t')
    idx = {name: i for i, name in enumerate(header)}

    kw_i = idx['キーワード']
    title_i = idx['想定ページタイトル']
    hantei_i = idx['判定']
    pg_i = idx['ページグループ']

    count = 0
    by_title = {}
    new_lines = [lines[0]]

    for line in lines[1:]:
        cols = line.strip().split('\t')
        # 列数が足りない場合はパディング
        while len(cols) <= title_i:
            cols.append('')

        hantei = cols[hantei_i]
        current_title = cols[title_i]
        kw = cols[kw_i]
        pg = cols[pg_i] if pg_i < len(cols) else ''

        # 削除でない & タイトルが空の場合のみ処理
        if hantei != '削除' and not current_title.strip():
            title = get_title_for_row(kw, pg)
            if title:
                cols[title_i] = title
                count += 1
                by_title[title] = by_title.get(title, 0) + 1

        new_lines.append('\t'.join(cols) + '\n')

    with open(FILEPATH, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print(f'想定ページタイトルを {count}件 に割り当て完了\n')
    print('割り当て内訳:')
    for title, cnt in sorted(by_title.items(), key=lambda x: -x[1]):
        print(f'  {cnt:3d}件  {title}')


if __name__ == '__main__':
    main()
