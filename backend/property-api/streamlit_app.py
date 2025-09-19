"""
不動産取引価格検索 Streamlitアプリ
"""
import streamlit as st
import pandas as pd
from real_estate_client import RealEstateAPIClient
from datetime import datetime
import os
from dotenv import load_dotenv
import plotly.express as px
import plotly.graph_objects as go

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
# キャッシュを削除して毎回新しいインスタンスを作成（修正反映のため）
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
    st.error("⚠️ APIキーが設定されていません。GitHub SecretsにVITE_REAL_ESTATE_API_KEYを設定してください。")
    # デバッグ情報を表示
    with st.expander("デバッグ情報"):
        st.write(f"os.getenv('VITE_REAL_ESTATE_API_KEY'): {os.getenv('VITE_REAL_ESTATE_API_KEY')}")
        st.write(f"os.getenv('MAIN_REAL_ESTATE_API_KEY'): {os.getenv('MAIN_REAL_ESTATE_API_KEY')}")
        st.write(f"os.getenv('REAL_ESTATE_API_KEY'): {os.getenv('REAL_ESTATE_API_KEY')}")
        st.write(f"client.api_key: {client.api_key}")
        st.write(f"現在のディレクトリ: {os.getcwd()}")
        st.info("💡 GitHub Secretsを設定した後は、Codespacesの再起動が必要な場合があります。")
    st.stop()

# サイドバーで検索条件入力
st.sidebar.header("🔍 検索条件")
st.sidebar.markdown("**\u203b すべての項目が必須です**")

