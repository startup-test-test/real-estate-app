#!/usr/bin/env python3
"""
WordPress 記事一覧取得スクリプト
すべての投稿を取得して表示します
"""

import argparse
from wp_client import WordPressClient


def main():
    parser = argparse.ArgumentParser(description='WordPress記事一覧を取得')
    parser.add_argument('--limit', type=int, default=10, help='表示件数（デフォルト: 10）')
    parser.add_argument('--all', action='store_true', help='すべての記事を取得')
    parser.add_argument('--search', type=str, help='検索キーワード')
    parser.add_argument('--category', type=int, help='カテゴリーIDで絞り込み')
    parser.add_argument('--status', type=str, default='publish',
                       help='投稿ステータス（publish, draft, private など）')
    args = parser.parse_args()

    print("=" * 80)
    print("WordPress 記事一覧取得")
    print("=" * 80)
    print()

    try:
        # クライアント初期化
        client = WordPressClient()
        print(f"サイト: {client.site_url}")
        print()

        # 記事を取得
        if args.all:
            print("すべての記事を取得中...")
            posts = client.get_all_posts(
                status=args.status,
                search=args.search,
                categories=[args.category] if args.category else None
            )
        else:
            posts = client.get_posts(
                per_page=args.limit,
                search=args.search,
                categories=[args.category] if args.category else None,
                status=args.status
            )

        print(f"取得件数: {len(posts)} 件")
        print("=" * 80)
        print()

        # 記事を表示
        for i, post in enumerate(posts, 1):
            title = post['title']['rendered']
            post_id = post['id']
            link = post['link']
            date = post['date']
            status = post['status']

            # カテゴリー
            categories_ids = post.get('categories', [])

            print(f"{i}. {title}")
            print(f"   ID: {post_id}")
            print(f"   URL: {link}")
            print(f"   日付: {date}")
            print(f"   ステータス: {status}")
            if categories_ids:
                print(f"   カテゴリーID: {categories_ids}")
            print()

    except Exception as e:
        print(f"エラー: {e}")
        return 1

    return 0


if __name__ == '__main__':
    exit(main())
