#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WordPress固定ページ（ID: 1726）の両ランキングセクションを更新するスクリプト
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
PAGE_ID = 1726

def get_current_page_content():
    """現在のページコンテンツを取得"""
    api_url = f"{WP_SITE_URL.rstrip('/')}/wp-json/wp/v2/pages/{PAGE_ID}"

    try:
        response = requests.get(
            api_url,
            auth=(WP_USERNAME, WP_APP_PASSWORD),
            timeout=30
        )

        if response.status_code == 200:
            page = response.json()
            return page.get('content', {}).get('rendered', '')
        else:
            print(f"❌ ページ取得エラー: HTTP {response.status_code}")
            return None

    except Exception as e:
        print(f"❌ エラー: {str(e)}")
        return None

def update_wordpress_page(page_id, content):
    """WordPress固定ページを更新"""
    api_url = f"{WP_SITE_URL.rstrip('/')}/wp-json/wp/v2/pages/{page_id}"

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
                'id': page.get('id'),
                'title': page.get('title', {}).get('rendered'),
                'url': page.get('link'),
                'modified': page.get('modified')
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

def main():
    """メイン処理"""
    print("=" * 80)
    print("WordPress固定ページ更新 - 両ランキングセクション（背景グラデーション削除版）")
    print("=" * 80)
    print()

    # 設定チェック
    if not all([WP_SITE_URL, WP_USERNAME, WP_APP_PASSWORD]):
        print("❌ WordPress設定が不完全です")
        print("   .env ファイルに以下を設定してください:")
        print("   - WP_SITE_URL")
        print("   - WP_USERNAME")
        print("   - WP_APP_PASSWORD")
        sys.exit(1)

    print(f"WordPressサイト: {WP_SITE_URL}")
    print(f"更新対象ページID: {PAGE_ID}")
    print()

    # 現在のページコンテンツを取得
    print("現在のページコンテンツを取得中...")
    current_content = get_current_page_content()
    if not current_content:
        sys.exit(1)
    print(f"✅ 現在のコンテンツ取得完了（{len(current_content)}文字）")
    print()

    # 新しいランキングセクションHTMLを読み込み
    prefecture_file = Path(__file__).parent / 'prefecture-ranking-section.html'
    national_file = Path(__file__).parent / 'national-ranking-section.html'

    print(f"都道府県ランキングセクション読み込み中: {prefecture_file.name}")
    try:
        with open(prefecture_file, 'r', encoding='utf-8') as f:
            prefecture_section = f.read()
    except Exception as e:
        print(f"❌ ファイル読み込みエラー: {str(e)}")
        sys.exit(1)
    print(f"✅ 都道府県ランキングセクション読み込み完了（{len(prefecture_section)}文字）")

    print(f"全国地点ランキングセクション読み込み中: {national_file.name}")
    try:
        with open(national_file, 'r', encoding='utf-8') as f:
            national_section = f.read()
    except Exception as e:
        print(f"❌ ファイル読み込みエラー: {str(e)}")
        sys.exit(1)
    print(f"✅ 全国地点ランキングセクション読み込み完了（{len(national_section)}文字）")
    print()

    # 都道府県ランキングセクションを置き換え
    pattern_prefecture = r'<!-- 都道府県基準地価ランキングセクション -->.*?</section>'
    if re.search(pattern_prefecture, current_content, re.DOTALL):
        current_content = re.sub(pattern_prefecture, prefecture_section, current_content, flags=re.DOTALL)
        print("✅ 都道府県ランキングセクションを更新しました")
    else:
        print("❌ 都道府県ランキングセクションが見つかりませんでした")
        sys.exit(1)

    # 全国地点ランキングセクションを置き換え
    pattern_national = r'<!-- 全国地点ランキングセクション -->.*?</section>'
    if re.search(pattern_national, current_content, re.DOTALL):
        current_content = re.sub(pattern_national, national_section, current_content, flags=re.DOTALL)
        print("✅ 全国地点ランキングセクションを更新しました")
    else:
        print("❌ 全国地点ランキングセクションが見つかりませんでした")
        sys.exit(1)

    print()
    print(f"更新後のコンテンツサイズ: {len(current_content)}文字")
    print()

    # ページ更新
    print("=" * 80)
    print("固定ページを更新中...")
    print("=" * 80)
    print()

    result = update_wordpress_page(PAGE_ID, current_content)

    # 結果表示
    if result['success']:
        print("✅ 固定ページの更新に成功しました！")
        print()
        print("=" * 80)
        print("更新されたページ情報")
        print("=" * 80)
        print(f"ページID: {result['id']}")
        print(f"タイトル: {result['title']}")
        print(f"URL: {result['url']}")
        print(f"更新日時: {result['modified']}")
        print()
        print("📝 変更内容:")
        print("   - 都道府県ランキングセクション: 背景グラデーション削除")
        print("   - 全国地点ランキングセクション: 背景グラデーション削除")
        print("   - ヘッダーとテーブルヘッダーをシンプルなデザインに変更")
        print()
        print(f"👉 ページURL: {result['url']}")
        print()
    else:
        print("❌ 固定ページの更新に失敗しました")
        print(f"   エラー: {result['error']}")
        sys.exit(1)

if __name__ == '__main__':
    main()
