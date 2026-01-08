#!/usr/bin/env python3
"""
ID:1726（全国トップページ）用の公示地価マスターデータを生成
計算ロジック: Option A - 全データポイント方式

全国平均 = Σ(全47都道府県の全データポイント) / 総データポイント数
都道府県平均 = Σ(その都道府県の全データポイント) / その都道府県のデータポイント数
"""

import sys
import csv
from statistics import mean
from datetime import datetime

# Backend pathを追加

sys.path.insert(0, '/workspaces/real-estate-app/backend/property-api')
from real_estate_client import RealEstateAPIClient


def fetch_national_average_all_datapoints(year="2025"):
    """
    全国平均データ取得（全データポイント方式）

    全47都道府県の全公示地価データポイントを取得し、
    その全体から平均値を算出する。
    """
    print(f"📊 {year}年 全国平均データを取得中（全データポイント方式）...")
    print("=" * 80)

    client = RealEstateAPIClient()
    all_prices = []  # 全データポイントの地価
    all_change_rates = []  # 全データポイントの変動率

    # 全都道府県のデータを取得
    for i, (pref_name, _) in enumerate(client.prefecture_codes.items(), 1):
        print(f"[{i}/47] {pref_name}...", end=" ", flush=True)

        try:
            data = client.search_land_prices(prefecture=pref_name, year=year)

            if data:
                # 各データポイントを収集
                for item in data:
                    price = item.get('price_per_sqm', 0)
                    if price > 0:
                        all_prices.append(price)

                    change_rate_str = str(item.get('change_rate', '')).strip()
                    if change_rate_str:
                        try:
                            change_rate = float(change_rate_str.replace('%', '').replace('+', ''))
                            all_change_rates.append(change_rate)
                        except:
                            pass

                print(f"✅ {len(data)}件")
            else:
                print("⚠️ データなし")

        except Exception as e:
            print(f"❌ エラー")
            continue

    if not all_prices:
        raise Exception("データ取得に失敗しました")

    # 全データポイントから平均を計算
    avg_price = int(mean(all_prices))
    avg_change_rate = round(mean(all_change_rates), 1) if all_change_rates else 0
    avg_tsubo_price = int(avg_price * 3.30579)

    print(f"\n✅ 全データポイントから平均を計算:")
    print(f"   データポイント数: {len(all_prices):,}件")
    print(f"   平均地価: {avg_price:,}円/㎡")
    print(f"   変動率: {avg_change_rate:+.1f}%\n")

    return {
        'average_price': avg_price,
        'tsubo_price': avg_tsubo_price,
        'change_rate': avg_change_rate,
        'data_count': len(all_prices)
    }


def fetch_prefecture_data_all_datapoints(pref_name, year="2025"):
    """都道府県別データ取得（全データポイント方式）"""

    client = RealEstateAPIClient()

    try:
        data = client.search_land_prices(prefecture=pref_name, year=year)

        if not data:
            return None

        prices = []
        change_rates = []

        # 全データポイントを収集
        for item in data:
            price = item.get('price_per_sqm', 0)
            if price > 0:
                prices.append(price)

            change_rate_str = str(item.get('change_rate', '')).strip()
            if change_rate_str:
                try:
                    change_rate = float(change_rate_str.replace('%', '').replace('+', ''))
                    change_rates.append(change_rate)
                except:
                    pass

        if not prices:
            return None

        # 全データポイントから平均を計算
        avg_price = int(mean(prices))
        avg_change_rate = round(mean(change_rates), 1) if change_rates else 0
        avg_tsubo_price = int(avg_price * 3.30579)
        tsubo_price_man = round(avg_tsubo_price / 10000, 1)

        return {
            'prefecture_name': pref_name,
            'average_price': avg_price,
            'tsubo_price': avg_tsubo_price,
            'tsubo_price_man': tsubo_price_man,
            'change_rate': avg_change_rate,
            'data_count': len(prices)
        }

    except Exception as e:
        return None


