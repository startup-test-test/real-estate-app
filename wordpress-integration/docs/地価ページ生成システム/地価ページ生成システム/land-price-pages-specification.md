# 地価ページ生成システム 仕様書

## 概要

国土交通省の不動産情報ライブラリAPIから地価データを取得し、WordPress固定ページに表示するシステムです。

- **対象WordPressページID**: 1726
- **データソース**: 国土交通省 不動産情報ライブラリ REST API
- **更新対象年度**: 2025年（令和7年）基準地価

## ディレクトリ構成

```
wordpress-integration/land-price-pages/
├── README.md                              # ドキュメント
├── fetch_national_ranking.py              # 全国地点ランキング取得スクリプト
├── fetch_prefecture_ranking_data.py       # 都道府県別ランキング取得スクリプト
├── generate_national_summary.py           # 全国平均サマリー生成スクリプト
├── move_summary_to_map_section.py         # サマリーセクション配置スクリプト
├── update_both_rankings.py                # WordPress更新スクリプト
├── national_ranking_data.json             # 全国地点ランキングデータ
├── prefecture_ranking_data.json           # 都道府県別ランキングデータ
├── national-ranking-section.html          # 全国地点ランキングHTML
├── prefecture-ranking-section.html        # 都道府県別ランキングHTML
├── national-summary-section.html          # 全国平均サマリーHTML
├── custom-width-css.css                   # カスタムCSSスタイル
└── geolonia-map.svg                       # 地図SVGファイル
```

## ファイル詳細

### スクリプトファイル

#### 1. fetch_national_ranking.py (9.0KB)
**機能**: 全国地点ランキングTOP10のデータ取得とHTML生成

**処理フロー**:
1. 不動産情報ライブラリAPIから全国の基準地価データを取得
2. 地価の高い順にソートしてTOP10を抽出
3. HTMLテーブル形式のランキングセクションを生成
4. JSONデータとHTMLファイルを保存

**出力ファイル**:
- `national_ranking_data.json` - TOP10のJSONデータ
- `national-ranking-section.html` - 生成されたHTMLセクション

**主な機能**:
- `calculate_tsubo_price(price_per_sqm)` - 坪単価計算（1坪 = 3.30579㎡）
- `generate_ranking_html(ranking_data)` - HTMLテーブル生成

**スタイル仕様**:
- 背景: 白（`background: white`）
- タイトル: 白文字（`color: white`）
- テーブルヘッダー: 白文字（`color: white`）
- ホバー効果: 水色背景（`#f0f9ff`）

---

#### 2. fetch_prefecture_ranking_data.py (12KB)
**機能**: 都道府県別ランキングのデータ取得とHTML生成

**処理フロー**:
1. 不動産情報ライブラリAPIから47都道府県の基準地価データを取得
2. 各都道府県の平均地価、変動率、坪単価を計算
3. 地価順にソートしてランキングHTMLを生成
4. JSONデータとHTMLファイルを保存

**出力ファイル**:
- `prefecture_ranking_data.json` - 47都道府県のJSONデータ
- `prefecture-ranking-section.html` - 生成されたHTMLセクション

**データ構造**:
```json
[
  {
    "rank": 1,
    "prefecture": "東京都",
    "price_per_sqm": 385000,
    "tsubo_price": 1272731,
    "change_rate": 5.2,
    "emoji": "🥇"
  },
  ...
]
```

**主な機能**:
- `calculate_tsubo_price(price_per_sqm)` - 坪単価計算
- `determine_change_status(change_rate)` - 変動状態判定（上昇/下落/横ばい）
- `get_rank_emoji(rank)` - ランクに応じた絵文字取得
- `generate_ranking_html(ranking_data)` - HTMLテーブル生成

**スタイル仕様**:
- 背景: 白（`background: white`）
- タイトル: 白文字（`color: white`）
- テーブルヘッダー: 白文字（`color: white`）
- 変動率バッジ:
  - 上昇: 緑背景（`#dcfce7`）、緑文字（`#16a34a`）
  - 下落: 赤背景（`#fee2e2`）、赤文字（`#dc2626`）
  - 横ばい: グレー背景（`#f3f4f6`）、グレー文字（`#6b7280`）

---

#### 3. generate_national_summary.py (4.5KB)
**機能**: 全国平均サマリーセクションのHTML生成

**処理フロー**:
1. `prefecture_ranking_data.json`から47都道府県のデータを読み込み
2. 全国平均地価、平均変動率を計算
3. 坪単価を計算
4. サマリーHTMLを生成して保存

