"""
XCT001 API（鑑定評価書情報API）のテスト
areaパラメータの詳細確認と公示地価データの取得
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

def test_area_parameter():
    """areaパラメータがどこまで詳細に指定できるか確認"""

    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XCT001"

    # テストケース
    test_cases = [
        {"name": "東京都全体", "area": "13"},
        {"name": "埼玉県全体", "area": "11"},
        {"name": "東京都千代田区（試験）", "area": "13101"},  # 都道府県コード + 市区町村コード
        {"name": "埼玉県さいたま市（試験）", "area": "11100"},  # 政令指定都市コード
        {"name": "埼玉県さいたま市大宮区（試験）", "area": "11103"},  # 区コード
    ]

    print("=" * 70)
    print("XCT001 API - areaパラメータの詳細度テスト")
    print("=" * 70)

    for test in test_cases:
        print(f"\n【{test['name']}】")
        print(f"  area={test['area']}")

        params = {
            "year": "2024",
            "area": test['area'],
            "division": "00"  # 住宅地
        }

        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)

            if response.status_code == 200:
                data = response.json()

                if data.get("status") == "OK" and data.get("data"):
                    results = data["data"]
                    print(f"  ✅ 成功: {len(results)}件のデータ取得")

                    # 最初の3件のデータを表示
                    print(f"  サンプルデータ:")
                    for i, item in enumerate(results[:3]):
                        address = item.get("標準地　所在地　所在地番", "")
                        price = item.get("1㎡当たりの価格", 0)
                        print(f"    {i+1}. {address}")
                        print(f"       価格: {int(price):,}円/㎡")

                elif data.get("status") == "NG":
                    print(f"  ❌ エラー: {data.get('message', 'APIエラー')}")
                else:
                    print(f"  ⚠️  データなし")

            else:
                print(f"  ❌ HTTPエラー: ステータスコード {response.status_code}")

        except Exception as e:
            print(f"  ❌ 例外エラー: {e}")

    print("\n" + "=" * 70)
    print("結論: areaパラメータは都道府県コード（2桁）のみ指定可能")
    print("市区町村レベルの絞り込みは、取得後のデータをフィルタリングする必要あり")
    print("=" * 70)

def get_specific_area_data():
    """特定地域（大宮区天沼町）の公示地価を取得"""

    print("\n\n" + "=" * 70)
    print("埼玉県さいたま市大宮区天沼町の公示地価データ取得")
    print("=" * 70)

    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XCT001"
    params = {
        "year": "2024",
        "area": "11",  # 埼玉県
        "division": "00"  # 住宅地
    }

    print(f"\n1. 埼玉県全体のデータを取得中...")

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)

        if response.status_code == 200:
            data = response.json()

            if data.get("status") == "OK" and data.get("data"):
                all_results = data["data"]
                print(f"   ✅ {len(all_results)}件のデータ取得完了")

                # 大宮区のデータをフィルタリング
                omiya_data = []
                amenuma_data = []

                for item in all_results:
                    address = item.get("標準地　所在地　所在地番", "")

                    if "大宮区" in address:
                        omiya_data.append(item)

                        if "天沼町" in address:
                            amenuma_data.append(item)

                print(f"\n2. フィルタリング結果:")
                print(f"   - 大宮区全体: {len(omiya_data)}件")
                print(f"   - 天沼町: {len(amenuma_data)}件")

                # 天沼町のデータを詳細表示
                if amenuma_data:
                    print(f"\n【天沼町の公示地価（2024年）】")
                    for i, item in enumerate(amenuma_data):
                        print(f"\n地点 {i+1}:")
                        print(f"  住所: {item.get('標準地　所在地　所在地番', '')}")
                        print(f"  価格: {int(item.get('1㎡当たりの価格', 0)):,}円/㎡")
                        print(f"  最寄駅: {item.get('標準地　交通施設の状況　交通施設', '')}")
                        print(f"  駅からの距離: {item.get('標準地　交通施設の状況　距離', '')}m")
                        print(f"  用途地域: {item.get('標準地　法令上の規制等　用途地域', '')}")
                        print(f"  建蔽率: {item.get('標準地　法令上の規制等　指定建蔽率', '')}%")
                        print(f"  容積率: {item.get('標準地　法令上の規制等　指定容積率', '')}%")
                        print(f"  前年比変動率: {item.get('変動率', '')}%")

                        # 坪単価も計算
                        price_per_sqm = int(item.get('1㎡当たりの価格', 0))
                        price_per_tsubo = price_per_sqm * 3.30578
                        print(f"  坪単価: {int(price_per_tsubo):,}円/坪")
                else:
                    print("\n⚠️  天沼町の公示地価データは見つかりませんでした")

                # 大宮区の統計情報
                if omiya_data:
                    prices = [int(item.get('1㎡当たりの価格', 0)) for item in omiya_data]
                    avg_price = sum(prices) / len(prices)
                    max_price = max(prices)
                    min_price = min(prices)

                    print(f"\n【大宮区全体の統計（2024年）】")
                    print(f"  データ数: {len(omiya_data)}地点")
                    print(f"  平均価格: {avg_price:,.0f}円/㎡")
                    print(f"  最高価格: {max_price:,.0f}円/㎡")
                    print(f"  最低価格: {min_price:,.0f}円/㎡")

                    # 価格帯別の分布
                    price_ranges = {
                        "20万円未満": 0,
                        "20-30万円": 0,
                        "30-40万円": 0,
                        "40-50万円": 0,
                        "50万円以上": 0
                    }

                    for price in prices:
                        if price < 200000:
                            price_ranges["20万円未満"] += 1
                        elif price < 300000:
                            price_ranges["20-30万円"] += 1
                        elif price < 400000:
                            price_ranges["30-40万円"] += 1
                        elif price < 500000:
                            price_ranges["40-50万円"] += 1
                        else:
                            price_ranges["50万円以上"] += 1

                    print(f"\n  価格帯分布:")
                    for range_name, count in price_ranges.items():
                        percentage = (count / len(prices)) * 100
                        print(f"    {range_name}: {count}件 ({percentage:.1f}%)")

    except Exception as e:
        print(f"❌ エラー: {e}")

if __name__ == "__main__":
    # areaパラメータのテスト
    test_area_parameter()

    # 特定地域のデータ取得
    get_specific_area_data()