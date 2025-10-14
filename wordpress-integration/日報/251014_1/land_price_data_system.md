# 地価情報ページ 実データ連携システム設計書

## 📋 概要

不動産情報ライブラリAPIから実際の公示地価データを取得し、都道府県・市区町村別の地価情報ページ（約1,900ページ）をWordPressに自動投稿するシステムの設計書。

---

## 🏗️ システム構成

```
wordpress-integration/日報/251014_1/
├── land_price_generator/           # 新規作成ディレクトリ
│   ├── data_fetcher.py             # APIからデータ取得
│   ├── data_processor.py           # データ集計・統計計算
│   ├── html_generator.py           # HTML生成
│   ├── wordpress_publisher.py      # WordPress投稿
│   ├── templates/                  # HTMLテンプレート
│   │   ├── prefecture_template.html
│   │   └── city_template.html
│   └── cache/                      # データキャッシュ
│       └── .gitignore
└── run_land_price_generator.py     # メイン実行スクリプト
```

---

## 📊 使用するAPI

### 1. 公示地価データ取得 (XCT001)

**エンドポイント:** `https://www.reinfolib.mlit.go.jp/ex-api/external/XCT001`

**取得できるデータ:**
- 標準地の所在地・地番
- 1㎡あたりの価格
- 変動率
- 最寄駅・駅距離
- 用途地域、建蔽率、容積率
- 緯度経度

**使用メソッド:**
```python
# real_estate_client.py の既存メソッド
client.search_land_prices(prefecture="東京都", city="千代田区", year="2024")
client.search_land_price_history(prefecture="東京都", city="千代田区", years=["2020", "2021", "2022", "2023", "2024"])
```

---

## 🔧 各モジュールの設計

### 1. data_fetcher.py - データ取得モジュール

**役割:** APIから公示地価データを取得してキャッシュに保存

**主要機能:**

#### 1.1 全国の公示地価データ取得
```python
def fetch_all_prefecture_data(year: str = "2024") -> Dict[str, Any]:
    """
    全国47都道府県の公示地価データを取得

    Returns:
        {
            "13": {  # 都道府県コード
                "name": "東京都",
                "data": [...]  # 公示地価データのリスト
            },
            ...
        }
    """
```

#### 1.2 都道府県別データ取得
```python
def fetch_prefecture_data(prefecture_code: str, prefecture_name: str, year: str = "2024") -> Dict:
    """
    特定の都道府県の公示地価データを取得

    Args:
        prefecture_code: 都道府県コード（例: "13"）
        prefecture_name: 都道府県名（例: "東京都"）
        year: 対象年

    Returns:
        {
            "prefecture_code": "13",
            "prefecture_name": "東京都",
            "year": "2024",
            "data": [...],
            "municipalities": {...}  # 市区町村別にグループ化
        }
    """
```

#### 1.3 市区町村別データ取得
```python
def fetch_city_data(prefecture_name: str, city_name: str, years: List[str] = None) -> Dict:
    """
    特定の市区町村の公示地価データを取得（過去データ含む）

    Args:
        prefecture_name: 都道府県名（例: "東京都"）
        city_name: 市区町村名（例: "千代田区"）
        years: 対象年のリスト（デフォルト: 過去5年）

    Returns:
        {
            "prefecture": "東京都",
            "city": "千代田区",
            "current_year": "2024",
            "history": {...}  # 住所ごとの年次データ
        }
    """
```

#### 1.4 キャッシュ機能
```python
def save_to_cache(data: Dict, cache_key: str):
    """データをJSON形式でキャッシュに保存"""

def load_from_cache(cache_key: str, max_age_days: int = 30) -> Optional[Dict]:
    """キャッシュからデータを読み込み（期限チェック付き）"""
```

---

### 2. data_processor.py - データ処理・統計モジュール

**役割:** 取得したデータを集計・分析して統計情報を生成

**主要機能:**

