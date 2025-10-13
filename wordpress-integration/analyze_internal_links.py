#!/usr/bin/env python3
"""
内部リンク構造分析ツール
全記事を取得して、内部リンクの構造を分析し、最適化の提案を行います
"""

import json
import re
from collections import defaultdict
from typing import Dict, List, Set
from wp_client import WordPressClient
from urllib.parse import urlparse


def extract_internal_links(content: str, site_url: str) -> List[str]:
    """
    記事本文からサイト内の内部リンクを抽出

    Args:
        content: 記事本文HTML
        site_url: サイトのベースURL

    Returns:
        内部リンクのURLリスト
    """
    # <a href="..."> タグからURLを抽出
    link_pattern = r'<a[^>]+href=["\']([^"\']+)["\']'
    links = re.findall(link_pattern, content)

    # サイト内リンクのみをフィルタ
    internal_links = []
    for link in links:
        if site_url in link or link.startswith('/'):
            internal_links.append(link)

    return internal_links


def analyze_internal_links(client: WordPressClient):
    """内部リンク構造を分析"""

    print("=" * 80)
    print("内部リンク構造分析")
    print("=" * 80)
    print()

    print("全記事を取得中...")
    posts = client.get_all_posts()
    print(f"✓ {len(posts)}件の記事を取得しました")
    print()

    # 記事データの整理
    post_map = {}  # ID -> 記事データ
    url_to_id = {}  # URL -> 記事ID

    for post in posts:
        post_id = post['id']
        post_url = post['link']
        post_map[post_id] = {
            'id': post_id,
            'title': post['title']['rendered'],
            'url': post_url,
            'content': post['content']['rendered'],
            'excerpt': post['excerpt']['rendered'],
            'categories': post.get('categories', []),
            'tags': post.get('tags', []),
        }
        url_to_id[post_url] = post_id

    # 内部リンク構造の分析
    print("内部リンク構造を分析中...")

    link_graph = defaultdict(list)  # 記事ID -> リンク先記事IDのリスト
    backlinks = defaultdict(list)   # 記事ID -> 被リンク元記事IDのリスト
    orphan_posts = []  # 孤立記事（被リンクなし）
    hub_posts = []     # ハブ記事（多くの記事からリンクされている）

    site_url = client.site_url

    for post_id, post_data in post_map.items():
        content = post_data['content']
        links = extract_internal_links(content, site_url)

        for link in links:
            # リンク先の記事IDを特定
            if link in url_to_id:
                target_id = url_to_id[link]
                link_graph[post_id].append(target_id)
                backlinks[target_id].append(post_id)

    # 孤立記事の検出（被リンクが0の記事）
    for post_id in post_map.keys():
        if len(backlinks[post_id]) == 0:
            orphan_posts.append(post_id)

    # ハブ記事の検出（被リンクが多い記事）
    hub_posts = sorted(
        [(post_id, len(backlinks[post_id])) for post_id in post_map.keys()],
        key=lambda x: x[1],
        reverse=True
    )[:10]

    print("✓ 分析完了")
    print()

    # 結果の表示
    print("=" * 80)
    print("【分析結果】")
    print("=" * 80)
    print()

    # 全体統計
    total_posts = len(posts)
    total_links = sum(len(links) for links in link_graph.values())
    avg_links = total_links / total_posts if total_posts > 0 else 0

    print("📊 全体統計")
    print("-" * 80)
    print(f"  総記事数: {total_posts}件")
    print(f"  総内部リンク数: {total_links}個")
    print(f"  記事あたりの平均リンク数: {avg_links:.1f}個")
    print(f"  孤立記事数: {len(orphan_posts)}件")
    print()

    # ハブ記事（多くの記事からリンクされている）
    print("🌟 ハブ記事 TOP 10（被リンクが多い記事）")
    print("-" * 80)
    for i, (post_id, backlink_count) in enumerate(hub_posts, 1):
        if backlink_count == 0:
            break
        post = post_map[post_id]
        print(f"  {i:2d}. {post['title']}")
        print(f"      被リンク数: {backlink_count}件 | ID: {post_id}")
        print(f"      URL: {post['url']}")
    print()

    # 孤立記事（被リンクがない記事）
    print("⚠️  孤立記事（内部リンクがない記事）")
    print("-" * 80)
    if len(orphan_posts) > 0:
        print(f"  {len(orphan_posts)}件の孤立記事が見つかりました")
        print()
        for i, post_id in enumerate(orphan_posts[:10], 1):
            post = post_map[post_id]
            print(f"  {i:2d}. {post['title']}")
            print(f"      ID: {post_id}")
            print(f"      URL: {post['url']}")
    else:
        print("  ✓ 孤立記事はありません")
    print()

    # リンクが少ない記事
    print("🔗 発リンクが少ない記事 TOP 10")
    print("-" * 80)
    low_link_posts = sorted(
        [(post_id, len(link_graph[post_id])) for post_id in post_map.keys()],
        key=lambda x: x[1]
    )[:10]

    for i, (post_id, link_count) in enumerate(low_link_posts, 1):
        post = post_map[post_id]
        print(f"  {i:2d}. {post['title']}")
        print(f"      発リンク数: {link_count}個 | ID: {post_id}")
    print()

    # 結果をJSONで保存
    result = {
        'summary': {
            'total_posts': total_posts,
            'total_internal_links': total_links,
            'average_links_per_post': avg_links,
            'orphan_posts_count': len(orphan_posts),
        },
        'hub_posts': [
            {
                'id': post_id,
                'title': post_map[post_id]['title'],
                'url': post_map[post_id]['url'],
                'backlink_count': count
            }
            for post_id, count in hub_posts if count > 0
        ],
        'orphan_posts': [
            {
                'id': post_id,
                'title': post_map[post_id]['title'],
                'url': post_map[post_id]['url']
            }
            for post_id in orphan_posts
        ],
        'link_graph': {
            str(post_id): {
                'title': post_map[post_id]['title'],
                'outbound_links': len(link_graph[post_id]),
                'inbound_links': len(backlinks[post_id]),
                'links_to': [post_map[target_id]['title'] for target_id in link_graph[post_id]]
            }
            for post_id in post_map.keys()
        }
    }

    output_file = 'internal_links_analysis.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"✓ 分析結果を {output_file} に保存しました")
    print()

    # 改善提案
    print("=" * 80)
    print("【改善提案】")
    print("=" * 80)
    print()

    if len(orphan_posts) > 0:
        print("1. 孤立記事への内部リンクを追加")
        print(f"   → {len(orphan_posts)}件の記事が他の記事からリンクされていません")
        print("   → 関連する記事から内部リンクを追加することをお勧めします")
        print()

    if avg_links < 3:
        print("2. 記事あたりの内部リンク数を増やす")
        print(f"   → 現在の平均: {avg_links:.1f}個/記事")
        print("   → 推奨: 3-5個/記事")
        print("   → 関連記事へのリンクを積極的に追加しましょう")
        print()

    print("3. ハブ記事を活用")
    print("   → 人気のあるハブ記事から他の記事へのリンクを増やすと、")
    print("     全体のページビューを増やせる可能性があります")
    print()


def main():
    try:
        client = WordPressClient()
        analyze_internal_links(client)
        return 0
    except Exception as e:
        print(f"エラー: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    exit(main())