**計算ロジック**:
```python
# 全国平均地価
avg_price = int(mean([item['price_per_sqm'] for item in prefecture_data]))

# 全国平均変動率
avg_change_rate = mean([item['change_rate'] for item in prefecture_data])

# 全国平均坪単価
tsubo_price = calculate_tsubo_price(avg_price)
```

**出力ファイル**:
- `national-summary-section.html` - 全国平均サマリーHTML

**表示データ例**:
- 平均地価: 74,154円/㎡
- 変動率: ↑+1.10%
- 坪単価: 245,137円/坪

**スタイル仕様**:
- 背景: 白（`background: white`）
- タイトル: 白文字（`color: white`）
- 3カラムレイアウト（平均地価、変動率、坪単価）

---

#### 4. move_summary_to_map_section.py (7.0KB)
**機能**: 全国平均サマリーセクションを地図選択セクションの上に配置

**処理フロー**:
1. WordPress固定ページ（ID: 1726）の現在のコンテンツを取得
2. 既存のサマリーセクションを削除（存在する場合）
3. `national-summary-section.html`を読み込み
4. 地図選択セクション（`📍 都道府県別の地価を地図から選択`）を検索
5. 地図選択セクションの前にサマリーセクションを挿入
6. WordPressページを更新

**検索パターン**:
```python
patterns = [
    r'(📍\s*都道府県別の地価を地図から選択)',
    r'(<h[23][^>]*>.*?📍.*?地図.*?選択.*?</h[23]>)',
    r'(<[^>]*class=["\'][^"\']*map[^"\']*["\'][^>]*>)',
]
```

**フォールバック**:
地図選択セクションが見つからない場合は、都道府県ランキングセクションの前に配置

**WordPress API設定**:
- サイトURL: 環境変数 `WP_SITE_URL`
- ユーザー名: 環境変数 `WP_USERNAME`
- アプリパスワード: 環境変数 `WP_APP_PASSWORD`

---

#### 5. update_both_rankings.py (8.3KB)
**機能**: 都道府県別ランキングと全国地点ランキングの両方をWordPressに更新

**処理フロー**:
1. WordPress固定ページ（ID: 1726）の現在のコンテンツを取得
2. `prefecture-ranking-section.html`を読み込み
3. `national-ranking-section.html`を読み込み
4. 既存のランキングセクションを正規表現で置換
5. WordPressページを更新

**置換パターン**:
```python
# 都道府県別ランキング
pattern_prefecture = r'<!-- 都道府県基準地価ランキングセクション -->.*?</section>\s*'

# 全国地点ランキング
pattern_national = r'<!-- 全国地点ランキングセクション -->.*?</section>\s*'
```

---

### データファイル

#### national_ranking_data.json (5.5KB)
全国地点ランキングTOP10のJSONデータ

**データ構造**:
```json
[
  {
    "rank": 1,
    "prefecture": "東京都",
    "address": "赤坂１丁目１４２４番１",
    "price_per_sqm": 5900000,
    "tsubo_price": 19504146,
    "change_rate": 10.3,
    "emoji": "🥇"
  },
  ...
]
```

---

#### prefecture_ranking_data.json (9.0KB)
都道府県別ランキング（47都道府県）のJSONデータ

**データ構造**:
```json
[
  {
    "rank": 1,
    "prefecture": "東京都",
    "price_per_sqm": 385000,
    "tsubo_price": 1272731,
    "change_rate": 5.2,
    "emoji": "🥇"
  },
  ...
]
```

---

### HTMLファイル

#### national-ranking-section.html (11KB)
全国地点ランキングTOP10のHTMLセクション

**セクション構成**:
- タイトル: 🏆 日本全国の地価ランキング トップ10（2025年最新）
- 説明文
- テーブル（順位、都道府県、所在地、地価、坪単価、前年比）
- データ出典注記

---

#### prefecture-ranking-section.html (54KB)
都道府県別ランキング（47都道府県）のHTMLセクション

**セクション構成**:
- タイトル: 📊 都道府県の基準地価ランキング（2025年最新）
- 説明文
- テーブル（順位、都道府県、平均地価、坪単価、変動率）
- データ出典注記

---

#### national-summary-section.html (1.6KB)
全国平均サマリーのHTMLセクション

