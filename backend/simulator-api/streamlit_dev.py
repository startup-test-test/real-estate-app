"""
不動産投資シミュレーター - Streamlit開発版
新機能のプロトタイプ開発用
"""

import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
from shared.calculations import run_full_simulation
import json

# 日本語フォント設定
plt.rcParams['font.family'] = 'DejaVu Sans'

def main():
    st.set_page_config(
        page_title="不動産投資シミュレーター（開発版）",
        page_icon="🏠",
        layout="wide"
    )
    
    st.title("🏠 不動産投資シミュレーター（開発版）")
    st.markdown("---")
    
    # サイドバーでページ選択
    page = st.sidebar.selectbox(
        "機能を選択",
        ["基本シミュレーション", "シナリオ分析（準備中）", "共有機能（準備中）"]
    )
    
    if page == "基本シミュレーション":
        basic_simulation_page()
    elif page == "シナリオ分析（準備中）":
        scenario_analysis_page()
    elif page == "共有機能（準備中）":
        sharing_feature_page()

def basic_simulation_page():
    st.header("📊 基本シミュレーション")
    
    # 入力フォーム
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("物件基本情報")
        monthly_rent = st.number_input("月間家賃収入（円）", value=100000, step=1000)
        purchase_price = st.number_input("購入価格（万円）", value=3000, step=100)
        market_value = st.number_input("実勢価格（万円）", value=3000, step=100)
        land_area = st.number_input("土地面積（㎡）", value=100.0, step=1.0)
        building_area = st.number_input("建物面積（㎡）", value=80.0, step=1.0)
        road_price = st.number_input("路線価（円/㎡）", value=200000, step=1000)
        
        st.subheader("運営費用")
        vacancy_rate = st.slider("空室率（%）", 0, 50, 5)
        management_fee = st.number_input("管理費（円/月）", value=8000, step=1000)
        fixed_cost = st.number_input("固定費（円/月）", value=5000, step=1000)
        property_tax = st.number_input("固定資産税（円/年）", value=120000, step=1000)
        rent_decline = st.slider("家賃下落率（%/年）", 0.0, 5.0, 1.0, step=0.1)
    
    with col2:
        st.subheader("融資条件")
        loan_amount = st.number_input("融資額（万円）", value=2400, step=100)
        interest_rate = st.slider("金利（%）", 0.0, 10.0, 2.0, step=0.1)
        loan_years = st.selectbox("融資期間（年）", [10, 15, 20, 25, 30, 35], index=4)
        loan_type = st.selectbox("返済方法", ["元利均等", "元金均等"])
        
        st.subheader("その他費用")
        other_costs = st.number_input("諸費用（万円）", value=200, step=10)
        renovation_cost = st.number_input("リフォーム費用（万円）", value=100, step=10)
        
        st.subheader("売却設定")
        holding_years = st.slider("保有年数（年）", 1, 35, 35)
        exit_cap_rate = st.slider("売却時利回り（%）", 3.0, 10.0, 5.0, step=0.1)
        
        st.subheader("税金条件")
        ownership_type = st.selectbox("所有形態", ["個人", "法人"])
        effective_tax_rate = st.number_input("実効税率（%）", value=20, min_value=0, max_value=50, step=1)
        st.caption("💡 実効税率の目安: 個人(20-30%) / 法人(15-25%)")
        
        st.subheader("大規模修繕設定")
        major_repair_cycle = st.number_input("大規模修繕周期（年）", value=10, min_value=1, max_value=35, step=1)
        major_repair_cost = st.number_input("大規模修繕費用（万円）", value=200, step=10)
        
        st.subheader("減価償却設定")
        building_price = st.number_input("建物価格（万円）", value=2000, step=100)
        depreciation_years = st.selectbox("償却年数（年）", [22, 27, 34, 39, 47], index=1)
    
    # シミュレーション実行ボタン
    if st.button("🚀 シミュレーション実行", type="primary"):
        # 入力データをまとめる
        property_data = {
            'monthly_rent': monthly_rent,
            'vacancy_rate': vacancy_rate,
            'management_fee': management_fee,
            'fixed_cost': fixed_cost,
            'property_tax': property_tax,
            'purchase_price': purchase_price,
            'loan_amount': loan_amount,
            'other_costs': other_costs,
            'renovation_cost': renovation_cost,
            'interest_rate': interest_rate,
            'loan_years': loan_years,
            'loan_type': loan_type,
            'exit_cap_rate': exit_cap_rate,
            'land_area': land_area,
            'road_price': road_price,
            'building_area': building_area,
            'market_value': market_value,
            'holding_years': holding_years,
            'rent_decline': rent_decline,
            'ownership_type': ownership_type,
            'effective_tax_rate': effective_tax_rate,
            'major_repair_cycle': major_repair_cycle,
            'major_repair_cost': major_repair_cost,
            'building_price': building_price,
            'depreciation_years': depreciation_years
        }
        
        # シミュレーション実行
        try:
            simulation_result = run_full_simulation(property_data)
            display_results(simulation_result, property_data)
        except Exception as e:
            st.error(f"シミュレーションエラー: {str(e)}")

