"""
地価データ処理・統計モジュール

取得した公示地価データを集計・分析して統計情報を生成する
"""

from typing import Dict, List, Optional, Any
import statistics


class LandPriceDataProcessor:
    """地価データ処理クラス"""

    def calculate_prefecture_stats(self, prefecture_data: Dict) -> Dict:
        """
        都道府県全体の統計情報を計算

        Args:
            prefecture_data: fetch_prefecture_data() の結果

        Returns:
            {
                "prefecture_name": "東京都",
                "prefecture_code": "13",
                "year": "2024",
                "summary": {...},
                "municipalities": [...],
                "price_distribution": {...},
                "municipality_ranking": [...]
            }
        """
        data = prefecture_data.get('data', [])
        municipalities = prefecture_data.get('municipalities', {})

        if not data:
            return self._empty_prefecture_stats(prefecture_data)

        # サマリー計算
        summary = self._calculate_summary(data)

        # 価格分布
        price_distribution = self._calculate_price_distribution(data)

        # 市区町村統計
        municipality_stats = []
        for city_name, city_data in municipalities.items():
            city_summary = self._calculate_summary(city_data)
            city_summary['municipality'] = city_name
            municipality_stats.append(city_summary)

        # 市区町村ランキング
        municipality_ranking = self._create_municipality_ranking(municipality_stats)

        return {
            "prefecture_name": prefecture_data['prefecture_name'],
            "prefecture_code": prefecture_data['prefecture_code'],
            "year": prefecture_data['year'],
            "summary": summary,
            "municipalities": municipality_stats,
            "price_distribution": price_distribution,
            "municipality_ranking": municipality_ranking
        }

    def calculate_city_stats(self, city_data: Dict) -> Dict:
        """
        市区町村の統計情報を計算

        Args:
            city_data: fetch_city_data() の結果

        Returns:
            {
                "city_name": "千代田区",
                "prefecture": "東京都",
                "year": "2024",
                "summary": {...},
                "station_ranking": [...],
                "district_ranking": [...],
                "point_ranking": [...],
                "trend": {...}
            }
        """
        current_data = city_data.get('current_data', [])
        history = city_data.get('history', {})

        if not current_data:
            return self._empty_city_stats(city_data)

        # サマリー計算
        summary = self._calculate_summary(current_data)

        # 駅別ランキング
        station_ranking = self._create_station_ranking(current_data)

        # 地区別ランキング（住所の先頭部分でグループ化）
        district_ranking = self._create_district_ranking(current_data)

        # 地点別ランキング
        point_ranking = self._create_point_ranking(current_data)

        # 推移分析
        trend = self._analyze_price_trend(history)

        return {
            "city_name": city_data['city'],
            "prefecture": city_data['prefecture'],
            "year": city_data['current_year'],
            "summary": summary,
            "station_ranking": station_ranking,
            "district_ranking": district_ranking,
            "point_ranking": point_ranking,
            "trend": trend
        }

    def _calculate_summary(self, data: List[Dict]) -> Dict:
        """
        データのサマリー統計を計算

        Returns:
            {
                "average_price_per_sqm": 1302000,
                "average_price_per_tsubo": 4303000,
                "median_price": 950000,
                "total_points": 2500,
                "change_rate": 7.7,
                "highest_price": 12000000,
                "lowest_price": 50000
            }
        """
        if not data:
            return {}

        # 価格リスト
        prices = [item['price_per_sqm'] for item in data if item.get('price_per_sqm', 0) > 0]

        if not prices:
            return {}

        # 変動率リスト
        change_rates = []
        for item in data:
            rate_str = item.get('change_rate', '')
            if rate_str:
                try:
                    # "%"を除去して数値に変換
                    rate = float(rate_str.replace('%', '').replace('+', ''))
                    change_rates.append(rate)
                except:
                    pass

        # 平均地価
        average_price = int(statistics.mean(prices))

        # 中央値
        median_price = int(statistics.median(prices))

        # 平均変動率
        avg_change_rate = round(statistics.mean(change_rates), 2) if change_rates else 0.0

        return {
            "average_price_per_sqm": average_price,
            "average_price_per_tsubo": int(average_price * 3.30578),  # 坪単価
            "median_price": median_price,
            "median_price_per_tsubo": int(median_price * 3.30578),
            "total_points": len(data),
            "change_rate": avg_change_rate,
            "highest_price": max(prices),
            "lowest_price": min(prices)
        }

    def _calculate_price_distribution(self, data: List[Dict]) -> Dict:
        """
        価格分布を計算

        Returns:
            {
                "highest": {...},
                "lowest": {...},
                "top10": [...],
                "bottom10": [...]
            }
        """
        if not data:
            return {}

        # 価格でソート
        sorted_data = sorted(data, key=lambda x: x.get('price_per_sqm', 0), reverse=True)

        # 最高額・最低額
        highest = sorted_data[0] if sorted_data else {}
        lowest = sorted_data[-1] if sorted_data else {}

        # TOP10/BOTTOM10
        top10 = sorted_data[:10]
        bottom10 = sorted_data[-10:][::-1]  # 逆順

        return {
            "highest": self._format_point_data(highest),
            "lowest": self._format_point_data(lowest),
            "top10": [self._format_point_data(item) for item in top10],
            "bottom10": [self._format_point_data(item) for item in bottom10]
        }

    def _create_municipality_ranking(self, municipality_stats: List[Dict]) -> List[Dict]:
        """
        市区町村ランキングを生成

        Returns:
            [
                {
                    "rank": 1,
                    "municipality": "中央区",
                    "average_price": 6530000,
                    "price_per_tsubo": 21580000,
                    "change_rate": 8.5,
                    "total_points": 120
                },
                ...
            ]
        """
        if not municipality_stats:
            return []

        # 平均地価でソート
        sorted_stats = sorted(
            municipality_stats,
            key=lambda x: x.get('average_price_per_sqm', 0),
            reverse=True
        )

        ranking = []
        for i, stats in enumerate(sorted_stats, 1):
            ranking.append({
                "rank": i,
                "municipality": stats.get('municipality', ''),
                "average_price": stats.get('average_price_per_sqm', 0),
                "price_per_tsubo": stats.get('average_price_per_tsubo', 0),
                "change_rate": stats.get('change_rate', 0.0),
                "total_points": stats.get('total_points', 0)
            })

        return ranking

    def _create_station_ranking(self, data: List[Dict], top_n: int = 10) -> List[Dict]:
        """
        駅別ランキングを生成

        Returns:
            [
                {
                    "rank": 1,
                    "station": "大手町",
                    "average_price": 12500000,
                    "price_per_tsubo": 41300000,
                    "count": 25
                },
                ...
            ]
        """
        # 駅ごとにグループ化
        station_groups = {}

        for item in data:
            station = item.get('station', '').strip()
            if not station or station == '-':
                continue

            price = item.get('price_per_sqm', 0)
            if price <= 0:
                continue

            if station not in station_groups:
                station_groups[station] = []
            station_groups[station].append(price)

        # 平均価格を計算してソート
        station_stats = []
        for station, prices in station_groups.items():
            if prices:
                avg_price = int(statistics.mean(prices))
                station_stats.append({
                    "station": station,
                    "average_price": avg_price,
                    "price_per_tsubo": int(avg_price * 3.30578),
                    "count": len(prices)
                })

        # ソート
        station_stats.sort(key=lambda x: x['average_price'], reverse=True)

        # ランク付け
        for i, stats in enumerate(station_stats[:top_n], 1):
            stats['rank'] = i

        return station_stats[:top_n]

    def _create_district_ranking(self, data: List[Dict], top_n: int = 10) -> List[Dict]:
        """
        地区別ランキングを生成（住所の先頭部分でグループ化）

        Returns:
            [
                {
                    "rank": 1,
                    "district": "丸の内",
                    "average_price": 15000000,
                    "price_per_tsubo": 49580000,
                    "count": 10
                },
                ...
            ]
        """
        # 地区ごとにグループ化（住所の先頭2-3文字）
        district_groups = {}

        for item in data:
            address = item.get('address', '').strip()
            if not address:
                continue

            # 地区名を抽出（最初の3文字程度）
            district = address[:3] if len(address) >= 3 else address

            price = item.get('price_per_sqm', 0)
            if price <= 0:
                continue

            if district not in district_groups:
                district_groups[district] = []
            district_groups[district].append(price)

        # 平均価格を計算してソート
        district_stats = []
        for district, prices in district_groups.items():
            if prices and len(prices) >= 2:  # 2件以上のデータがある地区のみ
                avg_price = int(statistics.mean(prices))
                district_stats.append({
                    "district": district,
                    "average_price": avg_price,
                    "price_per_tsubo": int(avg_price * 3.30578),
                    "count": len(prices)
                })

        # ソート
        district_stats.sort(key=lambda x: x['average_price'], reverse=True)

        # ランク付け
        for i, stats in enumerate(district_stats[:top_n], 1):
            stats['rank'] = i

        return district_stats[:top_n]

    def _create_point_ranking(self, data: List[Dict], top_n: int = 10) -> List[Dict]:
        """
        地点別ランキングを生成

        Returns:
            [
                {
                    "rank": 1,
                    "address": "丸の内2-4-1",
                    "full_address": "東京都千代田区丸の内2-4-1",
                    "price_per_sqm": 37100000,
                    "price_per_tsubo": 122600000,
                    "station": "東京",
                    "distance": "200m"
                },
                ...
            ]
        """
        # 価格でソート
        sorted_data = sorted(data, key=lambda x: x.get('price_per_sqm', 0), reverse=True)

        ranking = []
        for i, item in enumerate(sorted_data[:top_n], 1):
            ranking.append({
                "rank": i,
                "address": item.get('address', ''),
                "full_address": item.get('full_address', ''),
                "price_per_sqm": item.get('price_per_sqm', 0),
                "price_per_tsubo": item.get('price_per_tsubo', 0),
                "station": item.get('station', '-'),
                "distance": item.get('station_distance', '-'),
                "change_rate": item.get('change_rate', '-')
            })

        return ranking

    def _analyze_price_trend(self, history: Dict) -> Dict:
        """
        地価推移を分析

        Args:
            history: search_land_price_history() の結果

        Returns:
            {
                "years": [2020, 2021, 2022, 2023, 2024],
                "average_prices": [5400000, 5600000, 5900000, 6100000, 6530000],
                "change_rates": [2.5, 3.7, 5.4, 3.4, 7.0],
                "5_year_growth": 20.9,
                "trend": "上昇"
            }
        """
        if not history:
            return {}

        # 年次ごとの平均価格を計算
        yearly_data = {}

        for address, data in history.items():
            for yearly in data.get('yearly_prices', []):
                year = yearly['year']
                price = yearly['price_per_sqm']

                if year not in yearly_data:
                    yearly_data[year] = []
                yearly_data[year].append(price)

        if not yearly_data:
            return {}

        # 年でソート
        sorted_years = sorted(yearly_data.keys())

        # 各年の平均価格を計算
        years = []
        average_prices = []
        change_rates = []

        for year in sorted_years:
            prices = yearly_data[year]
            avg_price = int(statistics.mean(prices))

            years.append(year)
            average_prices.append(avg_price)

            # 変動率計算（前年との比較）
            if len(average_prices) >= 2:
                prev_price = average_prices[-2]
                change_rate = round((avg_price - prev_price) / prev_price * 100, 1)
                change_rates.append(change_rate)

        # 全期間の成長率
        if len(average_prices) >= 2:
            first_price = average_prices[0]
            last_price = average_prices[-1]
            total_growth = round((last_price - first_price) / first_price * 100, 1)
        else:
            total_growth = 0.0

        # トレンド判定
        if total_growth > 5:
            trend = "上昇"
        elif total_growth < -5:
            trend = "下降"
        else:
            trend = "横ばい"

        return {
            "years": years,
            "average_prices": average_prices,
            "change_rates": change_rates,
            "total_growth": total_growth,
            "trend": trend
        }

    def _format_point_data(self, item: Dict) -> Dict:
        """地点データをフォーマット"""
        return {
            "address": item.get('address', ''),
            "full_address": item.get('full_address', ''),
            "price_per_sqm": item.get('price_per_sqm', 0),
            "price_per_tsubo": item.get('price_per_tsubo', 0),
            "station": item.get('station', '-'),
            "distance": item.get('station_distance', '-'),
            "change_rate": item.get('change_rate', '-')
        }

    def _empty_prefecture_stats(self, prefecture_data: Dict) -> Dict:
        """データがない場合の空の都道府県統計"""
        return {
            "prefecture_name": prefecture_data.get('prefecture_name', ''),
            "prefecture_code": prefecture_data.get('prefecture_code', ''),
            "year": prefecture_data.get('year', ''),
            "summary": {},
            "municipalities": [],
            "price_distribution": {},
            "municipality_ranking": []
        }

    def _empty_city_stats(self, city_data: Dict) -> Dict:
        """データがない場合の空の市区町村統計"""
        return {
            "city_name": city_data.get('city', ''),
            "prefecture": city_data.get('prefecture', ''),
            "year": city_data.get('current_year', ''),
            "summary": {},
            "station_ranking": [],
            "district_ranking": [],
            "point_ranking": [],
            "trend": {}
        }


