#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WordPress固定ページ（ID: 1726）で全国平均サマリーセクションを移動するスクリプト
地図選択セクションの上に配置します
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
    print("WordPress固定ページ更新 - 全国平均サマリーセクション移動")
    print("=" * 80)
    print()

    # 設定チェック
    if not all([WP_SITE_URL, WP_USERNAME, WP_APP_PASSWORD]):
        print("❌ WordPress設定が不完全です")
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

    # 新しいサマリーセクションHTMLを読み込み
    summary_file = Path(__file__).parent / 'national-summary-section.html'
    print(f"全国平均サマリーセクション読み込み中: {summary_file.name}")

    try:
        with open(summary_file, 'r', encoding='utf-8') as f:
            summary_section = f.read()
    except Exception as e:
        print(f"❌ ファイル読み込みエラー: {str(e)}")
        sys.exit(1)

    print(f"✅ 全国平均サマリーセクション読み込み完了（{len(summary_section)}文字）")
    print()

    # 既存のサマリーセクションを削除
    pattern_remove = r'<!-- 全国平均地価サマリーセクション -->.*?</section>\s*'
    if re.search(pattern_remove, current_content, re.DOTALL):
        current_content = re.sub(pattern_remove, '', current_content, flags=re.DOTALL)
        print("✅ 既存のサマリーセクションを削除しました")
    else:
        print("⚠️  既存のサマリーセクションが見つかりませんでした")

    # 地図選択セクションを探す（複数のパターンを試す）
    patterns = [
        r'(📍\s*都道府県別の地価を地図から選択)',
        r'(<h[23][^>]*>.*?📍.*?地図.*?選択.*?</h[23]>)',
        r'(<[^>]*class=["\'][^"\']*map[^"\']*["\'][^>]*>)',
    ]

    inserted = False
    for i, pattern in enumerate(patterns, 1):
        print(f"パターン{i}で検索中: {pattern[:50]}...")
        match = re.search(pattern, current_content, re.DOTALL | re.IGNORECASE)

        if match:
            print(f"✅ パターン{i}でマッチしました")
            print(f"   マッチ箇所: {match.group(0)[:100]}...")

            # マッチした位置の前にサマリーセクションを挿入
            pos = match.start()
            updated_content = current_content[:pos] + summary_section + '\n\n' + current_content[pos:]
            inserted = True
            print("✅ 地図選択セクションの前にサマリーセクションを挿入しました")
            break

    if not inserted:
        print("❌ 地図選択セクションが見つかりませんでした")
        print("   都道府県ランキングの前に配置します")

        # フォールバック: 都道府県ランキングの前に配置
        pattern_fallback = r'(<!-- 都道府県基準地価ランキングセクション -->)'
        if re.search(pattern_fallback, current_content):
            updated_content = re.sub(
                pattern_fallback,
                summary_section + '\n\n' + r'\1',
                current_content
            )
            print("✅ 都道府県ランキングセクションの前に配置しました")
        else:
            print("❌ 配置場所が見つかりませんでした")
            sys.exit(1)

    print()
    print(f"更新後のコンテンツサイズ: {len(updated_content)}文字")
    print()

    # ページ更新
    print("=" * 80)
    print("固定ページを更新中...")
    print("=" * 80)
    print()

    result = update_wordpress_page(PAGE_ID, updated_content)

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
        print("   - 全国平均サマリーセクションを移動")
        print("   - 紫のグラデーション背景を削除（白背景に変更）")
        print("   - 地図選択セクションの上に配置")
        print()
        print(f"👉 ページURL: {result['url']}")
        print()
    else:
        print("❌ 固定ページの更新に失敗しました")
        print(f"   エラー: {result['error']}")
        sys.exit(1)

if __name__ == '__main__':
    main()