def display_results(simulation_result, property_data):
    """シミュレーション結果を表示"""
    results = simulation_result["results"]
    cash_flow_table = simulation_result["cash_flow_table"]
    
    st.markdown("---")
    st.header("📈 シミュレーション結果")
    
    # 重要指標をハイライト
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("表面利回り", f"{results['表面利回り（%）']}%")
        st.metric("NOI", f"{results['NOI（円）']:,}円")
    
    with col2:
        st.metric("CCR", f"{results['CCR（%）']}%")
        st.metric("月間CF", f"{results['月間キャッシュフロー（円）']:,}円")
    
    with col3:
        irr_value = results['IRR（%）']
        irr_display = f"{irr_value}%" if irr_value is not None else "計算不可"
        st.metric("IRR", irr_display)
        st.metric("DSCR", f"{results['DSCR（返済余裕率）']}")
    
    with col4:
        st.metric("自己資金", f"{results['自己資金（万円）']:,}万円")
        st.metric("売却益", f"{results['売却益（万円）']:,}万円")
    
    # 詳細結果を縦長で表示
    st.subheader("📊 収益指標詳細")
    revenue_data = {
        "項目": ["年間家賃収入", "年間キャッシュフロー", "年間ローン返済額", "ROI", "LTV"],
        "値": [
            f"{results['年間家賃収入（円）']:,}円",
            f"{results['年間キャッシュフロー（円）']:,}円", 
            f"{results['年間ローン返済額（円）']:,}円",
            f"{results['ROI（%）']}%",
            f"{results['LTV（%）']}%"
        ]
    }
    st.table(pd.DataFrame(revenue_data))
    
    st.markdown("---")
    
    st.subheader("🏢 物件評価額")
    valuation_data = {
        "評価方法": ["収益還元評価", "積算評価（土地）", "積算評価（建物）", "積算評価合計", "実勢価格"],
        "評価額（万円）": [
            results['収益還元評価額（万円）'],
            results['土地積算評価（万円）'],
            results['建物積算評価（万円）'],
            results['積算評価合計（万円）'],
            results['実勢価格（万円）']
        ]
    }
    st.table(pd.DataFrame(valuation_data))
    
    st.markdown("---")
    
    st.subheader("💰 売却時分析")
    sale_data = {
        "項目": ["売却価格", "残債", "売却コスト", "売却益"],
        "金額（万円）": [
            results['実勢価格（万円）'],
            results['残債（万円）'],
            results['売却コスト（万円）'],
            results['売却益（万円）']
        ]
    }
    st.table(pd.DataFrame(sale_data))
    
    st.markdown("---")
    
    st.subheader("📅 年次キャッシュフロー表")
    cf_df = pd.DataFrame(cash_flow_table)
    st.dataframe(cf_df, use_container_width=True)
    
    # キャッシュフロー推移グラフ
    if len(cash_flow_table) > 0:
        st.markdown("---")
        st.subheader("📈 キャッシュフロー推移")
        
        # データ準備
        years = [int(row['年次'].replace('年目', '')) for row in cash_flow_table]
        cf_values = [row['営業CF'] for row in cash_flow_table]
        cumulative_cf = [row['累計CF'] for row in cash_flow_table]
        
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))
        
        # 年次キャッシュフロー
        ax1.bar(years, cf_values, alpha=0.7, color='skyblue')
        ax1.set_title('Annual Cash Flow')
        ax1.set_xlabel('Year')
        ax1.set_ylabel('Cash Flow (JPY)')
        ax1.grid(True, alpha=0.3)
        
        # 累計キャッシュフロー
        ax2.plot(years, cumulative_cf, marker='o', linewidth=2, color='orange')
        ax2.set_title('Cumulative Cash Flow')
        ax2.set_xlabel('Year')
        ax2.set_ylabel('Cumulative Cash Flow (JPY)')
        ax2.grid(True, alpha=0.3)
        
        plt.tight_layout()
        st.pyplot(fig)
    
    st.markdown("---")
    
    st.subheader("📥 データエクスポート")
    
    # JSONダウンロード
    json_data = {
        "property_data": property_data,
        "simulation_results": simulation_result
    }
    
    st.download_button(
        label="📄 シミュレーションデータ（JSON）をダウンロード",
        data=json.dumps(json_data, ensure_ascii=False, indent=2),
        file_name=f"simulation_result_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.json",
        mime="application/json"
    )
    
    # CSVダウンロード
    st.download_button(
        label="📊 キャッシュフロー表（CSV）をダウンロード", 
        data=cf_df.to_csv(index=False, encoding='utf-8-sig'),
        file_name=f"cash_flow_table_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.csv",
        mime="text/csv"
    )

