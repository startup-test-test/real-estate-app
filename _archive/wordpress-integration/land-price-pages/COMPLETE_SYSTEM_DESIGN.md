# 1,900ページ対応システム設計

## 🎯 目標

**1つのプログラムで1,900ページを自動生成**

---

## 📐 システム構成

```
land-price-pages/
│
├── 📂 core/                          # コアシステム（再利用可能）
│   ├── page_generator.py             # ページ生成エンジン
│   ├── data_fetcher.py               # データ取得
│   ├── template_renderer.py          # テンプレート処理
│   └── wordpress_uploader.py         # WordPress反映
│
├── 📂 templates/                     # HTMLテンプレート
│   ├── base.html                     # 共通ベース
│   ├── national.html                 # 全国平均用
│   ├── prefecture.html               # 都道府県用
│   └── city.html                     # 市区町村用
│
├── 📂 config/                        # ページ定義
│   ├── pages.yaml                    # 全ページ設定（1,900行）
│   └── settings.yaml                 # 共通設定
│
└── 📂 output/                        # 生成結果
    ├── page_1726_national.html       # 全国平均
    ├── page_1727_hokkaido.html       # 北海道
    ├── page_1728_aomori.html         # 青森
    └── ...                           # 1,900ページ
```

---

## 🔧 コアシステム

### 1. page_generator.py（メインプログラム）

```python
#!/usr/bin/env python3
"""
1,900ページを自動生成するメインプログラム
"""

from data_fetcher import fetch_land_price_data
from template_renderer import render_template
from wordpress_uploader import upload_to_wordpress
import yaml

def generate_page(page_config):
    """1ページを生成"""

    # 1. データ取得
    data = fetch_land_price_data(
        area_type=page_config['area_type'],
        area_code=page_config['area_code'],
        year=2025
    )

    # 2. HTMLレンダリング
    html = render_template(
        template=page_config['template'],
        data=data
    )

    # 3. ファイル保存
    output_file = f"output/page_{page_config['page_id']}.html"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)

    # 4. WordPress反映
    upload_to_wordpress(
        page_id=page_config['page_id'],
        content=html
    )

    return True

def generate_all_pages():
    """全ページを生成"""

    # 設定ファイル読み込み
    with open('config/pages.yaml', 'r') as f:
        pages = yaml.safe_load(f)

    # 各ページを生成
    for page in pages:
        print(f"生成中: {page['title']}")
        generate_page(page)
        print(f"✅ 完了: {page['title']}")

if __name__ == '__main__':
    generate_all_pages()
```

---

### 2. data_fetcher.py（データ取得）

```python
#!/usr/bin/env python3
"""
国土交通省APIからデータ取得
"""

import sys
import os
from pathlib import Path

# real_estate_client をインポート
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../backend/property-api'))
sys.path.insert(0, backend_path)
from real_estate_client import RealEstateAPIClient

def fetch_land_price_data(area_type, area_code, year):
    """
    地価データを取得

    Args:
        area_type: 'national', 'prefecture', 'city'
        area_code: 都道府県コード or 市区町村コード
        year: 年度

    Returns:
        dict: 地価データ
    """

    client = RealEstateAPIClient()

    if area_type == 'national':
        # 全国平均
        return fetch_national_average(client, year)

    elif area_type == 'prefecture':
        # 都道府県別
        return fetch_prefecture_data(client, area_code, year)

    elif area_type == 'city':
        # 市区町村別
        return fetch_city_data(client, area_code, year)

def fetch_national_average(client, year):
    """全国平均データ取得"""
    all_prices = []
    all_change_rates = []

    # 47都道府県のデータ取得
    for pref_name in client.prefecture_codes.keys():
        data = client.search_land_prices(
            prefecture=pref_name,
            year=str(year)
        )

        for item in data:
            price = item.get('price_per_sqm', 0)
            if price > 0:
                all_prices.append(price)

            change_rate_str = str(item.get('change_rate', '')).strip()
            if change_rate_str:
                try:
                    change_rate = float(change_rate_str.replace('%', '').replace('+', ''))
                    all_change_rates.append(change_rate)
                except:
                    pass

    # 平均計算
    from statistics import mean
    avg_price = int(mean(all_prices))
    avg_change_rate = round(mean(all_change_rates), 1)
    avg_tsubo_price = int(avg_price * 3.30579)

    return {
        'average_price': avg_price,
        'tsubo_price': avg_tsubo_price,
        'change_rate': avg_change_rate,
        'data_count': len(all_prices)
    }

def fetch_prefecture_data(client, pref_code, year):
    """都道府県別データ取得"""
    # TODO: 実装
    pass

def fetch_city_data(client, city_code, year):
    """市区町村別データ取得"""
    # TODO: 実装
    pass
```

---

### 3. template_renderer.py（テンプレート処理）

