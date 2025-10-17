# データソース管理ポリシー

## 基本方針

**1,900ページすべてのデータは動的生成を原則とする**

- ❌ 静的データ（手入力の数値）は使用しない
- ✅ すべてのデータはAPIから取得
- ✅ HTMLはPythonスクリプトで自動生成
- ✅ HTMLコメントにデータソースと更新日時を明記

---

## データソースの分類

### 🟢 動的データ（API取得）

**定義:** 国土交通省 不動産情報ライブラリAPIから取得したデータ

**対象:**
- 平均地価、坪単価、変動率
- 都道府県別ランキング
- 市区町村別ランキング
- 過去推移データ

**生成スクリプト:**
- `generate_page_1726.py` - トップページ生成
- `fetch_historical_data.py` - 過去推移データ取得
- `generate_prefecture_pages.py` - 都道府県別ページ生成（予定）

**HTMLコメント例:**
```html
<!-- データソース: 国土交通省 不動産情報ライブラリAPI -->
<!-- 最終更新: 2025-10-16 14:30:00 -->
<!-- データ件数: 17,899件 -->
<p>74,154円/㎡</p>
```

---

### 🔴 静的データ（手入力）- 使用禁止

**定義:** HTMLに直接記述された固定値

**問題点:**
- データの信頼性が不明
- 更新漏れのリスク
- サンプルデータと本番データの混在

**対処法:**
- 既存の静的データは動的生成に置き換える
- 新規ページ作成時は必ずスクリプトから生成

---

### 🟡 テンプレートデータ（開発時のみ許可）

**定義:** デザイン確認用のサンプルデータ

**使用条件:**
- 明確に「サンプルデータ」とコメント記載
- 本番環境には反映しない
- 動的生成スクリプト作成後は削除

**HTMLコメント例:**
```html
<!-- ⚠️ サンプルデータ（本番使用禁止） -->
<!-- TODO: generate_xxx.py で動的生成に置き換え -->
<p>123,456円/㎡</p>
```

---

## ページ生成ワークフロー

### 1. データ取得スクリプト作成

```python
# 例: generate_prefecture_page.py
def fetch_prefecture_data(prefecture_code, year=2025):
    """APIから都道府県データを取得"""
    url = f"{API_BASE}?from={prefecture_code}&year={year}"
    response = requests.get(url)
    return response.json()
```

### 2. HTML生成スクリプト作成

```python
def generate_html(data):
    """取得データからHTMLを生成"""
    html = f"""
    <!-- データソース: 国土交通省 不動産情報ライブラリAPI -->
    <!-- 最終更新: {datetime.now()} -->
    <section>
      <h2>{data['prefecture']}の公示地価</h2>
      <p>{data['average_price']:,}円/㎡</p>
    </section>
    """
    return html
```

### 3. WordPress反映スクリプト作成

```python
def upload_to_wordpress(page_id, html):
    """WordPressにアップロード"""
    response = requests.post(
        f"{WP_URL}/wp-json/wp/v2/pages/{page_id}",
        json={'content': html},
        auth=HTTPBasicAuth(WP_USER, WP_PASS)
    )
    return response.status_code == 200
```

---

## ファイル命名規則

### 生成スクリプト

- `generate_<対象>_page.py` - ページ全体を生成
- `fetch_<データ種類>.py` - データのみ取得
- `update_<対象>.py` - 部分的な更新

**例:**
- `generate_page_1726.py` - トップページ生成
- `generate_prefecture_pages.py` - 都道府県別ページ生成
- `fetch_historical_data.py` - 過去推移データ取得
- `update_ranking_section.py` - ランキングセクションのみ更新

### 生成されたHTML

- `page_<ID>.html` - 完全なページHTML
- `<セクション名>_section.html` - セクション単位のHTML

**例:**
- `page_1726.html` - トップページ完全版
- `page_1726_summary_section.html` - サマリーセクションのみ
- `history_section.html` - 過去推移セクション

---

## 既存ページの監査方法

### 1. 静的データの検出

```bash
# HTMLファイル内の数値パターンを検索
grep -n "[0-9,]\+円" page_*.html

# データソースコメントがない箇所を検出
grep -L "データソース:" page_*.html
```

### 2. データソースコメントの追加

すべてのデータセクションに以下を追加：

```html
<!-- データソース: [API名 or 静的] -->
<!-- 最終更新: [YYYY-MM-DD HH:MM:SS] -->
<!-- データ件数: [N件] or 手入力 -->
```

### 3. 静的データの動的化

1. 該当データのAPI取得スクリプト作成
2. HTML生成スクリプト作成
3. 既存HTMLを置き換え
4. WordPress反映

---

## チェックリスト（新規ページ作成時）

- [ ] データ取得スクリプトを作成した
- [ ] HTML生成スクリプトを作成した
- [ ] HTMLにデータソースコメントを追加した
- [ ] 静的データ（手入力）は一切含まれていない
- [ ] 生成スクリプトの実行方法をREADMEに記載した
- [ ] WordPress反映を確認した

---

## 運用ルール

### 禁止事項

❌ HTMLファイルに直接数値を手入力する
❌ データソースコメントなしでデータを記述する
❌ サンプルデータを本番環境に反映する

### 推奨事項

✅ すべてのデータはスクリプトから生成する
✅ データ更新時はスクリプトを再実行する
✅ HTMLコメントでデータソースを明記する
✅ 生成スクリプトはGitで管理する

---

## 例外規定

以下の要素は静的でも可：

- HTMLの構造（タグ、クラス名）
- テキストコンテンツ（見出し、説明文）
- スタイル（CSS）
- スクリプト（JavaScript）

**数値データは例外なく動的生成**

---

## 参考リンク

- 国土交通省 不動産情報ライブラリ: https://www.reinfolib.mlit.go.jp/
- WordPress REST API: https://developer.wordpress.org/rest-api/

---

**作成日:** 2025年10月16日
**管理者:** Claude Code
**プロジェクト:** Real Estate App - WordPress Integration