def generate_master_csv(output_file='page_1726_master_correct.csv'):
    """ID:1726ページ用マスターCSV生成（全データポイント方式）"""

    print("=" * 80)
    print("ID:1726 公示地価マスターデータ生成")
    print("計算ロジック: Option A - 全データポイント方式")
    print("=" * 80 + "\n")

    # 1. 全国平均データ取得（2025年）
    national_data = fetch_national_average_all_datapoints("2025")

    # 2. 47都道府県データ取得
    print("\n" + "=" * 80)
    print("47都道府県のデータを取得中...")
    print("=" * 80 + "\n")

    client = RealEstateAPIClient()
    prefecture_data_list = []

    for i, (pref_name, _) in enumerate(client.prefecture_codes.items(), 1):
        print(f"[{i}/47] {pref_name}...", end=" ", flush=True)

        pref_data = fetch_prefecture_data_all_datapoints(pref_name, "2025")

        if pref_data:
            prefecture_data_list.append(pref_data)
            print(f"✅ {pref_data['average_price']:,}円/㎡")
        else:
            print("⚠️ スキップ")

    print(f"\n✅ データ取得完了: 全国1件 + 都道府県{len(prefecture_data_list)}件\n")

    # 3. 各種ランキング作成
    high_price_ranking = sorted(prefecture_data_list, key=lambda x: x['average_price'], reverse=True)[:10]
    low_price_ranking = sorted(prefecture_data_list, key=lambda x: x['average_price'])[:10]
    increase_ranking = sorted(prefecture_data_list, key=lambda x: x['change_rate'], reverse=True)[:10]
    decrease_ranking = sorted(prefecture_data_list, key=lambda x: x['change_rate'])[:10]

    normal_ranking = sorted(prefecture_data_list, key=lambda x: x['average_price'], reverse=True)
    for rank, pref_data in enumerate(normal_ranking, start=1):
        pref_data['rank'] = rank

    # 4. CSVに書き込み
    print("=" * 80)
    print("マスターCSVを生成中...")
    print("=" * 80 + "\n")

    with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)

        # メタデータ
        writer.writerow(['# ID:1726（全国トップページ）用 公示地価マスターデータ'])
        writer.writerow([f'# 生成日時: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'])
        writer.writerow([f'# データソース: 国土交通省 不動産情報ライブラリAPI'])
        writer.writerow([f'# 対象年: 2025年（令和7年）公示地価'])
        writer.writerow([])
        writer.writerow(['# ========== 計算ロジック =========='])
        writer.writerow(['# Option A: 全データポイント方式'])
        writer.writerow(['# 全国平均 = Σ(全47都道府県の全データポイント) / 総データポイント数'])
        writer.writerow(['# 都道府県平均 = Σ(その都道府県の全データポイント) / その都道府県のデータポイント数'])
        writer.writerow(['# 詳細: CALCULATION_LOGIC.md を参照'])
        writer.writerow([])

        # セクション1: 全国平均
        writer.writerow(['## セクション1: 全国平均サマリー（2025年）'])
        writer.writerow(['area_name', 'average_price', 'tsubo_price', 'change_rate', 'data_count'])
        writer.writerow([
            '日本全国',
            national_data['average_price'],
            national_data['tsubo_price'],
            f"{national_data['change_rate']:+.1f}",
            national_data['data_count']
        ])
        writer.writerow([])

        # セクション2: 高価格ランキング
        writer.writerow(['## セクション2: 💰 高価格ランキング TOP10'])
        writer.writerow(['rank', 'prefecture_name', 'average_price', 'tsubo_price', 'tsubo_price_man', 'change_rate'])
        for i, pref_data in enumerate(high_price_ranking, start=1):
            writer.writerow([
                i,
                pref_data['prefecture_name'],
                pref_data['average_price'],
                pref_data['tsubo_price'],
                pref_data['tsubo_price_man'],
                f"{pref_data['change_rate']:+.1f}"
            ])
        writer.writerow([])

        # セクション3: 低価格ランキング
        writer.writerow(['## セクション3: 📉 低価格ランキング TOP10'])
        writer.writerow(['rank', 'prefecture_name', 'average_price', 'tsubo_price', 'tsubo_price_man', 'change_rate'])
        for i, pref_data in enumerate(low_price_ranking, start=1):
            writer.writerow([
                i,
                pref_data['prefecture_name'],
                pref_data['average_price'],
                pref_data['tsubo_price'],
                pref_data['tsubo_price_man'],
                f"{pref_data['change_rate']:+.1f}"
            ])
        writer.writerow([])

        # セクション4: 上昇率ランキング
        writer.writerow(['## セクション4: 📈 上昇率ランキング TOP10'])
        writer.writerow(['rank', 'prefecture_name', 'change_rate', 'average_price', 'tsubo_price_man'])
        for i, pref_data in enumerate(increase_ranking, start=1):
            writer.writerow([
                i,
                pref_data['prefecture_name'],
                f"{pref_data['change_rate']:+.1f}",
                pref_data['average_price'],
                pref_data['tsubo_price_man']
            ])
        writer.writerow([])

        # セクション5: 下落率ランキング
        writer.writerow(['## セクション5: 📊 下落率ランキング TOP10'])
        writer.writerow(['rank', 'prefecture_name', 'change_rate', 'average_price', 'tsubo_price_man'])
        for i, pref_data in enumerate(decrease_ranking, start=1):
            writer.writerow([
                i,
                pref_data['prefecture_name'],
                f"{pref_data['change_rate']:+.1f}",
                pref_data['average_price'],
                pref_data['tsubo_price_man']
            ])
        writer.writerow([])

        # セクション6: 都道府県別全データ
        writer.writerow(['## セクション6: 都道府県別全データ（平均地価順）'])
        writer.writerow(['rank', 'prefecture_name', 'average_price', 'tsubo_price', 'tsubo_price_man', 'change_rate', 'data_count'])
        for pref_data in normal_ranking:
            writer.writerow([
                pref_data['rank'],
                pref_data['prefecture_name'],
                pref_data['average_price'],
                pref_data['tsubo_price'],
                pref_data['tsubo_price_man'],
                f"{pref_data['change_rate']:+.1f}",
                pref_data['data_count']
            ])

    print(f"✅ マスターCSVを生成しました: {output_file}\n")

    import os
    size = os.path.getsize(output_file)
    print(f"📄 ファイルサイズ: {size:,} bytes ({size/1024:.1f} KB)\n")

    # データサマリー
    print("=" * 80)
    print("📊 データサマリー")
    print("=" * 80)
    print(f"\n【全国平均（2025年）】- 全データポイント方式")
    print(f"  平均地価: {national_data['average_price']:,}円/㎡")
    print(f"  坪単価: {national_data['tsubo_price']:,}円/坪")
    print(f"  変動率: {national_data['change_rate']:+.1f}%")
    print(f"  データ件数: {national_data['data_count']:,}件")

    print(f"\n【💰 高価格ランキング TOP3】")
    for i, pref_data in enumerate(high_price_ranking[:3], start=1):
        print(f"  {i}位: {pref_data['prefecture_name']:8} {pref_data['average_price']:,}円/㎡")

    print(f"\n【📈 上昇率ランキング TOP3】")
    for i, pref_data in enumerate(increase_ranking[:3], start=1):
        print(f"  {i}位: {pref_data['prefecture_name']:8} {pref_data['change_rate']:+.1f}%")

    return True


if __name__ == '__main__':
    success = generate_master_csv()
    sys.exit(0 if success else 1)
