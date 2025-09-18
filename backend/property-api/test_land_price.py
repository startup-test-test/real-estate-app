"""
基準地価（地価公示）APIのテスト
天沼町周辺の標準地価格を3年分取得
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

def get_land_price_data(year, area_code="11", division="00"):
    """
    鑑定評価書情報APIから基準地価データを取得

    Parameters:
    - year: 年度（2021-2025）
    - area_code: 都道府県コード（11=埼玉県）
    - division: 用途区分（00=住宅地）
    """

    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XCT001"
    params = {
        "year": year,
        "area": area_code,
        "division": division
    }

    print(f"\n=== {year}年 埼玉県住宅地の基準地価を取得中 ===")

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)

        if response.status_code == 200:
            data = response.json()

            if data.get("status") == "OK" and data.get("data"):
                results = data["data"]
                print(f"✅ 取得成功: {len(results)}地点")

                # 天沼町周辺のデータを探す
                amenuma_data = []
                omiya_data = []

                for item in results:
                    # 所在地情報を取得
                    address = item.get("標準地　所在地　所在地番", "")
                    price = item.get("1㎡当たりの価格", 0)

                    # 天沼町のデータを抽出
                    if "天沼町" in address:
                        amenuma_data.append({
                            "year": year,
                            "address": address,
                            "price": price,
                            "price_formatted": f"{int(price):,}円/㎡",
                            "station": item.get("標準地　交通施設の状況　交通施設", ""),
                            "distance": item.get("標準地　交通施設の状況　距離", ""),
                            "use_district": item.get("標準地　法令上の規制等　用途地域", ""),
                            "coverage_ratio": item.get("標準地　法令上の規制等　指定建蔽率", ""),
                            "floor_ratio": item.get("標準地　法令上の規制等　指定容積率", ""),
                            "change_rate": item.get("変動率", ""),
                            "latitude": item.get("緯度", ""),
                            "longitude": item.get("経度", "")
                        })

                    # 大宮区のデータも収集
                    elif "大宮区" in address:
                        omiya_data.append({
                            "address": address,
                            "price": price
                        })

                return amenuma_data, omiya_data, results
            else:
                print(f"❌ データが見つかりませんでした")
                return [], [], []
        else:
            print(f"❌ APIエラー: {response.status_code}")
            if response.status_code == 401:
                print("APIキーが無効です。確認してください。")
            return [], [], []

    except Exception as e:
        print(f"❌ エラー: {e}")
        return [], [], []

def main():
    """3年分の基準地価データを取得"""

    print("=" * 60)
    print("基準地価（地価公示）データ取得テスト")
    print("対象：埼玉県さいたま市大宮区天沼町周辺")
    print("=" * 60)

    all_amenuma_data = []
    all_omiya_stats = {}

    # 2023年から2025年のデータを取得
    for year in [2023, 2024, 2025]:
        amenuma, omiya, all_data = get_land_price_data(year)

        if amenuma:
            all_amenuma_data.extend(amenuma)
            print(f"\n【{year}年 天沼町の標準地】")
            for item in amenuma:
                print(f"  所在地: {item['address']}")
                print(f"  価格: {item['price_formatted']}")
                print(f"  最寄駅: {item['station']} {item['distance']}")
                print(f"  用途地域: {item['use_district']}")
                print(f"  建蔽率/容積率: {item['coverage_ratio']}%/{item['floor_ratio']}%")
                print(f"  前年比: {item['change_rate']}%")
                print(f"  座標: ({item['latitude']}, {item['longitude']})")
                print()
        else:
            print(f"\n【{year}年】天沼町の標準地データは見つかりませんでした")

        # 大宮区全体の統計
        if omiya:
            prices = [item['price'] for item in omiya]
            avg_price = sum(prices) / len(prices)
            max_price = max(prices)
            min_price = min(prices)

            all_omiya_stats[year] = {
                "count": len(omiya),
                "average": avg_price,
                "max": max_price,
                "min": min_price
            }

            print(f"\n【{year}年 大宮区全体の統計】")
            print(f"  標準地数: {len(omiya)}地点")
            print(f"  平均価格: {avg_price:,.0f}円/㎡")
            print(f"  最高価格: {max_price:,.0f}円/㎡")
            print(f"  最低価格: {min_price:,.0f}円/㎡")

    # 3年間の価格推移
    if all_amenuma_data:
        print("\n" + "=" * 60)
        print("【天沼町の価格推移（3年間）】")

        # 同じ地点のデータを年度別に整理
        address_data = {}
        for item in all_amenuma_data:
            addr = item['address']
            if addr not in address_data:
                address_data[addr] = {}
            address_data[addr][item['year']] = item['price']

        for addr, yearly_prices in address_data.items():
            print(f"\n{addr}:")
            for year in sorted(yearly_prices.keys()):
                price = yearly_prices[year]
                print(f"  {year}年: {price:,}円/㎡")

                # 前年比を計算
                if year - 1 in yearly_prices:
                    prev_price = yearly_prices[year - 1]
                    change_rate = ((price - prev_price) / prev_price) * 100
                    print(f"    → 前年比: {change_rate:+.1f}%")

    # 大宮区全体の推移
    if all_omiya_stats:
        print("\n" + "=" * 60)
        print("【大宮区全体の平均価格推移】")
        for year in sorted(all_omiya_stats.keys()):
            stats = all_omiya_stats[year]
            print(f"{year}年: {stats['average']:,.0f}円/㎡ （{stats['count']}地点）")

if __name__ == "__main__":
    main()