"""
基準地価の詳細確認
大宮区のデータを詳しく調査
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("VITE_REAL_ESTATE_API_KEY")
headers = {
    "Ocp-Apim-Subscription-Key": api_key
}

def analyze_omiya_land_price(year=2025):
    """大宮区の基準地価を詳細分析"""

    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XCT001"
    params = {
        "year": year,
        "area": "11",  # 埼玉県
        "division": "00"  # 住宅地
    }

    print(f"\n=== {year}年 埼玉県住宅地データ分析 ===")

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)

        if response.status_code == 200:
            data = response.json()

            if data.get("status") == "OK" and data.get("data"):
                results = data["data"]

                # 大宮区のデータを抽出
                omiya_data = []
                saitama_city_data = []

                for item in results:
                    address = item.get("標準地　所在地　所在地番", "")
                    price = item.get("1㎡当たりの価格", 0)

                    # さいたま市のデータ
                    if "さいたま市" in address:
                        saitama_city_data.append({
                            "address": address,
                            "price": price,
                            "station": item.get("標準地　交通施設の状況　交通施設", ""),
                            "distance": item.get("標準地　交通施設の状況　距離", "")
                        })

                        # 大宮区のデータ
                        if "大宮区" in address:
                            omiya_data.append({
                                "address": address,
                                "price": price,
                                "price_formatted": f"{int(price):,}円/㎡",
                                "station": item.get("標準地　交通施設の状況　交通施設", ""),
                                "distance": item.get("標準地　交通施設の状況　距離", ""),
                                "use_district": item.get("標準地　法令上の規制等　用途地域", ""),
                                "coverage_ratio": item.get("標準地　法令上の規制等　指定建蔽率", ""),
                                "floor_ratio": item.get("標準地　法令上の規制等　指定容積率", "")
                            })

                print(f"\n【データ取得結果】")
                print(f"全体: {len(results)}地点")
                print(f"さいたま市: {len(saitama_city_data)}地点")
                print(f"大宮区: {len(omiya_data)}地点")

                # 大宮区の詳細データを表示
                if omiya_data:
                    print(f"\n【大宮区の標準地一覧（価格順）】")
                    omiya_sorted = sorted(omiya_data, key=lambda x: x['price'], reverse=True)

                    for i, item in enumerate(omiya_sorted[:10], 1):
                        print(f"\n{i}. {item['address']}")
                        print(f"   価格: {item['price_formatted']}")
                        print(f"   最寄駅: {item['station']} {item['distance']}")
                        print(f"   用途地域: {item['use_district']}")
                        print(f"   建蔽率/容積率: {item['coverage_ratio']}%/{item['floor_ratio']}%")

                    # 天沼町に近そうな地名を探す
                    print(f"\n【天沼町周辺の可能性がある地域】")
                    nearby_areas = ["寿能", "桜木", "宮町", "土手町", "高鼻", "堀の内"]

                    for area in nearby_areas:
                        for item in omiya_data:
                            if area in item['address']:
                                print(f"\n{area}のデータ:")
                                print(f"  {item['address']}")
                                print(f"  価格: {item['price_formatted']}")

                # さいたま市全体で「天沼」を含む地名を探す
                print(f"\n【さいたま市全体で「天沼」を含む地名を検索】")
                amenuma_found = False
                for item in saitama_city_data:
                    if "天沼" in item['address'] or "アメヌマ" in item['address'] or "あめぬま" in item['address']:
                        print(f"  {item['address']}: {int(item['price']):,}円/㎡")
                        amenuma_found = True

                if not amenuma_found:
                    print("  → 「天沼」を含む標準地は見つかりませんでした")
                    print("\n【注意】")
                    print("  天沼町には地価公示の標準地が設定されていない可能性があります。")
                    print("  標準地は全ての地域に存在するわけではなく、代表的な地点のみです。")

                return omiya_data
            else:
                print(f"❌ データが見つかりませんでした")
                return []
        else:
            print(f"❌ APIエラー: {response.status_code}")
            return []

    except Exception as e:
        print(f"❌ エラー: {e}")
        return []

if __name__ == "__main__":
    analyze_omiya_land_price(2025)