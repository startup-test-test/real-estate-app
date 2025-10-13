#!/usr/bin/env python3
"""
テスト記事作成スクリプト
下書きとして新規記事を作成します
"""

from wp_client import WordPressClient


def main():
    print("=" * 80)
    print("WordPress テスト記事作成")
    print("=" * 80)
    print()

    try:
        # クライアント初期化
        client = WordPressClient()
        print(f"サイト: {client.site_url}")
        print()

        # 記事データを準備
        post_data = {
            'title': '【テスト】Claude Codeから自動投稿されたテスト記事',
            'content': '''
<h2>これはテスト記事です</h2>

<p>この記事は、Claude CodeとWordPress REST APIを使用して自動的に作成されました。</p>

<h3>WordPress REST API連携の機能</h3>

<ul>
<li>記事の取得・検索</li>
<li>新規記事の作成</li>
<li>記事の更新・編集</li>
<li>カテゴリー・タグの管理</li>
<li>内部リンクの分析</li>
</ul>

<h3>今後の展開</h3>

<p>AI（Claude API）を活用して、以下のような機能を実装予定です：</p>

<ol>
<li>記事の自動生成</li>
<li>SEO最適化</li>
<li>内部リンクの自動挿入</li>
<li>関連記事の自動提案</li>
</ol>

<blockquote>
<p>この記事は下書きとして作成されています。公開前に内容を確認してください。</p>
</blockquote>

<p>作成日時: 2025年1月（自動生成）</p>
            '''.strip(),
            'status': 'draft',  # 下書きとして保存
            'categories': [5],  # 不動産投資の基礎知識
            'excerpt': 'Claude CodeとWordPress REST APIを使用して自動作成されたテスト記事です。',
        }

        print("記事を作成中...")
        print(f"タイトル: {post_data['title']}")
        print(f"ステータス: {post_data['status']} (下書き)")
        print(f"カテゴリー: {post_data['categories']}")
        print()

        # 記事を作成
        new_post = client.create_post(post_data)

        print("✓ 記事の作成に成功しました！")
        print()

        # レスポンスの型を確認
        if isinstance(new_post, dict):
            print(f"記事ID: {new_post['id']}")
            print(f"記事URL: {new_post['link']}")
            print(f"編集URL: https://ooya.tech/media/wp-admin/post.php?post={new_post['id']}&action=edit")
        elif isinstance(new_post, list) and len(new_post) > 0:
            print(f"記事ID: {new_post[0]['id']}")
            print(f"記事URL: {new_post[0]['link']}")
            print(f"編集URL: https://ooya.tech/media/wp-admin/post.php?post={new_post[0]['id']}&action=edit")
        else:
            print(f"レスポンス: {new_post}")

        print()
        print("※この記事は下書きとして保存されています。")
        print("※WordPressダッシュボードで確認・編集・公開できます。")
        print()

        return 0

    except Exception as e:
        print(f"エラー: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    exit(main())
