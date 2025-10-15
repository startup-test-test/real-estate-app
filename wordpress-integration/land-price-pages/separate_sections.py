#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
トップページ（ID: 1726）のセクション分離修正

修正内容:
📊 全国平均サマリーセクションと📍 地図選択セクションを明確に分離
"""

import os
import sys
import re
import requests
from pathlib import Path
from dotenv import load_dotenv

# プロジェクトルートの.envを読み込み
project_root = Path(__file__).parent.parent
env_path = project_root / '.env'
load_dotenv(env_path)

# WordPress設定
WP_SITE_URL = os.getenv('WP_SITE_URL')
WP_USERNAME = os.getenv('WP_USERNAME')
WP_APP_PASSWORD = os.getenv('WP_APP_PASSWORD')

# トップページのID
PAGE_ID = 1726


def get_page_content(page_id):
    """ページの現在のコンテンツを取得"""
    api_url = f"{WP_SITE_URL}/wp-json/wp/v2/pages/{page_id}"

    try:
        response = requests.get(
            api_url,
            auth=(WP_USERNAME, WP_APP_PASSWORD),
            timeout=30
        )

        if response.status_code == 200:
            page = response.json()
            return {
                'success': True,
                'content': page.get('content', {}).get('rendered', ''),
                'title': page.get('title', {}).get('rendered', '')
            }
        else:
            return {
                'success': False,
                'error': f"HTTP {response.status_code}"
            }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def update_page_content(page_id, content):
    """ページのコンテンツを更新"""
    api_url = f"{WP_SITE_URL}/wp-json/wp/v2/pages/{page_id}"

    data = {
        'content': content
    }

    try:
        response = requests.post(
            api_url,
            json=data,
            auth=(WP_USERNAME, WP_APP_PASSWORD),
            timeout=30
        )

        if response.status_code == 200:
            page = response.json()
            return {
                'success': True,
                'id': page['id'],
                'url': page['link']
            }
        else:
            return {
                'success': False,
                'error': f"HTTP {response.status_code}: {response.text}"
            }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def separate_sections(content):
    """
    全国平均サマリーセクションと地図選択セクションを分離

    修正内容:
    1. 全国平均サマリーセクションを独立したsectionタグで囲む
    2. 2つのセクションの間に明確な余白（margin-bottom: 48px）を追加
    """

    # 全国平均サマリーセクションのパターン
    # <!-- 全国平均地価サマリーセクション --> から </section> まで
    summary_pattern = r'(<!-- 全国平均地価サマリーセクション -->.*?</section>)'

    # 地図選択セクションの直前に余白を追加
    # 📍 都道府県別の地価を地図から選択 の前に余白を入れる

    # まず、全国平均サマリーセクションの終了タグ </section> の後に
    # 十分な余白があるか確認して、なければ追加

    def add_margin_after_summary(match):
        section_html = match.group(1)
        # セクションの最後が </section> で終わっているか確認
        if section_html.strip().endswith('</section>'):
            # margin-bottom を追加（既にあれば上書き）
            # section タグを探して margin-bottom を追加
            section_html = re.sub(
                r'(<section style="[^"]*)',
                lambda m: m.group(1) + ('; margin-bottom: 64px' if 'margin-bottom' not in m.group(1) else ''),
                section_html
            )
        return section_html

    # 全国平均サマリーセクションを探して余白を追加
    content = re.sub(summary_pattern, add_margin_after_summary, content, flags=re.DOTALL)

    # 地図選択セクションの直前にも余白を確保
    # <section で始まり、📍 都道府県別の地価を地図から選択 を含むセクション
    map_pattern = r'(<section[^>]*>.*?📍 都道府県別の地価を地図から選択)'

    def add_margin_to_map_section(match):
        section_tag = match.group(1)
        # section タグに margin-top を追加
        if '<section' in section_tag:
            section_tag = re.sub(
                r'(<section style=")',
                r'\1margin-top: 64px; ',
                section_tag
            )
        return section_tag

    content = re.sub(map_pattern, add_margin_to_map_section, content, flags=re.DOTALL)

    return content


def main():
    """メイン処理"""
    print("=" * 80)
    print("トップページ（ID: 1726）セクション分離修正")
    print("=" * 80)
    print()
    print("修正内容:")
    print("  ✅ 全国平均サマリーセクションと地図選択セクションを明確に分離")
    print("  ✅ セクション間に余白を追加（64px）")
    print()

    # 設定チェック
    if not all([WP_SITE_URL, WP_USERNAME, WP_APP_PASSWORD]):
        print("❌ WordPress設定が不完全です")
        sys.exit(1)

    print(f"WordPressサイト: {WP_SITE_URL}")
    print(f"ページID: {PAGE_ID}")
    print()

    # ステップ1: 現在のコンテンツを取得
    print("=" * 80)
    print("ステップ1: 現在のコンテンツを取得")
    print("=" * 80)
    print()

    result = get_page_content(PAGE_ID)

    if not result['success']:
        print(f"❌ ページ取得失敗: {result['error']}")
        sys.exit(1)

    print(f"✅ ページ取得成功")
    print(f"   タイトル: {result['title']}")
    print(f"   コンテンツサイズ: {len(result['content'])}文字")
    print()

    current_content = result['content']

    # ステップ2: セクション分離
    print("=" * 80)
    print("ステップ2: セクション分離")
    print("=" * 80)
    print()

    # 全国平均サマリーセクションを検索
    has_summary = '📊 日本全国2025年［令和7年］基準地価' in current_content
    has_map = '📍 都道府県別の地価を地図から選択' in current_content

    print(f"全国平均サマリーセクション: {'見つかりました' if has_summary else '見つかりませんでした'}")
    print(f"地図選択セクション: {'見つかりました' if has_map else '見つかりませんでした'}")
    print()

    if not (has_summary and has_map):
        print("⚠️  必要なセクションが見つかりませんでした")
        sys.exit(1)

    # セクション分離を適用
    updated_content = separate_sections(current_content)

    print(f"✅ セクション分離完了")
    print()

    # ステップ3: ページ更新
    print("=" * 80)
    print("ステップ3: ページ更新")
    print("=" * 80)
    print()

    update_result = update_page_content(PAGE_ID, updated_content)

    if not update_result['success']:
        print(f"❌ ページ更新失敗: {update_result['error']}")
        sys.exit(1)

    print(f"✅ ページ更新成功！")
    print(f"   ページID: {update_result['id']}")
    print(f"   URL: {update_result['url']}")
    print()

    # 完了メッセージ
    print("=" * 80)
    print("✅ セクション分離完了！")
    print("=" * 80)
    print()
    print("修正内容:")
    print("  ✅ 全国平均サマリーセクションに下余白追加（64px）")
    print("  ✅ 地図選択セクションに上余白追加（64px）")
    print("  ✅ 2つのセクションが明確に分離されました")
    print()
    print("👉 WordPressで確認してください:")
    print(f"   {update_result['url']}")


if __name__ == '__main__':
    main()
