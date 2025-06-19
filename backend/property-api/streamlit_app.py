"""
不動産取引価格検索 Streamlitアプリ
"""
import streamlit as st
import pandas as pd
from real_estate_client import RealEstateAPIClient
from datetime import datetime
import os
from dotenv import load_dotenv

# .envファイルの読み込み
load_dotenv()

# ページ設定
st.set_page_config(
    page_title="不動産取引価格検索",
    page_icon="🏢",
    layout="wide"
)

# タイトル
st.title("🏢 不動産取引価格検索システム")
st.markdown("国土交通省 不動産情報ライブラリのデータを検索します")

# APIクライアントの初期化
@st.cache_resource
def get_api_client():
    return RealEstateAPIClient()

client = get_api_client()

# 市区町村データをキャッシュ
@st.cache_data(ttl=3600)  # 1時間キャッシュ
def get_cities_cached(prefecture_code):
    return client.get_cities(prefecture_code)

# 地区名データをキャッシュ
@st.cache_data(ttl=3600)  # 1時間キャッシュ
def get_districts_cached(prefecture_code, municipality_code=None):
    return client.get_districts(prefecture_code, municipality_code)

# APIキーの確認（クライアントのapi_keyを直接チェック）
if not client.api_key:
    st.error("⚠️ APIキーが設定されていません。.envファイルにREAL_ESTATE_API_KEYを設定してください。")
    # デバッグ情報を表示
    with st.expander("デバッグ情報"):
        st.write(f"os.getenv('REAL_ESTATE_API_KEY'): {os.getenv('REAL_ESTATE_API_KEY')}")
        st.write(f"client.api_key: {client.api_key}")
        st.write(f"現在のディレクトリ: {os.getcwd()}")
        st.write(f".envファイルの存在: {os.path.exists('.env')}")
    st.stop()

# サイドバーで検索条件入力
st.sidebar.header("🔍 検索条件")

# 都道府県選択
prefectures = client.get_prefectures()
prefecture_names = [p["name"] for p in prefectures]
selected_prefecture = st.sidebar.selectbox(
    "都道府県",
    prefecture_names,
    index=prefecture_names.index("東京都") if "東京都" in prefecture_names else 0
)

# 選択された都道府県のコードを取得
selected_prefecture_code = None
for p in prefectures:
    if p["name"] == selected_prefecture:
        selected_prefecture_code = p["code"]
        break

# 市区町村選択（動的に取得）
cities = []
selected_city = None
selected_municipality_code = None

if selected_prefecture_code:
    with st.sidebar:
        with st.spinner("市区町村を取得中..."):
            cities = get_cities_cached(selected_prefecture_code)
    
    if cities:
        city_options = ["すべて"] + [c["name"] for c in cities]
        selected_city_name = st.sidebar.selectbox(
            "市区町村",
            city_options,
            index=0
        )
        
        if selected_city_name != "すべて":
            selected_city = selected_city_name
            # 市区町村コードを取得
            for c in cities:
                if c["name"] == selected_city_name:
                    selected_municipality_code = c["code"]
                    break
    else:
        st.sidebar.info("この都道府県にはデータがありません")

# 地区名選択（動的に取得）
districts = []
selected_district = None

if selected_prefecture_code:
    with st.sidebar:
        with st.spinner("地区名を取得中..."):
            districts = get_districts_cached(selected_prefecture_code, selected_municipality_code)
    
    if districts:
        district_options = ["すべて"] + districts
        selected_district_name = st.sidebar.selectbox(
            "地区名",
            district_options,
            index=0
        )
        
        if selected_district_name != "すべて":
            selected_district = selected_district_name

# 取引種類選択
st.sidebar.subheader("取引種類")
trade_type_options = {
    "01": "宅地(土地)",
    "02": "宅地(土地と建物)",
    "07": "中古マンション等"
}

st.sidebar.info("💡 不動産取引価格情報には最寄駅・駅距離の情報は含まれていません")

selected_types = []
for code, name in trade_type_options.items():
    # デフォルトを変更：中古マンション等も含める
    if st.sidebar.checkbox(name, value=(code in ["02", "07"])):
        selected_types.append(code)

# 期間選択
st.sidebar.subheader("取引時期")
current_year = datetime.now().year
years = list(range(current_year, current_year - 5, -1))

col1, col2 = st.sidebar.columns(2)
with col1:
    from_year = st.selectbox("開始年", years, index=0)
    from_quarter = st.selectbox("開始四半期", [1, 2, 3, 4], index=0)
