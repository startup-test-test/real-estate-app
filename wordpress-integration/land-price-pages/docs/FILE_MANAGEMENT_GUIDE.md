# HTMLファイル管理ガイド

## 基本方針

**すべてのHTMLファイルは必ず保存し、Gitで管理する**

---

## ファイル命名規則

### 1. 完全なページHTML

**用途:** WordPressにアップロードする最終版

**命名規則:** `page_<ページID>.html`

**例:**
```
page_1726.html          # トップページ（全国平均）
page_1727.html          # 北海道ページ
page_1728.html          # 青森県ページ
...
page_3626.html          # 1,900ページ目
```

**特徴:**
- ページ全体の完全なHTML
- すべてのセクションを含む
- WordPress REST APIで直接アップロード可能

---

### 2. セクション単位HTML

**用途:** ページの一部分だけを管理・更新

**命名規則:** `<セクション名>_section.html`

**例:**
```
page_1726_summary_section.html       # サマリー部分のみ
history_section.html                 # 過去推移部分のみ
prefecture-ranking-section.html      # 都道府県ランキング部分のみ
chart_section.html                   # グラフ部分のみ
```

**特徴:**
- 部分的な更新が容易
- 再利用可能
- 他のページにも流用できる

---

### 3. バックアップHTML

**用途:** 変更前の状態を保存

**命名規則:** `page_<ページID>_backup_<日付>.html`

**例:**
```
page_1726_backup_20251015.html
page_1726_backup_20251016_before_summary_update.html
```

**特徴:**
- 重要な変更前にバックアップ
- ロールバック（元に戻す）が可能

---

## ディレクトリ構造（推奨）

```
wordpress-integration/land-price-pages/
├── README.md                        # 全体説明
├── FILE_MANAGEMENT_GUIDE.md         # このファイル
├── DATA_SOURCE_POLICY.md            # データソース管理ポリシー
│
├── pages/                           # 完全なページHTML
│   ├── page_1726.html               # 全国平均（トップページ）
│   ├── prefectures/                 # 都道府県別ページ（47件）
│   │   ├── page_1727_hokkaido.html
│   │   ├── page_1728_aomori.html
│   │   └── ...
│   └── cities/                      # 市区町村別ページ（1,900件）
│       ├── page_2001_sapporo.html
│       ├── page_2002_hakodate.html
│       └── ...
│
├── sections/                        # セクション単位HTML
│   ├── summary_section.html
│   ├── history_section.html
│   ├── chart_section.html
│   ├── prefecture-ranking-section.html
│   └── national-ranking-section.html
│
├── backups/                         # バックアップ
│   ├── 2025-10-15/
│   │   └── page_1726_before_graph_update.html
│   └── 2025-10-16/
│       └── page_1726_before_summary_update.html
│
└── scripts/                         # 生成スクリプト
    ├── generate_page_1726.py
    ├── generate_prefecture_pages.py
    ├── generate_city_pages.py
    └── update_title_style.py
```

---

## Git管理ルール

### 1. 必ずコミットするファイル

✅ **完全なページHTML** (`page_*.html`)
✅ **生成スクリプト** (`*.py`)
✅ **ドキュメント** (`*.md`)

### 2. コミットしないファイル（.gitignoreに追加）

❌ **一時ファイル** (`*.tmp`, `*.bak`)
❌ **環境設定** (`.env`)
❌ **大量の中間ファイル**（必要に応じて）

### 3. コミットメッセージ例

```bash
# 良い例
git commit -m "feat: トップページに過去5年分の公示地価推移データとグラフを追加"
git commit -m "fix: 全国平均地価の計算ロジックを修正（静的→動的）"
git commit -m "docs: データソース管理ポリシーを追加"

# 悪い例
git commit -m "update"
git commit -m "fix bug"
```

---

## バックアップ戦略

### いつバックアップするか？

1. **大きな変更の前**
   - デザイン全体の変更
   - データ計算ロジックの変更
   - 複数セクションの同時更新

2. **定期的なバックアップ**
   - 毎月1日
   - データ更新時（年1回、1月）

3. **本番環境反映前**
   - WordPressにアップロードする直前

### バックアップコマンド例

```bash
# 日付付きバックアップ
cp page_1726.html backups/$(date +%Y%m%d)/page_1726_backup.html

# 説明付きバックアップ
cp page_1726.html backups/page_1726_backup_before_summary_update.html
```

---

## HTMLファイルの検証

### 1. ブラウザで直接開く

```bash
# macOS
open page_1726.html

# Linux
xdg-open page_1726.html

# Windows
start page_1726.html
```

### 2. データソースコメントの確認

```bash
# データソースコメントがあるか確認
grep "データソース:" page_1726.html

# 出力例:
# <!-- データソース: 国土交通省 不動産情報ライブラリAPI -->
```

