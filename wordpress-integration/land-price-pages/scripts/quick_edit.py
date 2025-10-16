#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WordPress固定ページのHTMLを直接修正する簡易スクリプト

使い方:
1. HTMLファイルを編集
2. このスクリプトで一発更新

例:
python quick_edit.py 1726 page_1726.html
"""

import os
import sys
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


def get_page_html(page_id):
    """ページのHTMLを取得してファイルに保存"""
    api_url = f"{WP_SITE_URL}/wp-json/wp/v2/pages/{page_id}"

    response = requests.get(
        api_url,
        auth=(WP_USERNAME, WP_APP_PASSWORD),
        timeout=30
    )

    if response.status_code == 200:
        page = response.json()
        content = page.get('content', {}).get('rendered', '')

        # HTMLファイルに保存
        output_file = f"page_{page_id}.html"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ HTML取得成功")
        print(f"   ページID: {page_id}")
        print(f"   タイトル: {page.get('title', {}).get('rendered', '')}")
        print(f"   保存先: {output_file}")
        print()
        print(f"👉 次のステップ:")
        print(f"   1. {output_file} をエディタで編集")
        print(f"   2. python quick_edit.py {page_id} {output_file} で更新")

        return True
    else:
        print(f"❌ エラー: HTTP {response.status_code}")
        return False


def update_page_html(page_id, html_file):
    """HTMLファイルからページを更新"""
    if not os.path.exists(html_file):
        print(f"❌ ファイルが見つかりません: {html_file}")
        return False

    # HTMLを読み込み
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    api_url = f"{WP_SITE_URL}/wp-json/wp/v2/pages/{page_id}"

    data = {
        'content': content
    }

    response = requests.post(
        api_url,
        json=data,
        auth=(WP_USERNAME, WP_APP_PASSWORD),
        timeout=30
    )

    if response.status_code == 200:
        page = response.json()
        print(f"✅ ページ更新成功！")
        print(f"   ページID: {page['id']}")
        print(f"   URL: {page['link']}")
        return True
    else:
        print(f"❌ エラー: HTTP {response.status_code}")
        print(f"   詳細: {response.text}")
        return False


def main():
    """メイン処理"""
    if len(sys.argv) < 2:
        print("使い方:")
        print("  python quick_edit.py <ページID>              # HTMLを取得")
        print("  python quick_edit.py <ページID> <HTMLファイル>  # HTMLで更新")
        print()
        print("例:")
        print("  python quick_edit.py 1726")
        print("  python quick_edit.py 1726 page_1726.html")
        sys.exit(1)

    page_id = sys.argv[1]

    # 設定チェック
    if not all([WP_SITE_URL, WP_USERNAME, WP_APP_PASSWORD]):
        print("❌ WordPress設定が不完全です")
        sys.exit(1)

    if len(sys.argv) == 2:
        # HTMLを取得
        get_page_html(page_id)
    else:
        # HTMLで更新
        html_file = sys.argv[2]
        update_page_html(page_id, html_file)


if __name__ == '__main__':
    main()
