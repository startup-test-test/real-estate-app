"""
公示地価APIのデバッグ - フィールド名を確認
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

def debug_api_response():
    """APIレスポンスの実際のフィールド名を確認"""

    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XCT001"
    params = {
        "year": "2024",
        "area": "11",  # 埼玉県
        "division": "00"  # 住宅地
    }

    print("APIリクエスト送信中...")

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)

        if response.status_code == 200:
            data = response.json()

            if data.get("status") == "OK" and data.get("data"):
                all_results = data["data"]
                print(f"✅ 取得成功: {len(all_results)}件\n")

                # 最初のデータのすべてのキーを表示
                if all_results:
                    first_item = all_results[0]
                    print("【利用可能なフィールド一覧】")
                    print("=" * 50)

                    # キーを取得してソート
                    keys = sorted(first_item.keys())

                    # 住所関連のキーを探す
                    address_keys = []
                    price_keys = []
                    station_keys = []

                    for key in keys:
                        value = first_item[key]
                        print(f"{key}: {value}")

                        # キーワードで分類
                        if "所在" in key or "住所" in key or "地番" in key:
                            address_keys.append(key)
                        if "価格" in key or "円" in key:
                            price_keys.append(key)
                        if "駅" in key or "交通" in key:
                            station_keys.append(key)

                    print(f"\n【住所関連のフィールド】")
                    for key in address_keys:
                        print(f"  {key}: {first_item[key]}")

                    print(f"\n【価格関連のフィールド】")
                    for key in price_keys:
                        print(f"  {key}: {first_item[key]}")

                    print(f"\n【交通関連のフィールド】")
                    for key in station_keys:
                        print(f"  {key}: {first_item[key]}")

                    # 大宮区を含むデータを探す
                    print(f"\n【大宮区を含むデータ検索】")
                    print("=" * 50)
                    found_omiya = False

                    for item in all_results:
                        # すべての値をチェック
                        for key, value in item.items():
                            if value and isinstance(value, str) and "大宮区" in value:
                                print(f"✅ 大宮区を含むデータ発見！")
                                print(f"  フィールド: {key}")
                                print(f"  値: {value}")
                                found_omiya = True
                                break
                        if found_omiya:
                            break

                    if not found_omiya:
                        print("⚠️  大宮区を含むデータは見つかりませんでした")

        else:
            print(f"❌ APIエラー: {response.status_code}")

    except Exception as e:
        print(f"❌ エラー: {e}")

if __name__ == "__main__":
    debug_api_response()