#### 2.1 都道府県統計の計算
```python
def calculate_prefecture_stats(prefecture_data: Dict) -> Dict:
    """
    都道府県全体の統計情報を計算

    Returns:
        {
            "prefecture_name": "東京都",
            "year": "2024",
            "summary": {
                "average_price_per_sqm": 1302000,  # 平均地価（円/㎡）
                "average_price_per_tsubo": 4303000,  # 平均坪単価（円/坪）
                "median_price": 950000,
                "total_points": 2500,  # 調査地点数
                "change_rate": 7.7,  # 変動率（%）
                "nationwide_rank": 1  # 全国順位（後で設定）
            },
            "municipalities": [...],  # 市区町村別統計
            "price_distribution": {
                "highest": {...},  # 最高額の地点
                "lowest": {...},   # 最低額の地点
                "top10": [...],    # 高額TOP10
                "bottom10": [...]  # 低額TOP10
            },
            "municipality_ranking": [...]  # 市区町村ランキング
        }
    """
```

#### 2.2 市区町村統計の計算
```python
def calculate_city_stats(city_data: Dict) -> Dict:
    """
    市区町村の統計情報を計算

    Returns:
        {
            "city_name": "千代田区",
            "prefecture": "東京都",
            "year": "2024",
            "summary": {
                "average_price_per_sqm": 6175000,
                "average_price_per_tsubo": 20413000,
                "total_points": 86,
                "change_rate": 13.9,
                "prefecture_rank": 2  # 都道府県内順位
            },
            "station_ranking": [...],  # 駅別ランキング
            "district_ranking": [...],  # 地区別ランキング
            "point_ranking": [...],     # 地点別ランキング
            "trend": {
                "5_year_data": [...],   # 過去5年の推移
                "growth_rate": 45.2     # 5年間の上昇率
            }
        }
    """
```

#### 2.3 ランキング生成
```python
def create_municipality_ranking(prefecture_data: Dict) -> List[Dict]:
    """
    都道府県内の市区町村ランキングを生成

    Returns:
        [
            {
                "rank": 1,
                "municipality": "中央区",
                "average_price": 6530000,
                "price_per_tsubo": 21580000,
                "change_rate": 8.5,
                "total_points": 120
            },
            ...
        ]
    """

def create_station_ranking(city_data: Dict) -> List[Dict]:
    """
    市区町村内の駅別ランキングを生成
    """

def create_district_ranking(city_data: Dict) -> List[Dict]:
    """
    市区町村内の地区別ランキングを生成
    """
```

#### 2.4 推移分析
```python
def analyze_price_trend(history_data: Dict) -> Dict:
    """
    地価推移を分析

    Returns:
        {
            "years": [2020, 2021, 2022, 2023, 2024],
            "average_prices": [5400000, 5600000, 5900000, 6100000, 6530000],
            "change_rates": [2.5, 3.7, 5.4, 3.4, 7.0],
            "5_year_growth": 20.9,  # 5年間の成長率
            "trend": "上昇"  # "上昇", "下降", "横ばい"
        }
    """
```

---

### 3. html_generator.py - HTML生成モジュール

**役割:** 統計データからHTMLページを生成

**主要機能:**

#### 3.1 都道府県ページ生成
```python
def generate_prefecture_html(stats: Dict) -> str:
    """
    都道府県ページのHTMLを生成

    Args:
        stats: data_processor.calculate_prefecture_stats() の結果

    Returns:
        完成したHTMLコンテンツ
    """
```

**生成されるHTMLセクション:**
1. パンくずリスト
2. ページタイトル（H1）
3. サマリーカード（4つの指標）
4. 市区町村ランキング TOP10
5. 地価推移グラフの説明
6. エリア分析
7. 全市区町村一覧（カード形式）
8. FAQ（よくある質問）
9. CTA（シミュレーターへの誘導）
10. 構造化データ（JSON-LD）

#### 3.2 市区町村ページ生成
```python
def generate_city_html(stats: Dict) -> str:
    """
    市区町村ページのHTMLを生成

    Args:
        stats: data_processor.calculate_city_stats() の結果

    Returns:
        完成したHTMLコンテンツ
    """
```

**生成されるHTMLセクション:**
1. パンくずリスト
2. ページタイトル（H1）
3. サマリーカード（4つの指標）
4. 駅別ランキング TOP5
5. 詳細地点ランキング TOP10
6. 地価推移グラフ（過去5年）
7. エリア特性・投資分析
8. 隣接市区町村リンク
9. FAQ
10. CTA
11. 構造化データ（JSON-LD）

