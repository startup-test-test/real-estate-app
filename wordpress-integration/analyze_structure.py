#!/usr/bin/env python3
"""
WordPress サイト構造分析ツール
記事、カテゴリー、タグの全体構造を分析します
"""

import json
from collections import defaultdict
from wp_client import WordPressClient


def analyze_site_structure(client):
    """サイト構造を分析"""

    print("=" * 80)
    print("WordPress サイト構造分析")
    print("=" * 80)
    print()

    # サイト情報を取得
    print("サイト情報を取得中...")
    site_info = client.get_site_info()
    site_name = site_info.get('name', 'Unknown')
    site_description = site_info.get('description', '')

    print(f"サイト名: {site_name}")
    print(f"説明: {site_description}")
    print(f"URL: {client.site_url}")
    print()

    # カテゴリーを取得
    print("カテゴリーを取得中...")
    categories = client.get_categories()
    print(f"カテゴリー数: {len(categories)}")
    print()

    # タグを取得
    print("タグを取得中...")
    tags = client.get_tags()
    print(f"タグ数: {len(tags)}")
    print()

    # すべての投稿を取得
    print("すべての投稿を取得中...")
    posts = client.get_all_posts()
    print(f"公開済み投稿数: {len(posts)}")
    print()

    # 分析結果
    print("=" * 80)
    print("分析結果")
    print("=" * 80)
    print()

    # カテゴリー別の投稿数
    print("【カテゴリー別投稿数】")
    print("-" * 80)
    category_map = {cat['id']: cat for cat in categories}

    for cat in sorted(categories, key=lambda x: x['count'], reverse=True):
        if cat['count'] > 0:
            print(f"  {cat['name']:30s} : {cat['count']:3d} 件 (ID: {cat['id']})")
    print()

    # タグの使用頻度
    print("【よく使われているタグ TOP 20】")
    print("-" * 80)
    top_tags = sorted(tags, key=lambda x: x['count'], reverse=True)[:20]

    for tag in top_tags:
        if tag['count'] > 0:
            print(f"  {tag['name']:30s} : {tag['count']:3d} 件 (ID: {tag['id']})")
    print()

    # 投稿の統計
    print("【投稿の統計】")
    print("-" * 80)

    # カテゴリーなしの投稿
    posts_without_category = [p for p in posts if not p.get('categories')]
    print(f"  カテゴリーなしの投稿: {len(posts_without_category)} 件")

    # タグなしの投稿
    posts_without_tags = [p for p in posts if not p.get('tags')]
    print(f"  タグなしの投稿: {len(posts_without_tags)} 件")

    # アイキャッチ画像なしの投稿
    posts_without_featured = [p for p in posts if not p.get('featured_media')]
    print(f"  アイキャッチ画像なしの投稿: {len(posts_without_featured)} 件")

    print()

    # 最近の投稿
    print("【最新投稿 10件】")
    print("-" * 80)

    for i, post in enumerate(posts[:10], 1):
        title = post['title']['rendered']
        date = post['date'][:10]  # 日付部分のみ
        post_id = post['id']

        # カテゴリー名を取得
        cat_names = []
        for cat_id in post.get('categories', []):
            if cat_id in category_map:
                cat_names.append(category_map[cat_id]['name'])

        cat_str = ', '.join(cat_names) if cat_names else 'なし'

        print(f"  {i:2d}. [{date}] {title}")
        print(f"      ID: {post_id}, カテゴリー: {cat_str}")
    print()

    # 内部リンクの分析（簡易版）
    print("【内部リンク分析】")
    print("-" * 80)

    internal_links = defaultdict(int)
    site_domain = client.site_url

    for post in posts:
        content = post['content']['rendered']

        # 簡易的に内部リンクをカウント
        link_count = content.count(site_domain)
        if link_count > 0:
            internal_links[post['id']] = link_count

    if internal_links:
        # 内部リンクが多い投稿 TOP 10
        top_linked = sorted(internal_links.items(), key=lambda x: x[1], reverse=True)[:10]

        print("  内部リンクが多い投稿 TOP 10:")
        for post_id, link_count in top_linked:
            # 投稿のタイトルを検索
            post_data = next((p for p in posts if p['id'] == post_id), None)
            if post_data:
                title = post_data['title']['rendered']
                print(f"    {title[:50]:50s} : {link_count} リンク")
    else:
        print("  内部リンクが検出されませんでした")

    print()

    # 分析結果をJSONで保存
    analysis_result = {
        'site': {
            'name': site_name,
            'description': site_description,
            'url': client.site_url
        },
        'stats': {
            'total_posts': len(posts),
            'total_categories': len(categories),
            'total_tags': len(tags),
            'posts_without_category': len(posts_without_category),
            'posts_without_tags': len(posts_without_tags),
            'posts_without_featured_image': len(posts_without_featured)
        },
        'categories': [
            {
                'id': cat['id'],
                'name': cat['name'],
                'count': cat['count'],
                'slug': cat['slug']
            }
            for cat in categories
        ],
        'top_tags': [
            {
                'id': tag['id'],
                'name': tag['name'],
                'count': tag['count'],
                'slug': tag['slug']
            }
            for tag in top_tags
        ]
    }

    # JSONファイルに保存
    output_file = 'site_structure.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(analysis_result, f, ensure_ascii=False, indent=2)

    print(f"分析結果を {output_file} に保存しました")
    print()


def main():
    try:
        client = WordPressClient()
        analyze_site_structure(client)
        return 0
    except Exception as e:
        print(f"エラー: {e}")
        return 1


if __name__ == '__main__':
    exit(main())
