# 地価情報トップページ - WordPressサンプル実装

**作成日**: 2025-10-15
**テーマ**: SWELL (https://swell-theme.com/)

---

## 📁 ファイル構成

```
land-price-pages/
├── 00_top_page_dashboard.html    # トップページのHTML（完全版）
├── publish_top_page.py            # WordPress自動投稿スクリプト
└── README.md                      # このファイル
```

---

## 🎨 作成したトップページの特徴

### ✅ 実装済みの機能

1. **インタラクティブなサマリーカード（4枚）**
   - ホバーで浮き上がる
   - 数値のカウントアップアニメーション

2. **都道府県ランキング TOP10**
   - ホバーでハイライト
   - クリックでソート可能
   - 「詳細」ボタンで各都道府県ページへリンク

3. **市区町村ランキング TOP10**
   - 同上

4. **地価推移グラフ（Chart.js）**
   - 過去10年のデータ
   - インタラクティブ（ホバーで詳細表示）

5. **全国地価マップ（Leaflet.js）**
   - OpenStreetMap使用
   - 主要都市のマーカー
   - クリックでポップアップ表示

6. **都道府県一覧グリッド**
   - カードホバーで拡大
   - 全47都道府県へのリンク（サンプルは6件のみ）

7. **完全レスポンシブ対応**
   - デスクトップ、タブレット、スマホで最適表示

8. **フェードインアニメーション**
   - ページ読み込み時にセクションごとにアニメーション

### 📊 使用しているライブラリ

- **Chart.js**: グラフ描画（CDN経由）
- **Leaflet.js**: 地図表示（CDN経由）
- **OpenStreetMap**: 地図タイル（無料）

---

## 🚀 WordPressへの投稿方法

### 方法1: 自動投稿スクリプト使用（推奨）

#### 前提条件

- Python 3.x
- `requests`, `python-dotenv` パッケージ
- `.env` ファイルの設定（wordpress-integration/.env）

#### 実行手順

1. **ディレクトリ移動**
   ```bash
   cd wordpress-integration/land-price-pages
   ```

2. **スクリプト実行**
   ```bash
   python publish_top_page.py
   ```

3. **結果確認**
   ```
   ✅ 固定ページの作成に成功しました！

   作成されたページ情報
   ページID: 123
   タイトル: 全国の地価・公示地価【2025年最新】...
   URL: https://ooya.tech/media/land-price/
   ステータス: draft
   ```

4. **WordPress管理画面で確認**
   - 固定ページ → 固定ページ一覧
   - 作成されたページを開く
   - テンプレート「1カラム（幅広）」を選択
   - プレビューで確認
   - 問題なければ「公開」

---

### 方法2: 手動でコピー＆ペースト

#### 手順

1. **00_top_page_dashboard.html を開く**
   - ブラウザで開いて動作確認

2. **WordPress管理画面へログイン**
   - https://ooya.tech/media/wp-admin/

3. **新規固定ページ作成**
   - 固定ページ → 新規追加
   - タイトル: 「全国の地価・公示地価【2025年最新】都道府県・市区町村別ランキング」

4. **テンプレート選択**
   - 右サイドバー → テンプレート → 「1カラム（幅広）」

5. **HTMLをコピー**
   - 00_top_page_dashboard.html の `<body>` タグ内のHTMLをコピー
   - ただし `<header>` と `<footer>` は除外（WordPress側で表示されるため）

6. **カスタムHTMLブロック追加**
   - ブロックエディター → 「+」ボタン
   - 「カスタムHTML」ブロックを選択
   - コピーしたHTMLをペースト

7. **プレビュー＆公開**
   - プレビューボタンで確認
   - 問題なければ公開

---

## 🎨 SWELLでのカスタマイズ方法

### CSS追加（デザイン調整）

1. **WordPress管理画面 → 外観 → カスタマイズ**
2. **追加CSS** セクションを開く
3. 必要に応じてCSSを追加

#### 例: カラーテーマの変更

```css
/* プライマリーカラーを変更 */
.summary-card {
    border-top-color: #0066cc; /* 青色に変更 */
}

.ranking-table thead {
    background: #0066cc;
}

.detail-btn {
    background: #0066cc;
}
```

---

## 📱 レスポンシブ対応

すでに実装済み：

- **デスクトップ（1024px以上）**: 4カラムのサマリーカード、6カラムの都道府県グリッド
- **タブレット（768px-1024px）**: 2カラムのサマリーカード、4カラムのグリッド
- **スマホ（768px以下）**: 1カラムのサマリーカード、2-3カラムのグリッド

---

## 🔧 カスタマイズ可能な箇所

### 1. サマリーカードの数値

HTMLの以下の部分を編集：

```html
<div class="card-value">85.3万円/㎡</div>
<div class="card-change up">前年比 +5.2% ↑</div>
```

### 2. ランキングデータ

テーブルの `<tr>` 行を追加・編集：

```html
<tr class="ranking-row">
    <td>順位</td>
    <td>都道府県名</td>
    <td>平均地価</td>
    <td>平均坪単価</td>
    <td class="change-up">前年比</td>
    <td><a href="URL" class="detail-btn">詳細 ▶</a></td>
</tr>
```

### 3. グラフデータ

JavaScriptの以下の部分を編集：

```javascript
labels: ['2015', '2016', '2017', ...],
data: [68.5, 70.2, 72.1, ...]
```

### 4. 地図のマーカー

JavaScriptの `cities` 配列を編集：

```javascript
const cities = [
    { name: '東京都', lat: 35.6762, lng: 139.6503, price: '130.2万円/㎡', url: '/land-price/tokyo/' },
    // ...
];
```

### 5. 都道府県グリッド

HTMLの `<a>` タグを追加：

```html
<a href="/land-price/prefecture-slug/" class="prefecture-card">
    <span class="prefecture-icon">🏠</span>
    <span class="prefecture-name">都道府県名</span>
</a>
```

---

## ✅ 確認事項チェックリスト

### WordPress投稿前

- [ ] HTMLファイルがブラウザで正しく表示される
- [ ] グラフが正しく描画される
- [ ] 地図が正しく表示される
- [ ] リンクが正しく設定されている
- [ ] レスポンシブ表示が正しい

### WordPress投稿後

- [ ] 固定ページが作成された
- [ ] テンプレート「1カラム（幅広）」が選択されている
- [ ] グラフが表示される
- [ ] 地図が表示される
- [ ] インタラクティブ機能が動作する
- [ ] スマホ表示が正しい

---

## 🎯 次のステップ

### 1. 実データへの置き換え

現在はサンプルデータを使用しています。次のステップとして：

1. 不動産情報ライブラリAPIから実データを取得
2. データ集計・統計計算
3. HTMLの数値を実データに置き換え

### 2. 都道府県ページの作成

トップページと同様の方法で：

1. 都道府県ページテンプレート作成
2. 47都道府県分のHTMLを生成
3. WordPress に自動投稿

### 3. 市区町村ページの作成

1. 市区町村ページテンプレート作成
2. 約1,900市区町村分のHTMLを生成
3. バッチ処理でWordPressに投稿

---

## ⚠️ トラブルシューティング

### グラフが表示されない

- Chart.jsのCDNが読み込まれているか確認
- ブラウザのコンソールでエラーをチェック

### 地図が表示されない

- Leaflet.jsのCDNが読み込まれているか確認
- インターネット接続を確認（OpenStreetMap）

### WordPressへの投稿が失敗する

- Application Passwordが正しいか確認
- 海外IPからのアクセスの場合、ローカル環境で実行

### レイアウトが崩れる

- SWELLテーマのCSSと競合している可能性
- カスタムCSSで調整

---

## 📚 参考リソース

- **Chart.js**: https://www.chartjs.org/
- **Leaflet.js**: https://leafletjs.com/
- **OpenStreetMap**: https://www.openstreetmap.org/
- **SWELL**: https://swell-theme.com/

---

## 📝 メモ

### データ出典の表記

フッターに以下を必ず含めること：

```
出典: 国土交通省 不動産情報ライブラリ（当サイトで加工して作成）
データ基準日: 2025年1月1日（令和7年公示地価）
最終更新日: 2025年10月15日

⚠️ データの正確性は保証されていません。
    重要な不動産取引には、必ず公式データをご確認ください。
```

---

**作成者**: Claude Code
**プロジェクト**: WordPress Integration - Land Price Pages