#### 3.3 テンプレートエンジン
```python
def render_template(template_name: str, context: Dict) -> str:
    """
    Jinjaテンプレートをレンダリング

    Args:
        template_name: テンプレートファイル名
        context: テンプレート変数の辞書

    Returns:
        レンダリングされたHTML
    """
```

---

### 4. wordpress_publisher.py - WordPress投稿モジュール

**役割:** 生成したHTMLをWordPressに投稿

**主要機能:**

#### 4.1 バッチ投稿
```python
def batch_publish_pages(pages: List[Dict], batch_size: int = 10, delay: int = 1):
    """
    複数のページをバッチ処理で投稿

    Args:
        pages: 投稿するページのリスト
        batch_size: 1回のバッチサイズ
        delay: バッチ間の遅延（秒）
    """
```

#### 4.2 都道府県ページ投稿
```python
def publish_prefecture_page(prefecture_name: str, html_content: str, stats: Dict) -> Dict:
    """
    都道府県ページを投稿

    Args:
        prefecture_name: 都道府県名
        html_content: 生成されたHTML
        stats: 統計データ（メタ情報用）

    Returns:
        投稿結果（投稿ID、URL等）
    """
```

#### 4.3 市区町村ページ投稿
```python
def publish_city_page(prefecture: str, city_name: str, html_content: str, stats: Dict) -> Dict:
    """
    市区町村ページを投稿
    """
```

#### 4.4 投稿データ作成
```python
def create_post_data(title: str, content: str, excerpt: str, slug: str, status: str = "draft") -> Dict:
    """
    WordPress投稿用のデータ構造を作成

    Returns:
        {
            'title': 'タイトル',
            'content': 'HTMLコンテンツ',
            'status': 'draft',
            'excerpt': 'メタディスクリプション',
            'slug': 'URLスラッグ'
        }
    """
```

---

## 🚀 実行フロー

### メインスクリプト: run_land_price_generator.py

```python
"""
地価情報ページ生成・投稿スクリプト
"""

def main():
    """メイン処理"""

    # ステップ1: データ取得
    print("ステップ1: 全国の公示地価データを取得中...")
    all_data = fetch_all_prefecture_data(year="2024")

    # ステップ2: 都道府県ページ生成
    print("ステップ2: 都道府県ページ（47件）を生成中...")
    prefecture_pages = []

    for pref_code, pref_data in all_data.items():
        # 統計計算
        stats = calculate_prefecture_stats(pref_data)

        # HTML生成
        html = generate_prefecture_html(stats)

        prefecture_pages.append({
            'prefecture': pref_data['name'],
            'html': html,
            'stats': stats
        })

    # ステップ3: 都道府県ページを投稿
    print("ステップ3: 都道府県ページをWordPressに投稿中...")
    batch_publish_pages(prefecture_pages, batch_size=10, delay=2)

    # ステップ4: 市区町村ページ生成
    print("ステップ4: 市区町村ページ（約1,900件）を生成中...")
    city_pages = []

    for pref_code, pref_data in all_data.items():
        for city_name, city_data in pref_data['municipalities'].items():
            # 過去データ取得
            history = fetch_city_data(
                prefecture_name=pref_data['name'],
                city_name=city_name,
                years=["2020", "2021", "2022", "2023", "2024"]
            )

            # 統計計算
            stats = calculate_city_stats({**city_data, 'history': history})

            # HTML生成
            html = generate_city_html(stats)

            city_pages.append({
                'prefecture': pref_data['name'],
                'city': city_name,
                'html': html,
                'stats': stats
            })

    # ステップ5: 市区町村ページを投稿（バッチ処理）
    print(f"ステップ5: 市区町村ページ（{len(city_pages)}件）をWordPressに投稿中...")
    batch_publish_pages(city_pages, batch_size=20, delay=3)

    print("完了!")

if __name__ == '__main__':
    main()
```

---

## 📝 段階的実装プラン

