"""
地価情報ページ生成システム プロトタイプテスト

東京都1都道府県と千代田区1市区町村でテスト実行
"""

import sys
import os

# land_price_generatorモジュールをインポート
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'land_price_generator'))

from data_fetcher import LandPriceDataFetcher
from data_processor import LandPriceDataProcessor
from html_generator import LandPriceHTMLGenerator
from wordpress_publisher import LandPriceWordPressPublisher


def main():
    """メイン処理"""
    print("="*60)
    print("地価情報ページ生成システム - プロトタイプテスト")
    print("="*60)
    print()

    # 初期化
    fetcher = LandPriceDataFetcher()
    processor = LandPriceDataProcessor()
    generator = LandPriceHTMLGenerator()
    publisher = LandPriceWordPressPublisher()

    # WordPress接続テスト
    print("ステップ0: WordPress接続テスト")
    print("-" * 60)
    if not publisher.test_connection():
        print("❌ WordPress接続に失敗しました")
        return
    print()

    # ===== テスト1: 東京都ページ生成 =====
    print("ステップ1: 東京都のデータ取得")
    print("-" * 60)

    try:
        tokyo_data = fetcher.fetch_prefecture_data("13", "東京都", "2024")
        print(f"✅ データ取得成功")
        print(f"   地点数: {len(tokyo_data['data'])}件")
        print(f"   市区町村数: {len(tokyo_data['municipalities'])}件")
        print()
    except Exception as e:
        print(f"❌ データ取得エラー: {e}")
        return

    print("ステップ2: 東京都の統計計算")
    print("-" * 60)

    try:
        tokyo_stats = processor.calculate_prefecture_stats(tokyo_data)
        summary = tokyo_stats.get('summary', {})
        print(f"✅ 統計計算成功")
        print(f"   平均地価: {summary.get('average_price_per_sqm', 0):,}円/㎡")
        print(f"   変動率: {summary.get('change_rate', 0)}%")
        print(f"   市区町村数: {len(tokyo_stats.get('municipality_ranking', []))}件")
        print()
    except Exception as e:
        print(f"❌ 統計計算エラー: {e}")
        return

    print("ステップ3: 東京都のHTML生成")
    print("-" * 60)

    try:
        tokyo_html = generator.generate_prefecture_html(tokyo_stats)
        print(f"✅ HTML生成成功")
        print(f"   HTML長: {len(tokyo_html)}文字")
        print()
    except Exception as e:
        print(f"❌ HTML生成エラー: {e}")
        return

    print("ステップ4: 東京都ページをWordPressに投稿")
    print("-" * 60)

    try:
        result = publisher.publish_prefecture_page(
            prefecture_name="東京都",
            html_content=tokyo_html,
            stats=tokyo_stats,
            status="draft"  # 下書きとして投稿
        )

        if result:
            print(f"✅ 投稿成功")
            print(f"   投稿ID: {result['id']}")
            print(f"   タイトル: {result['title']['rendered']}")
            print(f"   URL: {result['link']}")
            print(f"   ステータス: {result['status']}")
            print()
        else:
            print(f"❌ 投稿失敗")
            return
    except Exception as e:
        print(f"❌ 投稿エラー: {e}")
        import traceback
        traceback.print_exc()
        return

    # ===== テスト2: 千代田区ページ生成 =====
    print("ステップ5: 千代田区のデータ取得")
    print("-" * 60)

    try:
        chiyoda_data = fetcher.fetch_city_data(
            prefecture_name="東京都",
            city_name="千代田区",
            years=["2020", "2021", "2022", "2023", "2024"]
        )
        print(f"✅ データ取得成功")
        print(f"   最新データ: {len(chiyoda_data['current_data'])}件")
        print(f"   履歴データ: {len(chiyoda_data['history'])}地点")
        print()
    except Exception as e:
        print(f"❌ データ取得エラー: {e}")
        return

    print("ステップ6: 千代田区の統計計算")
    print("-" * 60)

    try:
        chiyoda_stats = processor.calculate_city_stats(chiyoda_data)
        summary = chiyoda_stats.get('summary', {})
        print(f"✅ 統計計算成功")
        print(f"   平均地価: {summary.get('average_price_per_sqm', 0):,}円/㎡")
        print(f"   変動率: {summary.get('change_rate', 0)}%")
        print(f"   駅別ランキング: {len(chiyoda_stats.get('station_ranking', []))}件")
        print()
    except Exception as e:
        print(f"❌ 統計計算エラー: {e}")
        return

    print("ステップ7: 千代田区のHTML生成")
    print("-" * 60)

    try:
        chiyoda_html = generator.generate_city_html(chiyoda_stats)
        print(f"✅ HTML生成成功")
        print(f"   HTML長: {len(chiyoda_html)}文字")
        print()
    except Exception as e:
        print(f"❌ HTML生成エラー: {e}")
        return

    print("ステップ8: 千代田区ページをWordPressに投稿")
    print("-" * 60)

    try:
        result = publisher.publish_city_page(
            prefecture="東京都",
            city_name="千代田区",
            html_content=chiyoda_html,
            stats=chiyoda_stats,
            status="draft"  # 下書きとして投稿
        )

        if result:
            print(f"✅ 投稿成功")
            print(f"   投稿ID: {result['id']}")
            print(f"   タイトル: {result['title']['rendered']}")
            print(f"   URL: {result['link']}")
            print(f"   ステータス: {result['status']}")
            print()
        else:
            print(f"❌ 投稿失敗")
            return
    except Exception as e:
        print(f"❌ 投稿エラー: {e}")
        import traceback
        traceback.print_exc()
        return

    # 完了
    print("="*60)
    print("✅ プロトタイプテスト完了")
    print("="*60)
    print()
    print("作成されたページ:")
    print("  1. 東京都ページ（下書き）")
    print("  2. 千代田区ページ（下書き）")
    print()
    print("次のステップ:")
    print("  - WordPress管理画面で内容を確認")
    print("  - 問題なければ「公開」に変更")
    print("  - 全国47都道府県への展開")
    print()


if __name__ == "__main__":
    main()
