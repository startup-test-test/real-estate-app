# WordPress 連携ツール

Claude Code から WordPress サイトを管理するためのツール集です。

## 機能

- ✅ 記事の取得・作成・更新・削除
- ✅ カテゴリー・タグの管理
- ✅ サイト構造の分析
- ✅ 内部リンクの分析
- 🔜 記事の自動生成（AI連携）
- 🔜 内部リンクの自動挿入

## セットアップ

### 1. 必要なパッケージのインストール

```bash
pip install requests python-dotenv
```

### 2. WordPress Application Password の作成

1. WordPressダッシュボードにログイン
2. **ユーザー** → **プロフィール**
3. 「アプリケーションパスワード」セクションまでスクロール
4. 新しいアプリケーションパスワード名を入力（例: `Claude Code`）
5. 「新しいアプリケーションパスワードを追加」をクリック
6. **生成されたパスワードをコピー**（一度しか表示されません）

### 3. 環境変数の設定

`.env` ファイルを作成して、認証情報を設定：

```bash
cp .env.example .env
```

`.env` ファイルを編集：

```env
WP_SITE_URL=https://ooya.tech
WP_USERNAME=あなたのユーザー名
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

**⚠️ 重要:** `.env` ファイルは `.gitignore` で除外されているため、GitHub にコミットされません。

## 使い方

### 接続テスト

```bash
cd wordpress-integration
python wp_client.py
```

成功すると、最新投稿とカテゴリーが表示されます。

### 記事一覧の取得

```bash
# 最新10件を表示
python list_posts.py

# 最新20件を表示
python list_posts.py --limit 20

# すべての記事を表示
python list_posts.py --all

# キーワードで検索
python list_posts.py --search "不動産投資"

# カテゴリーで絞り込み
python list_posts.py --category 5
```

### サイト構造の分析

```bash
python analyze_structure.py
```

以下の情報が取得されます：

- サイト全体の統計
- カテゴリー別投稿数
- よく使われているタグ
- カテゴリー・タグなしの投稿
- 最新投稿一覧
- 内部リンク分析

分析結果は `site_structure.json` に保存されます。

### Python スクリプトから使用

```python
from wp_client import WordPressClient

# クライアント初期化
client = WordPressClient()

# 記事一覧を取得
posts = client.get_posts(per_page=10)

for post in posts:
    print(f"{post['title']['rendered']} - {post['link']}")

# 新規記事を作成
new_post = client.create_post({
    'title': '新しい記事のタイトル',
    'content': '<p>記事の本文...</p>',
    'status': 'draft',  # 下書きとして保存
    'categories': [1, 5],
    'tags': [10, 12]
})

print(f"記事を作成しました: {new_post['link']}")
```

## ファイル構成

```
wordpress-integration/
├── .env                    # 認証情報（Gitignore）
├── .env.example            # 設定テンプレート
├── wp_client.py            # WordPress API クライアント
├── list_posts.py           # 記事一覧取得スクリプト
├── analyze_structure.py    # サイト構造分析ツール
├── site_structure.json     # 分析結果（自動生成）
└── README.md              # このファイル
```

## WordPress REST API リファレンス

### 投稿（Posts）

- `GET /wp-json/wp/v2/posts` - 投稿一覧を取得
- `GET /wp-json/wp/v2/posts/{id}` - 特定の投稿を取得
- `POST /wp-json/wp/v2/posts` - 新規投稿を作成
- `POST /wp-json/wp/v2/posts/{id}` - 投稿を更新
- `DELETE /wp-json/wp/v2/posts/{id}` - 投稿を削除

### カテゴリー（Categories）

- `GET /wp-json/wp/v2/categories` - カテゴリー一覧を取得
- `GET /wp-json/wp/v2/categories/{id}` - 特定のカテゴリーを取得

### タグ（Tags）

- `GET /wp-json/wp/v2/tags` - タグ一覧を取得
- `GET /wp-json/wp/v2/tags/{id}` - 特定のタグを取得

### 固定ページ（Pages）

- `GET /wp-json/wp/v2/pages` - 固定ページ一覧を取得

## セキュリティ

### 認証情報の保護

- `.env` ファイルは **絶対に GitHub にコミットしない**
- `.gitignore` で `.env` が除外されていることを確認
- Application Password は定期的に再生成を推奨

### 権限

REST API の操作には、WordPressユーザーの権限が必要です：

- **読み取り**: 認証不要（公開記事のみ）
- **作成・更新・削除**: 認証必須（編集者以上の権限）

## トラブルシューティング

### エラー: "サイトURLが設定されていません"

`.env` ファイルが正しく設定されているか確認してください。

### エラー: "HTTPエラー: 401"

Application Password が間違っているか、ユーザー名が正しくありません。

### エラー: "HTTPエラー: 403"

ユーザーに必要な権限がありません。管理者権限を持つユーザーで試してください。

### REST API が無効化されている

一部のセキュリティプラグインが REST API を無効化している場合があります。
以下のURLにアクセスして確認：

```
https://ooya.tech/wp-json/wp/v2/posts
```

JSON形式のレスポンスが返ってくれば正常です。

## 今後の機能拡張

- [ ] AI記事生成機能
- [ ] 内部リンク自動挿入
- [ ] SEO分析ツール
- [ ] 記事の一括更新
- [ ] 画像のアップロード
- [ ] バックアップ機能

## ライセンス

MIT License
