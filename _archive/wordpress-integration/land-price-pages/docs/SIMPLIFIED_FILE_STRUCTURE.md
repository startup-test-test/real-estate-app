# わかりやすいファイル構造の提案

## 現在の問題点

```
page_1726.html                           # ❌ 1726って何？
page_1726_summary_section.html           # ❌ これも1726？どう違う？
generate_page_1726.py                    # ❌ 長い名前...
```

**混乱します！**

---

## ✅ 改善案：3階層フォルダ構造

```
wordpress-integration/land-price-pages/
│
├── 📂 1-scripts/                        # プログラム置き場
│   ├── generate_national_page.py        # 全国平均ページ生成
│   ├── generate_prefecture_page.py      # 都道府県ページ生成
│   └── update_to_wordpress.py           # WordPress反映
│
├── 📂 2-html-parts/                     # 部品（セクション）置き場
│   ├── summary_section.html             # サマリー部分
│   ├── map_section.html                 # 地図部分
│   ├── ranking_section.html             # ランキング部分
│   └── graph_section.html               # グラフ部分
│
└── 📂 3-complete-pages/                 # 完成品（WordPress用）
    ├── national_page.html               # 全国平均ページ（完全版）
    ├── hokkaido_page.html               # 北海道ページ（完全版）
    └── tokyo_page.html                  # 東京都ページ（完全版）
```

---

## 📋 各フォルダの役割

### 1️⃣ `1-scripts/` - プログラム置き場

**中身:**
- Pythonプログラム（`.py`ファイル）だけ

**例:**
```
generate_national_page.py
  ↓ 実行すると...
  ↓
summary_section.html を生成（2-html-parts/に保存）
  ↓
national_page.html を生成（3-complete-pages/に保存）
```

---

### 2️⃣ `2-html-parts/` - 部品置き場

**中身:**
- ページの「一部分」だけのHTML
- 再利用可能な部品

**例:**
```html
<!-- summary_section.html -->
<!-- サマリー部分だけ -->
<section>
  <p>136,982円/㎡</p>
</section>
```

**用途:**
- 部分的な更新
- 他のページでも使い回せる
- テスト・確認が簡単

---

### 3️⃣ `3-complete-pages/` - 完成品置き場

**中身:**
- ページ全体の完全なHTML
- WordPressにアップロードするファイル

**例:**
```html
<!-- national_page.html -->
<!-- 全部入り -->
<html>
  <section>サマリー</section>
  <section>地図</section>
  <section>ランキング</section>
  <section>グラフ</section>
</html>
```

**用途:**
- WordPressに直接アップロード
- バックアップ
- Git管理

---

## 🔄 ワークフロー（作業の流れ）

### ステップ1: プログラム実行

```bash
cd 1-scripts/
python3 generate_national_page.py
```

### ステップ2: 部品が生成される

```
2-html-parts/summary_section.html が作成された！
```

### ステップ3: 完成品が生成される

```
3-complete-pages/national_page.html が作成された！
```

### ステップ4: WordPressに反映

```bash
python3 update_to_wordpress.py --file=../3-complete-pages/national_page.html
```

---

## 📊 ファイル名の対応表

### 現在 → 改善後

| 現在のファイル名 | 改善後のファイル名 | 配置場所 |
|-----------------|-------------------|---------|
| `generate_page_1726.py` | `generate_national_page.py` | `1-scripts/` |
| `page_1726_summary_section.html` | `summary_section.html` | `2-html-parts/` |
| `page_1726.html` | `national_page.html` | `3-complete-pages/` |
| `update_title_style.py` | `update_to_wordpress.py` | `1-scripts/` |

---

## 🎯 メリット

### ✅ 1. 一目でわかる

```
1-scripts/           → プログラムが入ってる
2-html-parts/        → 部品が入ってる
3-complete-pages/    → 完成品が入ってる
```

数字の順番 = 作業の順番

### ✅ 2. 1726が消える

```
❌ page_1726.html
✅ national_page.html
```

「1726って何？」と悩まなくてOK

### ✅ 3. 探しやすい

```
「全国平均ページのHTMLはどこ？」
→ 3-complete-pages/national_page.html

「サマリー部分だけ更新したい」
→ 2-html-parts/summary_section.html

「生成プログラムを修正したい」
→ 1-scripts/generate_national_page.py
```

---

## 🚀 実装方法

### 方法1: 新しいフォルダ構造を作る（推奨）

```bash
# フォルダ作成
mkdir -p 1-scripts 2-html-parts 3-complete-pages

# ファイル移動
mv generate_page_1726.py 1-scripts/generate_national_page.py
mv page_1726_summary_section.html 2-html-parts/summary_section.html
mv page_1726.html 3-complete-pages/national_page.html
```

### 方法2: ファイル名だけ変更

```bash
# フォルダは作らず、ファイル名だけ変更
mv generate_page_1726.py generate_national_page.py
mv page_1726_summary_section.html national_summary_section.html
mv page_1726.html national_page_FULL.html
```

---

## 💡 1,900ページになったら？

### 都道府県別（47ページ）

```
3-complete-pages/
├── national_page.html           # 全国平均
├── prefectures/
│   ├── hokkaido_page.html       # 北海道
│   ├── aomori_page.html         # 青森県
│   └── ...                      # 47ファイル
```

### 市区町村別（1,900ページ）

```
3-complete-pages/
├── cities/
│   ├── hokkaido/
│   │   ├── sapporo_page.html
│   │   ├── hakodate_page.html
│   │   └── ...
│   ├── tokyo/
│   │   ├── chiyoda_page.html
│   │   ├── chuo_page.html
│   │   └── ...
│   └── ...
```

**1,900個のファイルも迷わず管理できる！**

---

## ✅ まとめ

**シンプル = 最強**

- 📁 3つのフォルダ
  - `1-scripts/` - プログラム
  - `2-html-parts/` - 部品
  - `3-complete-pages/` - 完成品

- 📝 わかりやすい名前
  - `national_page.html` - 全国平均ページ
  - `hokkaido_page.html` - 北海道ページ

- 🔢 数字の順番 = 作業の流れ
  1. プログラム実行
  2. 部品生成
  3. 完成品作成

**これで1,900ページも怖くない！**

---

**作成日:** 2025年10月16日
**提案者:** Claude Code
