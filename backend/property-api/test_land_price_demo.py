"""
公示地価API（XCT001）のデモンストレーション
実際のデータ取得とフィルタリングの動作確認
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

def demo_land_price_search():
    """埼玉県の公示地価データを取得して、大宮区でフィルタリング"""

    print("=" * 70)
    print("公示地価API（XCT001）デモンストレーション")
    print("=" * 70)

    # APIエンドポイント
    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XCT001"

    # パラメータ（埼玉県、住宅地、2024年）
    params = {
        "year": "2024",
        "area": "11",  # 埼玉県
        "division": "00"  # 住宅地
    }

    print(f"\n1. APIリクエスト送信中...")
    print(f"   URL: {url}")
    print(f"   パラメータ: year={params['year']}, area={params['area']}, division={params['division']}")
    print(f"   （埼玉県全体の住宅地データを取得）")

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)

        if response.status_code == 200:
            data = response.json()

            if data.get("status") == "OK" and data.get("data"):
                all_results = data["data"]
                print(f"\n✅ APIレスポンス成功！")
                print(f"   取得件数: {len(all_results)}件（埼玉県全体）")

                # 最初の3件のデータ構造を表示
                print(f"\n2. データ構造の確認（最初の3件）:")
                print("=" * 50)
                for i, item in enumerate(all_results[:3]):
                    address = item.get("標準地　所在地　所在地番", "")
                    price = item.get("1㎡当たりの価格", 0)
                    station = item.get("標準地　交通施設の状況　交通施設", "")
                    distance = item.get("標準地　交通施設の状況　距離", "")

                    print(f"\n【データ {i+1}】")
                    print(f"  住所: {address}")
                    print(f"  価格: {int(price):,}円/㎡")
                    print(f"  最寄駅: {station} {distance}m")

                # フィルタリング処理のデモ
                print(f"\n" + "=" * 50)
                print("3. フィルタリング処理のデモンストレーション")
                print("=" * 50)

                # 各地域のカウント
                omiya_count = 0
                urawa_count = 0
                iwatsuki_count = 0
                other_count = 0

                # 大宮区の詳細データ
                omiya_data = []

                print("\n住所フィールドを1件ずつチェック中...")
                for item in all_results:
                    address = item.get("標準地　所在地　所在地番", "")

                    if "大宮区" in address:
                        omiya_count += 1
                        omiya_data.append({
                            "address": address,
                            "price": item.get("1㎡当たりの価格", 0),
                            "station": item.get("標準地　交通施設の状況　交通施設", ""),
                            "distance": item.get("標準地　交通施設の状況　距離", ""),
                            "use_district": item.get("標準地　法令上の規制等　用途地域", "")
                        })
                    elif "浦和区" in address:
                        urawa_count += 1
                    elif "岩槻区" in address:
                        iwatsuki_count += 1
                    else:
                        other_count += 1

                print(f"\n【フィルタリング結果】")
                print(f"  大宮区: {omiya_count}件")
                print(f"  浦和区: {urawa_count}件")
                print(f"  岩槻区: {iwatsuki_count}件")
                print(f"  その他: {other_count}件")
                print(f"  合計: {omiya_count + urawa_count + iwatsuki_count + other_count}件")

                # 大宮区の詳細表示
                if omiya_data:
                    print(f"\n" + "=" * 50)
                    print("4. 大宮区の公示地価データ（上位5件）")
                    print("=" * 50)

                    # 価格でソート
                    omiya_data_sorted = sorted(omiya_data, key=lambda x: x['price'], reverse=True)

                    for i, item in enumerate(omiya_data_sorted[:5]):
                        print(f"\n【地点 {i+1}】")
                        print(f"  住所: {item['address']}")
                        print(f"  価格: {int(item['price']):,}円/㎡")
                        print(f"  坪単価: {int(item['price'] * 3.30578):,}円/坪")
                        print(f"  最寄駅: {item['station']} {item['distance']}m")
                        print(f"  用途地域: {item['use_district']}")

                    # 統計情報
                    prices = [item['price'] for item in omiya_data]
                    avg_price = sum(prices) / len(prices)
                    max_price = max(prices)
                    min_price = min(prices)

                    print(f"\n【大宮区の統計情報】")
                    print(f"  平均価格: {avg_price:,.0f}円/㎡")
                    print(f"  最高価格: {max_price:,.0f}円/㎡")
                    print(f"  最低価格: {min_price:,.0f}円/㎡")
                    print(f"  価格レンジ: {(max_price - min_price):,.0f}円/㎡")

                # 天沼町の検索デモ
                print(f"\n" + "=" * 50)
                print("5. 特定地域（天沼町）の検索デモ")
                print("=" * 50)

                amenuma_data = []
                for item in all_results:
                    address = item.get("標準地　所在地　所在地番", "")
                    if "天沼町" in address:
                        amenuma_data.append({
                            "address": address,
                            "price": item.get("1㎡当たりの価格", 0)
                        })

                if amenuma_data:
                    print(f"✅ 天沼町のデータが{len(amenuma_data)}件見つかりました！")
                    for item in amenuma_data:
                        print(f"  住所: {item['address']}")
                        print(f"  価格: {int(item['price']):,}円/㎡")
                else:
                    print("⚠️  天沼町のデータは見つかりませんでした")
                    print("（公示地価の標準地が設定されていない可能性があります）")

                print(f"\n" + "=" * 70)
                print("デモンストレーション完了")
                print("=" * 70)

            else:
                print(f"❌ APIからデータが返されませんでした")
                print(f"   ステータス: {data.get('status')}")

        else:
            print(f"❌ APIエラー: ステータスコード {response.status_code}")

    except Exception as e:
        print(f"❌ エラー発生: {e}")

if __name__ == "__main__":
    demo_land_price_search()