# テスト用
if __name__ == "__main__":
    print("地価データ処理モジュール テスト\n")

    # テストデータ
    test_data = {
        "prefecture_name": "東京都",
        "prefecture_code": "13",
        "year": "2024",
        "data": [
            {"address": "千代田区丸の内1-1-1", "full_address": "東京都千代田区丸の内1-1-1",
             "price_per_sqm": 10000000, "price_per_tsubo": 33057800, "change_rate": "+10.5%",
             "station": "東京", "station_distance": "200m"},
            {"address": "千代田区丸の内2-2-2", "full_address": "東京都千代田区丸の内2-2-2",
             "price_per_sqm": 12000000, "price_per_tsubo": 39669360, "change_rate": "+12.0%",
             "station": "東京", "station_distance": "300m"},
        ],
        "municipalities": {
            "千代田区": [
                {"price_per_sqm": 10000000, "change_rate": "+10.5%"},
                {"price_per_sqm": 12000000, "change_rate": "+12.0%"}
            ]
        }
    }

    processor = LandPriceDataProcessor()
    stats = processor.calculate_prefecture_stats(test_data)

    print("都道府県統計:")
    print(f"  平均地価: {stats['summary']['average_price_per_sqm']:,}円/㎡")
    print(f"  調査地点数: {stats['summary']['total_points']}件")
    print(f"  変動率: {stats['summary']['change_rate']}%")
    print()

    print("✅ テスト完了")
