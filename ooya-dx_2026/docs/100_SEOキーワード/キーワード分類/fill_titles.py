#!/usr/bin/env python3
"""必須ページグループに想定記事タイトルを自動生成して入れるスクリプト。"""
import glob, os, re

TSV_DIR = os.path.dirname(os.path.abspath(__file__))
files = sorted(glob.glob(os.path.join(TSV_DIR, '*_判定済み.tsv')))

# ページグループ名のパターン → タイトルテンプレート
# {cat} = カテゴリ名
TITLE_PATTERNS = [
    # 計算
    (r'計算$', '{cat}の計算方法・シミュレーション'),
    # 基礎解説（メイン）
    (r'^[^_]+基礎解説$', '{cat}とは？仕組み・意味をわかりやすく解説'),
    # 基礎解説（サブ）
    (r'_基礎解説$', '{cat}の基礎知識まとめ'),
    # 相場
    (r'相場', '{cat}の相場はいくら？金額目安一覧'),
    # 不動産売買
    (r'不動産売買', '{cat}は不動産売買でいくら？売買時の注意点'),
    # 不動産特化
    (r'不動産特化', '{cat}と不動産投資の関係を解説'),
    # 上限
    (r'上限', '{cat}の上限はいくら？法律の規定を解説'),
    # 法律・規制
    (r'法律|規制|ルール|制度', '{cat}に関する法律・ルールを解説'),
    # 税率
    (r'税率', '{cat}の税率一覧と計算方法'),
    # 控除・軽減
    (r'控除|軽減', '{cat}の控除・軽減措置まとめ'),
    # 申告
    (r'申告', '{cat}の確定申告・届出の方法と必要書類'),
    # 利回り
    (r'利回り', '{cat}と利回りの関係・目安を解説'),
    # 目安・相場
    (r'目安', '{cat}の目安・相場はどのくらい？'),
    # 比較
    (r'比較|vs', '{cat}の比較・違いをわかりやすく解説'),
    # 手法比較
    (r'手法比較', '{cat}と他の評価手法の違いを比較'),
    # 不動産融資
    (r'融資', '{cat}と不動産融資の関係を解説'),
    # 評価額
    (r'評価額', '{cat}の評価額の調べ方・計算方法'),
    # 構造別
    (r'構造別|単価', '{cat}の構造別単価一覧'),
    # 公式基準
    (r'公式|基準', '{cat}の公式基準・算出根拠'),
    # NPV法
    (r'NPV法', 'NPV法（正味現在価値法）とは？投資判断への活用'),
    # 指標比較
    (r'指標比較', '{cat}と他の投資指標の違い・使い分け'),
    # 投資判断
    (r'投資判断', '{cat}を使った投資判断の方法'),
    # 不動産CF
    (r'不動産CF', '不動産投資のキャッシュフロー計算と管理'),
    # 具体例
    (r'具体例|ケース', '{cat}の具体例・計算シミュレーション'),
    # 場所別
    (r'場所別', '{cat}の場所別・部位別の費用目安'),
    # 支払い時期
    (r'支払い時期|時期', '{cat}はいつ払う？支払い時期と方法'),
    # 物件タイプ別
    (r'物件タイプ', '{cat}の物件タイプ別の計算・比較'),
    # 非課税
    (r'非課税', '{cat}が非課税になるケースまとめ'),
    # 会計処理
    (r'会計処理|勘定科目', '{cat}の仕訳・勘定科目と会計処理'),
    # 還元利回り
    (r'還元利回り', '還元利回りとは？{cat}での使い方'),
    # 耐用年数
    (r'耐用年数', '{cat}の耐用年数一覧と計算方法'),
    # 償却方法
    (r'償却方法', '{cat}の定額法・定率法の違いと選び方'),
    # 不動産
    (r'_不動産$', '{cat}と不動産の関係を解説'),
    # 登記タイプ別
    (r'登記', '{cat}の登記タイプ別の税額一覧'),
    # 相続
    (r'相続', '{cat}の相続時の計算・手続き'),
    # 不動産評価
    (r'不動産評価', '{cat}の不動産評価方法を解説'),
    # 金額別
    (r'金額別|金額', '{cat}の金額別一覧・早見表'),
    # 節税
    (r'節税', '{cat}を活用した節税対策'),
    # 賞与
    (r'賞与', '賞与（ボーナス）の{cat}計算方法'),
    # 確定申告
    (r'確定申告', '{cat}の確定申告のやり方ガイド'),
    # 火災保険
    (r'火災保険', '{cat}と火災保険の関係'),
    # 補助金
    (r'補助金', '{cat}に使える補助金・助成金まとめ'),
    # 住宅ローン連携
    (r'住宅ローン', '{cat}と住宅ローンの関係'),
    # 年収別
    (r'年収別', '{cat}の年収別シミュレーション'),
    # 一覧表
    (r'一覧', '{cat}の一覧表・早見表'),
    # 契約書
    (r'契約書', '{cat}と契約書の関係・注意点'),
    # 領収書
    (r'領収書', '{cat}の領収書の書き方・取り扱い'),
    # 不動産取引
    (r'不動産取引', '{cat}の不動産取引での計算・注意点'),
    # 納付方法
    (r'納付方法|支払い方法', '{cat}の納付方法・支払い方法'),
    # メリデメ
    (r'メリデメ', '{cat}のメリット・デメリットを解説'),
    # タイミング
    (r'タイミング', '{cat}のベストタイミングはいつ？'),
    # リスク
    (r'リスク', '{cat}のリスクと対策を解説'),
    # ローン
    (r'ローン', '{cat}とローンの関係・活用法'),
    # 不動産投資
    (r'不動産投資$', '{cat}の不動産投資での活用法'),
]

def generate_title(cat, pg):
    """ページグループ名からタイトルを生成"""
    # カテゴリ名を除去してパターン部分を取得
    pg_suffix = pg.replace(cat, '').strip('_')

    for pattern, template in TITLE_PATTERNS:
        if re.search(pattern, pg) or re.search(pattern, pg_suffix):
            return template.replace('{cat}', cat)

    # マッチしない場合はデフォルト
    if pg_suffix:
        return f'{cat}の{pg_suffix}を解説'
    return f'{cat}を徹底解説'

total_updated = 0
total_files = 0

for fpath in files:
    cat = os.path.basename(fpath).replace('_判定済み.tsv', '')

    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    if not lines:
        continue

    # まずページグループごとのトピカル貢献を集計
    pg_topical = {}
    for line in lines[1:]:
        cols = line.strip().split('\t')
        if len(cols) < 13: continue
        pg = cols[9].strip()
        topical = cols[12].strip()
        if pg and topical:
            pg_topical[pg] = topical

    # 必須グループにタイトルを生成
    pg_titles = {}
    for pg, topical in pg_topical.items():
        if topical == '必須':
            pg_titles[pg] = generate_title(cat, pg)

    # TSVを更新
    new_lines = [lines[0].rstrip('\n')]
    for line in lines[1:]:
        cols = line.rstrip('\n').split('\t')
        while len(cols) < 13:
            cols.append('')

        pg = cols[9].strip()
        if pg in pg_titles and not cols[10].strip():
            cols[10] = pg_titles[pg]
            total_updated += 1

        new_lines.append('\t'.join(cols))

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines) + '\n')
    total_files += 1

    # 表示
    if pg_titles:
        print(f'\n=== {cat} ===')
        for pg, title in sorted(pg_titles.items(), key=lambda x: x[0]):
            print(f'  {pg} → {title}')

print(f'\n合計: {total_files}ファイル, {total_updated}行にタイトル追加')
