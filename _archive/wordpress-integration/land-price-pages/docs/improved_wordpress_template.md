# 改良版：証拠付きWordPressテンプレート

## 🎯 Geminiの方法 + データソース記録

Geminiの方法は素晴らしいですが、**データの証拠**が残りません。

ここでは、Geminiの方法に「データソース記録」を追加した完全版を紹介します。

---

## 📋 必要なカスタムフィールド（ACF）

### 基本データ

| フィールド名 | ラベル | 用途 |
|-------------|--------|------|
| `heikin_chika` | 平均地価 | 表示用データ |
| `tsubo_tanka` | 坪単価 | 表示用データ |
| `hendo_ritsu` | 変動率 | 表示用データ |

### ⭐ 追加：メタデータ（証拠）

| フィールド名 | ラベル | 用途 |
|-------------|--------|------|
| `data_source` | データソース | 国土交通省API |
| `updated_at` | 最終更新日時 | 2025-10-16 06:30:05 |
| `data_count` | データ件数 | 927件 |
| `api_endpoint` | API URL | https://... |

---

## 📄 改良版テンプレート

### single-chika.php（完全版）

```php
<?php
/**
 * Template Name: 地価情報ページ（データソース付き）
 *
 * このテンプレートは、地価データとその出典を表示します
 */

get_header();
?>

<div id="content">

  <?php if (have_posts()) : while (have_posts()) : the_post(); ?>

    <!-- =============================================== -->
    <!-- データソース情報（HTMLコメント） -->
    <!-- =============================================== -->
    <!-- データソース: <?php the_field('data_source'); ?> -->
    <!-- 最終更新: <?php the_field('updated_at'); ?> -->
    <!-- データ件数: <?php the_field('data_count'); ?>件 -->
    <!-- API: <?php the_field('api_endpoint'); ?> -->

    <!-- =============================================== -->
    <!-- ページタイトル -->
    <!-- =============================================== -->
    <h1><?php the_title(); ?>の公示地価</h1>

    <!-- =============================================== -->
    <!-- サマリーセクション -->
    <!-- =============================================== -->
    <section class="chika-summary">
      <h2>📊 基本情報</h2>

      <div class="summary-grid">
        <div class="summary-item">
          <p class="label">平均地価</p>
          <p class="value">
            <?php echo number_format(get_field('heikin_chika')); ?>
            <span class="unit">円/㎡</span>
          </p>
        </div>

        <div class="summary-item">
          <p class="label">坪単価</p>
          <p class="value">
            <?php echo number_format(get_field('tsubo_tanka')); ?>
            <span class="unit">万円/坪</span>
          </p>
        </div>

        <div class="summary-item">
          <p class="label">変動率</p>
          <p class="value">
            <?php
            $hendo = get_field('hendo_ritsu');
            $arrow = ($hendo >= 0) ? '↑' : '↓';
            $sign = ($hendo >= 0) ? '+' : '';
            echo $arrow . $sign . $hendo;
            ?>
            <span class="unit">%</span>
          </p>
        </div>
      </div>
    </section>

    <!-- =============================================== -->
    <!-- データソース表示（ユーザー向け） -->
    <!-- =============================================== -->
    <section class="data-source">
      <h3>📋 データについて</h3>

      <table class="data-info-table">
        <tr>
          <th>データソース</th>
          <td><?php the_field('data_source'); ?></td>
        </tr>
        <tr>
          <th>最終更新日時</th>
          <td><?php the_field('updated_at'); ?></td>
        </tr>
        <tr>
          <th>データ件数</th>
          <td><?php the_field('data_count'); ?>件</td>
        </tr>
        <tr>
          <th>API</th>
          <td>
            <a href="<?php the_field('api_endpoint'); ?>" target="_blank">
              <?php the_field('api_endpoint'); ?>
            </a>
          </td>
        </tr>
      </table>

      <p class="note">
        ⚠️ 本データは参考情報として提供しており、その正確性・完全性を保証するものではありません。
      </p>
    </section>

    <!-- =============================================== -->
    <!-- 本文 -->
    <!-- =============================================== -->
    <div class="post-content">
      <?php the_content(); ?>
    </div>

  <?php endwhile; endif; ?>

</div>

<?php get_footer(); ?>
```

---

## 📊 生成されるHTML例