### 3. 静的データの検出

```bash
# データソースコメントがないセクションを検出
grep -n "<p.*[0-9,]\+円" page_1726.html | grep -v "データソース"
```

---

## ファイルサイズ管理

### 目安

| ページタイプ | ファイルサイズ | 理由 |
|------------|--------------|------|
| トップページ | 50-100KB | 複数セクション、グラフ含む |
| 都道府県ページ | 30-50KB | ランキング、地図含む |
| 市区町村ページ | 10-20KB | 基本情報のみ |

### サイズ確認

```bash
# ファイルサイズを確認
ls -lh page_*.html

# 出力例:
# -rw-rw-rw- 1 node node  96K Oct 16 page_1726.html
```

### 大きすぎる場合の対策

1. **画像の最適化**
   - Base64エンコードされた画像を外部ファイル化
   - 画像圧縮

2. **不要なスペース削除**
   ```bash
   # HTMLミニファイ（オプション）
   # 注意: 可読性が下がるため、開発時は非推奨
   ```

3. **セクション分割**
   - 大きなページを複数セクションに分割
   - 必要に応じて動的読み込み

---

## 運用フロー

### 新規ページ作成時

```bash
# 1. データ取得・HTML生成
python3 generate_prefecture_page.py --prefecture=tokyo

# 2. 生成されたHTMLを確認
open pages/page_1727_tokyo.html

# 3. 問題なければGitコミット
git add pages/page_1727_tokyo.html
git commit -m "feat: 東京都の公示地価ページを追加"

# 4. WordPressに反映
python3 update_page.py --page-id=1727 --file=pages/page_1727_tokyo.html

# 5. プッシュ
git push origin develop
```

### 既存ページ更新時

```bash
# 1. バックアップ
cp pages/page_1726.html backups/$(date +%Y%m%d)/page_1726_backup.html

# 2. 更新スクリプト実行
python3 generate_page_1726.py

# 3. 差分確認
git diff pages/page_1726.html

# 4. 問題なければコミット
git add pages/page_1726.html
git commit -m "fix: 全国平均地価を動的データに更新（74,154→136,982円/㎡）"

# 5. WordPress反映
python3 update_title_style.py

# 6. プッシュ
git push origin develop
```

---

## トラブルシューティング

### Q1: HTMLファイルを誤って削除してしまった

**A:** Gitから復元できます

```bash
# 最新のコミットから復元
git checkout -- page_1726.html

# 特定のコミットから復元
git checkout 315a4cc -- page_1726.html
```

---

### Q2: WordPressと手元のHTMLファイルが不一致

**A:** WordPressから最新を取得して同期

```python
# fetch_page_from_wordpress.py を作成
import requests
from requests.auth import HTTPBasicAuth

response = requests.get(
    "https://ooya.tech/media/wp-json/wp/v2/pages/1726",
    auth=HTTPBasicAuth(WP_USERNAME, WP_APP_PASSWORD)
)
content = response.json()['content']['rendered']

with open('page_1726_from_wp.html', 'w') as f:
    f.write(content)
```

---

### Q3: どのHTMLファイルが最新かわからない

**A:** Gitのログを確認

```bash
# 最終更新日時を確認
git log --all --pretty=format:"%h %ad | %s" --date=short -- page_1726.html

# 出力例:
# 315a4cc 2025-10-15 | feat: トップページに過去5年分の公示地価推移データとグラフを追加
# 6f8fbc9 2025-10-14 | docs: 地価ページ生成システム仕様書をフォルダに整理
```

---

## チェックリスト

### 新規ページ作成時

- [ ] データ取得スクリプトを実行
- [ ] HTMLファイルが生成された
- [ ] HTMLにデータソースコメントがある
- [ ] ブラウザで表示確認
- [ ] Gitにコミット
- [ ] WordPressに反映
- [ ] 本番環境で確認
- [ ] Gitプッシュ

### 既存ページ更新時

- [ ] 更新前のバックアップを作成
- [ ] 更新スクリプトを実行
- [ ] 差分を確認（git diff）
- [ ] HTMLにデータソースコメントがある
- [ ] ブラウザで表示確認
- [ ] Gitにコミット
- [ ] WordPressに反映
- [ ] 本番環境で確認
- [ ] Gitプッシュ

---

## まとめ

**HTMLファイルは資産です**

- ✅ すべて保存
- ✅ Gitで管理
- ✅ バックアップ作成
- ✅ データソース明記
- ✅ 定期的な検証

これにより、1,900ページを安全・確実に管理できます。

---

**作成日:** 2025年10月16日
**管理者:** Claude Code
**プロジェクト:** Real Estate App - WordPress Integration
