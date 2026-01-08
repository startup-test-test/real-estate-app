# 初心者向け：都道府県ページの作り方ガイド

## はじめに

このガイドでは、**プログラミング初心者の方**でも都道府県ページを作れるように、step by stepで説明します。

---

## 🎯 ゴール

最終的に作りたいもの：

```
トップページ: https://ooya.tech/land-price/
  ├── 東京都: https://ooya.tech/land-price/tokyo/
  ├── 大阪府: https://ooya.tech/land-price/osaka/
  ├── 神奈川県: https://ooya.tech/land-price/kanagawa/
  └── ...（残り44都道府県）
```

**合計47ページ**を自動で作ります。

---

## 📚 前提知識（知らなくてOK、読むだけ）

### WordPressの「固定ページ」とは？

WordPressには2種類のページがあります：

1. **投稿（ブログ記事）**: 日付順に並ぶ、ブログっぽいページ
2. **固定ページ**: 日付に関係なく独立したページ（会社概要とか）

今回作るのは**固定ページ**です。

### 「親ページ」と「子ページ」とは？

固定ページは階層構造にできます：

```
親ページ: 地価情報
├── 子ページ: 東京都
│   ├── 孫ページ: 千代田区
│   └── 孫ページ: 港区
└── 子ページ: 大阪府
    └── 孫ページ: 大阪市
```

これで**URLが階層的**になります：
- `/land-price/` （親）
- `/land-price/tokyo/` （子）
- `/land-price/tokyo/chiyoda/` （孫）

### REST APIとは？

**WordPress REST API** = プログラムからWordPressを操作できる仕組み

普通：
- ブラウザでWordPress管理画面を開く
- マウスでクリックしてページを作る

REST API：
- Pythonスクリプトを実行
- 自動で47ページ作成！

---

## 🛠️ 必要なもの

### 1. WordPress環境
- ✅ すでにある（ooya.tech）

### 2. Pythonスクリプト実行環境
- ✅ すでにある（Codespaces）

### 3. WordPress Application Password
- ✅ すでに設定済み（.envファイル）

### 4. 都道府県データ
- ✅ すでに取得済み（prefecture_ranking_data.json）

**全部そろってます！すぐ始められます！**

---

## 📝 ステップ1：データを確認する

まず、どんなデータがあるか見てみましょう。