**セクション構成**:
- タイトル: 📊 日本全国2025年［令和7年］基準地価
- 3カラム表示:
  - 平均地価（円/㎡）
  - 変動率（%）と状態バッジ
  - 坪単価（円/坪）
- データ出典注記

---

### その他ファイル

#### custom-width-css.css (4.8KB)
カスタムCSSスタイルシート

**用途**: WordPressページの幅調整やレイアウトカスタマイズ

---

#### geolonia-map.svg (30KB)
日本地図のSVGファイル

**用途**: 都道府県選択用の地図表示

---

#### README.md (8.3KB)
システムのドキュメント

**内容**:
- システム概要
- セットアップ手順
- 使用方法
- API仕様

---

## WordPress REST API連携

### 認証情報
環境変数（`.env`ファイル）で管理:
```
WP_SITE_URL=https://example.com
WP_USERNAME=admin
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### APIエンドポイント
```
GET  /wp-json/wp/v2/pages/{PAGE_ID}  # ページ取得
POST /wp-json/wp/v2/pages/{PAGE_ID}  # ページ更新
```

### 更新対象ページ
- **ページID**: 1726
- **ページタイトル**: 地価情報（または類似のタイトル）

---

## データ取得API

### 不動産情報ライブラリ REST API

**ベースURL**:
```
https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001
```

**パラメータ**:
- `year`: 年度（例: 2025）
- その他フィルタリングパラメータ

**レスポンス形式**: JSON

**取得データ項目**:
- 都道府県名
- 所在地
- 地価（円/㎡）
- 前年比変動率（%）

---

## 計算ロジック

### 坪単価計算
```python
def calculate_tsubo_price(price_per_sqm: float) -> int:
    """坪単価を計算（円/坪）"""
    return int(price_per_sqm * 3.30579)
```

**換算係数**: 1坪 = 3.30579㎡

### 変動率判定
```python
def determine_change_status(change_rate: float) -> dict:
    if change_rate > 0:
        return {"status": "上昇", "color": "#16a34a", "bg": "#dcfce7", "arrow": "↑"}
    elif change_rate < 0:
        return {"status": "下落", "color": "#dc2626", "bg": "#fee2e2", "arrow": "↓"}
    else:
        return {"status": "横ばい", "color": "#6b7280", "bg": "#f3f4f6", "arrow": "→"}
```

---

## スタイルガイド

### カラーパレット

**背景色**:
- 白背景: `#ffffff`
- グレー背景（テーブルヘッダー）: `#f9fafb`
- ボーダー: `#e5e7eb`

**テキスト色**:
- タイトル・ヘッダー: `white`（白文字）
- 本文: `#111827`
- 説明文: `#6b7280`
- 地価（紫）: `#667eea`

**変動率バッジ**:
- 上昇: 背景 `#dcfce7` / 文字 `#16a34a`
- 下落: 背景 `#fee2e2` / 文字 `#dc2626`
- 横ばい: 背景 `#f3f4f6` / 文字 `#6b7280`

### レイアウト

**セクション**:
- 背景: 白
- ボーダー半径: `12px`
- パディング: `40px`
- ボックスシャドウ: `0 2px 8px rgba(0,0,0,0.1)`
- マージン下: `48px`

**テーブル**:
- 幅: `100%`
- フォントサイズ: `14px`
- ホバー効果: 背景色 `#f0f9ff`

---

## 使用方法

### 1. データ取得と生成
```bash
# 都道府県別ランキング生成
python fetch_prefecture_ranking_data.py

# 全国地点ランキング生成
python fetch_national_ranking.py

# 全国平均サマリー生成
python generate_national_summary.py
```

### 2. WordPressへの反映
```bash
# 両方のランキングセクションを更新
python update_both_rankings.py

# サマリーセクションを配置
python move_summary_to_map_section.py
```

---

## 注意事項

1. **環境変数**: WordPress認証情報は`.env`ファイルで管理
2. **API制限**: 不動産情報ライブラリAPIの利用規約を遵守
3. **データ更新**: 年度ごとに最新データを取得して更新
4. **バックアップ**: WordPress更新前にページのバックアップを推奨

---

## 更新履歴

- 2025年10月15日: 初版作成
  - 全国地点ランキングTOP10機能追加
  - 都道府県別ランキング機能追加
  - 全国平均サマリーセクション追加
  - 白背景・白文字デザインに変更

---

## ライセンス・データ出典

**データ出典**: 国土交通省 不動産情報ライブラリ
**利用規約**: 国土交通省の利用規約に準拠
