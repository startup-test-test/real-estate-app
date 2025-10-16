# WordPressで共通パーツを管理する方法

## 方法1: 再利用ブロック（初心者向け・推奨）

### 特徴
- ✅ WordPressの標準機能（プラグイン不要）
- ✅ ビジュアルエディタで作成できる
- ✅ 一括更新が可能
- ✅ プログラミング不要

### 使用例：データ出典フッターを共通化

#### ステップ1: 再利用ブロックを作成

1. **WordPress管理画面**にログイン
   ```
   https://ooya.tech/media/wp-admin/
   ```

2. **固定ページ → 新規追加**

3. **カスタムHTMLブロックを追加**
   - 「+」ボタンをクリック
   - 「カスタムHTML」を選択

4. **共通パーツのHTMLを入力**
   ```html
   <div style="font-size: 13px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
       <p style="margin: 4px 0;">※ 出典: 国土交通省 不動産情報ライブラリ（当サイトで加工して作成）</p>
       <p style="margin: 4px 0;">※ データ基準日: 2025年1月1日（令和7年公示地価）</p>
       <p style="margin: 4px 0;">※ 最終更新日: 2025年10月15日</p>
   </div>
   ```

5. **再利用ブロック化**
   - ブロックを選択
   - 右上の「⋮」（3点メニュー）をクリック
   - 「再利用ブロックを作成」を選択
   - 名前を入力: 「地価データ出典フッター」
   - 「保存」

6. **このページは破棄してOK**（再利用ブロックは保存済み）

#### ステップ2: 他のページで使用

1. **地価ページを開く**
   - 東京都ページ（ID: 1765）を編集

2. **再利用ブロックを挿入**
   - ページの最後に移動
   - 「+」ボタンをクリック
   - 「再利用可能」セクションを開く
   - 「地価データ出典フッター」を選択

3. **保存**

#### ステップ3: 一括更新

1. **再利用ブロックを編集**
   - WordPress管理画面 → 固定ページ → すべての再利用ブロック
   - 「地価データ出典フッター」を開く
   - 内容を編集（例: 更新日を変更）
   - 「更新」ボタンを押す

2. **すべてのページに自動反映**
   - このブロックを使っている全ページが自動更新される！

---

## 方法2: ショートコード（中級者向け）

### 特徴
- ✅ パラメータを渡せる（動的な内容）
- ✅ PHPでロジックを書ける
- ⚠️ functions.phpの編集が必要

### 実装手順

#### ステップ1: functions.phpに追加

**SWELLテーマの子テーマ**の`functions.php`に以下を追加：

```php
<?php
/**
 * 地価ページ用のショートコード
 */

// データ出典フッター
function land_price_footer_shortcode() {
    $html = '
    <div style="font-size: 13px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 4px 0;">※ 出典: 国土交通省 不動産情報ライブラリ（当サイトで加工して作成）</p>
        <p style="margin: 4px 0;">※ データ基準日: 2025年1月1日（令和7年公示地価）</p>
        <p style="margin: 4px 0;">※ 最終更新日: ' . date('Y年m月d日') . '</p>
    </div>
    ';
    return $html;
}
add_shortcode('land_price_footer', 'land_price_footer_shortcode');


// サマリーカード（パラメータ付き）
function summary_card_shortcode($atts) {
    // デフォルト値
    $atts = shortcode_atts(array(
        'label' => 'ラベル',
        'value' => '0',
        'unit' => '',
    ), $atts);

    $html = '
    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">' . esc_html($atts['label']) . '</p>
        <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">
            ' . esc_html($atts['value']) . '<span style="font-size: 14px; font-weight: 400;">' . esc_html($atts['unit']) . '</span>
        </p>
    </div>
    ';
    return $html;
}
add_shortcode('summary_card', 'summary_card_shortcode');
?>
```

#### ステップ2: ページで使用

固定ページの編集画面で、以下のように記述：

```
[land_price_footer]

[summary_card label="平均地価" value="385,000" unit="円/㎡"]
```

#### メリット
- パラメータを渡せる
- 更新日が自動で変わる（`date()`関数）
- functions.phpを編集すればすべてのページに反映

---

## 方法3: テンプレートファイル（上級者向け）

### 特徴
- ✅ 最も柔軟（PHPの全機能が使える）
- ✅ パフォーマンスが良い
- ⚠️ テーマファイルの編集が必要
- ⚠️ PHPの知識が必要

