#!/usr/bin/env python3
"""テーマ・記事の方向性を全TSVに追加するスクリプト"""
import glob, os, re

# ページグループ → テーマ のマッピングルール
# カテゴリ名プレフィックスを除去して、人が読みやすいテーマ名に変換
THEME_PATTERNS = [
    # 共通パターン（カテゴリ横断）
    (r'基礎解説', '基礎知識'),
    (r'値引き|割引|安い|無料|節約', '値引き・節約'),
    (r'交渉', '値引き・節約'),
    (r'賃貸', '賃貸'),
    (r'不動産売買|売買', '不動産売買'),
    (r'相場', '相場'),
    (r'計算|シミュレーション', '計算方法'),
    (r'上限|法律|規制|宅建|ルール|制度', '法律・制度'),
    (r'法改正|改正', '法律・制度'),
    (r'会計|勘定科目|仕訳|経費|簿記', '会計処理'),
    (r'消費税|税率', '税金'),
    (r'住宅|マンション|戸建|一戸建|中古', '住宅タイプ別'),
    (r'金額別|金額', '金額別'),
    (r'特定企業|ブランド', '特定企業'),
    (r'期間|スケジュール|時期|いつ', '時期・スケジュール'),
    (r'具体例|ケース|事例', '具体例'),
    (r'比較|検討', '比較・検討'),
    (r'手続き|対策|方法', '手続き・対策'),
    (r'控除|特例|還付|非課税|ゼロ', '控除・特例'),
    (r'書式|書類|フォーマット', '書類・手続き'),
    (r'支払い|延納|分割', '支払い方法'),
    (r'解除|抹消', '手続き・対策'),
    (r'車|動産', 'その他'),
    (r'空き家', '空き家'),
    # 税金系カテゴリ特有
    (r'確定申告|申告', '確定申告'),
    (r'控除', '控除・特例'),
    (r'税率|速算表', '税率・計算'),
    (r'相続|贈与|遺産', '相続・贈与'),
    (r'源泉徴収|給与', '給与・源泉'),
    (r'退職', '退職'),
    (r'配偶者|扶養', '家族関連'),
    # 不動産投資系
    (r'利回り|収益|キャッシュフロー', '収益分析'),
    (r'融資|ローン|借入|金利', '融資・ローン'),
    (r'減価償却|耐用年数', '減価償却'),
    (r'売却|譲渡', '売却'),
    (r'取得|購入', '取得・購入'),
    (r'固定資産|評価額', '固定資産'),
    (r'リフォーム|修繕', 'リフォーム'),
]

# 検索意図 → 記事の方向性 のマッピングルール
DIRECTION_PATTERNS = [
    # 検索意図のテキストからパターンマッチ
    (r'計算したい|算出したい|シミュレーション', '実務ガイド'),
    (r'交渉したい|値引き|値切り|安くしたい', 'ハウツー'),
    (r'仕訳|勘定科目|経理|会計|記帳|簿記', '実務ガイド'),
    (r'確定申告|申告したい|申告方法', '実務ガイド'),
    (r'探したい|見つけたい|比較したい|選びたい', '比較・解説'),
    (r'手続き|方法|やり方|手順|流れ', 'ハウツー'),
    (r'相場|いくら|目安|平均', 'データ一覧'),
    (r'法律|上限|規定|違法|合法|制度', '解説'),
    (r'知りたい|理解したい|確認したい|学びたい', '解説'),
    (r'調べたい', '解説'),
]

# ページ役割ベースのフォールバック
ROLE_DIRECTION = {
    'ピラーページ': '網羅ガイド',
    '計算ツール': 'ツール',
    '解説記事': '解説',
}


def get_theme(page_group, category):
    """ページグループからテーマを導出"""
    if not page_group:
        return ''

    # カテゴリ名プレフィックスを除去してマッチング
    clean = page_group.replace(category, '').strip('_').strip()

    for pattern, theme in THEME_PATTERNS:
        if re.search(pattern, page_group) or (clean and re.search(pattern, clean)):
            return theme

    # フォールバック: クリーン名をそのまま使う
    if clean:
        return clean
    return '基礎知識'


def get_direction(intent, page_role, theme):
    """検索意図・ページ役割・テーマから記事の方向性を導出"""
    # 検索意図からパターンマッチ
    if intent:
        for pattern, direction in DIRECTION_PATTERNS:
            if re.search(pattern, intent):
                return direction

    # ページ役割からフォールバック
    if page_role and page_role in ROLE_DIRECTION:
        return ROLE_DIRECTION[page_role]

    # テーマからフォールバック
    theme_direction = {
        '基礎知識': '網羅ガイド',
        '値引き・節約': 'ハウツー',
        '相場': 'データ一覧',
        '法律・制度': '解説',
        '会計処理': '実務ガイド',
        '計算方法': '実務ガイド',
        '具体例': '具体例解説',
        '比較・検討': '比較・解説',
        '金額別': 'データ一覧',
        '税金': '解説',
    }
    if theme in theme_direction:
        return theme_direction[theme]

    return '解説'


def process_file(filepath):
    """TSVファイルにテーマ・記事の方向性列を追加"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    if not lines:
        return 0

    # ヘッダー解析
    header = lines[0].strip().split('\t')

    # 既にテーマ列がある場合はスキップ
    if 'テーマ' in header:
        print(f'  スキップ（テーマ列あり）: {os.path.basename(filepath)}')
        return 0

    # 検索意図列のインデックスを取得
    try:
        intent_idx = header.index('検索意図')
    except ValueError:
        print(f'  スキップ（検索意図列なし）: {os.path.basename(filepath)}')
        return 0

    # ページグループ・ページ役割列のインデックス
    pg_idx = header.index('ページグループ') if 'ページグループ' in header else -1
    role_idx = header.index('ページ役割') if 'ページ役割' in header else -1

    # カテゴリ名（ファイル名から）
    category = os.path.basename(filepath).replace('_判定済み.tsv', '')

    # 新しいヘッダー: 検索意図の後にテーマ・記事の方向性を挿入
    insert_pos = intent_idx + 1
    new_header = header[:insert_pos] + ['テーマ', '記事の方向性'] + header[insert_pos:]

    new_lines = ['\t'.join(new_header) + '\n']
    count = 0

    for line in lines[1:]:
        cols = line.strip().split('\t')
        if len(cols) < 6:
            new_lines.append(line)
            continue

        # 既存データ取得
        intent = cols[intent_idx] if intent_idx < len(cols) else ''
        page_group = cols[pg_idx] if pg_idx >= 0 and pg_idx < len(cols) else ''
        page_role = cols[role_idx] if role_idx >= 0 and role_idx < len(cols) else ''

        # テーマ・記事の方向性を算出
        theme = get_theme(page_group, category)
        direction = get_direction(intent, page_role, theme)

        # 挿入
        new_cols = cols[:insert_pos] + [theme, direction] + cols[insert_pos:]
        new_lines.append('\t'.join(new_cols) + '\n')
        count += 1

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    return count


def main():
    tsv_dir = os.path.dirname(os.path.abspath(__file__))
    files = sorted(glob.glob(os.path.join(tsv_dir, '*_判定済み.tsv')))

    print(f'対象ファイル数: {len(files)}')
    total = 0

    for filepath in files:
        count = process_file(filepath)
        if count > 0:
            print(f'  完了: {os.path.basename(filepath)} ({count}行)')
            total += count

    print(f'\n合計: {total}行にテーマ・記事の方向性を追加')


if __name__ == '__main__':
    main()
