# 都道府県ページ実装方法

## 方法1: カスタム投稿タイプ + タクソノミー（推奨）

### 1. カスタム投稿タイプとタクソノミーの登録

WordPressの`functions.php`またはカスタムプラグインに以下を追加：

```php
<?php
/**
 * 地価情報カスタム投稿タイプとタクソノミーの登録
 */

// カスタム投稿タイプ: 地価地点データ
function register_land_price_post_type() {
    $args = array(
        'label' => '地価地点',
        'public' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'land-price'),
        'capability_type' => 'post',
        'has_archive' => true,
        'hierarchical' => false,
        'menu_position' => 5,
        'menu_icon' => 'dashicons-location-alt',
        'supports' => array('title', 'editor', 'custom-fields'),
        'show_in_rest' => true, // REST API対応
    );
    register_post_type('land_price_point', $args);
}
add_action('init', 'register_land_price_post_type');

// タクソノミー1: 都道府県
function register_prefecture_taxonomy() {
    $args = array(
        'label' => '都道府県',
        'public' => true,
        'hierarchical' => true, // カテゴリー型
        'show_ui' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'land-price/prefecture'),
        'show_in_rest' => true,
    );
    register_taxonomy('prefecture', array('land_price_point'), $args);
}
add_action('init', 'register_prefecture_taxonomy');

// タクソノミー2: 市区町村
function register_city_taxonomy() {
    $args = array(
        'label' => '市区町村',
        'public' => true,
        'hierarchical' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'query_var' => true,
        'rewrite' => array('slug' => 'land-price/city'),
        'show_in_rest' => true,
    );
    register_taxonomy('city', array('land_price_point'), $args);
}
add_action('init', 'register_city_taxonomy');
```