`prefecture_ranking_data.json`の中身（一部）：

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
  {
    "rank": 2,
    "prefecture": "大阪府",
    "price_per_sqm": 195000,
    "tsubo_price": 644629,
    "change_rate": 3.8,
    "emoji": "🥈"
  }
]
```

**これを使ってページを作ります！**

---

## 📝 ステップ2：1ページだけ作ってみる（テスト）

### スクリプトファイルを作る

**ファイル名**: `create_single_prefecture_page.py`

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
都道府県ページを1ページだけ作るテストスクリプト（東京都）
"""

import os
import requests
from dotenv import load_dotenv

# .envファイルから認証情報を読み込む
load_dotenv('../.env')

WP_SITE_URL = os.getenv('WP_SITE_URL')
WP_USERNAME = os.getenv('WP_USERNAME')
WP_APP_PASSWORD = os.getenv('WP_APP_PASSWORD')

# トップページのID（親ページ）
PARENT_PAGE_ID = 1726

def create_tokyo_page():
    """東京都のページを1つだけ作る"""

    # ページのHTML内容を作成
    html_content = '''
<!-- ヘッダーセクション -->
<div style="margin-bottom: 40px;">
    <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 16px;">
        東京都の地価・公示地価【2025年最新】
    </h1>
    <div style="font-size: 14px; color: #6b7280;">
        <a href="/">ホーム</a> &gt;
        <a href="/land-price/">地価情報</a> &gt;
        <span>東京都</span>
    </div>
</div>

<!-- サマリーカード -->
<section style="margin-bottom: 48px;">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">

        <!-- カード1: 平均地価 -->
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">平均地価</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">
                385,000<span style="font-size: 14px;">円/㎡</span>
            </p>
        </div>

        <!-- カード2: 変動率 -->
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">変動率</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #16a34a;">
                ↑ +5.2<span style="font-size: 14px;">%</span>
            </p>
        </div>

        <!-- カード3: 坪単価 -->
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">坪単価</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">
                1,272,731<span style="font-size: 14px;">円/坪</span>
            </p>
        </div>

        <!-- カード4: 全国順位 -->
        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">全国順位</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">
                🥇 1<span style="font-size: 14px;">位</span>
            </p>
        </div>

    </div>
</section>

<!-- 説明文 -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
    <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">東京都の地価について</h2>
    <p style="font-size: 16px; line-height: 1.8; color: #374151;">
        東京都は日本の首都であり、全国で最も地価が高い地域です。
        2025年の平均地価は385,000円/㎡で、前年比+5.2%の上昇となっています。
        特に千代田区、港区、中央区などの都心部では高い地価となっており、
        商業地・住宅地ともに需要が高い状況が続いています。
    </p>
</section>

<!-- データ出典 -->
<div style="font-size: 13px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="margin: 4px 0;">出典: 国土交通省 不動産情報ライブラリ（当サイトで加工して作成）</p>
    <p style="margin: 4px 0;">データ基準日: 2025年1月1日（令和7年公示地価）</p>
    <p style="margin: 4px 0;">最終更新日: 2025年10月15日</p>
</div>
'''

    # WordPress REST APIのURL
    api_url = f"{WP_SITE_URL}/wp-json/wp/v2/pages"

    # 送信するデータ
    page_data = {
        'title': '東京都の地価・公示地価【2025年最新】',  # ページタイトル
        'content': html_content,  # ページの内容（HTML）
        'slug': 'tokyo',  # URLの末尾（/land-price/tokyo/）
        'status': 'draft',  # 下書きとして保存（確認してから公開）
        'parent': PARENT_PAGE_ID,  # 親ページ（地価情報トップページ）
    }

    # WordPressにリクエスト送信
    print("=" * 80)
    print("東京都ページを作成中...")
    print("=" * 80)
    print()

    response = requests.post(
        api_url,
        json=page_data,
        auth=(WP_USERNAME, WP_APP_PASSWORD),
        timeout=30
    )

    # 結果を確認
    if response.status_code == 201:
        page = response.json()
        print("✅ 東京都ページの作成に成功しました！")
        print()
        print(f"ページID: {page['id']}")
        print(f"タイトル: {page['title']['rendered']}")
        print(f"URL: {page['link']}")
        print(f"ステータス: {page['status']} （下書き）")
        print()
        print("👉 WordPress管理画面で確認してください：")
        print(f"   {WP_SITE_URL}/wp-admin/post.php?post={page['id']}&action=edit")
        print()
    else:
        print("❌ ページ作成に失敗しました")
        print(f"HTTPステータス: {response.status_code}")
        print(f"エラー内容: {response.text}")

if __name__ == '__main__':
    create_tokyo_page()
```

### スクリプトを実行してみる

```bash
cd /workspaces/real-estate-app/wordpress-integration/land-price-pages
python create_single_prefecture_page.py
```

### 実行結果の見方

成功すると、こんな表示が出ます：

```
================================================================================
東京都ページを作成中...
================================================================================

✅ 東京都ページの作成に成功しました！

ページID: 1234
タイトル: 東京都の地価・公示地価【2025年最新】
URL: https://ooya.tech/land-price/tokyo/
ステータス: draft （下書き）

👉 WordPress管理画面で確認してください：
   https://ooya.tech/wp-admin/post.php?post=1234&action=edit
```

### WordPress管理画面で確認

1. ブラウザで`https://ooya.tech/wp-admin/`を開く
2. 左メニュー「固定ページ」→「固定ページ一覧」
3. 「東京都の地価・公示地価【2025年最新】」を探す
4. クリックして開く
5. プレビューボタンを押して確認
6. 良ければ「公開」ボタンを押す

**これで1ページ完成！**

---

## 📝 ステップ3：47都道府県を一気に作る

1ページ作れたら、あとは**同じことを47回繰り返す**だけです。

### データから自動生成するスクリプト