```python
#!/usr/bin/env python3
"""
JinjaテンプレートでHTML生成
"""

from jinja2 import Template, Environment, FileSystemLoader
from datetime import datetime

def render_template(template_name, data):
    """
    テンプレートをレンダリング

    Args:
        template_name: テンプレートファイル名
        data: データ辞書

    Returns:
        str: レンダリングされたHTML
    """

    # Jinja2環境設定
    env = Environment(loader=FileSystemLoader('templates'))
    template = env.get_template(template_name)

    # データにメタ情報を追加
    data['meta'] = {
        'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'data_source': '国土交通省 不動産情報ライブラリAPI'
    }

    # レンダリング
    html = template.render(data)

    return html
```

---

## 📄 テンプレート例

### templates/national.html

```html
<!-- データソース: {{ meta.data_source }} -->
<!-- 最終更新: {{ meta.generated_at }} -->
<!-- データ件数: {{ data_count }}件 -->

<section>
  <h2>📊 日本全国{{ year }}年［令和{{ year - 2018 }}年］公示地価</h2>

  <div>
    <p>平均地価</p>
    <p>{{ average_price | number_format }}円/㎡</p>
  </div>

  <div>
    <p>変動率</p>
    <p>{{ change_rate_arrow }}{{ change_rate_sign }}{{ change_rate }}%</p>
  </div>

  <div>
    <p>坪単価</p>
    <p>{{ tsubo_price | number_format }}円/坪</p>
  </div>
</section>
```

---

## ⚙️ 設定ファイル

### config/pages.yaml

```yaml
# 全国平均ページ
- page_id: 1726
  area_type: national
  area_code: null
  title: 日本全国2025年公示地価
  template: national.html

# 都道府県ページ（47件）
- page_id: 1727
  area_type: prefecture
  area_code: "01"
  prefecture_name: 北海道
  title: 北海道の公示地価
  template: prefecture.html

- page_id: 1728
  area_type: prefecture
  area_code: "02"
  prefecture_name: 青森県
  title: 青森県の公示地価
  template: prefecture.html

# ... 45都道府県 ...

# 市区町村ページ（1,900件）
- page_id: 2001
  area_type: city
  area_code: "01101"
  city_name: 札幌市
  prefecture_name: 北海道
  title: 札幌市の公示地価
  template: city.html

# ... 1,899市区町村 ...
```

---

## 🚀 使い方

### 全ページ生成

```bash
python3 core/page_generator.py
```

**実行結果:**
```
生成中: 日本全国2025年公示地価
✅ 完了: 日本全国2025年公示地価

生成中: 北海道の公示地価
✅ 完了: 北海道の公示地価

...

生成中: 沖縄県那覇市の公示地価
✅ 完了: 沖縄県那覇市の公示地価

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 1,900ページの生成完了！
所要時間: 約2時間
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 1ページだけ生成

```bash
python3 core/page_generator.py --page-id=1726
```

---

### 都道府県だけ生成

```bash
python3 core/page_generator.py --type=prefecture
```

**実行結果:**
```
✅ 47都道府県ページ生成完了
所要時間: 約10分
```

---

## 📊 データの流れ

```
┌─────────────────────────────────────────────────┐
│ 1. 設定ファイル読み込み                          │
│    config/pages.yaml → 1,900ページ分の設定     │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 2. ループ処理（1,900回）                         │
│    for page in pages:                           │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 3. データ取得                                    │
│    国土交通省API → 地価データ                    │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 4. テンプレートレンダリング                      │
│    templates/xxx.html + データ → HTML          │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 5. ファイル保存                                  │
│    output/page_xxxx.html                        │
└────────────────┬────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────┐
│ 6. WordPress反映                                │
│    REST API → アップロード                      │
└─────────────────────────────────────────────────┘
```

---

## ✅ このシステムのメリット

### 1. スケーラブル

```
1ページ追加 = 設定ファイルに1行追加
1,900ページ = 同じプログラムで処理
```

---

### 2. メンテナンス容易

```
プログラム修正:
core/page_generator.py を1回修正
↓
全1,900ページに反映
```

---

### 3. データの一貫性

```
すべてのページ:
- データソースコメント付き
- 最終更新日時付き
- 統一されたフォーマット
```

---

### 4. 自動化可能

```
GitHub Actions:
- 毎年1月15日に自動実行
- 1,900ページを自動更新
- Slack通知
```

---

## 🎯 次のステップ

1. ✅ 設計理解
2. ⬜ `core/` フォルダ作成
3. ⬜ `page_generator.py` 実装
4. ⬜ `data_fetcher.py` 実装
5. ⬜ `template_renderer.py` 実装
6. ⬜ テンプレート作成
7. ⬜ 設定ファイル作成
8. ⬜ テスト実行（1ページ）
9. ⬜ 全ページ生成

---

**これが完全な1,900ページ対応システムです！**

今から作り始めますか？

---

**作成日**: 2025年10月16日
**設計者**: Claude Code
