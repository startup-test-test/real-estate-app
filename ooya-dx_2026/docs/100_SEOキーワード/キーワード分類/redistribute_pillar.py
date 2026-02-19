#!/usr/bin/env python3
"""ピラーページのキーワードを子ページに再分類するスクリプト

ピラーに集中していた237KWを、検索意図に基づいて適切な子ページに再配分する。
"""
import re

FILEPATH = '/Users/tetzlow/real-estate-app/ooya-dx_2026/docs/100_SEOキーワード/キーワード分類/仲介手数料_判定済み.tsv'

PILLAR_TITLE = '仲介手数料とは？仕組み・計算・相場を完全ガイド'

TITLES = {
    'calc':       '仲介手数料 計算ツール',
    'pillar':     '仲介手数料とは？仕組み・計算・相場を完全ガイド',
    'realestate': '不動産売買の仲介手数料はいくら？マンション・戸建・土地の計算方法',
    'rental':     '賃貸の仲介手数料はいくら？相場・上限・交渉・無料物件の見つけ方',
    'free':       '仲介手数料無料の仕組みとからくり｜メリット・デメリットを解説',
    'market':     '仲介手数料の相場はいくら？売買価格帯別の金額一覧',
    'nego':       '仲介手数料の交渉・値引き方法｜成功する言い方・タイミング',
    'legal':      '仲介手数料の上限はいくら？宅建業法の規定と2024年改正',
    'acct':       '仲介手数料の勘定科目・仕訳｜個人事業主・法人の経費処理',
    'tax':        '仲介手数料に消費税はかかる？土地・建物の計算方法',
    'price':      '仲介手数料の具体例｜800万円・400万円・3000万円の計算',
}

# 企業名ブランドキーワード（削除対象）
BRANDED = re.compile(
    r'ホームメイト|ニッショー|ラテルーム|ルームコア|ルームワン|ビッグ\s|'
    r'ユニライフ|ルームピア|プライムコーポレーション|lifix|'
    r'ラックハウジング|グールーム|ビジョンエステート|プロパティバンク|'
    r'ペアラボ|ヴィックスリアルエステート|ユウキホーム|ライフハウジング|'
    r'ライフクリエイト|ルームセレクト|グランディハウス|グッドルーム|'
    r'オープンハウス\s+ディベロップメント|ビレッジハウス|パークアクシス|'
    r'l-home|ヴィダックス'
)

# ⑦交渉ページ行きのパターン
NEGO_RE = re.compile(
    r'値切[るれ]|値切る客|払いたくない|なくすには|下げる|抑えたい|減額|'
    r'払わなくていい|相見積もり|キャンペーン|キャッシュバック|'
    r'安くする|かからない方法|抑える方法|割引|値下げ|ランキング|比較$'
)

# ⑤無料ページ行きのパターン
FREE_RE = re.compile(r'0円|ゼロ$|不要$|9800円')

# ③不動産売買ページ行きのパターン
REALESTATE_RE = re.compile(
    r'建売|中古住宅|購入$|建物$|手付金|手付解除|売却$|分譲'
)

# ⑧法律・上限ページ行きのパターン
LEGAL_RE = re.compile(
    r'宅建|下限|国土交通省|最大$|法定$|法定調書|限度|空き家|低廉|'
    r'割合$|特例|ルール$|(?<!料)率$|料率'
)

# ⑨会計ページ行きのパターン
ACCT_RE = re.compile(
    r'取得価額|取得価格|繰延資産|資産計上|減価償却|計上時期|按分|'
    r'売上計上|固定資産|取得費$|損金|前払[いい費]|原価$|譲渡費用|業務委託料'
)

# ⑩消費税ページ行きのパターン
TAX_RE = re.compile(
    r'税金|(?<![手仲介])税$|課税$|税務|法人税|免税|源泉徴収|税率$|'
    r'仕入税額控除|税金かかる'
)

