"""
シミュレーターAPI用 Streamlit UI
"""
import streamlit as st
import requests
import pandas as pd
import json

# ページ設定
st.set_page_config(
    page_title="不動産投資シミュレーター",
    page_icon="🏢",
    layout="wide"
)

st.title("🏢 不動産投資シミュレーター")
st.markdown("### AI物件シミュレーター - 35年キャッシュフロー対応版")

# APIのベースURL
API_URL = "http://localhost:8000"  # ローカル開発用
# API_URL = "https://real-estate-app-1-iii4.onrender.com"  # 本番用

# サイドバーで入力
with st.sidebar:
    st.header("📝 物件情報入力")
    
    # 物件基本情報
    st.subheader("🏠 物件情報")
    property_name = st.text_input("物件名", "品川区投資物件")
    location = st.text_input("所在地", "東京都品川区")
    property_type = st.selectbox("物件タイプ", ["一棟アパート/マンション", "区分マンション", "戸建て"])
    
    col1, col2 = st.columns(2)
    with col1:
        land_area = st.number_input("土地面積(㎡)", value=135.0, step=0.1)
        building_area = st.number_input("建物面積(㎡)", value=150.0, step=0.1)
    with col2:
        road_price = st.number_input("路線価(円/㎡)", value=250000, step=1000)
        year_built = st.number_input("築年", value=2010, step=1)
    
    # 取得・初期費用
    st.subheader("💰 取得・初期費用")
    col1, col2 = st.columns(2)
    with col1:
        purchase_price = st.number_input("購入価格(万円)", value=6980, step=10)
        other_costs = st.number_input("諸経費(万円)", value=300, step=10)
    with col2:
        renovation_cost = st.number_input("改装費(万円)", value=200, step=10)
        market_value = st.number_input("想定売却価格(万円)", value=8000, step=10)
    
    # 収益情報
    st.subheader("📈 収益情報")
    monthly_rent = st.number_input("月額賃料(円)", value=250000, step=1000)
    
    col1, col2 = st.columns(2)
    with col1:
        management_fee = st.number_input("管理費(月額円)", value=5000, step=100)
        fixed_cost = st.number_input("その他固定費(月額円)", value=0, step=100)
    with col2:
        property_tax = st.number_input("固定資産税(年額円)", value=100000, step=1000)
        vacancy_rate = st.number_input("空室率(%)", value=5.0, step=0.1)
    
    rent_decline = st.number_input("家賃下落率(%/年)", value=1.0, step=0.1)
    
    # 借入条件
    st.subheader("🏦 借入条件")
    loan_amount = st.number_input("借入額(万円)", value=6500, step=10)
    
    col1, col2 = st.columns(2)
    with col1:
        interest_rate = st.number_input("金利(%)", value=0.7, step=0.01)
        loan_years = st.number_input("返済期間(年)", value=35, min_value=1, max_value=35)
    with col2:
        loan_type = st.selectbox("借入形式", ["元利均等", "元金均等"])
    
    # 出口戦略
    st.subheader("🎯 出口戦略")
    holding_years = st.number_input("保有年数(年)", value=10, min_value=1, max_value=35)
    exit_cap_rate = st.number_input("売却CapRate(%)", value=6.0, step=0.1)
    
    # シミュレーション実行ボタン
    simulate_button = st.button("🚀 シミュレーション実行", type="primary", use_container_width=True)