with col2:
    to_year = st.selectbox("終了年", years, index=0)
    to_quarter = st.selectbox("終了四半期", [1, 2, 3, 4], index=3)

# 検索ボタン
search_button = st.sidebar.button("🔍 検索実行", type="primary", use_container_width=True)

# メインエリア
if search_button:
    if not selected_types:
        st.error("取引種類を少なくとも1つ選択してください")
    else:
        # 検索実行
        with st.spinner("検索中..."):
            results = client.search_real_estate_prices(
                prefecture=selected_prefecture,
                city=selected_city,
                district=selected_district,
                trade_types=selected_types,
                from_year=from_year,
                from_quarter=from_quarter,
                to_year=to_year,
                to_quarter=to_quarter
            )
        
        # エラーチェック
        if "error" in results:
            st.error(f"エラー: {results['error']}")
        else:
            # 検索結果の表示
            st.header("📊 検索結果")
            
            # サマリー表示
            col1, col2 = st.columns(2)
            with col1:
                st.metric("検索結果", f"{results['search_count']:,} 件")
            with col2:
                st.metric("検索条件", results['search_conditions']['location'])
            
            # 検索条件の詳細
            with st.expander("検索条件の詳細"):
                st.write(f"**場所**: {results['search_conditions']['location']}")
                st.write(f"**種類**: {', '.join(results['search_conditions']['types'])}")
                st.write(f"**期間**: {results['search_conditions']['period']}")
            
            if results['search_count'] > 0:
                # データフレームに変換
                df = pd.DataFrame(results['results'])
                
                # 統計情報
                st.subheader("📈 統計情報")
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    avg_price = df['price'].mean() / 10000
                    st.metric("平均取引価格", f"{avg_price:,.0f}万円")
                
                with col2:
                    avg_unit = df['unit_price'].mean() / 10000
                    st.metric("平均㎡単価", f"{avg_unit:,.1f}万円")
                
                with col3:
                    avg_area = df['land_area'].mean()
                    st.metric("平均土地面積", f"{avg_area:,.0f}㎡")
                
                with col4:
                    count_by_type = df['type'].value_counts()
                    st.metric("最多取引種類", count_by_type.index[0])
                
                # 取引事例の詳細表（全データ表示、1番上に配置）
                st.subheader("📋 取引事例")
                
                # 表示用のデータフレームを作成
                table_df = df.copy()
                table_df = table_df.sort_values('building_area')  # 延床面積でソート
                
                # 全ての情報を表示用に整形
                display_table = pd.DataFrame({
                    'No.': range(1, len(table_df) + 1),
                    '価格情報区分': table_df['price_type'],
                    '種別': table_df['type'],
                    '所在地': table_df['location'],
                    '地区': table_df['region'],
                    '取引価格': table_df['price_formatted'],
                    '坪単価': table_df['tsubo_price_formatted'],
                    '㎡単価': table_df['unit_price_formatted'],
                    '土地面積(㎡)': table_df['land_area'].astype(int),
                    '延床面積(㎡)': table_df['building_area'].astype(int),
                    '建築年': table_df['build_year'],
                    '構造': table_df['structure'],
                    '間取り': table_df['floor_plan'],
                    '用途': table_df['use'],
                    '利用目的': table_df['purpose'],
                    '土地形状': table_df['land_shape'],
                    '間口(m)': table_df['road_width'],
                    '前面道路方位': table_df['road_direction'],
                    '前面道路種類': table_df['road_type'],
                    '前面道路幅員(m)': table_df['breadth'],
                    '都市計画': table_df['city_planning'],
                    '建蔽率(%)': table_df['coverage_ratio'],
                    '容積率(%)': table_df['floor_area_ratio'],
                    '改装': table_df['renovation'],
                    '取引事情等': table_df['remarks'],
                    '取引時期': table_df['trade_period']
                })
                
                # 表を表示
                st.dataframe(
                    display_table,
                    use_container_width=True,
                    hide_index=True,
                    height=600
                )
                
                # 価格分布のグラフ（全データ対象）
                if st.checkbox("📊 価格分布を表示"):
                    st.subheader("価格分布（全データ対象）")
                    
                    # ヒストグラム
                    import matplotlib.pyplot as plt
                    
                    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
                    
                    # 取引価格分布（全データ）
                    ax1.hist(df['price'] / 10000, bins=20, edgecolor='black')
                    ax1.set_xlabel('取引価格（万円）')
                    ax1.set_ylabel('件数')
                    ax1.set_title(f'取引価格の分布 (全 {total_items} 件)')
                    
                    # ㎡単価分布（全データ）
                    ax2.hist(df['unit_price'] / 10000, bins=20, edgecolor='black')
                    ax2.set_xlabel('㎡単価（万円）')
                    ax2.set_ylabel('件数')
                    ax2.set_title(f'㎡単価の分布 (全 {total_items} 件)')
                    
                    st.pyplot(fig)
                
                # 延床面積と成約価格の散布図（自動表示）
                st.subheader("📈 延床面積と成約価格の分布")
                
                # 延床面積がある物件のみをフィルタリング
                scatter_df = df[df['building_area'] > 0].copy()
                
                if len(scatter_df) > 0:
                    import matplotlib.pyplot as plt
                    import matplotlib.font_manager as fm
                    
                    # 日本語フォントの設定
                    plt.rcParams['font.family'] = 'Noto Sans CJK JP'
                    
                    fig, ax = plt.subplots(figsize=(10, 6))
                    
                    # 散布図を作成
                    scatter = ax.scatter(
                        scatter_df['building_area'], 
                        scatter_df['price'] / 10000,
                        alpha=0.6,
                        s=50,
                        color='lightblue',
                        edgecolors='black',
                        linewidth=0.5
                    )
                    
                    ax.set_xlabel('延床面積（㎡）')
                    ax.set_ylabel('価格（万円）')
                    ax.set_title(f'{results["search_conditions"]["location"]}の延床面積別価格事例の分布 ※{len(scatter_df)}件')
                    ax.grid(True, alpha=0.3)
                    
                    # Y軸を0、5,000万円、10,000万円の3段階に設定
                    ax.set_ylim(0, 10000)
                    ax.set_yticks([0, 5000, 10000])
                    ax.set_yticklabels(['0', '5,000', '10,000'])
                    
                    # X軸の範囲を調整（70から170㎡程度まで）
                    min_area = max(70, scatter_df['building_area'].min() * 0.9)
                    max_area = min(170, scatter_df['building_area'].max() * 1.1)
                    ax.set_xlim(min_area, max_area)
                    
                    st.pyplot(fig)
                    
                    # 統計情報
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("対象物件数", f"{len(scatter_df)}件")
                    with col2:
                        avg_building_area = scatter_df['building_area'].mean()
                        st.metric("平均延床面積", f"{avg_building_area:.1f}㎡")
                    with col3:
                        avg_price_scatter = scatter_df['price'].mean() / 10000
                        st.metric("平均価格", f"{avg_price_scatter:,.0f}万円")
                    
                    # 延床面積と価格の分布表（クロス集計）
                    st.subheader("📊 延床面積別売出価格の内訳")
                    
                    # 価格帯を定義（万円）- 3段階に簡略化
                    price_bins = [0, 5000, 10000, float('inf')]
                    price_labels = ['0~5,000', '5,000~10,000', '10,000~']
                    
                    # 延床面積帯を定義（㎡）
                    area_bins = list(range(40, 320, 20))  # 40, 60, 80, ..., 300
                    area_bins.append(320)  # 最後のbinを追加
                    area_labels = [f"{area_bins[i]}" for i in range(len(area_bins)-1)]
                    
                    # データを分類
                    scatter_df_copy = scatter_df.copy()
                    scatter_df_copy['price_range'] = pd.cut(scatter_df_copy['price']/10000, bins=price_bins, labels=price_labels, right=False)
                    scatter_df_copy['area_range'] = pd.cut(scatter_df_copy['building_area'], bins=area_bins, labels=area_labels, right=False)
                    
                    # クロス集計表を作成
                    cross_table = pd.crosstab(scatter_df_copy['price_range'], scatter_df_copy['area_range']).fillna(0)
                    
                    # 列の順序を調整
                    available_cols = [col for col in area_labels if col in cross_table.columns]
                    cross_table = cross_table.reindex(columns=available_cols, fill_value=0)
                    
                    # 行の順序を調整（下から上へ：0万円→5,000万円→10,000万円）
                    available_rows = [row for row in price_labels if row in cross_table.index]
                    cross_table = cross_table.reindex(index=available_rows, fill_value=0)
                    # Y軸を反転（下から上へ価格が上がるように）
                    cross_table = cross_table.iloc[::-1]
                    
                    # 表示用に整形
                    cross_table_display = cross_table.copy()
                    cross_table_display.index.name = '価格(万円)'
                    cross_table_display.columns.name = '延床面積(㎡)'
                    
                    # ヒートマップで表示
                    import matplotlib.pyplot as plt
                    import numpy as np
                    
                    fig, ax = plt.subplots(figsize=(12, 8))
                    
                    # ヒートマップ作成
                    im = ax.imshow(cross_table_display.values, cmap='Blues', aspect='auto')
                    
                    # 軸ラベル設定
                    ax.set_xticks(np.arange(len(cross_table_display.columns)))
                    ax.set_yticks(np.arange(len(cross_table_display.index)))
                    ax.set_xticklabels(cross_table_display.columns)
                    ax.set_yticklabels(cross_table_display.index)
                    
                    # 軸ラベル
                    ax.set_xlabel('延床面積(㎡)')
                    ax.set_ylabel('価格(万円)')
                    
                    # 各セルに数値を表示
                    for i in range(len(cross_table_display.index)):
                        for j in range(len(cross_table_display.columns)):
                            value = cross_table_display.iloc[i, j]
                            if value > 0:
                                text = ax.text(j, i, int(value), ha="center", va="center", 
                                             color="black" if value < cross_table_display.values.max()/2 else "white",
                                             fontsize=10, fontweight='bold')
                    
                    # グリッド線を追加
                    ax.set_xticks(np.arange(len(cross_table_display.columns)+1)-.5, minor=True)
                    ax.set_yticks(np.arange(len(cross_table_display.index)+1)-.5, minor=True)
                    ax.grid(which="minor", color="white", linestyle='-', linewidth=2)
                    
                    plt.title(f'{results["search_conditions"]["location"]}の延床面積別売出価格の内訳', fontsize=14, pad=20)
                    plt.tight_layout()
                    
                    st.pyplot(fig)
                    
                    
                    # 延床面積における割合を表示
                    if len(scatter_df_copy) > 0:
                        st.subheader("📈 延床面積における割合")
                        
                        # 延床面積帯別の割合を計算
                        area_counts = scatter_df_copy['area_range'].value_counts().sort_index()
                        total_count = len(scatter_df_copy)
                        
                        # 主要な面積帯の割合を表示
                        col1, col2, col3, col4 = st.columns(4)
                        
                        # 面積帯を定義
                        ranges = [
                            ("100~120", ["100", "120"]),
                            ("80~100", ["80", "100"]), 
                            ("140~160", ["140", "160"]),
                            ("160~180", ["160", "180"])
                        ]
                        
                        for i, (range_name, area_list) in enumerate(ranges):
                            count = sum(area_counts.get(area, 0) for area in area_list if area in area_counts.index)
                            percentage = (count / total_count * 100) if total_count > 0 else 0
                            
                            cols = [col1, col2, col3, col4]
                            with cols[i]:
                                st.metric(range_name, f"{percentage:.0f}%", f"{count}件")
                    
                else:
                    st.warning("延床面積のデータがある物件が見つかりませんでした。")
            
            else:
                st.info("検索条件に一致する物件が見つかりませんでした。")

else:
    # 初期表示
    st.info("👈 左側のサイドバーで検索条件を入力し、検索ボタンをクリックしてください。")
    
    # 使い方
    with st.expander("💡 使い方"):
        st.markdown("""
        1. **都道府県**を選択します
        2. **市区町村**を入力します（任意）
        3. **地区名**を入力します（任意）
        4. **取引種類**を選択します（複数選択可）
        5. **取引時期**を指定します
        6. **検索実行**ボタンをクリックします
        
        ※ APIキーが必要です。[不動産情報ライブラリ](https://www.reinfolib.mlit.go.jp/)で取得してください。
        """)
    
    # 注意事項
    with st.expander("⚠️ 注意事項"):
        st.markdown("""
        - このアプリは国土交通省の不動産情報ライブラリAPIを使用しています
        - APIの利用にはAPIキー（Subscription Key）が必要です
        - 大量のデータを取得する場合は時間がかかることがあります
        - 取引価格情報は実際の取引事例に基づくものです
        """)

# フッター
st.markdown("---")
st.markdown("データ提供: [国土交通省 不動産情報ライブラリ](https://www.reinfolib.mlit.go.jp/)")