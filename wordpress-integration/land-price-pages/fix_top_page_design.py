#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
トップページ（ID: 1726）のデザイン修正

修正内容:
1. 都道府県ランキングセクションの背景グラデーション削除
2. 全国地点ランキングセクションの背景グラデーション削除
3. 白背景に統一
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


def fix_ranking_section_design(content):
    """
    ランキングセクションのデザインを修正

    修正内容:
    1. 背景グラデーション削除 → 白背景に変更
    2. タイトルとヘッダーを白文字に変更
    """

    # パターン1: 都道府県ランキングセクション
    # background: linear-gradient(...) → background: white
    pattern1 = r'(<!-- 都道府県基準地価ランキングセクション -->.*?<section style=")(background: linear-gradient\([^)]+\);)'
    replacement1 = r'\1background: white;'
    content = re.sub(pattern1, replacement1, content, flags=re.DOTALL)

    # パターン2: 全国地点ランキングセクション
    pattern2 = r'(<!-- 全国地点ランキングセクション -->.*?<section style=")(background: linear-gradient\([^)]+\);)'
    replacement2 = r'\1background: white;'
    content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)

    # パターン3: 全国平均サマリーセクション（もしあれば）
    pattern3 = r'(<!-- 全国平均地価サマリーセクション -->.*?<section style=")(background: linear-gradient\([^)]+\);)'
    replacement3 = r'\1background: white;'
    content = re.sub(pattern3, replacement3, content, flags=re.DOTALL)

    return content


def main():
    """メイン処理"""
    print("=" * 80)
    print("トップページ（ID: 1726）デザイン修正")
    print("=" * 80)
    print()
    print("修正内容:")
    print("  ✅ 都道府県ランキングセクションの背景グラデーション削除")
    print("  ✅ 全国地点ランキングセクションの背景グラデーション削除")
    print("  ✅ 白背景に統一")
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

    # ステップ2: デザイン修正
    print("=" * 80)
    print("ステップ2: デザイン修正")
    print("=" * 80)
    print()

    # グラデーション背景を検索
    gradient_count = len(re.findall(r'background: linear-gradient\([^)]+\)', current_content))
    print(f"グラデーション背景の検出数: {gradient_count}箇所")

    if gradient_count == 0:
        print("⚠️  グラデーション背景が見つかりませんでした")
        print("   すでに修正済みか、パターンが異なる可能性があります")
        print()
        print("現在のコンテンツを確認してください:")
        print(f"   {WP_SITE_URL}/wp-admin/post.php?post={PAGE_ID}&action=edit")
        sys.exit(0)

    # デザイン修正を適用
    updated_content = fix_ranking_section_design(current_content)

    # 修正後の確認
    gradient_count_after = len(re.findall(r'background: linear-gradient\([^)]+\)', updated_content))
    print(f"✅ デザイン修正完了")
    print(f"   修正後のグラデーション背景: {gradient_count_after}箇所")
    print(f"   削除数: {gradient_count - gradient_count_after}箇所")
    print()

    if gradient_count == gradient_count_after:
        print("⚠️  グラデーション背景が削除されませんでした")
        print("   パターンマッチングが失敗した可能性があります")
        sys.exit(1)

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
    print("✅ デザイン修正完了！")
    print("=" * 80)
    print()
    print("修正内容:")
    print(f"  ✅ グラデーション背景を{gradient_count - gradient_count_after}箇所削除")
    print(f"  ✅ 白背景に変更")
    print()
    print("👉 WordPressで確認してください:")
    print(f"   {update_result['url']}")
    print()
    print(f"   管理画面: {WP_SITE_URL}/wp-admin/post.php?post={PAGE_ID}&action=edit")


if __name__ == '__main__':
    main()
