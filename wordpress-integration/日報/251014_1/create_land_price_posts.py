"""
地価情報ページをWordPressに自動投稿するスクリプト
"""

import sys
import os

# 親ディレクトリのwp_client.pyをインポートできるようにパスを追加
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from wp_client import WordPressClient


def read_html_file(filename):
    """HTMLファイルを読み込む"""
    filepath = os.path.join(os.path.dirname(__file__), 'sample-pages', filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def create_tokyo_prefecture_post(client):
    """東京都ページを投稿"""
    print("=" * 60)
    print("1. 東京都ページを投稿中...")
    print("=" * 60)

    html_content = read_html_file('01_tokyo.html')

    post_data = {
        'title': '東京都の地価・公示地価【2025年最新】平均相場・推移グラフ・ランキング',
        'content': html_content,
        'status': 'draft',  # まず下書きとして作成
        'excerpt': '東京都の地価・公示地価の最新データ（2025年）。平均地価130.2万円/㎡、前年比+7.7%。市区町村ランキング、地価推移グラフ、坪単価相場を掲載。不動産投資の判断材料に。',
        # カテゴリーIDは実際のWordPressのカテゴリーIDに合わせて調整が必要
        # 'categories': [1],  # 例: 「地価情報」カテゴリーのID
    }

    try:
        result = client.create_post(post_data)
        print(f"✅ 投稿成功!")
        print(f"   投稿ID: {result['id']}")
        print(f"   タイトル: {result['title']['rendered']}")
        print(f"   URL: {result['link']}")
        print(f"   ステータス: {result['status']}")
        print()
        return result
    except Exception as e:
        print(f"❌ 投稿失敗: {e}")
        print()
        return None


def create_chiyoda_post(client):
    """千代田区ページを投稿"""
    print("=" * 60)
    print("2. 千代田区ページを投稿中...")
    print("=" * 60)

    html_content = read_html_file('02_chiyoda.html')

    post_data = {
        'title': '千代田区の地価・公示地価【2025年最新】駅別・エリア別ランキング・推移グラフ',
        'content': html_content,
        'status': 'draft',
        'excerpt': '千代田区の地価・公示地価（2025年）。平均617.5万円/㎡、前年比+13.9%。駅別・エリア別ランキング、過去10年の推移グラフ、最高額・最低額地点を掲載。',
    }

    try:
        result = client.create_post(post_data)
        print(f"✅ 投稿成功!")
        print(f"   投稿ID: {result['id']}")
        print(f"   タイトル: {result['title']['rendered']}")
        print(f"   URL: {result['link']}")
        print(f"   ステータス: {result['status']}")
        print()
        return result
    except Exception as e:
        print(f"❌ 投稿失敗: {e}")
        print()
        return None


def create_chuo_post(client):
    """中央区ページを投稿"""
    print("=" * 60)
    print("3. 中央区ページを投稿中...")
    print("=" * 60)

    html_content = read_html_file('03_chuo.html')

    post_data = {
        'title': '中央区の地価・公示地価【2025年最新】東京都内1位・銀座・日本橋エリア詳細分析',
        'content': html_content,
        'status': 'draft',
        'excerpt': '中央区の地価・公示地価（2025年）。平均653.0万円/㎡、前年比+8.5%で東京都内1位。銀座・日本橋エリアの詳細データを掲載。',
    }

    try:
        result = client.create_post(post_data)
        print(f"✅ 投稿成功!")
        print(f"   投稿ID: {result['id']}")
        print(f"   タイトル: {result['title']['rendered']}")
        print(f"   URL: {result['link']}")
        print(f"   ステータス: {result['status']}")
        print()
        return result
    except Exception as e:
        print(f"❌ 投稿失敗: {e}")
        print()
        return None


def main():
    """メイン処理"""
    print("=" * 60)
    print("地価情報ページ WordPress自動投稿スクリプト")
    print("=" * 60)
    print()

    try:
        # WordPressクライアント初期化
        print("WordPressに接続中...")
        client = WordPressClient()
        print(f"サイトURL: {client.site_url}")
        print()

        # 接続テスト
        if not client.test_connection():
            print("❌ WordPress接続に失敗しました")
            return

        print("✅ WordPress接続成功")
        print()

        # 3つの投稿を作成
        results = []

        # 1. 東京都ページ
        result1 = create_tokyo_prefecture_post(client)
        if result1:
            results.append(result1)

        # 2. 千代田区ページ
        result2 = create_chiyoda_post(client)
        if result2:
            results.append(result2)

        # 3. 中央区ページ
        result3 = create_chuo_post(client)
        if result3:
            results.append(result3)

        # 結果サマリー
        print("=" * 60)
        print("投稿完了サマリー")
        print("=" * 60)
        print(f"成功: {len(results)} 件")
        print(f"失敗: {3 - len(results)} 件")
        print()

        if results:
            print("作成された投稿:")
            for i, result in enumerate(results, 1):
                print(f"{i}. {result['title']['rendered']}")
                print(f"   URL: {result['link']}")
                print()

            print("⚠️ 注意:")
            print("- すべて「下書き」として作成されました")
            print("- WordPress管理画面で内容を確認してから「公開」してください")
            print("- パーマリンク（URL）を適切に設定してください")
            print()
            print("パーマリンク推奨設定:")
            print("  東京都: land-price/tokyo")
            print("  千代田区: land-price/tokyo/chiyoda")
            print("  中央区: land-price/tokyo/chuo")

    except Exception as e:
        print(f"❌ エラー: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