### 2. タクソノミーの一括登録スクリプト

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
都道府県・市区町村タクソノミーをWordPressに一括登録
"""

import os
import requests
from dotenv import load_dotenv

# 環境変数読み込み
load_dotenv()

WP_SITE_URL = os.getenv('WP_SITE_URL')
WP_USERNAME = os.getenv('WP_USERNAME')
WP_APP_PASSWORD = os.getenv('WP_APP_PASSWORD')

# 47都道府県のデータ
PREFECTURES = [
    {'name': '北海道', 'slug': 'hokkaido'},
    {'name': '青森県', 'slug': 'aomori'},
    {'name': '岩手県', 'slug': 'iwate'},
    # ... 残り44都道府県
    {'name': '東京都', 'slug': 'tokyo'},
    {'name': '大阪府', 'slug': 'osaka'},
    {'name': '神奈川県', 'slug': 'kanagawa'},
    # ...
]

def create_taxonomy_term(taxonomy, name, slug, description=''):
    """タクソノミー項目を作成"""
    api_url = f"{WP_SITE_URL}/wp-json/wp/v2/{taxonomy}"

    data = {
        'name': name,
        'slug': slug,
        'description': description
    }

    response = requests.post(
        api_url,
        json=data,
        auth=(WP_USERNAME, WP_APP_PASSWORD),
        timeout=30
    )

    if response.status_code == 201:
        term = response.json()
        print(f"✅ {taxonomy} 作成: {name} (ID: {term['id']})")
        return term['id']
    else:
        print(f"❌ エラー: {name} - {response.status_code}")
        return None

def main():
    print("=" * 80)
    print("都道府県タクソノミー一括登録")
    print("=" * 80)
    print()

    # 都道府県タクソノミーを登録
    for pref in PREFECTURES:
        description = f"{pref['name']}の地価・公示地価データ"
        create_taxonomy_term('prefecture', pref['name'], pref['slug'], description)

    print()
    print("✅ 処理完了")

if __name__ == '__main__':
    main()
```

### 3. 都道府県アーカイブページのテンプレート

SWELLテーマの子テーマに以下のファイルを作成：

**ファイル名**: `taxonomy-prefecture.php`

```php
<?php
/**
 * 都道府県アーカイブページテンプレート
 * Template Name: Prefecture Archive
 */

get_header();

// 現在の都道府県タームを取得
$term = get_queried_object();
$prefecture_name = $term->name;
$prefecture_slug = $term->slug;

// 都道府県に属する地価地点を取得
$args = array(
    'post_type' => 'land_price_point',
    'tax_query' => array(
        array(
            'taxonomy' => 'prefecture',
            'field' => 'slug',
            'terms' => $prefecture_slug,
        ),
    ),
    'posts_per_page' => -1, // 全件取得
);
$land_price_query = new WP_Query($args);

// 統計データの計算
$prices = array();
$change_rates = array();

if ($land_price_query->have_posts()) {
    while ($land_price_query->have_posts()) {
        $land_price_query->the_post();
        $price = get_post_meta(get_the_ID(), 'price_per_sqm', true);
        $change_rate = get_post_meta(get_the_ID(), 'change_rate', true);

        if ($price) $prices[] = floatval($price);
        if ($change_rate) $change_rates[] = floatval($change_rate);
    }
    wp_reset_postdata();
}

$avg_price = !empty($prices) ? array_sum($prices) / count($prices) : 0;
$avg_change_rate = !empty($change_rates) ? array_sum($change_rates) / count($change_rates) : 0;
$tsubo_price = $avg_price * 3.30579;

?>

<main id="main-content" class="l-mainContent">
    <article class="l-article">

        <!-- ヘッダーセクション -->
        <header class="entry-header">
            <h1 class="entry-title"><?php echo esc_html($prefecture_name); ?>の地価・公示地価【2025年最新】</h1>
            <div class="breadcrumb">
                <a href="<?php echo home_url('/'); ?>">ホーム</a> &gt;
                <a href="<?php echo home_url('/land-price/'); ?>">地価情報</a> &gt;
                <span><?php echo esc_html($prefecture_name); ?></span>
            </div>
        </header>

        <!-- 都道府県サマリーカード -->
        <section class="prefecture-summary">
            <div class="summary-cards">
                <div class="summary-card">
                    <div class="card-label">平均地価</div>
                    <div class="card-value"><?php echo number_format($avg_price); ?>円/㎡</div>
                </div>
                <div class="summary-card">
                    <div class="card-label">変動率</div>
                    <div class="card-value <?php echo $avg_change_rate > 0 ? 'up' : ($avg_change_rate < 0 ? 'down' : 'neutral'); ?>">
                        <?php echo $avg_change_rate > 0 ? '↑' : ($avg_change_rate < 0 ? '↓' : '→'); ?>
                        <?php echo sprintf('%+.2f', $avg_change_rate); ?>%
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card-label">坪単価</div>
                    <div class="card-value"><?php echo number_format($tsubo_price); ?>円/坪</div>
                </div>
                <div class="summary-card">
                    <div class="card-label">データ地点数</div>
                    <div class="card-value"><?php echo count($prices); ?>地点</div>
                </div>
            </div>
        </section>

        <!-- 市区町村ランキング -->
        <section class="city-ranking">
            <h2>📊 <?php echo esc_html($prefecture_name); ?>の市区町村別ランキング</h2>

            <?php
            // 市区町村別の統計を計算
            $cities = get_terms(array(
                'taxonomy' => 'city',
                'hide_empty' => false,
            ));

            $city_stats = array();

            foreach ($cities as $city) {
                // 各市区町村の地価地点を取得
                $city_args = array(
                    'post_type' => 'land_price_point',
                    'tax_query' => array(
                        'relation' => 'AND',
                        array(
                            'taxonomy' => 'prefecture',
                            'field' => 'slug',
                            'terms' => $prefecture_slug,
                        ),
                        array(
                            'taxonomy' => 'city',
                            'field' => 'slug',
                            'terms' => $city->slug,
                        ),
                    ),
                    'posts_per_page' => -1,
                );

                $city_query = new WP_Query($city_args);

                if ($city_query->have_posts()) {
                    $city_prices = array();
                    $city_change_rates = array();

                    while ($city_query->have_posts()) {
                        $city_query->the_post();
                        $price = get_post_meta(get_the_ID(), 'price_per_sqm', true);
                        $change_rate = get_post_meta(get_the_ID(), 'change_rate', true);

                        if ($price) $city_prices[] = floatval($price);
                        if ($change_rate) $city_change_rates[] = floatval($change_rate);
                    }
                    wp_reset_postdata();

                    if (!empty($city_prices)) {
                        $city_avg_price = array_sum($city_prices) / count($city_prices);
                        $city_avg_change = array_sum($city_change_rates) / count($city_change_rates);

                        $city_stats[] = array(
                            'name' => $city->name,
                            'slug' => $city->slug,
                            'avg_price' => $city_avg_price,
                            'tsubo_price' => $city_avg_price * 3.30579,
                            'change_rate' => $city_avg_change,
                            'count' => count($city_prices),
                        );
                    }
                }
            }

            // 地価順にソート
            usort($city_stats, function($a, $b) {
                return $b['avg_price'] - $a['avg_price'];
            });
            ?>

            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>順位</th>
                        <th>市区町村</th>
                        <th>平均地価（円/㎡）</th>
                        <th>坪単価（万円/坪）</th>
                        <th>変動率</th>
                        <th>詳細</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($city_stats as $index => $city): ?>
                    <tr>
                        <td><?php echo ($index + 1); ?>位</td>
                        <td><?php echo esc_html($city['name']); ?></td>
                        <td><?php echo number_format($city['avg_price']); ?></td>
                        <td><?php echo number_format($city['tsubo_price'] / 10000, 1); ?></td>
                        <td class="<?php echo $city['change_rate'] > 0 ? 'up' : ($city['change_rate'] < 0 ? 'down' : 'neutral'); ?>">
                            <?php echo sprintf('%+.2f', $city['change_rate']); ?>%
                        </td>
                        <td>
                            <a href="<?php echo home_url("/land-price/city/{$city['slug']}/"); ?>" class="detail-btn">
                                詳細 ▶
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </section>

        <!-- 地価推移グラフ（Chart.js） -->
        <section class="price-trend">
            <h2>📈 <?php echo esc_html($prefecture_name); ?>の地価推移</h2>
            <canvas id="priceTrendChart" width="400" height="200"></canvas>
        </section>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
        // グラフデータ（実際はPHPから動的に生成）
        const ctx = document.getElementById('priceTrendChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
                datasets: [{
                    label: '<?php echo esc_js($prefecture_name); ?>の平均地価',
                    data: [/* 実データをPHPから出力 */],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + '円/㎡';
                            }
                        }
                    }
                }
            }
        });
        </script>

    </article>
</main>

<?php get_footer(); ?>
```

---

## 方法2: 固定ページで生成（シンプル）

### 設計思想
```
固定ページ階層:
├── 地価情報（親） - ID: 1726
    ├── 東京都（子） - スラッグ: tokyo
    ├── 大阪府（子） - スラッグ: osaka
    └── 神奈川県（子） - スラッグ: kanagawa
```

### URL構造
```
/land-price/                # 親ページ（トップ）
/land-price/tokyo/          # 子ページ（東京都）
/land-price/osaka/          # 子ページ（大阪府）
```

### 実装方法

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
都道府県ページを固定ページとして一括生成
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

WP_SITE_URL = os.getenv('WP_SITE_URL')
WP_USERNAME = os.getenv('WP_USERNAME')
WP_APP_PASSWORD = os.getenv('WP_APP_PASSWORD')

PARENT_PAGE_ID = 1726  # トップページのID

# 都道府県データ
PREFECTURES = [
    {'name': '東京都', 'slug': 'tokyo', 'avg_price': 385000, 'change_rate': 5.2},
    {'name': '大阪府', 'slug': 'osaka', 'avg_price': 195000, 'change_rate': 3.8},
    # ... 残り45都道府県
]

def generate_prefecture_html(pref_data):
    """都道府県ページのHTML生成"""
    name = pref_data['name']
    avg_price = pref_data['avg_price']
    change_rate = pref_data['change_rate']
    tsubo_price = int(avg_price * 3.30579)

    html = f'''
<!-- ヘッダーセクション -->
<div style="margin-bottom: 40px;">
    <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 16px;">{name}の地価・公示地価【2025年最新】</h1>
    <div style="font-size: 14px; color: #6b7280;">
        <a href="/">ホーム</a> &gt;
        <a href="/land-price/">地価情報</a> &gt;
        <span>{name}</span>
    </div>
</div>

<!-- サマリーカード -->
<section style="margin-bottom: 48px;">
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">平均地価</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">{avg_price:,}<span style="font-size: 14px;">円/㎡</span></p>
        </div>
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">変動率</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">↑{change_rate:+.1f}<span style="font-size: 14px;">%</span></p>
        </div>
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">坪単価</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">{tsubo_price:,}<span style="font-size: 14px;">円/坪</span></p>
        </div>
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">全国順位</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">1<span style="font-size: 14px;">位</span></p>
        </div>
    </div>
</section>

<!-- 市区町村ランキング -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
    <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 24px 0;">📊 {name}の市区町村別ランキング</h2>
    <!-- テーブルをここに追加 -->
</section>

<!-- データ出典 -->
<div style="font-size: 13px; color: #6b7280; margin-top: 40px;">
    <p>出典: 国土交通省 不動産情報ライブラリ（当サイトで加工して作成）</p>
    <p>データ基準日: 2025年1月1日（令和7年公示地価）</p>
</div>
'''

    return html

def create_prefecture_page(pref_data):
    """都道府県ページを作成"""
    api_url = f"{WP_SITE_URL}/wp-json/wp/v2/pages"

    html = generate_prefecture_html(pref_data)

    data = {
        'title': f"{pref_data['name']}の地価・公示地価【2025年最新】",
        'content': html,
        'slug': pref_data['slug'],
        'status': 'publish',
        'parent': PARENT_PAGE_ID,  # 親ページを指定
        'template': 'page-wide',  # 1カラム（幅広）テンプレート
    }

    response = requests.post(
        api_url,
        json=data,
        auth=(WP_USERNAME, WP_APP_PASSWORD),
        timeout=30
    )

    if response.status_code == 201:
        page = response.json()
        print(f"✅ {pref_data['name']} ページ作成: {page['link']}")
        return page['id']
    else:
        print(f"❌ エラー: {pref_data['name']} - {response.status_code}")
        return None

def main():
    print("=" * 80)
    print("都道府県ページ一括生成")
    print("=" * 80)
    print()

    for pref in PREFECTURES:
        create_prefecture_page(pref)

    print()
    print("✅ 処理完了")

if __name__ == '__main__':
    main()
```

---

## 2つの方法の比較

| 項目 | カスタム投稿タイプ + タクソノミー | 固定ページ |
|------|----------------------------------|-----------|
| **URL構造** | `/land-price/prefecture/tokyo/` | `/land-price/tokyo/` |
| **拡張性** | ⭐⭐⭐⭐⭐ 高い | ⭐⭐⭐ 中程度 |
| **管理の容易さ** | ⭐⭐⭐⭐ 良い | ⭐⭐⭐⭐⭐ 非常に良い |
| **検索・フィルター** | ⭐⭐⭐⭐⭐ 強力 | ⭐⭐⭐ 基本的 |
| **SEO** | ⭐⭐⭐⭐ 良い | ⭐⭐⭐⭐⭐ 非常に良い |
| **初期設定** | やや複雑 | シンプル |
| **データ更新** | 容易 | やや手間 |

---

## 推奨アプローチ

### 短期的（すぐ始めたい場合）
→ **方法2: 固定ページ**
- すぐに実装できる
- SEOに最適化されたURL
- 管理画面での編集が容易

### 長期的（将来の拡張を見据える場合）
→ **方法1: カスタム投稿タイプ + タクソノミー**
- データベース設計が堅牢
- 検索・フィルター機能が強力
- 将来的な機能追加に対応しやすい

---

どちらの方法で実装しますか？それとも両方のアプローチの詳細な実装コードを用意しましょうか？