# ④賃貸ページ行きのパターン
RENTAL_RE = re.compile(
    r'一人暮らし|共益費|管理費|借主|ヶ月分|何ヶ月|ヶ月$|か月$|'
    r'オーナー|大家|オフィス|店舗|住み替え|礼金|生活保護|'
    r'アパート$|駐車場|0\.5ヶ月|0\.55ヶ月|1ヶ月|2ヶ月'
)

# ⑪金額別ページ行きのパターン
PRICE_RE = re.compile(r'住宅ローン|ローンに組み込む|ローン$|ローン特約')

# ⑥相場ページ行きのパターン
MARKET_RE = re.compile(r'最低金額|目安')

# ②計算ツール行きのパターン
CALC_RE = re.compile(r'速算式|物件価格')


def classify_pillar_kw(kw):
    """ピラーページのKWを適切な子ページに再分類"""
    # 1. 企業名ブランド → 削除
    if BRANDED.search(kw):
        return 'DELETE'

    # 2. 交渉（優先度高：値切る系が大量）
    if NEGO_RE.search(kw):
        return 'nego'

    # 3. 無料
    if FREE_RE.search(kw):
        return 'free'

    # 4. 不動産売買
    if REALESTATE_RE.search(kw):
        return 'realestate'

    # 5. 会計（税より先にチェック：取得価額等は会計用語）
    if ACCT_RE.search(kw):
        return 'acct'

    # 6. 消費税
    if TAX_RE.search(kw):
        return 'tax'

    # 7. 法律・上限
    if LEGAL_RE.search(kw):
        return 'legal'

    # 8. 賃貸
    if RENTAL_RE.search(kw):
        return 'rental'

    # 9. 金額別
    if PRICE_RE.search(kw):
        return 'price'

    # 10. 相場
    if MARKET_RE.search(kw):
        return 'market'

    # 11. 計算
    if CALC_RE.search(kw):
        return 'calc'

    # 残りはピラーに留まる
    return 'pillar'


def main():
    with open(FILEPATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    header = lines[0].strip().split('\t')
    idx = {name: i for i, name in enumerate(header)}

    kw_i = idx['キーワード']
    title_i = idx['想定ページタイトル']
    hantei_i = idx['判定']
    vol_i = idx['月間検索数']

    stats = {'stay': 0, 'moved': 0, 'deleted': 0}
    by_dest = {}
    moved_details = []
    new_lines = [lines[0]]

    for line in lines[1:]:
        cols = line.strip().split('\t')
        while len(cols) <= title_i:
            cols.append('')

        hantei = cols[hantei_i]
        title = cols[title_i]
        kw = cols[kw_i]
        vol = int(cols[vol_i]) if cols[vol_i].isdigit() else 0

        # ピラーページに割り当てられた非削除KWのみ処理
        if hantei != '削除' and title == PILLAR_TITLE:
            dest = classify_pillar_kw(kw)

            if dest == 'DELETE':
                cols[hantei_i] = '削除'
                stats['deleted'] += 1
                moved_details.append(f'  削除  {kw} (vol={vol})')
            elif dest != 'pillar':
                cols[title_i] = TITLES[dest]
                stats['moved'] += 1
                dest_name = TITLES[dest][:20]
                by_dest[dest_name] = by_dest.get(dest_name, 0) + 1
                moved_details.append(f'  → {dest_name}...  {kw} (vol={vol})')
            else:
                stats['stay'] += 1

        new_lines.append('\t'.join(cols) + '\n')

    with open(FILEPATH, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print(f'=== ピラーページ再分類完了 ===')
    print(f'  ピラーに残留: {stats["stay"]}件')
    print(f'  子ページに移動: {stats["moved"]}件')
    print(f'  削除（企業名）: {stats["deleted"]}件')
    print()
    print('移動先内訳:')
    for dest, cnt in sorted(by_dest.items(), key=lambda x: -x[1]):
        print(f'  {cnt:3d}件  {dest}...')
    print()
    print('全移動詳細:')
    for d in moved_details:
        print(d)


if __name__ == '__main__':
    main()
