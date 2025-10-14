"""
WordPress投稿モジュール

生成したHTMLをWordPressに自動投稿する
"""

import sys
import os
import time
from typing import Dict, List, Optional

# 親ディレクトリのwp_client.pyをインポート
# land_price_generator -> 251014_1 -> 日報 -> wordpress-integration
wp_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
if wp_path not in sys.path:
    sys.path.insert(0, wp_path)

from wp_client import WordPressClient


class LandPriceWordPressPublisher:
    """地価情報ページWordPress投稿クラス"""

    def __init__(self):
        """初期化"""
        self.client = WordPressClient()

    def batch_publish_pages(self, pages: List[Dict], batch_size: int = 10,
                           delay: int = 2, status: str = "draft"):
        """
        複数のページをバッチ処理で投稿

        Args:
            pages: 投稿するページのリスト
            batch_size: 1回のバッチサイズ
            delay: バッチ間の遅延（秒）
            status: 投稿ステータス（"draft" or "publish"）
        """
        total = len(pages)
        success_count = 0
        fail_count = 0

        print(f"\n{'='*60}")
        print(f"バッチ投稿開始: {total}ページ")
        print(f"バッチサイズ: {batch_size}件ずつ")
        print(f"{'='*60}\n")

        for i in range(0, total, batch_size):
            batch = pages[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (total + batch_size - 1) // batch_size

            print(f"[バッチ {batch_num}/{total_batches}] {len(batch)}ページを投稿中...")

            for page in batch:
                try:
                    result = self._publish_page(page, status)
                    if result:
                        success_count += 1
                        print(f"  ✅ {page.get('title', '不明')}")
                    else:
                        fail_count += 1
                        print(f"  ❌ {page.get('title', '不明')} - 投稿失敗")
                except Exception as e:
                    fail_count += 1
                    print(f"  ❌ {page.get('title', '不明')} - エラー: {e}")

            # バッチ間の遅延
            if i + batch_size < total:
                print(f"  {delay}秒待機中...\n")
                time.sleep(delay)

        print(f"\n{'='*60}")
        print(f"バッチ投稿完了")
        print(f"  成功: {success_count}件")
        print(f"  失敗: {fail_count}件")
        print(f"{'='*60}\n")

        return {
            "total": total,
            "success": success_count,
            "fail": fail_count
        }

    def publish_prefecture_page(self, prefecture_name: str, html_content: str,
                               stats: Dict, status: str = "draft") -> Optional[Dict]:
        """
        都道府県ページを投稿

        Args:
            prefecture_name: 都道府県名
            html_content: 生成されたHTML
            stats: 統計データ（メタ情報用）
            status: 投稿ステータス

        Returns:
            投稿結果（投稿ID、URL等）
        """
        year = stats.get('year', '2024')
        summary = stats.get('summary', {})
        avg_price = summary.get('average_price_per_sqm', 0)
        change_rate = summary.get('change_rate', 0)

        # タイトル
        title = f"{prefecture_name}の地価・公示地価【{year}年最新】平均相場・推移グラフ・ランキング"

        # 抜粋（メタディスクリプション）
        excerpt = (
            f"{prefecture_name}の地価・公示地価の最新データ（{year}年）。"
            f"平均地価{avg_price/10000:.1f}万円/㎡、前年比{change_rate:+.1f}%。"
            f"市区町村ランキング、地価推移グラフ、坪単価相場を掲載。不動産投資の判断材料に。"
        )

        # URLスラッグ（TODO: 都道府県名をローマ字に変換）
        slug = f"land-price/{prefecture_name}"

        post_data = self._create_post_data(
            title=title,
            content=html_content,
            excerpt=excerpt,
            slug=slug,
            status=status
        )

        return self._publish_post(post_data)

    def publish_city_page(self, prefecture: str, city_name: str, html_content: str,
                         stats: Dict, status: str = "draft") -> Optional[Dict]:
        """
        市区町村ページを投稿

        Args:
            prefecture: 都道府県名
            city_name: 市区町村名
            html_content: 生成されたHTML
            stats: 統計データ
            status: 投稿ステータス

        Returns:
            投稿結果
        """
        year = stats.get('year', '2024')
        summary = stats.get('summary', {})
        avg_price = summary.get('average_price_per_sqm', 0)
        change_rate = summary.get('change_rate', 0)

        # タイトル
        title = f"{city_name}の地価・公示地価【{year}年最新】駅別・エリア別ランキング・推移グラフ"

        # 抜粋
        excerpt = (
            f"{prefecture}{city_name}の地価・公示地価（{year}年）。"
            f"平均{avg_price/10000:.1f}万円/㎡、前年比{change_rate:+.1f}%。"
            f"駅別・エリア別ランキング、過去10年の推移グラフを掲載。"
        )

        # URLスラッグ（TODO: ローマ字変換）
        slug = f"land-price/{prefecture}/{city_name}"

        post_data = self._create_post_data(
            title=title,
            content=html_content,
            excerpt=excerpt,
            slug=slug,
            status=status
        )

        return self._publish_post(post_data)

    def _publish_page(self, page: Dict, status: str = "draft") -> Optional[Dict]:
        """
        ページを投稿（汎用）

        Args:
            page: ページデータ
                - title: タイトル
                - html: HTMLコンテンツ
                - type: "prefecture" or "city"
                - prefecture: 都道府県名
                - city: 市区町村名（cityの場合のみ）
                - stats: 統計データ
            status: 投稿ステータス

        Returns:
            投稿結果
        """
        page_type = page.get('type', 'prefecture')
        html = page.get('html', '')
        stats = page.get('stats', {})

        if page_type == 'prefecture':
            prefecture = page.get('prefecture', '')
            return self.publish_prefecture_page(prefecture, html, stats, status)
        else:  # city
            prefecture = page.get('prefecture', '')
            city = page.get('city', '')
            return self.publish_city_page(prefecture, city, html, stats, status)

    def _create_post_data(self, title: str, content: str, excerpt: str,
                         slug: str, status: str = "draft") -> Dict:
        """
        WordPress投稿用のデータ構造を作成

        Args:
            title: タイトル
            content: HTMLコンテンツ
            excerpt: 抜粋（メタディスクリプション）
            slug: URLスラッグ
            status: 投稿ステータス

        Returns:
            投稿データ
        """
        return {
            'title': title,
            'content': content,
            'status': status,
            'excerpt': excerpt,
            # 'slug': slug,  # 注意: WordPressのスラッグ設定は管理画面で行う
            # カテゴリーIDは実際のWordPressのカテゴリーに合わせて設定
            # 'categories': [land_price_category_id]
        }

    def _publish_post(self, post_data: Dict) -> Optional[Dict]:
        """
        WordPressに投稿

        Args:
            post_data: 投稿データ

        Returns:
            投稿結果
        """
        try:
            result = self.client.create_post(post_data)
            return result
        except Exception as e:
            print(f"投稿エラー: {e}")
            return None

    def test_connection(self) -> bool:
        """WordPress接続テスト"""
        print("WordPress接続テスト中...")
        if self.client.test_connection():
            print("✅ 接続成功")
            return True
        else:
            print("❌ 接続失敗")
            return False


# テスト用
if __name__ == "__main__":
    print("WordPress投稿モジュール テスト\n")

    publisher = LandPriceWordPressPublisher()

    # 接続テスト
    if publisher.test_connection():
        print("\n✅ テスト完了")
    else:
        print("\n❌ 接続失敗")