def scenario_analysis_page():
    """シナリオ分析ページ（今後実装予定）"""
    st.header("📊 シナリオ分析（開発中）")
    
    st.info("🚧 この機能は現在開発中です。以下の機能を実装予定：")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        ### 📈 複数シナリオ比較
        - 楽観的・現実的・悲観的シナリオ
        - パラメータの個別調整
        - 横並び比較表示
        - レーダーチャート比較
        """)
        
        st.markdown("""
        ### 🎯 感度分析
        - 家賃変動の影響分析
        - 空室率変動の影響分析
        - 金利変動の影響分析
        - トルネードチャート表示
        """)
    
    with col2:
        st.markdown("""
        ### 🎲 モンテカルロシミュレーション
        - 確率分布を用いたリスク分析
        - VaR（Value at Risk）計算
        - 成功確率の算出
        - 結果の統計分析
        """)
        
        st.markdown("""
        ### 📊 インタラクティブ分析
        - リアルタイムパラメータ調整
        - ブレークイーブン分析
        - 臨界値の自動計算
        - リスク指標の可視化
        """)

def sharing_feature_page():
    """共有機能ページ（今後実装予定）"""
    st.header("🔗 共有機能（開発中）")
    
    st.info("🚧 この機能は現在開発中です。以下の機能を実装予定：")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("""
        ### 🚀 かんたん共有
        - ワンクリックで共有URL生成
        - QRコード生成
        - SNS共有ボタン
        - パスワード保護オプション
        - 有効期限設定
        """)
        
        st.markdown("""
        ### 📧 メール招待
        - 複数宛先への一括送信
        - カスタムメッセージ追加
        - HTMLメールテンプレート
        - 開封率トラッキング
        """)
    
    with col2:
        st.markdown("""
        ### 📄 レポート生成
        - PDF形式でのエクスポート
        - プロフェッショナルなレイアウト
        - グラフ・チャート込み
        - カスタムブランディング
        """)
        
        st.markdown("""
        ### 🔒 アクセス制御
        - 閲覧回数制限
        - IPアドレス制限
        - ログイン必須設定
        - アクセスログ記録
        """)

if __name__ == "__main__":
    main()