### フェーズ1: プロトタイプ（1日）
- [ ] data_fetcher.py 作成
- [ ] data_processor.py 作成
- [ ] 東京都1都道府県でテスト
- [ ] 千代田区1市区町村でテスト

### フェーズ2: 都道府県ページ（1-2日）
- [ ] html_generator.py 作成（都道府県テンプレート）
- [ ] wordpress_publisher.py 作成
- [ ] 47都道府県のページ生成・投稿

### フェーズ3: 市区町村ページ（3-5日）
- [ ] html_generator.py 拡張（市区町村テンプレート）
- [ ] 主要100都市のページ生成・投稿
- [ ] 全国1,900市区町村のページ生成・投稿

### フェーズ4: 最適化・改善
- [ ] キャッシュ機能実装
- [ ] エラーハンドリング強化
- [ ] パフォーマンス改善
- [ ] ログ機能追加

---

## 🎯 期待される成果物

### 1. 都道府県ページ（47件）

**URL例:** `https://ooya.tech/media/land-price/tokyo/`

**コンテンツ:**
- 東京都の平均地価: 130.2万円/㎡（実データ）
- 全国順位: 1位（実データ）
- 市区町村ランキング TOP10（実データ）
- 地価推移グラフ（過去5-10年の実データ）
- 全62市区町村へのリンク

### 2. 市区町村ページ（約1,900件）

**URL例:** `https://ooya.tech/media/land-price/tokyo/chiyoda/`

**コンテンツ:**
- 千代田区の平均地価: 617.5万円/㎡（実データ）
- 東京都内順位: 2位（実データ）
- 駅別ランキング（実データ）
- 詳細地点ランキング TOP10（実データ）
- 過去5年の地価推移（実データ）

---

## ⚠️ 注意事項

### 1. API呼び出し制限
- 一度に大量のリクエストを送らない
- キャッシュを活用して再利用
- エラー時はリトライロジックを実装

### 2. WordPressサーバー負荷
- バッチ処理で段階的に投稿（1回10-20件）
- バッチ間に遅延を入れる（2-3秒）
- 1日100-200件ずつ投稿することを推奨

### 3. データの品質
- 欠損データのハンドリング
- 異常値のチェック
- 市区町村名の表記ゆれ対応

---

## 📊 データフロー図

```
[不動産情報ライブラリAPI]
         ↓
    XCT001エンドポイント
         ↓
   data_fetcher.py
    (データ取得)
         ↓
     キャッシュ保存
         ↓
   data_processor.py
    (統計計算)
         ↓
   html_generator.py
    (HTML生成)
         ↓
  wordpress_publisher.py
    (WordPress投稿)
         ↓
  [WordPress記事として公開]
```

---

## 🔍 データサンプル例

### 都道府県データの例（東京都）
```json
{
  "prefecture_code": "13",
  "prefecture_name": "東京都",
  "year": "2024",
  "summary": {
    "average_price_per_sqm": 1302000,
    "average_price_per_tsubo": 4303000,
    "total_points": 2500,
    "change_rate": 7.7
  },
  "municipality_ranking": [
    {
      "rank": 1,
      "municipality": "中央区",
      "average_price": 6530000,
      "change_rate": 8.5
    },
    {
      "rank": 2,
      "municipality": "千代田区",
      "average_price": 6175000,
      "change_rate": 13.9
    }
  ]
}
```

### 市区町村データの例（千代田区）
```json
{
  "city_name": "千代田区",
  "prefecture": "東京都",
  "year": "2024",
  "summary": {
    "average_price_per_sqm": 6175000,
    "total_points": 86,
    "change_rate": 13.9,
    "prefecture_rank": 2
  },
  "station_ranking": [
    {
      "rank": 1,
      "station": "大手町",
      "average_price": 12500000
    },
    {
      "rank": 2,
      "station": "東京",
      "average_price": 11200000
    }
  ],
  "point_ranking": [
    {
      "rank": 1,
      "address": "丸の内2-4-1",
      "price_per_sqm": 37100000,
      "station": "東京",
      "distance": "200m"
    }
  ]
}
```

---

**作成日**: 2025-10-14
**プロジェクト**: WordPress Integration - Land Price Pages
**バージョン**: 1.0
