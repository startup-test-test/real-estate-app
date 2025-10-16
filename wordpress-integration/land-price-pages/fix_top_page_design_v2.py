#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
トップページ（ID: 1726）のデザイン修正 v2

修正内容:
1. すべてのグラデーション背景を削除→白背景に変更
2. 各セクションのデータ出典を削除
3. ページ最下部に統一したデータ出典を追加
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


def fix_design(content):
    """
    デザイン修正

    1. グラデーション背景を削除
    2. データ出典を削除（各セクション）
    3. 統一したデータ出典をページ最下部に追加
    """

    # ========================================
    # 1. グラデーション背景を削除
    # ========================================

    # パターン1: セクションヘッダーのグラデーション（divタグ）
    # background: linear-gradient(...) → background: #f9fafb (薄いグレー)
    content = re.sub(
        r'(<div style=")(background: linear-gradient\([^)]+\);)(\s*color: white;)',
        r'\1background: #f9fafb;\3color: #111827;',  # 白背景、黒文字に変更
        content
    )

    # パターン2: テーブルヘッダーのグラデーション（trタグ）
    # background: linear-gradient(...) → background: #f9fafb
    content = re.sub(
        r'(<tr style=")(background: linear-gradient\([^)]+\);)',
        r'\1background: #f9fafb;',
        content
    )

    # ========================================
    # 2. 各セクションのデータ出典を削除
    # ========================================

    # パターン: ※ で始まる出典表記
    # 例: <p>※ 全国47都道府県の基準地価データから算出...</p>
    patterns_to_remove = [
        r'<p[^>]*>※\s*全国47都道府県の基準地価データから算出[^<]*</p>\s*',
        r'<p[^>]*>※\s*全国で最も地価が高い地点のランキング[^<]*</p>\s*',
        r'<p[^>]*>※\s*データ出典:[^<]*</p>\s*',
        r'<p[^>]*>※\s*最終更新日:[^<]*</p>\s*',
    ]

    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE)

    # ========================================
    # 3. 統一したデータ出典をページ最下部に追加
    # ========================================

    footer_html = '''

<!-- データについて -->
<section style="background: #f9fafb; border-radius: 12px; padding: 40px; margin-top: 60px; border-left: 4px solid #667eea;">
    <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 20px 0; color: #111827;">📋 データについて</h2>

    <div style="font-size: 14px; line-height: 1.8; color: #374151;">
        <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #111827;">データ出典</h3>
        <p style="margin: 0 0 16px 0;">
            <strong>国土交通省 不動産情報ライブラリ</strong><br>
            本ページに掲載している地価データは、国土交通省が公表する不動産情報ライブラリのオープンデータを使用しています。
        </p>

        <h3 style="font-size: 16px; font-weight: 600; margin: 20px 0 12px 0; color: #111827;">データ基準日</h3>
        <p style="margin: 0 0 16px 0;">
            <strong>2025年1月1日（令和7年公示地価）</strong><br>
            公示地価は毎年1月1日時点の標準地の価格を調査したものです。
        </p>

        <h3 style="font-size: 16px; font-weight: 600; margin: 20px 0 12px 0; color: #111827;">データ処理</h3>
        <p style="margin: 0 0 16px 0;">
            全国47都道府県・約1,900市区町村の基準地価データを当サイトで集計・加工しています。<br>
            平均値、変動率、ランキングなどは、複数の地点データから算出した統計値です。
        </p>

        <h3 style="font-size: 16px; font-weight: 600; margin: 20px 0 12px 0; color: #111827;">最終更新日</h3>
        <p style="margin: 0 0 16px 0;">
            <strong>2025年10月15日</strong>
        </p>

        <h3 style="font-size: 16px; font-weight: 600; margin: 20px 0 12px 0; color: #111827;">免責事項</h3>
        <p style="margin: 0; padding: 16px; background: #fff; border-radius: 8px; border: 1px solid #e5e7eb;">
            ⚠️ 本データは参考情報として提供しており、その正確性・完全性を保証するものではありません。<br>
            重要な不動産取引や投資判断を行う際は、必ず<a href="https://www.reinfolib.mlit.go.jp/" target="_blank" rel="noopener" style="color: #667eea; text-decoration: underline;">国土交通省の公式サイト</a>で最新のデータをご確認ください。
        </p>
    </div>
</section>
'''

    # ページの最後に追加
    content = content + footer_html

    return content


def main():
    """メイン処理"""
    print("=" * 80)
    print("トップページ（ID: 1726）デザイン修正 v2")
    print("=" * 80)
    print()
    print("修正内容:")
    print("  ✅ すべてのグラデーション背景を削除")
    print("  ✅ 各セクションのデータ出典を削除")
    print("  ✅ ページ最下部に統一したデータ出典を追加")
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

    # グラデーション背景の数を確認
    gradient_count_before = len(re.findall(r'background: linear-gradient\([^)]+\)', current_content))
    print(f"修正前のグラデーション背景: {gradient_count_before}箇所")

    # データ出典の数を確認
    source_count_before = len(re.findall(r'※\s*全国47都道府県', current_content))
    print(f"修正前のデータ出典表記: {source_count_before}箇所")
    print()

    # デザイン修正を適用
    updated_content = fix_design(current_content)

    # 修正後の確認
    gradient_count_after = len(re.findall(r'background: linear-gradient\([^)]+\)', updated_content))
    source_count_after = len(re.findall(r'※\s*全国47都道府県', updated_content))

    print(f"✅ デザイン修正完了")
    print(f"   グラデーション背景: {gradient_count_before} → {gradient_count_after}箇所")
    print(f"   削除数: {gradient_count_before - gradient_count_after}箇所")
    print(f"   データ出典表記: {source_count_before} → {source_count_after}箇所")
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
    print("✅ デザイン修正完了！")
    print("=" * 80)
    print()
    print("修正サマリー:")
    print(f"  ✅ グラデーション背景を{gradient_count_before - gradient_count_after}箇所削除")
    print(f"  ✅ データ出典表記を整理")
    print(f"  ✅ ページ最下部に統一したデータ出典セクションを追加")
    print()
    print("👉 WordPressで確認してください:")
    print(f"   {update_result['url']}")


if __name__ == '__main__':
    main()