```html
<!-- データソース: 国土交通省 不動産情報ライブラリAPI -->
<!-- 最終更新: 2025-10-16 06:30:05 -->
<!-- データ件数: 927件 -->
<!-- API: https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001 -->

<h1>札幌市の公示地価</h1>

<section class="chika-summary">
  <h2>📊 基本情報</h2>

  <div class="summary-grid">
    <div class="summary-item">
      <p class="label">平均地価</p>
      <p class="value">253,000 <span class="unit">円/㎡</span></p>
    </div>

    <div class="summary-item">
      <p class="label">坪単価</p>
      <p class="value">83.6 <span class="unit">万円/坪</span></p>
    </div>

    <div class="summary-item">
      <p class="label">変動率</p>
      <p class="value">↑+2.5 <span class="unit">%</span></p>
    </div>
  </div>
</section>

<section class="data-source">
  <h3>📋 データについて</h3>

  <table>
    <tr>
      <th>データソース</th>
      <td>国土交通省 不動産情報ライブラリAPI</td>
    </tr>
    <tr>
      <th>最終更新日時</th>
      <td>2025-10-16 06:30:05</td>
    </tr>
    <tr>
      <th>データ件数</th>
      <td>927件</td>
    </tr>
    <tr>
      <th>API</th>
      <td>
        <a href="https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001">
          https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001
        </a>
      </td>
    </tr>
  </table>
</section>
```

---

## 🐍 Pythonで生成するCSV（改良版）

### generate_csv_with_metadata.py

```python
#!/usr/bin/env python3
"""
WordPressインポート用CSV生成（メタデータ付き）
"""

import csv
from datetime import datetime
from real_estate_client import RealEstateAPIClient

def generate_csv_with_metadata():
    """メタデータ付きCSV生成"""

    client = RealEstateAPIClient()
    result = []

    # 1,900市区町村をループ
    for city in all_cities:
        print(f"取得中: {city['name']}")

        # APIからデータ取得
        data = client.search_land_prices(
            city=city['name'],
            year='2025'
        )

        # 平均計算
        prices = [item['price_per_sqm'] for item in data]
        avg_price = int(sum(prices) / len(prices))
        tsubo_price = round(avg_price * 3.30579 / 10000, 1)

        # 変動率計算
        change_rates = [
            float(item['change_rate'].replace('%', '').replace('+', ''))
            for item in data if item.get('change_rate')
        ]
        avg_change_rate = round(sum(change_rates) / len(change_rates), 1)

        # 現在時刻
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # データ追加（メタデータ付き）
        result.append({
            # 基本データ
            'city_name': city['name'],
            'heikin_chika': avg_price,
            'tsubo_tanka': tsubo_price,
            'hendo_ritsu': avg_change_rate,

            # メタデータ（証拠）
            'data_source': '国土交通省 不動産情報ライブラリAPI',
            'updated_at': now,
            'data_count': len(data),
            'api_endpoint': f'https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?city={city["code"]}&year=2025'
        })

    # CSV保存
    with open('cities_with_metadata.csv', 'w', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'city_name', 'heikin_chika', 'tsubo_tanka', 'hendo_ritsu',
            'data_source', 'updated_at', 'data_count', 'api_endpoint'
        ])
        writer.writeheader()
        writer.writerows(result)

    print(f"\n✅ {len(result)}件のデータをCSVに保存しました")

if __name__ == '__main__':
    generate_csv_with_metadata()
```

---

## 📥 WP All Import 設定

### インポート時のマッピング

```
CSVの列               →  WordPressフィールド
─────────────────────────────────────────────
city_name            →  投稿タイトル
heikin_chika         →  カスタムフィールド「heikin_chika」
tsubo_tanka          →  カスタムフィールド「tsubo_tanka」
hendo_ritsu          →  カスタムフィールド「hendo_ritsu」
data_source          →  カスタムフィールド「data_source」  ⭐
updated_at           →  カスタムフィールド「updated_at」   ⭐
data_count           →  カスタムフィールド「data_count」   ⭐
api_endpoint         →  カスタムフィールド「api_endpoint」 ⭐
```

---

## ✅ この方法のメリット

### 1. Geminiの良いところは全部残す

- ✅ WordPressで管理しやすい
- ✅ 1,900ページ一括生成
- ✅ デザイン統一

### 2. データの信頼性を追加

- ✅ データソース明記
- ✅ 更新日時記録
- ✅ 「事実」として証明可能

### 3. ユーザーに透明性

- ✅ ページにデータソース表示
- ✅ API URLも公開
- ✅ 信頼度UP

---

## 🎯 まとめ

**Geminiの方法 + データソース記録 = 完璧！**

| 項目 | Gemini方式 | 改良版 |
|------|-----------|--------|
| 作成速度 | ✅ 速い | ✅ 速い |
| 管理しやすさ | ✅ 簡単 | ✅ 簡単 |
| データソース | ❌ なし | ✅ あり |
| 信頼性 | ⚠️ 低い | ✅ 高い |
| 1,900ページ対応 | ✅ 可能 | ✅ 可能 |

---

**この改良版テンプレートを使いましょう！**

---

**作成日**: 2025年10月16日
**作成者**: Claude Code
