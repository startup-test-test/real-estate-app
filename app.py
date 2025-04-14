
import streamlit as st
import requests
from datetime import datetime
from typing import List, Dict, Optional

api_key = "b491308188504fa98cab52d5cab3da63"

pref_map = {
    "北海道": "01", "青森県": "02", "岩手県": "03", "宮城県": "04", "秋田県": "05",
    "山形県": "06", "福島県": "07", "茨城県": "08", "栃木県": "09", "群馬県": "10",
    "埼玉県": "11", "千葉県": "12", "東京都": "13", "神奈川県": "14",
    "新潟県": "15", "富山県": "16", "石川県": "17", "福井県": "18", "山梨県": "19",
    "長野県": "20", "岐阜県": "21", "静岡県": "22", "愛知県": "23", "三重県": "24",
    "滋賀県": "25", "京都府": "26", "大阪府": "27", "兵庫県": "28", "奈良県": "29",
    "和歌山県": "30", "鳥取県": "31", "島根県": "32", "岡山県": "33", "広島県": "34",
    "山口県": "35", "徳島県": "36", "香川県": "37", "愛媛県": "38", "高知県": "39",
    "福岡県": "40", "佐賀県": "41", "長崎県": "42", "熊本県": "43", "大分県": "44",
    "宮崎県": "45", "鹿児島県": "46", "沖縄県": "47"
}

def get_year_quarters(years: int = 3) -> List[tuple]:
    now = datetime.now()
    result = []
    for y in range(now.year - years, now.year + 1):
        for q in range(1, 5):
            if y < now.year or (y == now.year and q <= (now.month - 1) // 3 + 1):
                result.append((y, q))
    return result

def fetch_city_list(pref_code: str) -> List[str]:
    url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002"
    res = requests.get(url, headers={"Ocp-Apim-Subscription-Key": api_key}, params={"area": pref_code, "language": "ja"})
    if res.status_code == 200:
        return [city["name"] for city in res.json().get("data", [])]
    return []

def fetch_transaction_data(pref_code: str, city_name: str) -> Optional[List[Dict]]:
    res_city = requests.get("https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002",
        headers={"Ocp-Apim-Subscription-Key": api_key}, params={"area": pref_code, "language": "ja"})
    city_code = ""
    for city in res_city.json().get("data", []):
        if city_name in city["name"]:
            city_code = city["id"]
            break
    if not city_code:
        return None

    base_url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001"
    results = []
    for y, q in get_year_quarters():
        res = requests.get(base_url, headers={"Ocp-Apim-Subscription-Key": api_key},
            params={"year": y, "quarter": q, "city": city_code, "priceClassification": "01", "format": "json"})
        if res.status_code == 200 and "data" in res.json():
            results.extend(res.json()["data"])
    return results

def display_results_table(results: List[Dict]):
    if not results:
        st.warning("データが見つかりませんでした。")
        return
    st.write(f"✅ {len(results)} 件の取引データを取得しました。")
    table = []
    for item in results:
        table.append({
            "種類": item.get("Type", ""),
            "地区名": item.get("DistrictName", ""),
            "価格": item.get("TradePrice", ""),
            "面積": item.get("Area", ""),
            "築年": item.get("BuildingYear", ""),
            "時期": item.get("Period", ""),
            "間取り": item.get("FloorPlan", ""),
            "構造": item.get("Structure", ""),
            "用途": item.get("Use", ""),
            "備考": item.get("Remarks", "")
        })
    st.dataframe(table)

# Streamlit UI
st.title("不動産取引データ検索ツール")

pref_name = st.selectbox("都道府県を選択", list(pref_map.keys()))
if pref_name:
    city_list = fetch_city_list(pref_map[pref_name])
    city_name = st.selectbox("市区町村を選択", city_list)

    if st.button("検索する"):
        results = fetch_transaction_data(pref_map[pref_name], city_name)
        display_results_table(results)
