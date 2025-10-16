#!/usr/bin/env python3
"""
タイトルのスタイルを更新してWordPressに反映
"""

import os
import sys
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

# .envファイルを読み込み（親ディレクトリから）
load_dotenv(dotenv_path='../.env')

# WordPress設定
WORDPRESS_URL = os.getenv('WP_SITE_URL', 'https://ooya.tech/media')
WORDPRESS_USER = os.getenv('WP_USERNAME')
WORDPRESS_APP_PASSWORD = os.getenv('WP_APP_PASSWORD', '').replace(' ', '')
PAGE_ID = 1726

def update_page():
    """ページを更新"""

    # HTMLファイルを読み込み
    html_file = 'page_1726.html'
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # WordPress REST API エンドポイント
    url = f"{WORDPRESS_URL}/wp-json/wp/v2/pages/{PAGE_ID}"

    # 認証情報
    auth = HTTPBasicAuth(WORDPRESS_USER, WORDPRESS_APP_PASSWORD)

    # リクエストデータ
    data = {
        'content': content
    }

    # ヘッダー
    headers = {
        'Content-Type': 'application/json'
    }

    print(f"ページID {PAGE_ID} を更新中...")

    # API呼び出し
    response = requests.post(
        url,
        json=data,
        headers=headers,
        auth=auth
    )

    if response.status_code == 200:
        print(f"✅ ページID {PAGE_ID} の更新に成功しました")
        print(f"プレビューURL: {WORDPRESS_URL}/?page_id={PAGE_ID}&preview=true")
        return True
    else:
        print(f"❌ 更新に失敗しました: {response.status_code}")
        print(f"エラー: {response.text}")
        return False

if __name__ == '__main__':
    if not WORDPRESS_USER or not WORDPRESS_APP_PASSWORD:
        print("エラー: WP_USERNAME と WP_APP_PASSWORD を .env ファイルに設定してください")
        sys.exit(1)

    update_page()
