#!/usr/bin/env python3
"""
Geminiの手順ベース + メタデータ追加
シンプルなCSV生成（まずは手動で国土交通省データをダウンロード）
"""

import pandas as pd
from datetime import datetime

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 設定項目
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOURCE_FILE = 'kouji_2025.csv'  # 国土交通省からダウンロードしたファイル
OUTPUT_FILE = '../data/import_data_with_metadata.csv'

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# データ読み込み
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
try:
    df = pd.read_csv(SOURCE_FILE, encoding='shift_jis')
    print(f"✅ {SOURCE_FILE} を読み込みました")
except FileNotFoundError:
    print(f"❌ {SOURCE_FILE} が見つかりません")
    print("\n📥 国土交通省のデータをダウンロードしてください:")
    print("https://www.land.mlit.go.jp/webland/download.html")
    exit(1)
except UnicodeDecodeError:
    try:
        df = pd.read_csv(SOURCE_FILE, encoding='cp932')
        print(f"✅ {SOURCE_FILE} を読み込みました（cp932エンコード）")
    except Exception as e:
        print(f"❌ エンコードエラー: {e}")
        exit(1)

print(f"📊 元データ: {len(df):,}行")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# データ加工
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 必要な列を抽出（実際のCSVに合わせて列名を調整してください）
df_needed = df[['都道府県名', '市区町村名', 'H27価格', 'H26価格']].copy()

# 価格データを数値に変換
df_needed['H27価格'] = pd.to_numeric(df_needed['H27価格'], errors='coerce')
df_needed['H26価格'] = pd.to_numeric(df_needed['H26価格'], errors='coerce')

# 欠損値を削除
df_needed.dropna(subset=['H27価格', 'H26価格'], inplace=True)

# 市区町村名を結合
df_needed['full_name'] = df_needed['都道府県名'] + df_needed['市区町村名']

# 市区町村ごとに平均値を計算
df_agg = df_needed.groupby('full_name').agg({
    'H27価格': ['mean', 'count'],  # 平均と件数
    'H26価格': 'mean'
}).reset_index()

# 列名をフラット化
df_agg.columns = ['full_name', 'H27価格_平均', 'データ件数', 'H26価格_平均']

print(f"📊 集計後: {len(df_agg):,}市区町村")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# WordPress用の列を作成
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
df_wp = pd.DataFrame()

# 基本データ（Geminiの手順）
df_wp['post_title'] = df_agg['full_name']
df_wp['heikin_chika'] = df_agg['H27価格_平均'].round(0).astype(int)
df_wp['tsubo_tanka'] = (df_agg['H27価格_平均'] * 3.30578 / 10000).round(1)
df_wp['hendo_ritsu'] = ((df_agg['H27価格_平均'] - df_agg['H26価格_平均']) / df_agg['H26価格_平均'] * 100).round(2)
df_wp['hendo_ritsu'] = df_wp['hendo_ritsu'].apply(lambda x: f"+{x}%" if x > 0 else f"{x}%")

# メタデータ（追加）
current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
df_wp['data_source'] = '国土交通省 地価公示データ'
df_wp['updated_at'] = current_time
df_wp['data_count'] = df_agg['データ件数'].astype(int)
df_wp['api_endpoint'] = 'https://www.land.mlit.go.jp/webland/'

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CSV出力
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import os
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

df_wp.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')

print(f"\n✅ {OUTPUT_FILE} の作成が完了しました")
print(f"📊 {len(df_wp):,}件のデータを出力")

# サンプル表示
print("\n📄 サンプルデータ（最初の5件）:")
print("=" * 80)
print(df_wp.head().to_string(index=False))
print("=" * 80)

print("\n🔄 次のステップ:")
print("1. WordPress管理画面で Custom Post Type UI を設定")
print("2. Advanced Custom Fields を設定（7フィールド）")
print("3. WP All Import でこのCSVをインポート")
