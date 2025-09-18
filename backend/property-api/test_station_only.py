"""
駅コードのみを使用した検索テスト
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("VITE_REAL_ESTATE_API_KEY")
headers = {
    "Ocp-Apim-Subscription-Key": api_key
}

def search_by_station_only(station_code="002829", year=2023, quarter=4):
    """駅コードのみで検索（都道府県・市区町村指定なし）"""

    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001"

    # 駅コードのみを指定
    params = {
        "year": year,
        "quarter": quarter,
        "station": station_code  # 大宮駅: 002829
    }

    print(f"=== 駅コードのみで検索 ===")
    print(f"パラメータ: {params}")
    print(f"URL: {url}")

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)

        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "OK" and data.get("data"):
                results = data["data"]

                print(f"\n✅ 検索成功！")
                print(f"取得件数: {len(results)}件")

                # 地域の分布を確認
                municipalities = {}
                for item in results:
                    key = f"{item.get('Prefecture', '')} {item.get('Municipality', '')}"
                    municipalities[key] = municipalities.get(key, 0) + 1

                print(f"\n【地域分布】")
                for area, count in sorted(municipalities.items(), key=lambda x: x[1], reverse=True):
                    print(f"  {area}: {count}件")

                # 最初の5件を詳細表示
                print(f"\n【物件詳細（最初の5件）】")
                for i, item in enumerate(results[:5], 1):
                    print(f"\n{i}. {item.get('Type', '')}")
                    print(f"   場所: {item.get('Prefecture', '')} {item.get('Municipality', '')} {item.get('DistrictName', '')}")
                    print(f"   価格: {int(item.get('TradePrice', 0)):,}円")
                    print(f"   面積: {item.get('Area', '')}㎡")
                    print(f"   取引時期: {item.get('Period', '')}")

                return results
            else:
                print(f"❌ データが見つかりませんでした")
                return []
        else:
            print(f"❌ APIエラー: {response.status_code}")
            return []

    except Exception as e:
        print(f"❌ エラー: {e}")
        return []

def search_with_area_and_station(year=2023, quarter=4):
    """都道府県＋駅コードで検索"""

    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001"

    # 埼玉県（11）＋大宮駅
    params = {
        "year": year,
        "quarter": quarter,
        "area": "11",  # 埼玉県
        "station": "002829"  # 大宮駅
    }

    print(f"\n\n=== 都道府県＋駅コードで検索 ===")
    print(f"パラメータ: {params}")

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)

        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "OK" and data.get("data"):
                results = data["data"]
                print(f"\n✅ 検索成功！")
                print(f"取得件数: {len(results)}件")

                # 地域の分布
                municipalities = {}
                for item in results:
                    key = f"{item.get('Municipality', '')}"
                    municipalities[key] = municipalities.get(key, 0) + 1

                print(f"\n【市区町村分布】")
                for area, count in sorted(municipalities.items(), key=lambda x: x[1], reverse=True)[:10]:
                    print(f"  {area}: {count}件")

                return results
            else:
                print(f"❌ データが見つかりませんでした")
                return []
        else:
            print(f"❌ APIエラー: {response.status_code}")
            return []

    except Exception as e:
        print(f"❌ エラー: {e}")
        return []

# テスト実行
if __name__ == "__main__":
    # 1. 駅コードのみで検索
    results1 = search_by_station_only()

    # 2. 都道府県＋駅コードで検索
    results2 = search_with_area_and_station()

    print(f"\n\n【検索結果の比較】")
    print(f"駅コードのみ: {len(results1)}件")
    print(f"埼玉県＋駅コード: {len(results2)}件")