# メインエリア
if simulate_button:
    # APIリクエストデータ
    request_data = {
        "property_name": property_name,
        "location": location,
        "year_built": year_built,
        "property_type": property_type,
        "land_area": land_area,
        "building_area": building_area,
        "road_price": road_price,
        "purchase_price": purchase_price,
        "building_price": purchase_price * 0.7,
        "other_costs": other_costs,
        "renovation_cost": renovation_cost,
        "monthly_rent": monthly_rent,
        "management_fee": management_fee,
        "fixed_cost": fixed_cost,
        "property_tax": property_tax,
        "vacancy_rate": vacancy_rate,
        "rent_decline": rent_decline,
        "loan_type": loan_type,
        "loan_amount": loan_amount,
        "interest_rate": interest_rate,
        "loan_years": loan_years,
        "holding_years": holding_years,
        "exit_cap_rate": exit_cap_rate,
        "market_value": market_value
    }
    
    # プログレスバー表示
    with st.spinner("シミュレーション実行中..."):
        try:
            # API呼び出し
            response = requests.post(f"{API_URL}/api/simulate", json=request_data)
            
            if response.status_code == 200:
                result = response.json()
                
                # 結果表示
                st.success("✅ シミュレーション完了！")
                
                # 主要指標の表示
                st.subheader("📊 投資パフォーマンス指標")
                
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("表面利回り", f"{result['results']['表面利回り（%）']}%")
                with col2:
                    irr = result['results'].get('IRR（%）')
                    if irr is not None:
                        st.metric("IRR（内部収益率）", f"{irr}%")
                    else:
                        st.metric("IRR（内部収益率）", "N/A")
                with col3:
                    st.metric("CCR（自己資金回収率）", f"{result['results']['CCR（%）']}%")
                with col4:
                    st.metric("DSCR（返済余裕率）", f"{result['results']['DSCR（返済余裕率）']:.2f}")
                
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("月間キャッシュフロー", f"{result['results']['月間キャッシュフロー（円）']:,}円")
                with col2:
                    st.metric("年間キャッシュフロー", f"{result['results']['年間キャッシュフロー（円）']:,}円")
                with col3:
                    st.metric("自己資金", f"{result['results']['自己資金（万円）']}万円")
                with col4:
                    st.metric("売却益", f"{result['results']['売却益（万円）']}万円")
                
                # キャッシュフローテーブル
                if 'cash_flow_table' in result and result['cash_flow_table']:
                    st.subheader(f"📋 年次キャッシュフロー詳細（{len(result['cash_flow_table'])}年分）")
                    
                    # データフレームに変換
                    df = pd.DataFrame(result['cash_flow_table'])
                    
                    # 数値のフォーマット
                    for col in ['満室想定収入', '実効収入', '経費', '大規模修繕', 'ローン返済', '営業CF', '累計CF']:
                        if col in df.columns:
                            df[col] = df[col].apply(lambda x: f"{x:,}円")
                    
                    if '空室率（%）' in df.columns:
                        df['空室率（%）'] = df['空室率（%）'].apply(lambda x: f"{x}%")
                    
                    # テーブル表示
                    st.dataframe(df, use_container_width=True, height=400)
                    
                    # CSVダウンロード
                    csv = df.to_csv(index=False, encoding='utf-8-sig')
                    st.download_button(
                        label="📥 CSVダウンロード",
                        data=csv,
                        file_name=f"{property_name}_キャッシュフロー.csv",
                        mime="text/csv"
                    )
                
            else:
                st.error(f"エラーが発生しました: {response.status_code}")
                
        except Exception as e:
            st.error(f"エラーが発生しました: {str(e)}")
            st.info("APIサーバーが起動していることを確認してください。")

else:
    # 初期表示
    st.info("👈 左のサイドバーで物件情報を入力し、シミュレーションを実行してください。")
    
    # 特徴説明
    st.markdown("""
    ### 🌟 主な特徴
    
    - **最大35年のキャッシュフロー分析**: 長期保有シミュレーションに対応
    - **詳細な投資指標**: IRR、CCR、DSCR等の重要指標を自動計算
    - **大規模修繕の自動計算**: 10年ごとに大規模修繕費を計上
    - **家賃下落の考慮**: 経年による家賃下落を反映
    - **売却シミュレーション**: 指定年数後の売却益も計算
    
    ### 📊 計算される指標
    
    - **表面利回り**: 年間家賃収入 ÷ 物件価格
    - **IRR（内部収益率）**: 投資期間全体の収益率
    - **CCR（自己資金回収率）**: 年間キャッシュフロー ÷ 自己資金
    - **DSCR（返済余裕率）**: NOI ÷ 年間ローン返済額
    """)