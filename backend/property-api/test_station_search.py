"""
駅コード検索のテスト実装
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# APIキーの設定
api_key = os.getenv("VITE_REAL_ESTATE_API_KEY")
headers = {
    "Ocp-Apim-Subscription-Key": api_key
}

# 主要駅のコード例
station_codes = {
    "東京駅": "003785",
    "新宿駅": "003938",
    "渋谷駅": "003856",
    "品川駅": "003788",
    "大宮駅": "002829",
    "横浜駅": "004298"
}

def search_by_station(station_code, year=2023, quarter=4):
    """駅コードで不動産価格を検索"""

    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001"
    params = {
        "year": year,
        "quarter": quarter,
        "station": station_code
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=30)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "OK" and data.get("data"):
                results = data["data"]
                print(f"\n駅コード {station_code} の検索結果: {len(results)}件")

                # 最初の3件を表示
                for i, item in enumerate(results[:3], 1):
                    print(f"\n{i}. {item.get('Type', '')} - {item.get('Municipality', '')} {item.get('DistrictName', '')}")
                    print(f"   価格: {item.get('TradePrice', '')}円")
                    print(f"   面積: {item.get('Area', '')}㎡")
                    print(f"   取引時期: {item.get('Period', '')}")

                return results
            else:
                print(f"データが見つかりませんでした")
                return []
        else:
            print(f"APIエラー: {response.status_code}")
            return []
    except Exception as e:
        print(f"エラー: {e}")
        return []

# テスト実行
if __name__ == "__main__":
    print("=== 駅コード検索テスト ===")

    # 東京駅周辺の物件を検索
    print("\n東京駅周辺の不動産価格:")
    search_by_station(station_codes["東京駅"])

    # 大宮駅周辺の物件を検索
    print("\n\n大宮駅周辺の不動産価格:")
    search_by_station(station_codes["大宮駅"])