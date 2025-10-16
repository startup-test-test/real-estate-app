# 地価ページ管理システム

## 📁 フォルダ構成

```
land-price-pages/
├── 📂 scripts/              # Pythonプログラム
├── 📂 html-sections/        # HTMLの部品（セクション）
├── 📂 data/                 # JSONデータ
├── 📂 docs/                 # ドキュメント
├── 📂 assets/               # CSS、SVG等
├── 📂 templates/            # テンプレート
└── 📄 national_page.html    # 全国平均ページ（完全版）
```

---

## 🎯 メインファイル

### national_page.html
- **役割**: 全国平均地価のページ（完全版）
- **WordPress**: ページID 1726
- **URL**: https://ooya.tech/media/?page_id=1726
- **サイズ**: 96KB

---

## 📂 各フォルダの説明

### scripts/
Pythonプログラム置き場

| ファイル | 役割 |
|---------|------|
| `generate_page_1726.py` | 全国平均ページのサマリーデータを生成 |
| `fetch_historical_data.py` | 過去5年分の推移データ取得 |
| `fetch_national_ranking.py` | 全国ランキングデータ取得 |
| `fetch_prefecture_ranking_data.py` | 都道府県ランキングデータ取得 |
| `quick_edit.py` | WordPressに簡単アップロード |
| `update_title_style.py` | WordPressページ更新 |

### html-sections/
HTMLの部品（セクション単位）

| ファイル | 内容 |
|---------|------|
| `history_section.html` | 過去5年分の推移テーブル |
| `national-ranking-section.html` | 全国ランキング（高価格・低価格等） |
| `prefecture-ranking-section.html` | 都道府県別ランキング |

### data/
JSON形式のデータ

| ファイル | 内容 |
|---------|------|
| `national_ranking_data.json` | 全国ランキングの生データ |
| `prefecture_ranking_data.json` | 都道府県ランキングの生データ |

### docs/
ドキュメント

| ファイル | 内容 |
|---------|------|
| `DATA_SOURCE_POLICY.md` | データソース管理ポリシー |
| `FILE_MANAGEMENT_GUIDE.md` | ファイル管理ガイド |
| `SIMPLIFIED_FILE_STRUCTURE.md` | わかりやすいファイル構造の提案 |

### assets/
CSS、SVG等のアセット

| ファイル | 内容 |
|---------|------|
| `geolonia-map.svg` | 日本地図SVG |
| `custom-width-css.css` | カスタムCSS |

---

## 🚀 使い方

### 1. 全国平均ページのデータを更新

```bash
cd scripts/
python3 generate_page_1726.py
```

→ `html-sections/` に最新データのHTMLが生成されます

### 2. WordPressに反映

```bash
python3 update_title_style.py
```

→ https://ooya.tech/media/?page_id=1726 が更新されます

### 3. 簡単更新（quick_edit）

```bash
python3 quick_edit.py 1726 ../national_page.html
```

---

## 📊 データの流れ

```
国土交通省API
    ↓ (Pythonで取得)
scripts/generate_page_1726.py
    ↓ (HTMLを生成)
html-sections/*.html
    ↓ (組み合わせ)
national_page.html
    ↓ (WordPressに反映)
https://ooya.tech/media/?page_id=1726
```

---

## 🔄 今後の拡張

### 都道府県別ページ（47ページ）

```
hokkaido_page.html
tokyo_page.html
osaka_page.html
...
```

### 市区町村別ページ（1,900ページ）

```
sapporo_page.html
tokyo-chiyoda_page.html
...
```

---

## 📝 ファイル命名規則

- `national_page.html` - 全国平均ページ
- `{都道府県名}_page.html` - 都道府県別ページ
- `{市区町村名}_page.html` - 市区町村別ページ

**1726などのID番号は使わない**（わかりにくいため）

---

## ✅ チェックリスト

データ更新時：
- [ ] scripts/generate_page_1726.py 実行
- [ ] データソースコメント確認
- [ ] ブラウザで表示確認
- [ ] Gitコミット
- [ ] WordPressに反映
- [ ] 本番確認

---

**最終更新:** 2025年10月16日
**管理者:** Claude Code
