"""
APIレスポンスの生データを確認
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

def check_raw_response():
    """生のAPIレスポンスを確認"""

    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XCT001"
    params = {
        "year": 2025,
        "area": "11",  # 埼玉県
        "division": "00"  # 住宅地
    }

    print("=== APIレスポンスの生データを確認 ===\n")

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)

        print(f"HTTPステータスコード: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Content-Encoding: {response.headers.get('Content-Encoding')}")

        if response.status_code == 200:
            # JSONとしてパース
            data = response.json()

            # 最初のデータ項目を詳細に表示
            if data.get("data") and len(data["data"]) > 0:
                first_item = data["data"][0]

                print("\n【最初のデータ項目の全フィールド】")
                print(json.dumps(first_item, ensure_ascii=False, indent=2))

                # 特定のフィールドを確認
                print("\n【重要フィールドの値を確認】")
                important_fields = [
                    "標準地　所在地　所在地番",
                    "標準地番号　市区町村コード　市区町村コード",
                    "標準地番号　地域名",
                    "1㎡当たりの価格",
                    "標準地　交通施設の状況　交通施設",
                    "公示価格"
                ]

                for field in important_fields:
                    value = first_item.get(field)
                    if value:
                        print(f"{field}: {value}")

                # 市区町村コードからさいたま市のデータを探す
                print("\n【市区町村コードでさいたま市を検索】")
                # さいたま市の市区町村コードは11101〜11110
                saitama_codes = ["11101", "11102", "11103", "11104", "11105",
                                "11106", "11107", "11108", "11109", "11110"]

                saitama_data = []
                for item in data["data"]:
                    city_code = str(item.get("標準地番号　市区町村コード　市区町村コード", ""))
                    if city_code in saitama_codes:
                        saitama_data.append({
                            "code": city_code,
                            "price": item.get("1㎡当たりの価格"),
                            "location": item.get("標準地　所在地　所在地番", "不明")
                        })

                if saitama_data:
                    print(f"さいたま市のデータ: {len(saitama_data)}件発見")
                    for i, item in enumerate(saitama_data[:5], 1):
                        print(f"  {i}. コード:{item['code']}, 価格:{item['price']}円/㎡, 所在地:{item['location']}")
                else:
                    print("さいたま市のデータが見つかりませんでした")

                # データの総数を確認
                print(f"\n【データ統計】")
                print(f"総データ数: {len(data['data'])}件")

                # 価格が設定されているデータ数
                price_count = sum(1 for item in data["data"] if item.get("1㎡当たりの価格"))
                print(f"価格データあり: {price_count}件")

                # 所在地が設定されているデータ数
                address_count = sum(1 for item in data["data"] if item.get("標準地　所在地　所在地番"))
                print(f"所在地データあり: {address_count}件")

        else:
            print(f"\nエラーレスポンス:")
            print(response.text[:1000])

    except Exception as e:
        print(f"エラー: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_raw_response()