"""
マンションデータのフィールド確認テスト
"""
import os
from dotenv import load_dotenv
from real_estate_client import RealEstateAPIClient
import json

load_dotenv()

def test_mansion_fields():
    client = RealEstateAPIClient()

    # 東京都港区のマンションを検索
    results = client.search_real_estate_prices(
        prefecture="東京都",
        city="港区",
        trade_types=["07"],  # マンション
        from_year=2024,
        from_quarter=1,
        to_year=2024,
        to_quarter=3
    )

    print(f"検索結果: {results.get('search_count', 0)}件")
    print(f"エラー: {results.get('error', 'なし')}")

    if results.get('results') and len(results['results']) > 0:
        print("\n=== 最初のマンション物件の全フィールド ===")
        first_item = results['results'][0]

        # 全フィールドを表示
        for key, value in first_item.items():
            print(f"{key}: {value}")

        print("\n=== 面積関連フィールド ===")
        print(f"land_area (土地面積): {first_item.get('land_area', 'なし')}")
        print(f"building_area (延床面積): {first_item.get('building_area', 'なし')}")

        # APIから直接取得したデータも確認
        print("\n=== APIの生データ（最初の1件） ===")
        # 生データを取得するために再度検索
        import requests
        params = {
            "year": 2024,
            "area": "13",  # 東京都
            "quarter": 1
        }

        response = requests.get(
            f"{client.base_url}/XIT001",
            headers=client.headers,
            params=params,
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "OK" and data.get("data"):
                # マンションデータのみフィルタ
                mansion_data = [d for d in data["data"] if "マンション" in d.get("Type", "")]
                if mansion_data:
                    print(json.dumps(mansion_data[0], ensure_ascii=False, indent=2))
                    print("\n=== マンション物件で利用可能なフィールド ===")
                    print("利用可能なキー:", list(mansion_data[0].keys()))

if __name__ == "__main__":
    test_mansion_fields()