# 都道府県選択
prefectures = client.get_prefectures()
prefecture_names = [p["name"] for p in prefectures]
selected_prefecture = st.sidebar.selectbox(
    "都道府県 *",
    prefecture_names,
    index=prefecture_names.index("東京都") if "東京都" in prefecture_names else 0,
    help="都道府県を選択してください（必須）"
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
        city_names = [c["name"] for c in cities]
        selected_city_name = st.sidebar.selectbox(
            "市区町村 *",
            city_names,
            index=0,
            help="市区町村を選択してください（必須）"
        )

        selected_city = selected_city_name
        # 市区町村コードを取得
        for c in cities:
            if c["name"] == selected_city_name:
                selected_municipality_code = c["code"]
                break
    else:
        st.sidebar.error("この都道府県にはデータがありません")
        selected_city = None

# 地区名選択（動的に取得）
districts = []
selected_district = None

if selected_prefecture_code:
    with st.sidebar:
        with st.spinner("地区名を取得中..."):
            districts = get_districts_cached(selected_prefecture_code, selected_municipality_code)
    
    if districts:
        selected_district_name = st.sidebar.selectbox(
            "地区名 *",
            districts,
            index=0,
            help="地区名を選択してください（必須）"
        )

        selected_district = selected_district_name
    else:
        st.sidebar.error("このエリアには地区名データがありません")
        selected_district = None

# 取引種類選択
st.sidebar.subheader("取引種類 *")
trade_type_options = {
    "01": "土地",
    "02": "戸建て",
    "07": "マンション"
}

# ラジオボタンで単一選択に変更（デフォルトは戸建て）
selected_type_name = st.sidebar.radio(
    "種類を選択",
    options=list(trade_type_options.values()),
    index=1,  # 戸建てをデフォルト
    label_visibility="collapsed"
)

# 選択された名前からコードを取得
selected_type_code = [code for code, name in trade_type_options.items() if name == selected_type_name][0]
selected_types = [selected_type_code]

# 希望延床面積入力（必須）
st.sidebar.subheader("希望延床面積 *")

target_area = st.sidebar.number_input(
    "延床面積(㎡) *",
    min_value=10,
    max_value=500,
    value=100,
    step=10,
    help="探したい延床面積を入力してください（必須）"
)

# 許容範囲は自動設定（±10㎡）
area_tolerance = 10

use_target_area = True  # 常に有効

# 建築年入力（必須）
st.sidebar.subheader("建築年 *")

current_year = datetime.now().year
target_year = st.sidebar.number_input(
    "建築年 *",
    min_value=1950,
    max_value=current_year,
    value=2015,
    step=1,
    help="探したい建築年を入力してください（必須）"
)

# 許容範囲は自動設定（±5年）
year_tolerance = 5

use_target_year = True  # 常に有効

# 期間選択（直近3年分を自動設定）
st.sidebar.subheader("取引時期")
current_year = datetime.now().year

# 直近3年分を自動的に設定
from_year = current_year - 3
to_year = current_year

# 検索ボタン
search_button = st.sidebar.button("🔍 検索実行", type="primary", use_container_width=True)

# メインエリア
if search_button:
    # 必須項目のチェック
    errors = []
    if not selected_prefecture:
        errors.append("都道府県を選択してください")
    if not selected_city:
        errors.append("市区町村を選択してください")
    if not selected_district:
        errors.append("地区名を選択してください")
    if not selected_types:
        errors.append("取引種類を選択してください")

    if errors:
        for error in errors:
            st.error(error)
    else:
        # 検索実行
        with st.spinner("検索中..."):
            results = client.search_real_estate_prices(
                prefecture=selected_prefecture,
                city=selected_city,
                district=selected_district,
                trade_types=selected_types,
                from_year=from_year,
                from_quarter=1,  # 1月から
                to_year=to_year,
                to_quarter=4  # 12月まで（全四半期）
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

                # 希望面積での色分け準備
                if use_target_area and target_area:
                    # 取引種類に応じて適切な面積フィールドを選択
                    if selected_type_code == "01":  # 土地
                        area_field = 'land_area'
                    else:  # 戸建て・マンション
                        area_field = 'building_area'

                    # 希望面積との差を計算
                    table_df['area_diff'] = abs(table_df[area_field] - target_area)
                    table_df['is_target'] = table_df['area_diff'] <= area_tolerance

                    # 希望面積に近い順でソート
                    table_df = table_df.sort_values('area_diff')
                else:
                    table_df = table_df.sort_values('building_area')  # 延床面積でソート
                
                # 表示する列を限定
                display_table = pd.DataFrame({
                    'No.': range(1, len(table_df) + 1),
                    '所在地': table_df['location'],
                    '取引時期': table_df['trade_period'],
                    '取引価格': table_df['price_formatted'],
                    '土地面積(㎡)': table_df['land_area'].astype(int),
                    '延床面積(㎡)': table_df['building_area'].astype(int),
                    '間取り': table_df['floor_plan'],
                    '前面道路': table_df['road_type'] + ' ' + table_df['breadth'].astype(str) + 'm'
                })
                
                # 希望面積に応じた色分け設定
                if use_target_area and target_area and 'is_target' in table_df.columns:
                    # 強調表示される物件数を表示
                    target_count = table_df['is_target'].sum()
                    st.success(f"✨ 広さ {target_area}㎡ (±{area_tolerance}㎡) に該当する物件: {target_count}件")

                    # 該当する物件に色付けマークを追加
                    display_table['該当'] = table_df['is_target'].map({True: '🟢', False: ''})

                    # 列の順番を調整（該当列を最初に）
                    cols = display_table.columns.tolist()
                    cols = ['該当', 'No.'] + [col for col in cols if col not in ['該当', 'No.']]
                    display_table = display_table[cols]

                    # 表を表示（マーク付き）
                    st.dataframe(
                        display_table,
                        use_container_width=True,
                        hide_index=True,
                        height=600
                    )
                else:
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

                # 取引種類が土地かどうか判定
                is_land = selected_type_code == "01"  # 01が土地のコード

                if is_land:
                    # 土地専用の分析グラフ
                    st.subheader("📈 土地面積と成約価格の分布")

                    # 土地面積がある物件のみをフィルタリング
                    land_df = df[df['land_area'] > 0].copy()

                    if len(land_df) > 0:
                        import matplotlib.pyplot as plt
                        import japanize_matplotlib

                        fig, ax = plt.subplots(figsize=(10, 4))

                        # 散布図を作成（希望面積に応じて色分け）
                        if use_target_area and target_area:
                            # 希望面積との差を計算
                            land_df['area_diff'] = abs(land_df['land_area'] - target_area)
                            land_df['is_target'] = land_df['area_diff'] <= area_tolerance

                            # 色分けして散布図を作成
                            # 範囲外の物件
                            non_target = land_df[~land_df['is_target']]
                            ax.scatter(
                                non_target['land_area'],
                                non_target['price'] / 10000,
                                alpha=0.4,
                                s=30,
                                color='lightgray',
                                edgecolors='gray',
                                linewidth=0.5,
                                label='範囲外'
                            )

                            # 範囲内の物件（希望面積に近いほど濃い色）
                            target = land_df[land_df['is_target']]
                            if len(target) > 0:
                                # 距離に応じて色の濃さを調整
                                colors = plt.cm.Greens(1 - target['area_diff'] / area_tolerance)
                                ax.scatter(
                                    target['land_area'],
                                    target['price'] / 10000,
                                    alpha=0.8,
                                    s=80,
                                    c=colors,
                                    edgecolors='darkgreen',
                                    linewidth=1.5,
                                    label=f'{target_area}±{area_tolerance}㎡'
                                )

                                # 広さに縦線を追加
                                ax.axvline(x=target_area, color='red', linestyle='--', linewidth=1, alpha=0.5, label=f'広さ {target_area}㎡')
                                ax.axvspan(target_area-area_tolerance, target_area+area_tolerance, alpha=0.1, color='green')

                                ax.legend(loc='upper left')
                        else:
                            scatter = ax.scatter(
                                land_df['land_area'],
                                land_df['price'] / 10000,
                                alpha=0.6,
                                s=50,
                                color='lightgreen',
                                edgecolors='darkgreen',
                                linewidth=0.5
                            )

                        # Y軸を1000万円刻みで設定
                        ax.set_ylim(0, 10000)
                        y_ticks = list(range(0, 11000, 1000))
                        ax.set_yticks(y_ticks)
                        ax.set_yticklabels([f'{y:,}' for y in y_ticks])

                        # X軸を50㎡刻みで設定
                        max_area = int((land_df['land_area'].max() + 50) / 50) * 50
                        min_area = int(land_df['land_area'].min() / 50) * 50
                        x_ticks = list(range(min_area, max_area + 1, 50))
                        ax.set_xticks(x_ticks)

                        # グリッド線を追加
                        ax.grid(True, alpha=0.3, linestyle='--')

                        # ラベル
                        ax.set_xlabel('土地面積（㎡）', fontsize=12)
                        ax.set_ylabel('価格（万円）', fontsize=12)
                        ax.set_title(f'{results["search_conditions"]["location"]}の土地面積と成約価格の分布',
                                   fontsize=14, pad=20)

                        plt.tight_layout()
                        st.pyplot(fig)

                        # 土地面積別価格分布のヒートマップ
                        st.subheader("📊 土地面積別価格分布")

                        # 価格帯を定義（万円）- 1000万円刻み
                        price_bins = list(range(0, 11000, 1000))
                        price_bins.append(float('inf'))
                        price_labels = []
                        for i in range(len(price_bins)-1):
                            if price_bins[i+1] == float('inf'):
                                price_labels.append('10,000~')
                            else:
                                price_labels.append(f'{price_bins[i]:,}~{price_bins[i+1]:,}')

                        # 土地面積帯を定義（㎡）- 50㎡刻み
                        area_bins = list(range(50, min(500, int(land_df['land_area'].max()) + 50), 50))
                        if land_df['land_area'].max() > 500:
                            area_bins.append(int(land_df['land_area'].max()) + 50)
                        area_labels = [f"{area_bins[i]}" for i in range(len(area_bins)-1)]

                        # データを分類
                        land_df_copy = land_df.copy()
                        land_df_copy['price_range'] = pd.cut(land_df_copy['price']/10000, bins=price_bins, labels=price_labels, right=False)
                        land_df_copy['area_range'] = pd.cut(land_df_copy['land_area'], bins=area_bins, labels=area_labels, right=False)

                        # クロス集計表を作成
                        cross_table = pd.crosstab(land_df_copy['price_range'], land_df_copy['area_range']).fillna(0)

                        # 列の順序を調整
                        available_cols = [col for col in area_labels if col in cross_table.columns]
                        cross_table = cross_table.reindex(columns=available_cols, fill_value=0)

                        # 行の順序を調整
                        available_rows = [row for row in price_labels if row in cross_table.index]
                        cross_table = cross_table.reindex(index=available_rows, fill_value=0)
                        # Y軸を反転
                        cross_table = cross_table.iloc[::-1]

                        # 表示用に整形
                        cross_table_display = cross_table.copy()
                        cross_table_display.index.name = '価格(万円)'
                        cross_table_display.columns.name = '土地面積(㎡)'

                        # ヒートマップで表示
                        import numpy as np

                        fig, ax = plt.subplots(figsize=(12, 4))

                        # ヒートマップ作成
                        im = ax.imshow(cross_table_display.values, cmap='Greens', aspect='auto')

                        # 軸ラベル設定
                        ax.set_xticks(np.arange(len(cross_table_display.columns)))
                        ax.set_yticks(np.arange(len(cross_table_display.index)))
                        ax.set_xticklabels(cross_table_display.columns)
                        ax.set_yticklabels(cross_table_display.index)

                        # 軸ラベル
                        ax.set_xlabel('土地面積(㎡)')
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

                        plt.title(f'{results["search_conditions"]["location"]}の土地面積別価格分布', fontsize=14, pad=20)
                        plt.tight_layout()

                        st.pyplot(fig)
                    else:
                        st.warning("土地面積のデータがある物件が見つかりませんでした。")

                else:
                    # 戸建て・マンション用の分析グラフ（延床面積/専有面積）
                    area_label = "専有面積" if selected_type_code == "07" else "延床面積"
                    st.subheader(f"📈 {area_label}と成約価格の分布")

                    # 延床面積がある物件のみをフィルタリング
                    scatter_df = df[df['building_area'] > 0].copy()

                    if len(scatter_df) > 0:
                        # Plotlyでインタラクティブな散布図を作成
                        scatter_df['price_man'] = scatter_df['price'] / 10000

                        # ホバー時に表示する情報を準備
                        scatter_df['hover_text'] = (
                            '所在地: ' + scatter_df['location'] + '<br>' +
                            '価格: ' + scatter_df['price_formatted'] + '<br>' +
                            f'{area_label}: ' + scatter_df['building_area'].astype(str) + '㎡<br>' +
                            '㎡単価: ' + scatter_df['unit_price_formatted'] + '<br>' +
                            '建築年: ' + scatter_df['build_year'].astype(str) + '<br>' +
                            '間取り: ' + scatter_df['floor_plan'].astype(str) + '<br>' +
                            '取引時期: ' + scatter_df['trade_period'].astype(str)
                        )

                        fig = go.Figure()

                        if use_target_area and target_area:
                            # 希望面積との差を計算
                            scatter_df['area_diff'] = abs(scatter_df['building_area'] - target_area)
                            scatter_df['is_target'] = scatter_df['area_diff'] <= area_tolerance

                            # 範囲外の物件
                            non_target = scatter_df[~scatter_df['is_target']]
                            if len(non_target) > 0:
                                fig.add_trace(go.Scatter(
                                    x=non_target['building_area'],
                                    y=non_target['price_man'],
                                    mode='markers',
                                    name='その他',
                                    marker=dict(
                                        color='#4169E1',
                                        size=8,
                                        opacity=0.6,
                                        line=dict(color='#000080', width=0.5)
                                    ),
                                    text=non_target['hover_text'],
                                    hovertemplate='%{text}<extra></extra>'
                                ))

                            # 範囲内の物件
                            target = scatter_df[scatter_df['is_target']]
                            if len(target) > 0:
                                fig.add_trace(go.Scatter(
                                    x=target['building_area'],
                                    y=target['price_man'],
                                    mode='markers',
                                    name=f'{target_area}±{area_tolerance}㎡',
                                    marker=dict(
                                        color='#FF4500',
                                        size=12,
                                        opacity=0.8,
                                        line=dict(color='#8B0000', width=1),
                                    ),
                                    text=target['hover_text'],
                                    hovertemplate='%{text}<extra></extra>'
                                ))

                                # 希望面積に縦線を追加
                                fig.add_vline(x=target_area, line_dash="dash", line_color="red",
                                            annotation_text=f"広さ {target_area}㎡", annotation_position="top")

                                # 許容範囲を背景色で表示
                                fig.add_vrect(x0=target_area-area_tolerance, x1=target_area+area_tolerance,
                                            fillcolor="blue", opacity=0.1, layer="below", line_width=0)
                        else:
                            # 通常の散布図
                            fig.add_trace(go.Scatter(
                                x=scatter_df['building_area'],
                                y=scatter_df['price_man'],
                                mode='markers',
                                name='物件',
                                marker=dict(
                                    color='#FFD700',
                                    size=10,
                                    opacity=0.7,
                                    line=dict(color='#FFA500', width=1)
                                ),
                                text=scatter_df['hover_text'],
                                hovertemplate='%{text}<extra></extra>'
                            ))

                        # レイアウトの設定
                        fig.update_layout(
                            title={
                                'text': f'{area_label}と価格の分布 - {len(scatter_df)}件',
                                'font': {'color': 'black', 'size': 16}
                            },
                            xaxis_title={
                                'text': f'{area_label}（㎡）',
                                'font': {'color': 'black', 'size': 14}
                            },
                            yaxis_title={
                                'text': '価格（万円）',
                                'font': {'color': 'black', 'size': 14}
                            },
                            height=500,
                            hovermode='closest',
                            showlegend=True,
                            plot_bgcolor='white',
                            paper_bgcolor='white',
                            font=dict(color='black'),
                            xaxis=dict(
                                gridcolor='#E0E0E0',
                                gridwidth=0.5,
                                dtick=10,
                                range=[max(50, scatter_df['building_area'].min() - 5),
                                      min(200, scatter_df['building_area'].max() + 5)],
                                showgrid=True,
                                zeroline=True,
                                zerolinecolor='#E0E0E0',
                                showline=True,
                                linecolor='black',
                                linewidth=1,
                                tickfont=dict(color='black', size=12),
                                tickcolor='black'
                            ),
                            yaxis=dict(
                                gridcolor='#E0E0E0',
                                gridwidth=0.5,
                                dtick=1000,
                                range=[0, min(10000, scatter_df['price_man'].max() + 500)],
                                showgrid=True,
                                zeroline=True,
                                zerolinecolor='#E0E0E0',
                                showline=True,
                                linecolor='black',
                                linewidth=1,
                                tickfont=dict(color='black', size=12),
                                tickcolor='black',
                                tickformat=',d',
                                ticksuffix='万円',
                                tickvals=list(range(0, int(min(10000, scatter_df['price_man'].max() + 500)) + 1, 1000)),
                                ticktext=[f'{i:,}万円' if i > 0 else '0' for i in range(0, int(min(10000, scatter_df['price_man'].max() + 500)) + 1, 1000)]
                            )
                        )

                        st.plotly_chart(fig, use_container_width=True)

                        # 統計情報
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("対象物件数", f"{len(scatter_df)}件")
                        with col2:
                            avg_building_area = scatter_df['building_area'].mean()
                            st.metric(f"平均{area_label}", f"{avg_building_area:.1f}㎡")
                        with col3:
                            avg_price_scatter = scatter_df['price'].mean() / 10000
                            st.metric("平均価格", f"{avg_price_scatter:,.0f}万円")
                    
                    # 面積と価格の分布表（クロス集計）
                    st.subheader(f"📊 {area_label}別売出価格の内訳")
                    
                    # 価格帯を定義（万円）- 1000万円刻み
                    price_bins = list(range(0, 11000, 1000))  # 0, 1000, 2000, ..., 10000
                    price_bins.append(float('inf'))  # 10000万円以上
                    price_labels = []
                    for i in range(len(price_bins)-1):
                        if price_bins[i+1] == float('inf'):
                            price_labels.append('10,000~')
                        else:
                            price_labels.append(f'{price_bins[i]:,}~{price_bins[i+1]:,}')

                    # 面積帯を定義（㎡）- 10㎡刻み
                    area_bins = list(range(50, 210, 10))  # 50, 60, 70, ..., 200
                    area_bins.append(210)  # 最後のbinを追加
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
                    cross_table_display.columns.name = f'{area_label}(㎡)'
                    
                    # Plotlyでインタラクティブなヒートマップを作成
                    import plotly.graph_objects as go
                    import numpy as np

                    # ホバーテキストを作成
                    hover_text = []
                    for i in range(len(cross_table_display.index)):
                        row_text = []
                        for j in range(len(cross_table_display.columns)):
                            value = int(cross_table_display.iloc[i, j])
                            price_range = cross_table_display.index[i]
                            area_range = cross_table_display.columns[j]
                            text = f'価格: {price_range}<br>{area_label}: {area_range}㎡<br>件数: {value}件'
                            row_text.append(text)
                        hover_text.append(row_text)

                    # ヒートマップ作成
                    fig = go.Figure(data=go.Heatmap(
                        z=cross_table_display.values,
                        x=cross_table_display.columns,
                        y=cross_table_display.index,
                        colorscale='Blues',
                        text=cross_table_display.values,
                        texttemplate='%{text:.0f}',
                        textfont={"size": 12},
                        hovertext=hover_text,
                        hovertemplate='%{hovertext}<extra></extra>',
                        colorbar=dict(title="件数")
                    ))

                    # レイアウトの設定
                    fig.update_layout(
                        title={
                            'text': f'{results["search_conditions"]["location"]}の{area_label}別売出価格の内訳',
                            'font': {'color': 'black', 'size': 16}
                        },
                        xaxis_title={
                            'text': f'{area_label}(㎡)',
                            'font': {'color': 'black', 'size': 14}
                        },
                        yaxis_title={
                            'text': '価格(万円)',
                            'font': {'color': 'black', 'size': 14}
                        },
                        height=400,
                        plot_bgcolor='white',
                        paper_bgcolor='white',
                        font=dict(color='black'),
                        xaxis=dict(
                            side='bottom',
                            tickfont=dict(color='black', size=12),
                            tickangle=0,
                            showgrid=False,
                            showline=True,
                            linecolor='black'
                        ),
                        yaxis=dict(
                            side='left',
                            tickfont=dict(color='black', size=12),
                            showgrid=False,
                            showline=True,
                            linecolor='black'
                        )
                    )

                    st.plotly_chart(fig, use_container_width=True)
                    
                    
                    # 面積における割合を表示
                    if len(scatter_df_copy) > 0:
                        st.subheader(f"📈 {area_label}における割合")

                        # 面積帯別の割合を計算
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
                        st.warning(f"{area_label}のデータがある物件が見つかりませんでした。")

                    # 建築年別価格分布グラフを追加（土地以外の場合のみ）
                    st.subheader("🏗️ 建築年別価格分布")

                    # 建築年のデータをフィルタリング（建築年が有効なデータのみ）
                    # dfから直接建築年データを取得
                    build_year_df = df.copy()

                    # 建築年が有効なデータのみフィルタリング
                    build_year_df = build_year_df[
                        (build_year_df['build_year'].notna()) &
                        (build_year_df['build_year'] != "") &
                        (build_year_df['build_year'] != "不詳")
                    ]

                    # 建築年を西暦に変換
                    def convert_to_year(year_str):
                        if pd.isna(year_str) or year_str == "" or year_str == "不詳":
                            return None

                        try:
                            year_str = str(year_str)

                            # 既に西暦4桁の場合
                            if year_str.isdigit() and len(year_str) == 4:
                                return int(year_str)

                            # 和暦から西暦への変換
                            if "昭和" in year_str:
                                num = int(''.join(filter(str.isdigit, year_str.replace("昭和", ""))))
                                return 1925 + num
                            elif "平成" in year_str:
                                num = int(''.join(filter(str.isdigit, year_str.replace("平成", ""))))
                                return 1988 + num
                            elif "令和" in year_str:
                                num = int(''.join(filter(str.isdigit, year_str.replace("令和", ""))))
                                return 2018 + num
                            else:
                                # 数字のみ抽出（"2024年"などの場合）
                                year_nums = ''.join(filter(str.isdigit, year_str))
                                if year_nums and len(year_nums) >= 4:
                                    return int(year_nums[:4])
                        except:
                            return None
                        return None

                    # 建築年を変換
                    build_year_df['year'] = build_year_df['build_year'].apply(convert_to_year)

                    # 有効な年のみフィルタリング
                    build_year_df = build_year_df[
                        (build_year_df['year'].notna()) &
                        (build_year_df['year'] > 1950) &
                        (build_year_df['year'] <= 2025)
                    ]

                    # 価格を万円単位に変換
                    build_year_df['price_man'] = build_year_df['price'] / 10000

                    if len(build_year_df) > 0:
                        # ホバー時に表示する情報を準備
                        build_year_df['hover_text'] = (
                            '所在地: ' + build_year_df['location'] + '<br>' +
                            '価格: ' + build_year_df['price_formatted'] + '<br>' +
                            '建築年: ' + build_year_df['year'].astype(str) + '年<br>' +
                            '延床面積: ' + build_year_df['building_area'].astype(str) + '㎡<br>' +
                            '㎡単価: ' + build_year_df['unit_price_formatted'] + '<br>' +
                            '間取り: ' + build_year_df['floor_plan'].astype(str) + '<br>' +
                            '取引時期: ' + build_year_df['trade_period'].astype(str)
                        )

                        fig = go.Figure()

                        if use_target_year and target_year:
                            # 希望建築年との差を計算
                            build_year_df['year_diff'] = abs(build_year_df['year'] - target_year)
                            build_year_df['is_target_year'] = build_year_df['year_diff'] <= year_tolerance

                            # 範囲外の物件
                            non_target = build_year_df[~build_year_df['is_target_year']]
                            if len(non_target) > 0:
                                fig.add_trace(go.Scatter(
                                    x=non_target['year'],
                                    y=non_target['price_man'],
                                    mode='markers',
                                    name='その他',
                                    marker=dict(
                                        color='#4169E1',
                                        size=8,
                                        opacity=0.6,
                                        line=dict(color='#000080', width=0.5)
                                    ),
                                    text=non_target['hover_text'],
                                    hovertemplate='%{text}<extra></extra>'
                                ))

                            # 範囲内の物件
                            target = build_year_df[build_year_df['is_target_year']]
                            if len(target) > 0:
                                fig.add_trace(go.Scatter(
                                    x=target['year'],
                                    y=target['price_man'],
                                    mode='markers',
                                    name=f'{target_year}±{year_tolerance}年',
                                    marker=dict(
                                        color='#FF4500',
                                        size=12,
                                        opacity=0.8,
                                        line=dict(color='#8B0000', width=1),
                                    ),
                                    text=target['hover_text'],
                                    hovertemplate='%{text}<extra></extra>'
                                ))

                                # 希望建築年に縦線を追加
                                fig.add_vline(x=target_year, line_dash="dash", line_color="red",
                                            annotation_text=f"建築年 {target_year}年", annotation_position="top")

                                # 許容範囲を背景色で表示
                                fig.add_vrect(x0=target_year-year_tolerance, x1=target_year+year_tolerance,
                                            fillcolor="red", opacity=0.1, layer="below", line_width=0)
                        else:
                            # 通常の散布図
                            fig.add_trace(go.Scatter(
                                x=build_year_df['year'],
                                y=build_year_df['price_man'],
                                mode='markers',
                                name='物件',
                                marker=dict(
                                    color='#FFD700',
                                    size=10,
                                    opacity=0.7,
                                    line=dict(color='#FFA500', width=1)
                                ),
                                text=build_year_df['hover_text'],
                                hovertemplate='%{text}<extra></extra>'
                            ))

                        # レイアウトの設定
                        fig.update_layout(
                            title={
                                'text': f'{results["search_conditions"]["location"]}の建築年別価格分布',
                                'font': {'color': 'black', 'size': 16}
                            },
                            xaxis_title={
                                'text': '建築年',
                                'font': {'color': 'black', 'size': 14}
                            },
                            yaxis_title={
                                'text': '価格（万円）',
                                'font': {'color': 'black', 'size': 14}
                            },
                            height=500,
                            hovermode='closest',
                            showlegend=True,
                            plot_bgcolor='white',
                            paper_bgcolor='white',
                            font=dict(color='black'),
                            xaxis=dict(
                                gridcolor='#E0E0E0',
                                gridwidth=0.5,
                                dtick=5,
                                range=[build_year_df['year'].min() - 2, build_year_df['year'].max() + 2],
                                showgrid=True,
                                zeroline=True,
                                zerolinecolor='#E0E0E0',
                                showline=True,
                                linecolor='black',
                                linewidth=1,
                                tickfont=dict(color='black', size=12),
                                tickcolor='black'
                            ),
                            yaxis=dict(
                                gridcolor='#E0E0E0',
                                gridwidth=0.5,
                                dtick=1000,
                                range=[0, min(10000, build_year_df['price_man'].max() + 500)],
                                showgrid=True,
                                zeroline=True,
                                zerolinecolor='#E0E0E0',
                                showline=True,
                                linecolor='black',
                                linewidth=1,
                                tickfont=dict(color='black', size=12),
                                tickcolor='black',
                                tickformat=',d',
                                ticksuffix='万円',
                                tickvals=list(range(0, int(min(10000, build_year_df['price_man'].max() + 500)) + 1, 1000)),
                                ticktext=[f'{i:,}万円' if i > 0 else '0' for i in range(0, int(min(10000, build_year_df['price_man'].max() + 500)) + 1, 1000)]
                            )
                        )

                        st.plotly_chart(fig, use_container_width=True)

                    # 統計情報を表示
                    col1, col2, col3, col4 = st.columns(4)
                    with col1:
                        st.metric("データ件数", f"{len(build_year_df)}件")
                    with col2:
                        st.metric("最古建築年", f"{int(build_year_df['year'].min())}年")
                    with col3:
                        st.metric("最新建築年", f"{int(build_year_df['year'].max())}年")
                    with col4:
                        avg_price = build_year_df['price'].mean()
                        st.metric("平均価格", f"{avg_price:,.0f}万円")

                    # 建築年別価格分布のヒートマップ
                    st.subheader("📊 建築年別価格分布（ヒートマップ）")

                    # 価格帯を定義（万円）- 1000万円刻み
                    price_bins = list(range(0, 11000, 1000))  # 0, 1000, 2000, ..., 10000
                    price_bins.append(float('inf'))  # 10000万円以上
                    price_labels = []
                    for i in range(len(price_bins)-1):
                        if price_bins[i+1] == float('inf'):
                            price_labels.append('10,000~')
                        else:
                            price_labels.append(f'{price_bins[i]:,}~{price_bins[i+1]:,}')

                    # 建築年帯を定義（5年刻み）
                    min_year = int(build_year_df['year'].min() / 5) * 5
                    max_year = int((build_year_df['year'].max() + 4) / 5) * 5
                    year_bins = list(range(min_year, max_year + 5, 5))
                    year_labels = [f"{year_bins[i]}" for i in range(len(year_bins)-1)]

                    # データを分類
                    heatmap_df = build_year_df.copy()
                    heatmap_df['price_range'] = pd.cut(heatmap_df['price'], bins=price_bins, labels=price_labels, right=False)
                    heatmap_df['year_range'] = pd.cut(heatmap_df['year'], bins=year_bins, labels=year_labels, right=False)

                    # クロス集計表を作成
                    cross_table_year = pd.crosstab(heatmap_df['price_range'], heatmap_df['year_range']).fillna(0)

                    # 列の順序を調整
                    available_cols = [col for col in year_labels if col in cross_table_year.columns]
                    cross_table_year = cross_table_year.reindex(columns=available_cols, fill_value=0)

                    # 行の順序を調整（下から上へ：0万円→10,000万円）
                    available_rows = [row for row in price_labels if row in cross_table_year.index]
                    cross_table_year = cross_table_year.reindex(index=available_rows, fill_value=0)
                    # Y軸を反転（下から上へ価格が上がるように）
                    cross_table_year = cross_table_year.iloc[::-1]

                    # 表示用に整形
                    cross_table_year_display = cross_table_year.copy()
                    cross_table_year_display.index.name = '価格(万円)'
                    cross_table_year_display.columns.name = '建築年'

                    # ヒートマップで表示
                    fig, ax = plt.subplots(figsize=(14, 4))

                    # ヒートマップ作成
                    im = ax.imshow(cross_table_year_display.values, cmap='Oranges', aspect='auto')

                    # 軸ラベル設定
                    ax.set_xticks(np.arange(len(cross_table_year_display.columns)))
                    ax.set_yticks(np.arange(len(cross_table_year_display.index)))
                    ax.set_xticklabels(cross_table_year_display.columns, rotation=45)
                    ax.set_yticklabels(cross_table_year_display.index)

                    # 軸ラベル
                    ax.set_xlabel('建築年（5年刻み）', fontsize=12)
                    ax.set_ylabel('価格（万円）', fontsize=12)

                    # 各セルに数値を表示
                    for i in range(len(cross_table_year_display.index)):
                        for j in range(len(cross_table_year_display.columns)):
                            value = cross_table_year_display.iloc[i, j]
                            if value > 0:
                                text = ax.text(j, i, int(value), ha="center", va="center",
                                             color="black" if value < cross_table_year_display.values.max()/2 else "white",
                                             fontsize=9, fontweight='bold')

                    # グリッド線を追加
                    ax.set_xticks(np.arange(len(cross_table_year_display.columns)+1)-.5, minor=True)
                    ax.set_yticks(np.arange(len(cross_table_year_display.index)+1)-.5, minor=True)
                    ax.grid(which="minor", color="white", linestyle='-', linewidth=2)

                    plt.title(f'{results["search_conditions"]["location"]}の建築年別価格分布', fontsize=14, pad=20)
                    plt.tight_layout()

                    st.pyplot(fig)

                    # 建築年代別の統計情報
                    st.subheader("📈 建築年代別の統計")

                    # 年代別に分類（10年刻み）
                    decade_bins = list(range(min_year, max_year + 10, 10))
                    decade_labels = [f"{decade_bins[i]}年代" for i in range(len(decade_bins)-1)]
                    heatmap_df['decade'] = pd.cut(heatmap_df['year'], bins=decade_bins, labels=decade_labels, right=False)

                    # 年代別の統計
                    decade_stats = heatmap_df.groupby('decade').agg({
                        'price': ['count', 'mean', 'median', 'std']
                    }).round(0)

                    # カラム名を整理
                    decade_stats.columns = ['件数', '平均価格', '中央値', '標準偏差']

                    # 表示
                    col1, col2 = st.columns([2, 1])
                    with col1:
                        st.dataframe(decade_stats)
                    with col2:
                        # 最も多い年代を表示
                        if len(decade_stats) > 0:
                            most_common_decade = decade_stats['件数'].idxmax()
                            st.metric("最多取引年代", most_common_decade)
                            st.metric("該当件数", f"{int(decade_stats.loc[most_common_decade, '件数'])}件")

                # 成約件数の推移グラフ
                st.subheader("📊 成約件数の推移")

                # 取引時期のデータを集計
                period_df = pd.DataFrame()
                for item in results['results']:
                    if item.get('trade_period') and item['trade_period'] != "":
                        new_row = pd.DataFrame([{
                            'period': item['trade_period'],
                            'count': 1
                        }])
                        period_df = pd.concat([period_df, new_row], ignore_index=True)

                if len(period_df) > 0:
                    # 期間別に集計
                    period_counts = period_df.groupby('period')['count'].sum().sort_index()

                    import matplotlib.pyplot as plt
                    import japanize_matplotlib

                    fig, ax = plt.subplots(figsize=(14, 5))

                    # 棒グラフを作成
                    bars = ax.bar(range(len(period_counts)), period_counts.values,
                                  color='skyblue', edgecolor='navy', linewidth=0.5)

                    # 棒の上に件数を表示
                    for i, (bar, count) in enumerate(zip(bars, period_counts.values)):
                        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                               f'{int(count)}件', ha='center', va='bottom', fontsize=10)

                    # Y軸を1件刻みで設定
                    max_count = int(period_counts.max()) + 2
                    y_ticks = list(range(0, max_count + 1, 1))
                    ax.set_ylim(0, max_count)
                    ax.set_yticks(y_ticks)

                    # X軸ラベルを設定（四半期を月表記に変換）
                    def convert_quarter_to_month(period_str):
                        """四半期表記を月表記に変換"""
                        # 例: "2023年第1四半期" -> "2023年1月〜3月"
                        if "第1四半期" in period_str:
                            return period_str.replace("第1四半期", "1月〜3月")
                        elif "第2四半期" in period_str:
                            return period_str.replace("第2四半期", "4月〜6月")
                        elif "第3四半期" in period_str:
                            return period_str.replace("第3四半期", "7月〜9月")
                        elif "第4四半期" in period_str:
                            return period_str.replace("第4四半期", "10月〜12月")
                        return period_str

                    x_labels = [convert_quarter_to_month(str(period)) for period in period_counts.index]
                    ax.set_xticks(range(len(period_counts)))
                    ax.set_xticklabels(x_labels, rotation=45, ha='right')

                    # グリッド線を追加
                    ax.grid(True, axis='y', alpha=0.3, linestyle='--')

                    # ラベル
                    ax.set_xlabel('取引時期', fontsize=12)
                    ax.set_ylabel('成約件数（件）', fontsize=12)
                    ax.set_title(f'{results["search_conditions"]["location"]}の成約件数推移',
                               fontsize=14, pad=20)

                    plt.tight_layout()
                    st.pyplot(fig)

                    # 統計情報
                    col1, col2, col3, col4 = st.columns(4)
                    with col1:
                        st.metric("総成約件数", f"{period_counts.sum()}件")
                    with col2:
                        st.metric("期間数", f"{len(period_counts)}期間")
                    with col3:
                        avg_count = period_counts.mean()
                        st.metric("平均成約件数", f"{avg_count:.1f}件/期")
                    with col4:
                        max_period = period_counts.idxmax()
                        st.metric("最多成約期", max_period)
                else:
                    st.info("取引時期データが含まれる物件がありません。")

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