### 実装手順

#### ステップ1: テーマディレクトリに部品ファイルを作成

```
/wp-content/themes/swell-child/
└── template-parts/
    └── land-price/
        ├── header.php
        ├── footer.php
        └── summary-card.php
```

#### ステップ2: 部品ファイルの内容

**footer.php**:
```php
<?php
/**
 * 地価ページ用フッター
 */
?>
<div style="font-size: 13px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="margin: 4px 0;">※ 出典: 国土交通省 不動産情報ライブラリ（当サイトで加工して作成）</p>
    <p style="margin: 4px 0;">※ データ基準日: 2025年1月1日（令和7年公示地価）</p>
    <p style="margin: 4px 0;">※ 最終更新日: <?php echo date('Y年m月d日'); ?></p>
</div>
```

#### ステップ3: ページテンプレートで読み込む

```php
<?php
// 固定ページテンプレート内で
get_template_part('template-parts/land-price/footer');
?>
```

---

## 🎯 どの方法を選ぶべきか？

### 今回のプロジェクトでの推奨

| 方法 | 使用箇所 | 理由 |
|------|---------|------|
| **Pythonテンプレート** | **全ページ生成時** | ✅ 最も効率的（2,000ページ一括生成） |
| **再利用ブロック** | **手動で微調整する部分** | ✅ 簡単・プログラミング不要 |
| **ショートコード** | **動的な部分** | ✅ パラメータで柔軟に対応 |

### 具体的な使い分け

```
【ページ生成時（Python）】
- 全2,000ページを一括生成
- 共通パーツもPythonで埋め込む
    ↓
【WordPress上での微調整】
- 再利用ブロックで簡単に更新
- 例: データ出典の日付を変更
    ↓
【将来的な拡張】
- ショートコードで動的な部分を追加
- 例: ユーザーの検索履歴に基づく推奨ページ
```

---

## 💡 推奨アプローチ（ハイブリッド型）

### Phase 1: Python で一括生成（今）
```python
# templates/common_parts.py
def generate_footer():
    return '''<div>...</div>'''

# すべてのページに埋め込む
html = generate_prefecture_page(data) + generate_footer()
```

**メリット**:
- 2,000ページを一気に生成できる
- メンテナンスしやすい（Pythonコードを修正すれば全ページ再生成）

### Phase 2: WordPress で微調整（後で）
```
必要に応じて：
- 再利用ブロックで手動更新
- ショートコードで動的機能追加
```

---

## 📝 実装例：Pythonテンプレート + 共通パーツ

### 現在の構造
```
wordpress-integration/land-price-pages/
├── templates/
│   ├── common_parts.py        ← 共通パーツ定義
│   ├── prefecture_template.py ← 都道府県ページテンプレート
│   └── city_template.py       ← 市区町村ページテンプレート（未作成）
├── create_all_prefectures.py  ← 47都道府県生成スクリプト
└── prefecture_ranking_data.json
```

### 使い方
```python
# 共通パーツをインポート
from templates.common_parts import generate_footer, generate_summary_card

# 都道府県ページ生成
from templates.prefecture_template import generate_prefecture_page

data = {
    'name': '東京都',
    'avg_price': 385000,
    'change_rate': 5.2,
    # ...
}

html = generate_prefecture_page(data)

# WordPressに投稿
create_page(title='東京都 地価ランキング 2025', content=html)
```

**これで47都道府県を一気に生成！**

---

## 🔄 更新フロー

### 全ページを更新したい場合
```bash
# 1. Pythonテンプレートを修正
vim templates/common_parts.py

# 2. 全ページを再生成
python create_all_prefectures.py --update

# 3. WordPressの既存ページを上書き更新
```

### 一部だけ手動で更新したい場合
```
WordPress管理画面で該当ページを編集
```

---

## まとめ

**今回のプロジェクトでは**:
1. ✅ **Pythonテンプレート**で2,000ページを一括生成（効率的）
2. ✅ **共通パーツ**をPython関数で管理（メンテナンス性）
3. ⏳ 必要に応じてWordPressの**再利用ブロック**で微調整（柔軟性）

この方法が最もバランスが良いです！

---

**次のステップ**: 47都道府県を一括生成するスクリプトを作りますか？
