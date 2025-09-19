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
import numpy as np
from scipy import stats
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

# .envファイルの読み込み
load_dotenv()

# ページ設定
st.set_page_config(
    page_title="不動産取引価格検索",
    page_icon="🏢",
    layout="wide"
)

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
            if results['search_count'] > 0:
                # データフレームに変換
                df = pd.DataFrame(results['results'])

                # AIトレンド分析セクション
                st.markdown("### 📊 AI市場分析")

                # 類似物件の価格レンジ分析（ユーザーの検索条件に基づく）
                if use_target_area or use_target_year:
                    st.success("🎯 **あなたの条件に近い物件の価格分布**")

                    similar_properties = df.copy()
                    conditions_text = []

                    # 面積条件でフィルタリング
                    if use_target_area and target_area:
                        # 選択された取引種類がマンションかどうかを判定
                        is_mansion = '07' in selected_types  # 07はマンションのコード
                        area_field = 'building_area' if is_mansion else 'area'
                        if area_field in similar_properties.columns:
                            similar_properties = similar_properties[
                                (similar_properties[area_field] >= target_area - area_tolerance) &
                                (similar_properties[area_field] <= target_area + area_tolerance)
                            ]
                            conditions_text.append(f"延床面積 {target_area}±{area_tolerance}㎡")

                    # 建築年条件でフィルタリング
                    if use_target_year and target_year:
                        if 'building_year' in similar_properties.columns:
                            similar_properties = similar_properties[
                                (similar_properties['building_year'] >= target_year - year_tolerance) &
                                (similar_properties['building_year'] <= target_year + year_tolerance)
                            ]
                            conditions_text.append(f"建築年 {target_year}±{year_tolerance}年")

                    if len(similar_properties) > 0:
                        # 統計値を計算
                        similar_prices = similar_properties['price'] / 10000
                        q25 = similar_prices.quantile(0.25)
                        q50 = similar_prices.quantile(0.50)
                        q75 = similar_prices.quantile(0.75)

                        col_s1, col_s2, col_s3, col_s4 = st.columns(4)

                        with col_s1:
                            st.metric(
                                "下位25%",
                                f"{q25:,.0f}万円以下",
                                help="類似物件の25%がこの価格以下"
                            )

                        with col_s2:
                            st.metric(
                                "中央値レンジ",
                                f"{q25:,.0f}〜{q75:,.0f}万円",
                                help="類似物件の50%がこの範囲内"
                            )

                        with col_s3:
                            st.metric(
                                "上位25%",
                                f"{q75:,.0f}万円以上",
                                help="類似物件の25%がこの価格以上"
                            )

                        with col_s4:
                            st.metric(
                                "分析サンプル数",
                                f"{len(similar_properties)}件",
                                help="指定条件に該当する物件数"
                            )

                    else:
                        st.info("指定条件に該当する取引事例が見つかりませんでした")

                # 統計データの計算（外れ値を除外）
                # IQR法で外れ値を検出
                Q1 = df['price'].quantile(0.25)
                Q3 = df['price'].quantile(0.75)
                IQR = Q3 - Q1

                # 外れ値の境界を計算（通常の1.5倍を2.5倍に緩和して、ある程度の高額物件は残す）
                lower_bound = Q1 - 2.5 * IQR
                upper_bound = Q3 + 2.5 * IQR

                # 外れ値を除いたデータ
                df_filtered = df[(df['price'] >= lower_bound) & (df['price'] <= upper_bound)]

                # 外れ値を除いた統計値を計算
                avg_price = df_filtered['price'].mean() / 10000  # 万円単位
                median_price = df_filtered['price'].median() / 10000
                price_std = df_filtered['price'].std() / 10000
                total_count = len(df)
                outlier_count = len(df) - len(df_filtered)

                # 四分位数を計算（外れ値除外後）
                q25_price = df_filtered['price'].quantile(0.25) / 10000
                q75_price = df_filtered['price'].quantile(0.75) / 10000

                # マーケット分析セクション
                st.markdown("### 📊 **マーケット分析**")

                # 価格トレンドの計算（外れ値を除いたデータで計算）+ 統計的有意性
                p_value = None
                r_squared = None
                trend_slope = 0

                if 'trade_period' in df_filtered.columns:
                    # 取引時期から年を抽出
                    df_filtered['year'] = df_filtered['trade_period'].str.extract(r'(\d{4})').astype(float)

                    # デバッグ：取引時期の年を確認
                    unique_years = df_filtered['year'].dropna().unique()
                    unique_years_sorted = sorted(unique_years) if len(unique_years) > 0 else []

                    if len(unique_years_sorted) >= 2:
                        # 年ごとの平均価格を計算
                        yearly_prices = df_filtered.groupby('year')['price'].mean() / 10000

                        # 線形回帰分析で統計的有意性を計算
                        x = np.array(yearly_prices.index.values)
                        y = np.array(yearly_prices.values)

                        if len(x) >= 2:
                            # scipyの線形回帰
                            slope, intercept, r_value, p_value_calc, std_err = stats.linregress(x, y)
                            p_value = p_value_calc
                            r_squared = r_value ** 2
                            trend_slope = slope

                            # 年次成長率を傾きから計算（基準年の価格に対する割合）
                            base_price = yearly_prices.loc[unique_years_sorted[0]]
                            if base_price > 0:
                                growth_rate = (slope / base_price) * 100
                            else:
                                growth_rate = 0
                        else:
                            growth_rate = 0
                    else:
                        growth_rate = 0
                else:
                    growth_rate = 0
                    unique_years_sorted = []

                # 面積あたりの平均単価（外れ値を除いたデータで計算）
                if 'area' in df_filtered.columns:
                    df_filtered['unit_price'] = df_filtered['price'] / df_filtered['area'] / 10000  # 万円/㎡
                    avg_unit_price = df_filtered['unit_price'].mean()
                else:
                    avg_unit_price = 0

                # メトリクスを4列で表示
                col1, col2, col3, col4 = st.columns(4)

                with col1:
                    # データの期間を取得して価格トレンドを表示（統計的有意性付き）
                    if 'trade_period' in df_filtered.columns and df_filtered['trade_period'].notna().any():
                        # 実際の年データを確認
                        if len(unique_years_sorted) >= 2 and p_value is not None:
                            # 実際のデータの期間を取得
                            periods_by_year = df_filtered.groupby('year')['trade_period'].first()
                            oldest_period = periods_by_year.loc[unique_years_sorted[0]]
                            newest_period = periods_by_year.loc[unique_years_sorted[-1]]

                            # 統計的有意性に基づく表示
                            if p_value < 0.05:  # 統計的に有意
                                if growth_rate > 0:
                                    trend_value = f"📈 +{growth_rate:.1f}%/年"
                                    significance = "明確な上昇傾向"
                                else:
                                    trend_value = f"📉 {growth_rate:.1f}%/年"
                                    significance = "明確な下降傾向"
                                delta_text = significance
                            else:  # 統計的に有意でない
                                trend_value = "→ ±0%/年"
                                delta_text = "価格変動なし"

                            years_list = ", ".join([str(int(y)) for y in unique_years_sorted])
                            help_text = f"""
                            📊 分析結果:
                            • データ期間: {years_list}
                            • サンプル数: {len(df_filtered)}件
                            • 年間変化率: {growth_rate:+.1f}%
                            """

                        elif len(unique_years_sorted) == 1:
                            # 1年分のデータのみ
                            year_str = str(int(unique_years_sorted[0]))
                            trend_value = "算出不可"
                            delta_text = f"{year_str}年のデータのみ"
                            help_text = "統計分析には複数年のデータが必要です"

                        else:
                            # 年データが取得できない
                            trend_value = "算出不可"
                            delta_text = f"データ不足"
                            help_text = "統計分析に必要なデータがありません"
                    else:
                        trend_value = "算出不可"
                        delta_text = "取引時期データなし"
                        help_text = "APIレスポンスに取引時期が含まれていません"

                    st.metric(
                        label="AI価格トレンド分析",
                        value=trend_value,
                        delta=delta_text,
                        help=help_text
                    )

                with col2:
                    # 下位25%の価格
                    help_text = "市場の25%がこの価格以下"
                    if outlier_count > 0:
                        help_text += f"\n（外れ値{outlier_count}件除外済）"
                    st.metric(
                        label="下位25%",
                        value=f"{q25_price:,.0f}万円以下",
                        delta=None,
                        help=help_text
                    )

                with col3:
                    # 中央値レンジ
                    st.metric(
                        label="中央値レンジ",
                        value=f"{q25_price:,.0f}〜{q75_price:,.0f}万円",
                        delta=None,
                        help=f"市場の50%がこの範囲内\n中央値: {median_price:,.0f}万円"
                    )

                with col4:
                    # 上位25%の価格
                    st.metric(
                        label="上位25%",
                        value=f"{q75_price:,.0f}万円以上",
                        delta=None,
                        help=f"市場の25%がこの価格以上\n分析対象: {len(df_filtered)}/{total_count}件"
                    )

                # 詳細分析（エキスパンダーで折り畳み可能）
                with st.expander("🤖 AI詳細分析レポートを見る"):
                    # 駅からの距離分析（外れ値を除いたデータで分析）
                    if 'minutes_to_station' in df_filtered.columns:
                        station_stats = df_filtered.groupby(pd.cut(df_filtered['minutes_to_station'],
                                                         bins=[0, 5, 10, 15, 30, 100],
                                                         labels=['5分以内', '6-10分', '11-15分', '16-30分', '30分超']))['price'].mean() / 10000

                    # 築年数分析（外れ値を除いたデータで分析）
                    if 'building_year' in df_filtered.columns:
                        current_year = pd.Timestamp.now().year
                        df_filtered['age'] = current_year - pd.to_numeric(df_filtered['building_year'], errors='coerce')
                        age_stats = df_filtered.groupby(pd.cut(df_filtered['age'],
                                                     bins=[0, 5, 10, 20, 30, 100],
                                                     labels=['築5年以内', '築6-10年', '築11-20年', '築21-30年', '築30年超'],
                                                     include_lowest=True))['price'].mean() / 10000

                    analysis_text = f"""
                    **📊 統計サマリー**
                    - 分析対象物件数: {len(df_filtered)}件 （全{total_count}件中）
                    """

                    if outlier_count > 0:
                        analysis_text += f"    - 外れ値として除外: {outlier_count}件\n"

                    analysis_text += f"""    - 平均価格: {avg_price:,.0f}万円
                    - 中央値: {median_price:,.0f}万円
                    - 価格帯: {df_filtered['price'].min()/10000:,.0f}万円 〜 {df_filtered['price'].max()/10000:,.0f}万円

                    **📈 価格動向分析**
                    - 年間成長率: {growth_rate:.1f}%
                    - 価格のばらつき（標準偏差）: ±{price_std:,.0f}万円
                    """

                    st.write(analysis_text)

                    if 'minutes_to_station' in df_filtered.columns and 'station_stats' in locals() and not station_stats.empty:
                        st.write("**🚉 駅距離別の平均価格**")
                        for distance, price in station_stats.items():
                            if pd.notna(price):
                                st.write(f"- {distance}: {price:,.0f}万円")

                    if 'building_year' in df_filtered.columns and 'age_stats' in locals() and not age_stats.empty:
                        st.write("**🏢 築年数別の平均価格**")
                        for age_range, price in age_stats.items():
                            if pd.notna(price):
                                st.write(f"- {age_range}: {price:,.0f}万円")

                    # AI機能1: 自動クラスタリング
                    st.write("\n**🎯 AI自動クラスタリング分析**")
                    if len(df_filtered) >= 10:  # 最低10件以上でクラスタリング
                        try:
                            # マンションの場合はbuilding_area、それ以外はareaを使用
                            is_mansion = '07' in selected_types
                            area_column = 'building_area' if is_mansion else 'area'

                            # クラスタリング用の特徴量を準備
                            clustering_features = []
                            feature_names = []

                            if 'price' in df_filtered.columns:
                                clustering_features.append(df_filtered['price'].values.reshape(-1, 1))
                                feature_names.append('価格')

                            if area_column in df_filtered.columns and df_filtered[area_column].notna().sum() > 5:
                                clustering_features.append(df_filtered[area_column].fillna(df_filtered[area_column].median()).values.reshape(-1, 1))
                                feature_names.append('面積')

                            if len(clustering_features) >= 1:
                                # 特徴量を結合して標準化
                                X = np.hstack(clustering_features)
                                scaler = StandardScaler()
                                X_scaled = scaler.fit_transform(X)

                                # KMeansクラスタリング（3グループ）
                                n_clusters = min(3, len(df_filtered) // 3)  # データ数に応じて調整
                                kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
                                clusters = kmeans.fit_predict(X_scaled)

                                # クラスタごとの統計を計算
                                df_filtered['cluster'] = clusters

                                # クラスタ統計を計算（面積カラムがある場合のみ）
                                if area_column in df_filtered.columns:
                                    cluster_stats = df_filtered.groupby('cluster').agg({
                                        'price': ['mean', 'count'],
                                        area_column: 'mean'
                                    })
                                else:
                                    cluster_stats = df_filtered.groupby('cluster').agg({
                                        'price': ['mean', 'count']
                                    })

                                st.write(f"📊 {n_clusters}つの物件グループを自動検出:")

                                # 各クラスタの平均価格を先に計算
                                cluster_avg_prices = []
                                for i in range(n_clusters):
                                    cluster_data = df_filtered[df_filtered['cluster'] == i]
                                    if len(cluster_data) > 0:
                                        cluster_avg_prices.append(cluster_data['price'].mean())
                                    else:
                                        cluster_avg_prices.append(0)

                                # 価格順でクラスタをソート
                                sorted_clusters = sorted(range(n_clusters), key=lambda x: cluster_avg_prices[x])

                                for idx, i in enumerate(sorted_clusters):
                                    cluster_data = df_filtered[df_filtered['cluster'] == i]
                                    if len(cluster_data) > 0:
                                        avg_price = cluster_data['price'].mean() / 10000
                                        count = len(cluster_data)
                                        percent = (count / len(df_filtered)) * 100

                                        # グループの名前を決定（価格順で）
                                        if n_clusters == 3:
                                            if idx == 0:
                                                group_name = "エントリー"
                                            elif idx == 2:
                                                group_name = "高価格帯"
                                            else:
                                                group_name = "中価格帯"
                                        else:
                                            group_name = f"グループ{idx+1}"

                                        st.write(f"• **{group_name}** ({percent:.0f}%): 平均{avg_price:,.0f}万円 ({count}件)")
                        except Exception as e:
                            st.write(f"クラスタリング分析に必要なデータが不足しています: {str(e)}")
                    else:
                        st.write("クラスタリング分析には10件以上のデータが必要です")

                    # AI機能2: 異常値検出
                    st.write("\n**⚠️ AI異常値検出**")
                    if len(df_filtered) >= 5:  # 最低5件以上で異常検出
                        try:
                            # 異常検出用の特徴量
                            anomaly_features = []
                            if 'price' in df_filtered.columns:
                                anomaly_features.append(df_filtered['price'].values.reshape(-1, 1))
                            if 'unit_price' in df_filtered.columns:
                                anomaly_features.append(df_filtered['unit_price'].values.reshape(-1, 1))

                            if len(anomaly_features) >= 1:
                                X_anomaly = np.hstack(anomaly_features)
                                X_anomaly_scaled = StandardScaler().fit_transform(X_anomaly)

                                # Isolation Forestで異常検出
                                iso_forest = IsolationForest(contamination=0.1, random_state=42)
                                anomaly_predictions = iso_forest.fit_predict(X_anomaly_scaled)
                                anomaly_scores = iso_forest.score_samples(X_anomaly_scaled)

                                # 異常スコアを正規化（0-1の範囲）
                                anomaly_scores_normalized = (anomaly_scores - anomaly_scores.min()) / (anomaly_scores.max() - anomaly_scores.min())

                                # 異常物件を検出
                                anomalies = df_filtered[anomaly_predictions == -1].copy()
                                anomalies['anomaly_score'] = anomaly_scores_normalized[anomaly_predictions == -1]

                                if len(anomalies) > 0:
                                    st.write(f"📍 統計的外れ値として{len(anomalies)}件を検出:")
                                    for idx, row in anomalies.head(3).iterrows():
                                        price = row['price'] / 10000
                                        score = 1 - row['anomaly_score']  # スコアを反転（高いほど異常）
                                        avg_ratio = price / avg_price
                                        st.write(f"• 価格{price:,.0f}万円 - 地域平均の{avg_ratio:.1f}倍 (異常度: {score:.2f})")
                                else:
                                    st.write("✅ 統計的に異常な物件は検出されませんでした")
                        except Exception as e:
                            st.write("異常検出分析に必要なデータが不足しています")
                    else:
                        st.write("異常検出分析には5件以上のデータが必要です")

                    st.info("""
                    📌 **重要事項**
                    • 本分析は公開データの統計処理による参考情報です
                    • 不動産の投資判断や購入の推奨ではありません
                    • 個別物件の適正価格を示すものではありません
                    • 実際の取引には宅地建物取引士にご相談ください
                    """)

                # 類似物件の詳細表（最大10件表示、1番上に配置）
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

                # 最大10件に制限
                table_df_limited = table_df.head(10)

                # 表示する列を限定
                display_table = pd.DataFrame({
                    'No.': range(1, len(table_df_limited) + 1),
                    '所在地': table_df_limited['location'].values,
                    '取引時期': table_df_limited['trade_period'].values,
                    '取引価格': table_df_limited['price_formatted'].values,
                    '土地面積(㎡)': table_df_limited['land_area'].astype(int).values,
                    '延床面積(㎡)': table_df_limited['building_area'].astype(int).values,
                    '間取り': table_df_limited['floor_plan'].fillna('-').replace('', '-').values,
                    '前面道路': (table_df_limited['road_type'] + ' ' + table_df_limited['breadth'].astype(str) + 'm').values
                })

                # タイトル表示
                st.subheader("📋 類似物件")

                # HTMLテーブルのスタイル設定
                table_style = """
                <style>
                .property-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    background-color: white;
                }
                .property-table th {
                    background-color: white;
                    color: black;
                    text-align: left;
                    padding: 10px;
                    font-size: 18px;
                    font-weight: bold;
                    border-bottom: 2px solid #ddd;
                }
                .property-table td {
                    background-color: white;
                    color: black;
                    text-align: left;
                    padding: 10px;
                    font-size: 18px;
                    border-bottom: 1px solid #eee;
                }
                .property-table tr:hover td {
                    background-color: #fafafa;
                }
                </style>
                """

                # HTMLテーブルの作成
                html_table = table_style + '<table class="property-table">'
                html_table += '<thead><tr>'
                for col in display_table.columns:
                    html_table += f'<th>{col}</th>'
                html_table += '</tr></thead><tbody>'

                for _, row in display_table.iterrows():
                    html_table += '<tr>'
                    for val in row:
                        html_table += f'<td>{val}</td>'
                    html_table += '</tr>'
                html_table += '</tbody></table>'

                # HTMLテーブルを表示
                st.markdown(html_table, unsafe_allow_html=True)
                

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
                        ax.set_xlabel('土地面積（㎡）', fontsize=14)
                        ax.set_ylabel('価格（万円）', fontsize=14)
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
                                                 fontsize=14, fontweight='bold')

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

                    # 延床面積がある物件のみをフィルタリング
                    scatter_df = df[df['building_area'] > 0].copy()

                    if len(scatter_df) > 0:
                        # Plotlyでインタラクティブな散布図を作成
                        scatter_df['price_man'] = scatter_df['price'] / 10000

                        # 四半期を月表記に変換する関数
                        def quarter_to_months(period_str):
                            if pd.isna(period_str):
                                return period_str
                            period_str = str(period_str)
                            if "第1四半期" in period_str:
                                return period_str.replace("第1四半期", "1月〜3月")
                            elif "第2四半期" in period_str:
                                return period_str.replace("第2四半期", "4月〜6月")
                            elif "第3四半期" in period_str:
                                return period_str.replace("第3四半期", "7月〜9月")
                            elif "第4四半期" in period_str:
                                return period_str.replace("第4四半期", "10月〜12月")
                            return period_str

                        # ホバー時に表示する情報を準備
                        scatter_df['hover_text'] = (
                            '所在地: ' + scatter_df['location'] + '<br>' +
                            '価格: ' + scatter_df['price_formatted'] + '<br>' +
                            f'{area_label}: ' + scatter_df['building_area'].astype(str) + '㎡<br>' +
                            '㎡単価: ' + scatter_df['unit_price_formatted'] + '<br>' +
                            '建築年: ' + scatter_df['build_year'].astype(str) + '<br>' +
                            '間取り: ' + scatter_df['floor_plan'].astype(str) + '<br>' +
                            '取引時期: ' + scatter_df['trade_period'].apply(quarter_to_months).astype(str)
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
                            title=None,
                            xaxis_title={
                                'text': f'{area_label}（㎡）',
                                'font': {'color': 'black', 'size': 14}
                            },
                            yaxis_title=None,
                            height=500,
                            hovermode='closest',
                            showlegend=True,
                            plot_bgcolor='white',
                            paper_bgcolor='white',
                            font=dict(color='black'),
                            margin=dict(t=40, b=20, l=20, r=20),
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
                                tickfont=dict(color='black', size=14),
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
                                tickfont=dict(color='black', size=14),
                                tickcolor='black',
                                tickformat=',d',
                                ticksuffix='万円',
                                tickvals=list(range(0, int(min(10000, scatter_df['price_man'].max() + 500)) + 1, 1000)),
                                ticktext=[f'{i:,}万円' if i > 0 else '0' for i in range(0, int(min(10000, scatter_df['price_man'].max() + 500)) + 1, 1000)]
                            )
                        )


                        st.markdown("<h4>1. 延べ床と価格</h4>", unsafe_allow_html=True)
                        st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})

                    
                    # 面積と価格の分布表（クロス集計）
                    
                    # 価格帯を定義（万円）- 1000万円刻み
                    price_bins = list(range(0, 11000, 1000))  # 0, 1000, 2000, ..., 10000
                    price_bins.append(float('inf'))  # 10000万円以上
                    price_labels = []
                    for i in range(len(price_bins)-1):
                        if price_bins[i+1] == float('inf'):
                            price_labels.append('10,000万円~')
                        elif price_bins[i] == 0:
                            price_labels.append(f'0~1,000万円')
                        else:
                            price_labels.append(f'{price_bins[i]:,}万円')

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
                    
                    # 行の順序を調整（下から上へ：0万円→10,000万円）
                    available_rows = [row for row in price_labels if row in cross_table.index]
                    cross_table = cross_table.reindex(index=available_rows, fill_value=0)
                    # Y軸を反転（上から下へ価格が下がるように）- 下が0円、上が高額
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
                        textfont={"size": 14},
                        hovertext=hover_text,
                        hovertemplate='%{hovertext}<extra></extra>',
                        colorbar=dict(title="件数")
                    ))

                    # レイアウトの設定
                    fig.update_layout(
                        title=None,
                        xaxis_title={
                            'text': f'{area_label}(㎡)',
                            'font': {'color': 'black', 'size': 14}
                        },
                        yaxis_title=None,
                        height=400,
                        plot_bgcolor='white',
                        paper_bgcolor='white',
                        font=dict(color='black'),
                        margin=dict(t=40, b=20, l=20, r=20),
                        xaxis=dict(
                            side='bottom',
                            tickfont=dict(color='black', size=14),
                            tickangle=0,
                            showgrid=False,
                            showline=True,
                            linecolor='black'
                        ),
                        yaxis=dict(
                            side='left',
                            tickfont=dict(color='black', size=14),
                            showgrid=False,
                            showline=True,
                            linecolor='black'
                        )
                    )


                    st.markdown("<h4>2. 延床面積別価格分布</h4>", unsafe_allow_html=True)
                    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})

                    # 建築年別価格分布グラフを追加（土地以外の場合のみ）

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
                        # 四半期を月表記に変換する関数
                        def quarter_to_months_year(period_str):
                            if pd.isna(period_str):
                                return period_str
                            period_str = str(period_str)
                            if "第1四半期" in period_str:
                                return period_str.replace("第1四半期", "1月〜3月")
                            elif "第2四半期" in period_str:
                                return period_str.replace("第2四半期", "4月〜6月")
                            elif "第3四半期" in period_str:
                                return period_str.replace("第3四半期", "7月〜9月")
                            elif "第4四半期" in period_str:
                                return period_str.replace("第4四半期", "10月〜12月")
                            return period_str

                        # ホバー時に表示する情報を準備
                        build_year_df['hover_text'] = (
                            '所在地: ' + build_year_df['location'] + '<br>' +
                            '価格: ' + build_year_df['price_formatted'] + '<br>' +
                            '建築年: ' + build_year_df['year'].astype(str) + '年<br>' +
                            '延床面積: ' + build_year_df['building_area'].astype(str) + '㎡<br>' +
                            '㎡単価: ' + build_year_df['unit_price_formatted'] + '<br>' +
                            '間取り: ' + build_year_df['floor_plan'].astype(str) + '<br>' +
                            '取引時期: ' + build_year_df['trade_period'].apply(quarter_to_months_year).astype(str)
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
                            title=None,
                            xaxis_title={
                                'text': '建築年',
                                'font': {'color': 'black', 'size': 14}
                            },
                            yaxis_title=None,
                            height=500,
                            hovermode='closest',
                            showlegend=True,
                            plot_bgcolor='white',
                            paper_bgcolor='white',
                            font=dict(color='black'),
                            margin=dict(t=40, b=20, l=20, r=20),
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
                                tickfont=dict(color='black', size=14),
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
                                tickfont=dict(color='black', size=14),
                                tickcolor='black',
                                tickformat=',d',
                                ticksuffix='万円',
                                tickvals=list(range(0, int(min(10000, build_year_df['price_man'].max() + 500)) + 1, 1000)),
                                ticktext=[f'{i:,}万円' if i > 0 else '0' for i in range(0, int(min(10000, build_year_df['price_man'].max() + 500)) + 1, 1000)]
                            )
                        )


                        st.markdown("<h4>3. 建築年別価格分布</h4>", unsafe_allow_html=True)
                        st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})


                    # 建築年別価格分布のヒートマップ

                    # 価格帯を定義（万円）- 1000万円刻み
                    price_bins = list(range(0, 11000, 1000))  # 0, 1000, 2000, ..., 10000
                    price_bins.append(float('inf'))  # 10000万円以上
                    price_labels = []
                    for i in range(len(price_bins)-1):
                        if price_bins[i+1] == float('inf'):
                            price_labels.append('10,000万円~')
                        elif price_bins[i] == 0:
                            price_labels.append(f'0~1,000万円')
                        else:
                            price_labels.append(f'{price_bins[i]:,}万円')

                    # 建築年帯を定義（5年刻み）
                    min_year = int(build_year_df['year'].min() / 5) * 5
                    max_year = int((build_year_df['year'].max() + 4) / 5) * 5
                    year_bins = list(range(min_year, max_year + 5, 5))
                    year_labels = [f"{year_bins[i]}" for i in range(len(year_bins)-1)]

                    # データを分類
                    heatmap_df = build_year_df.copy()
                    heatmap_df['price_range'] = pd.cut(heatmap_df['price']/10000, bins=price_bins, labels=price_labels, right=False)
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

                    # Plotlyでインタラクティブなヒートマップを作成
                    import numpy as np

                    # ホバーテキストを作成
                    hover_text = []
                    for i in range(len(cross_table_year_display.index)):
                        row_text = []
                        for j in range(len(cross_table_year_display.columns)):
                            value = int(cross_table_year_display.iloc[i, j])
                            price_range = cross_table_year_display.index[i]
                            year_range = cross_table_year_display.columns[j]
                            text = f'価格: {price_range}<br>建築年: {year_range}年<br>件数: {value}件'
                            row_text.append(text)
                        hover_text.append(row_text)

                    # ヒートマップ作成
                    fig = go.Figure(data=go.Heatmap(
                        z=cross_table_year_display.values,
                        x=cross_table_year_display.columns,
                        y=cross_table_year_display.index,
                        colorscale='Oranges',
                        text=cross_table_year_display.values,
                        texttemplate='%{text:.0f}',
                        textfont={"size": 14},
                        hovertext=hover_text,
                        hovertemplate='%{hovertext}<extra></extra>',
                        colorbar=dict(title="件数")
                    ))

                    # レイアウトの設定
                    fig.update_layout(
                        title=None,
                        xaxis_title={
                            'text': '建築年',
                            'font': {'color': 'black', 'size': 14}
                        },
                        yaxis_title=None,
                        height=400,
                        plot_bgcolor='white',
                        paper_bgcolor='white',
                        font=dict(color='black'),
                        margin=dict(t=40, b=20, l=100, r=20),
                        xaxis=dict(
                            side='bottom',
                            tickfont=dict(color='black', size=14),
                            tickangle=0,
                            showgrid=False,
                            showline=True,
                            linecolor='black'
                        ),
                        yaxis=dict(
                            side='left',
                            tickfont=dict(color='black', size=14),
                            showgrid=False,
                            showline=True,
                            linecolor='black',
                            tickmode='array',
                            tickvals=list(range(len(cross_table_year_display.index))),
                            ticktext=list(cross_table_year_display.index)
                        )
                    )


                    st.markdown("<h4>4. 建築年別価格分布（ヒートマップ）</h4>", unsafe_allow_html=True)
                    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})


                # 成約件数の推移グラフ

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

                    # 四半期を月表記に変換（改行付き）
                    def convert_quarter_to_month(period_str):
                        """四半期表記を月表記に変換（年と月を改行で分ける）"""
                        if "第1四半期" in period_str:
                            year = period_str.split("年")[0] + "年"
                            return year + "<br>1月〜3月"
                        elif "第2四半期" in period_str:
                            year = period_str.split("年")[0] + "年"
                            return year + "<br>4月〜6月"
                        elif "第3四半期" in period_str:
                            year = period_str.split("年")[0] + "年"
                            return year + "<br>7月〜9月"
                        elif "第4四半期" in period_str:
                            year = period_str.split("年")[0] + "年"
                            return year + "<br>10月〜12月"
                        return period_str

                    x_labels = [convert_quarter_to_month(str(period)) for period in period_counts.index]

                    # Plotlyでインタラクティブな棒グラフを作成
                    fig = go.Figure()

                    # ホバーテキストを作成
                    hover_texts = []
                    for i, (period, count) in enumerate(zip(x_labels, period_counts.values)):
                        hover_texts.append(f'取引時期: {period}<br>成約件数: {int(count)}件')

                    # 棒グラフを追加
                    fig.add_trace(go.Bar(
                        x=x_labels,
                        y=period_counts.values,
                        marker=dict(
                            color='#87CEEB',  # skyblue
                            line=dict(
                                color='#000080',  # navy
                                width=1.5
                            )
                        ),
                        text=[f'{int(count)}件' for count in period_counts.values],
                        textposition='outside',
                        textfont=dict(size=14, color='black'),
                        hovertext=hover_texts,
                        hovertemplate='%{hovertext}<extra></extra>'
                    ))

                    # レイアウトの設定
                    max_count = int(period_counts.max()) + 2
                    fig.update_layout(
                        title=None,
                        xaxis_title={
                            'text': '取引時期',
                            'font': {'color': 'black', 'size': 14}
                        },
                        yaxis_title=None,
                        height=500,
                        plot_bgcolor='white',
                        paper_bgcolor='white',
                        font=dict(color='black'),
                        margin=dict(t=40, b=60, l=20, r=20),
                        xaxis=dict(
                            tickfont=dict(color='black', size=14),
                            tickangle=0,
                            showgrid=False,
                            showline=True,
                            linecolor='black',
                            linewidth=1
                        ),
                        yaxis=dict(
                            tickfont=dict(color='black', size=14),
                            showgrid=True,
                            gridcolor='#E0E0E0',
                            gridwidth=0.5,
                            showline=True,
                            linecolor='black',
                            linewidth=1,
                            range=[0, max_count],
                            dtick=1,
                            tickmode='linear',
                            ticksuffix='件'
                        ),
                        showlegend=False,
                        bargap=0.2
                    )


                    st.markdown("<h4>5. 成約件数推移</h4>", unsafe_allow_html=True)
                    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})

                else:
                    st.info("取引時期データが含まれる物件がありません。")

            else:
                st.info("検索条件に一致する物件が見つかりませんでした。")


# フッター
st.markdown("---")
st.markdown("""
**データ提供**: [国土交通省 不動産情報ライブラリ](https://www.reinfolib.mlit.go.jp/)

**注意事項**:
- 本サービスは国土交通省の不動産情報ライブラリのAPI機能を使用していますが、提供情報の最新性、正確性、完全性等が保証されたものではありません。
- 表示される価格情報は参考情報であり、実際の取引価格を保証するものではありません。
- これは類似条件の過去の取引事例の統計です。個別物件の査定や価格予測ではありません。
- 実際の不動産価格は個別要因により大きく異なります。
""")