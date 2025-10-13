"""
WordPress REST API クライアント
記事の取得、作成、更新、削除などの操作を行う
"""

import os
import json
import requests
from typing import Dict, List, Optional, Any
from base64 import b64encode
from dotenv import load_dotenv

# .env ファイルの読み込み
load_dotenv()


class WordPressClient:
    """WordPress REST API クライアント"""

    def __init__(
        self,
        site_url: Optional[str] = None,
        username: Optional[str] = None,
        app_password: Optional[str] = None
    ):
        """
        初期化

        Args:
            site_url: WordPressサイトのURL（例: https://ooya.tech）
            username: WordPressのユーザー名
            app_password: Application Password
        """
        self.site_url = site_url or os.getenv('WP_SITE_URL')
        self.username = username or os.getenv('WP_USERNAME')
        self.app_password = app_password or os.getenv('WP_APP_PASSWORD')

        if not self.site_url:
            raise ValueError("サイトURLが設定されていません")

        # URLの末尾のスラッシュを削除
        self.site_url = self.site_url.rstrip('/')

        # パーマリンクが正しく設定されていない場合のために、
        # ?rest_route= 形式を使用（両方試すフォールバック機能を追加）
        self.use_query_string = True  # デフォルトでクエリ文字列形式を使用

        # 認証ヘッダーの設定（username/passwordがある場合）
        self.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'ClaudeCode-Authorized/1.0'  # カスタム User-Agent
        }

        if self.username and self.app_password:
            # Application Passwordの場合、スペースを削除
            clean_password = self.app_password.replace(' ', '')
            credentials = f"{self.username}:{clean_password}"
            token = b64encode(credentials.encode()).decode('utf-8')
            self.headers['Authorization'] = f'Basic {token}'

    def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict] = None,
        data: Optional[Dict] = None
    ) -> Any:
        """
        APIリクエストを実行

        Args:
            method: HTTPメソッド（GET, POST, PUT, DELETE）
            endpoint: エンドポイント（例: /posts）
            params: クエリパラメータ
            data: リクエストボディ

        Returns:
            APIレスポンス
        """
        # ?rest_route= 形式のURLを構築
        # エンドポイントの先頭のスラッシュを削除
        clean_endpoint = endpoint.lstrip('/')

        # パラメータの準備
        if params is None:
            params = {}

        # rest_route パラメータを追加
        params['rest_route'] = f'/wp/v2/{clean_endpoint}'

        # ベースURL
        url = self.site_url

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                params=params,
                json=data,
                timeout=30
            )

            # エラーチェック
            response.raise_for_status()

            return response.json()

        except requests.exceptions.HTTPError as e:
            error_msg = f"HTTPエラー: {e}"
            if response.text:
                try:
                    error_data = response.json()
                    error_msg = f"HTTPエラー: {error_data.get('message', str(e))}"
                except:
                    pass
            raise Exception(error_msg) from e
        except requests.exceptions.RequestException as e:
            raise Exception(f"リクエストエラー: {e}") from e

    # ========================================
    # 投稿（Posts）関連
    # ========================================

    def get_posts(
        self,
        per_page: int = 10,
        page: int = 1,
        search: Optional[str] = None,
        categories: Optional[List[int]] = None,
        tags: Optional[List[int]] = None,
        status: str = 'publish'
    ) -> List[Dict]:
        """
        投稿一覧を取得

        Args:
            per_page: 1ページあたりの件数（最大100）
            page: ページ番号
            search: 検索キーワード
            categories: カテゴリーIDのリスト
            tags: タグIDのリスト
            status: 投稿ステータス（publish, draft, private, など）

        Returns:
            投稿のリスト
        """
        params = {
            'per_page': min(per_page, 100),
            'page': page,
            'status': status
        }

        if search:
            params['search'] = search
        if categories:
            params['categories'] = ','.join(map(str, categories))
        if tags:
            params['tags'] = ','.join(map(str, tags))

        return self._make_request('GET', '/posts', params=params)

    def get_all_posts(self, status: str = 'publish', **kwargs) -> List[Dict]:
        """
        すべての投稿を取得（ページネーション自動処理）

        Args:
            status: 投稿ステータス
            **kwargs: get_postsに渡すその他の引数

        Returns:
            すべての投稿のリスト
        """
        all_posts = []
        page = 1

        while True:
            try:
                posts = self.get_posts(per_page=100, page=page, status=status, **kwargs)

                if not posts or len(posts) == 0:
                    break

                all_posts.extend(posts)
                page += 1
            except Exception as e:
                # ページ数オーバーのエラーは正常終了として扱う
                if "存在するページ数を上回っています" in str(e) or "400" in str(e):
                    break
                else:
                    raise

        return all_posts

    def get_post(self, post_id: int) -> Dict:
        """
        特定の投稿を取得

        Args:
            post_id: 投稿ID

        Returns:
            投稿データ
        """
        return self._make_request('GET', f'/posts/{post_id}')

    def create_post(self, post_data: Dict) -> Dict:
        """
        新しい投稿を作成

        Args:
            post_data: 投稿データ
                - title: タイトル（必須）
                - content: 本文
                - status: ステータス（draft, publish, など）
                - categories: カテゴリーIDのリスト
                - tags: タグIDのリスト
                - excerpt: 抜粋
                - featured_media: アイキャッチ画像ID

        Returns:
            作成された投稿データ
        """
        if not self.username or not self.app_password:
            raise Exception("投稿の作成には認証が必要です")

        return self._make_request('POST', '/posts', data=post_data)

    def update_post(self, post_id: int, post_data: Dict) -> Dict:
        """
        投稿を更新

        Args:
            post_id: 投稿ID
            post_data: 更新する投稿データ

        Returns:
            更新された投稿データ
        """
        if not self.username or not self.app_password:
            raise Exception("投稿の更新には認証が必要です")

        return self._make_request('POST', f'/posts/{post_id}', data=post_data)

    def delete_post(self, post_id: int, force: bool = False) -> Dict:
        """
        投稿を削除

        Args:
            post_id: 投稿ID
            force: True の場合は完全に削除、False の場合はゴミ箱へ

        Returns:
            削除結果
        """
        if not self.username or not self.app_password:
            raise Exception("投稿の削除には認証が必要です")

        params = {'force': force}
        return self._make_request('DELETE', f'/posts/{post_id}', params=params)

    # ========================================
    # カテゴリー関連
    # ========================================

    def get_categories(self, per_page: int = 100) -> List[Dict]:
        """
        カテゴリー一覧を取得

        Args:
            per_page: 1ページあたりの件数

        Returns:
            カテゴリーのリスト
        """
        return self._make_request('GET', '/categories', params={'per_page': per_page})

    def get_category(self, category_id: int) -> Dict:
        """
        特定のカテゴリーを取得

        Args:
            category_id: カテゴリーID

        Returns:
            カテゴリーデータ
        """
        return self._make_request('GET', f'/categories/{category_id}')

    # ========================================
    # タグ関連
    # ========================================

    def get_tags(self, per_page: int = 100) -> List[Dict]:
        """
        タグ一覧を取得

        Args:
            per_page: 1ページあたりの件数

        Returns:
            タグのリスト
        """
        return self._make_request('GET', '/tags', params={'per_page': per_page})

    def get_tag(self, tag_id: int) -> Dict:
        """
        特定のタグを取得

        Args:
            tag_id: タグID

        Returns:
            タグデータ
        """
        return self._make_request('GET', f'/tags/{tag_id}')

    # ========================================
    # ページ関連
    # ========================================

    def get_pages(self, per_page: int = 10, page: int = 1) -> List[Dict]:
        """
        固定ページ一覧を取得

        Args:
            per_page: 1ページあたりの件数
            page: ページ番号

        Returns:
            固定ページのリスト
        """
        params = {'per_page': per_page, 'page': page}
        return self._make_request('GET', '/pages', params=params)

    # ========================================
    # ユーティリティ
    # ========================================

    def test_connection(self) -> bool:
        """
        接続テスト

        Returns:
            接続成功の場合 True
        """
        try:
            self.get_posts(per_page=1)
            return True
        except Exception as e:
            print(f"接続エラー: {e}")
            return False

    def get_site_info(self) -> Dict:
        """
        サイト情報を取得

        Returns:
            サイト情報
        """
        # ?rest_route=/ 形式を使用
        url = f"{self.site_url}/?rest_route=/"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.json()


if __name__ == '__main__':
    # テスト実行
    print("WordPress API クライアントのテスト")
    print("=" * 50)

    try:
        client = WordPressClient()

        print(f"サイトURL: {client.site_url}")
        print(f"API形式: ?rest_route= (クエリ文字列形式)")
        print()

        # 接続テスト
        print("接続テスト中...")
        if client.test_connection():
            print("✓ 接続成功")
        else:
            print("✗ 接続失敗")
            exit(1)

        print()

        # 投稿数を取得
        posts = client.get_posts(per_page=5)
        print(f"最新投稿 {len(posts)} 件:")
        for post in posts:
            print(f"  - {post['title']['rendered']} (ID: {post['id']})")

        print()

        # カテゴリーを取得
        categories = client.get_categories()
        print(f"カテゴリー {len(categories)} 件:")
        for cat in categories[:10]:
            print(f"  - {cat['name']} (ID: {cat['id']}, 投稿数: {cat['count']})")

    except Exception as e:
        print(f"エラー: {e}")