**ファイル名**: `create_all_prefecture_pages.py`

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
47都道府県のページを一括作成
"""

import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

# .envファイルから認証情報を読み込む
load_dotenv('../.env')

WP_SITE_URL = os.getenv('WP_SITE_URL')
WP_USERNAME = os.getenv('WP_USERNAME')
WP_APP_PASSWORD = os.getenv('WP_APP_PASSWORD')
PARENT_PAGE_ID = 1726

# 都道府県データを読み込み
data_file = Path(__file__).parent / 'prefecture_ranking_data.json'
with open(data_file, 'r', encoding='utf-8') as f:
    prefecture_data = json.load(f)

# 都道府県名 → URLスラッグの対応表
PREFECTURE_SLUGS = {
    '北海道': 'hokkaido',
    '青森県': 'aomori',
    '岩手県': 'iwate',
    '宮城県': 'miyagi',
    '秋田県': 'akita',
    '山形県': 'yamagata',
    '福島県': 'fukushima',
    '茨城県': 'ibaraki',
    '栃木県': 'tochigi',
    '群馬県': 'gunma',
    '埼玉県': 'saitama',
    '千葉県': 'chiba',
    '東京都': 'tokyo',
    '神奈川県': 'kanagawa',
    '新潟県': 'niigata',
    '富山県': 'toyama',
    '石川県': 'ishikawa',
    '福井県': 'fukui',
    '山梨県': 'yamanashi',
    '長野県': 'nagano',
    '岐阜県': 'gifu',
    '静岡県': 'shizuoka',
    '愛知県': 'aichi',
    '三重県': 'mie',
    '滋賀県': 'shiga',
    '京都府': 'kyoto',
    '大阪府': 'osaka',
    '兵庫県': 'hyogo',
    '奈良県': 'nara',
    '和歌山県': 'wakayama',
    '鳥取県': 'tottori',
    '島根県': 'shimane',
    '岡山県': 'okayama',
    '広島県': 'hiroshima',
    '山口県': 'yamaguchi',
    '徳島県': 'tokushima',
    '香川県': 'kagawa',
    '愛媛県': 'ehime',
    '高知県': 'kochi',
    '福岡県': 'fukuoka',
    '佐賀県': 'saga',
    '長崎県': 'nagasaki',
    '熊本県': 'kumamoto',
    '大分県': 'oita',
    '宮崎県': 'miyazaki',
    '鹿児島県': 'kagoshima',
    '沖縄県': 'okinawa',
}

def generate_prefecture_html(pref):
    """都道府県ページのHTMLを生成"""
    name = pref['prefecture']
    rank = pref['rank']
    emoji = pref['emoji']
    price = pref['price_per_sqm']
    tsubo_price = pref['tsubo_price']
    change_rate = pref['change_rate']

    # 変動の判定
    if change_rate > 0:
        change_arrow = '↑'
        change_color = '#16a34a'
    elif change_rate < 0:
        change_arrow = '↓'
        change_color = '#dc2626'
    else:
        change_arrow = '→'
        change_color = '#6b7280'

    html = f'''
<!-- ヘッダーセクション -->
<div style="margin-bottom: 40px;">
    <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 16px;">
        {name}の地価・公示地価【2025年最新】
    </h1>
    <div style="font-size: 14px; color: #6b7280;">
        <a href="/">ホーム</a> &gt;
        <a href="/land-price/">地価情報</a> &gt;
        <span>{name}</span>
    </div>
</div>

<!-- サマリーカード -->
<section style="margin-bottom: 48px;">
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">平均地価</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">
                {price:,}<span style="font-size: 14px;">円/㎡</span>
            </p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">変動率</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: {change_color};">
                {change_arrow} {change_rate:+.2f}<span style="font-size: 14px;">%</span>
            </p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">坪単価</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">
                {tsubo_price:,}<span style="font-size: 14px;">円/坪</span>
            </p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0;">全国順位</p>
            <p style="font-size: 28px; font-weight: 700; margin: 0; color: #111827;">
                {emoji} {rank}<span style="font-size: 14px;">位</span>
            </p>
        </div>

    </div>
</section>

<!-- 説明文 -->
<section style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 48px;">
    <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">{name}の地価について</h2>
    <p style="font-size: 16px; line-height: 1.8; color: #374151;">
        {name}の2025年平均地価は{price:,}円/㎡で、全国{rank}位となっています。
        前年比{change_rate:+.2f}%の{"上昇" if change_rate > 0 else "下落" if change_rate < 0 else "横ばい"}となっています。
    </p>
</section>

<!-- データ出典 -->
<div style="font-size: 13px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="margin: 4px 0;">出典: 国土交通省 不動産情報ライブラリ（当サイトで加工して作成）</p>
    <p style="margin: 4px 0;">データ基準日: 2025年1月1日（令和7年公示地価）</p>
    <p style="margin: 4px 0;">最終更新日: 2025年10月15日</p>
</div>
'''

    return html

def create_prefecture_page(pref):
    """都道府県ページを作成"""
    name = pref['prefecture']
    slug = PREFECTURE_SLUGS.get(name)

    if not slug:
        print(f"⚠️  スキップ: {name} （スラッグが見つかりません）")
        return None

    html = generate_prefecture_html(pref)

    api_url = f"{WP_SITE_URL}/wp-json/wp/v2/pages"

    page_data = {
        'title': f"{name}の地価・公示地価【2025年最新】",
        'content': html,
        'slug': slug,
        'status': 'draft',  # 下書き
        'parent': PARENT_PAGE_ID,
    }

    response = requests.post(
        api_url,
        json=page_data,
        auth=(WP_USERNAME, WP_APP_PASSWORD),
        timeout=30
    )

    if response.status_code == 201:
        page = response.json()
        print(f"✅ {name:8s} - {page['link']}")
        return page['id']
    else:
        print(f"❌ {name:8s} - エラー: {response.status_code}")
        return None

def main():
    print("=" * 80)
    print("47都道府県ページ一括作成")
    print("=" * 80)
    print()

    success_count = 0

    for pref in prefecture_data:
        page_id = create_prefecture_page(pref)
        if page_id:
            success_count += 1

    print()
    print("=" * 80)
    print(f"✅ 処理完了: {success_count}/{len(prefecture_data)}ページ作成")
    print("=" * 80)
    print()
    print("👉 WordPress管理画面で確認してください：")
    print(f"   {WP_SITE_URL}/wp-admin/edit.php?post_type=page")

if __name__ == '__main__':
    main()
```

### 実行する

```bash
cd /workspaces/real-estate-app/wordpress-integration/land-price-pages
python create_all_prefecture_pages.py
```

### 実行結果

```
================================================================================
47都道府県ページ一括作成
================================================================================

✅ 北海道     - https://ooya.tech/land-price/hokkaido/
✅ 青森県     - https://ooya.tech/land-price/aomori/
✅ 岩手県     - https://ooya.tech/land-price/iwate/
...
✅ 東京都     - https://ooya.tech/land-price/tokyo/
...
✅ 沖縄県     - https://ooya.tech/land-price/okinawa/

================================================================================
✅ 処理完了: 47/47ページ作成
================================================================================

👉 WordPress管理画面で確認してください：
   https://ooya.tech/wp-admin/edit.php?post_type=page
```

**これで47ページ完成！**

---

## 🎉 完成！

これで、手作業なら166時間かかる作業が**数分で完了**しました！

---

## 🤔 よくある質問

### Q1: エラーが出たらどうする？

**A1**: エラーメッセージを確認してください。

- `HTTPエラー: 401` → パスワードが間違っている（.envファイル確認）
- `HTTPエラー: 403` → 権限がない（管理者アカウントか確認）
- `HTTPエラー: 500` → WordPress側の問題（しばらく待って再実行）

### Q2: ページが重複したらどうする？

**A2**: WordPressは同じスラッグのページを複数作れません。

もし再実行して重複エラーが出たら、既存ページを削除してから再実行してください。

### Q3: 内容を変更したい

**A3**: スクリプトのHTMLを編集して、もう一度実行してください。

既存ページを更新する場合は、`POST`ではなく`PUT`メソッドを使います（別途説明）。

---

## 📚 次のステップ

1. ✅ 1ページ作成（テスト）
2. ✅ 47ページ一括作成
3. 🔜 市区町村ページ作成（約1,900ページ）
4. 🔜 自動更新スクリプト作成

---

## 💡 理解度チェック

以下の質問に答えられますか？

1. 固定ページと投稿の違いは？
2. 親ページと子ページの関係は？
3. REST APIとは何？
4. スクリプトがやっていることは？

答えられたら完璧です！👏

---

**作成者**: Claude Code
**更新日**: 2025年10月15日
