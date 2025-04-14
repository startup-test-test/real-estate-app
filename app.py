# ファイルとして保存（最新版：平均価格・築年フィルター・グラフ付き）
with open("app.py", "w", encoding="utf-8") as f:
    f.write("""
import streamlit as st
import requests
from datetime import datetime
from typing import List, Dict, Optional
import matplotlib.pyplot as plt
import pandas as pd

api_key = "b491308188504fa98cab52d5cab3da63"

pref_map = {
    "北海道": "01", "青森県": "02", "岩手県": "03", "宮城県": "04", "秋田県": "05",
    "山形県": "06", "福島県": "07", "茨城県": "08", "栃木県": "09", "群馬県": "10",
    "埼玉県": "11", "千葉県": "12", "東京都": "13", "神奈川県": "14", "新潟県": "15",
    "富山県": "16", "石川県": "17", "福井県": "18", "山梨県": "19", "長野県": "20",
    "岐阜県": "21", "静岡県": "22", "愛知県": "23", "三重県": "24", "滋賀県": "25",
    "京都府": "26", "大阪府": "27", "兵庫県": "28", "奈良県": "29", "和歌山県": "30",
    "鳥取県": "31", "島根県": "32", "岡山県": "33", "広島県": "34", "山口県": "35",
    "徳島県": "36", "香川県": "37", "愛媛県": "38", "高知県": "39", "福岡県": "40",
    "佐賀県": "41", "長崎県": "42", "熊本県": "43", "大分県": "44", "宮崎県": "45",
    "鹿児島県": "46", "沖縄県": "47"
}

def get_year_quarters(years: int = 3) -> List[tuple]:
    now = datetime.now()
    return [(y, q) for y in range(now.year - years, now.year + 1) for q in range(1, 5)
            if y < now.year or (y == now.year and q <= (now.month - 1) // 3 + 1)]

def fetch_city_list(pref_code: str) -> List[str]:
    res = requests.get("https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002",
                       headers={"Ocp-Apim-Subscription-Key": api_key},
                       params={"area": pref_code, "language": "ja"})
    if res.status_code == 200:
        return [city["name"] for city in res.json().get("data", [])]
    return []

def fetch_transaction_data(pref_code: str, city_name: str) -> Optional[List[Dict]]:
    city_code = ""
    res_city = requests.get("https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002",
                            headers={"Ocp-Apim-Subscription-Key": api_key},
                            params={"area": pref_code, "language": "ja"})
    for city in res_city.json().get("data", []):
        if city_name in city["name"]:
            city_code = city["id"]
            break
    if not city_code:
        return None

    base_url = "https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001"
    results = []
    for y, q in get_year_quarters():
        res = requests.get(base_url,
            headers={"Ocp-Apim-Subscription-Key": api_key},
            params={"year": y, "quarter": q, "city": city_code, "priceClassification": "01", "format": "json"})
        if res.status_code == 200 and "data" in res.json():
            results.extend(res.json()["data"])
    return results

def filter_by_building_age(results: List[Dict], age_filter: str) -> List[Dict]:
    now = datetime.now().year
    def age(bld_year):
        if not bld_year or "年以前" in bld_year: return None
        try: return now - int(bld_year.replace("年", ""))
        except: return None

    def match(bld_year):
        a = age(bld_year)
        if a is None: return False
        if age_filter == "〜10年": return a <= 10
        elif age_filter == "〜20年": return a <= 20
        elif age_filter == "20年以上": return a > 20
        return True

    return [item for item in results if match(item.get("BuildingYear", ""))]

def display_results_table(results: List[Dict]):
    st.write(f"✅ {len(results)} 件のデータが取得されました。")

    trade_prices = []
    data_for_table = []

    for item in results:
        try:
            price = int(item.get("TradePrice", "").replace(",", "").replace("万円", ""))
            trade_prices.append(price)
        except:
            continue
        data_for_table.append({
            "種類": item.get("Type", ""),
            "地区名": item.get("DistrictName", ""),
            "価格(万円)": item.get("TradePrice", ""),
            "面積": item.get("Area", ""),
            "築年": item.get("BuildingYear", ""),
            "時期": item.get("Period", ""),
            "間取り": item.get("FloorPlan", ""),
            "構造": item.get("Structure", ""),
            "用途": item.get("Use", ""),
        })

    df = pd.DataFrame(data_for_table)
    st.dataframe(df)

    if trade_prices:
        avg_price = sum(trade_prices) / len(trade_prices)
        st.success(f"📊 平均価格：{round(avg_price):,} 万円")

    df["築年数"] = df["築年"].str.extract(r'(\\d{4})').dropna().astype(int).apply(lambda x: datetime.now().year - x)
    fig, ax = plt.subplots()
    df["築年数"].hist(bins=20, ax=ax)
    ax.set_title("築年数の分布")
    ax.set_xlabel("築年数")
    ax.set_ylabel("件数")
    st.pyplot(fig)

st.title("不動産取引データ検索ツール")

pref_name = st.selectbox("都道府県を選択", list(pref_map.keys()))
if pref_name:
    city_list = fetch_city_list(pref_map[pref_name])
    city_name = st.selectbox("市区町村を選択", city_list)
    age_filter = st.selectbox("築年フィルター", ["指定なし", "〜10年", "〜20年", "20年以上"])

    if st.button("検索する"):
        with st.spinner("検索中です...少々お待ちください。"):
            results = fetch_transaction_data(pref_map[pref_name], city_name)
            if not results:
                st.warning("⚠️ データが取得できませんでした。")
            else:
                filtered_results = filter_by_building_age(results, age_filter)
                st.info(f"🔍 フィルター後の件数：{len(filtered_results)} 件")
                display_results_table(filtered_results)
""")
