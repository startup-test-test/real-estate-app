"""
APIレスポンスのフォーマットを確認
大宮区のデータが本当にないのか詳細チェック
"""
import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

api_key = os.getenv("VITE_REAL_ESTATE_API_KEY")
headers = {
    "Ocp-Apim-Subscription-Key": api_key
}

def check_api_format():
    """APIレスポンスの構造を確認"""

    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XCT001"
    params = {
        "year": 2025,
        "area": "11",  # 埼玉県
        "division": "00"  # 住宅地
    }

    print("=== 埼玉県の基準地価データ構造を確認 ===\n")

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)

        if response.status_code == 200:
            data = response.json()

            print(f"レスポンスステータス: {data.get('status')}")
            print(f"データ件数: {len(data.get('data', []))}\n")

            if data.get("data"):
                # 最初の5件のデータ構造を確認
                print("【最初の5件のデータを確認】")
                for i, item in enumerate(data["data"][:5], 1):
                    print(f"\n--- {i}件目 ---")
                    # 主要なフィールドのみ表示
                    address = item.get("標準地　所在地　所在地番", "")
                    price = item.get("1㎡当たりの価格", "")
                    print(f"所在地: {address}")
                    print(f"価格: {price}")

                # さいたま市を含むデータを検索
                print("\n【さいたま市を含むデータを検索】")
                saitama_count = 0
                omiya_count = 0
                area_distribution = {}

                for item in data["data"]:
                    address = item.get("標準地　所在地　所在地番", "")

                    # さいたま市のデータをカウント
                    if "さいたま市" in address:
                        saitama_count += 1

                        # 区名を抽出
                        for ku in ["西区", "北区", "大宮区", "見沼区", "中央区", "桜区", "浦和区", "南区", "緑区", "岩槻区"]:
                            if ku in address:
                                area_distribution[ku] = area_distribution.get(ku, 0) + 1
                                if ku == "大宮区":
                                    omiya_count += 1
                                    print(f"  大宮区のデータ発見: {address[:50]}...")
                                break

                print(f"\nさいたま市のデータ: {saitama_count}件")
                print(f"大宮区のデータ: {omiya_count}件")

                print("\n【さいたま市の区別データ分布】")
                for ku, count in sorted(area_distribution.items()):
                    print(f"  {ku}: {count}件")

                # 大宮区のデータを全て表示
                if omiya_count > 0:
                    print("\n【大宮区の全データ】")
                    for item in data["data"]:
                        address = item.get("標準地　所在地　所在地番", "")
                        if "大宮区" in address:
                            price = item.get("1㎡当たりの価格", 0)
                            station = item.get("標準地　交通施設の状況　交通施設", "")
                            distance = item.get("標準地　交通施設の状況　距離", "")
                            print(f"\n所在地: {address}")
                            print(f"  価格: {int(price):,}円/㎡")
                            print(f"  最寄駅: {station} {distance}")

                # データのキー一覧を表示（構造確認用）
                if data["data"]:
                    print("\n【データ構造（使用可能なフィールド一覧）】")
                    sample = data["data"][0]
                    keys = list(sample.keys())[:20]  # 最初の20個のキーを表示
                    for key in keys:
                        print(f"  - {key}")
                    print(f"  ... 他 {len(sample.keys()) - 20} フィールド")

        else:
            print(f"APIエラー: {response.status_code}")
            print(response.text[:500])

    except Exception as e:
        print(f"エラー: {e}")

if __name__ == "__main__":
    check_api_format()