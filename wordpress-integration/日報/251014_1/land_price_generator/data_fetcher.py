"""
地価データ取得モジュール

不動産情報ライブラリAPIから公示地価データを取得し、キャッシュに保存する
"""

import sys
import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from pathlib import Path

# 親ディレクトリのreal_estate_client.pyをインポート
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../backend/property-api'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from real_estate_client import RealEstateAPIClient


class LandPriceDataFetcher:
    """公示地価データ取得クラス"""

    def __init__(self, cache_dir: str = None):
        """
        初期化

        Args:
            cache_dir: キャッシュディレクトリのパス
        """
        self.client = RealEstateAPIClient()

        # キャッシュディレクトリ設定
        if cache_dir is None:
            cache_dir = os.path.join(os.path.dirname(__file__), 'cache')
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        # 都道府県コード
        self.prefecture_codes = self.client.prefecture_codes

    def fetch_all_prefecture_data(self, year: str = "2024", use_cache: bool = True) -> Dict[str, Any]:
        """
        全国47都道府県の公示地価データを取得

        Args:
            year: 対象年
            use_cache: キャッシュを使用するか

        Returns:
            {
                "13": {  # 都道府県コード
                    "name": "東京都",
                    "code": "13",
                    "year": "2024",
                    "data": [...],  # 公示地価データのリスト
                    "municipalities": {...}  # 市区町村別にグループ化
                },
                ...
            }
        """
        print(f"\n{'='*60}")
        print(f"全国の公示地価データ取得（{year}年）")
        print(f"{'='*60}\n")

        # キャッシュチェック
        cache_key = f"all_prefecture_data_{year}"
        if use_cache:
            cached = self.load_from_cache(cache_key, max_age_days=30)
            if cached:
                print("✅ キャッシュからデータを読み込みました")
                return cached

        all_data = {}
        total = len(self.prefecture_codes)

        for i, (pref_name, pref_code) in enumerate(self.prefecture_codes.items(), 1):
            print(f"[{i}/{total}] {pref_name}のデータを取得中...")

            try:
                pref_data = self.fetch_prefecture_data(pref_code, pref_name, year, use_cache=False)
                all_data[pref_code] = pref_data

                # データ数を表示
                total_points = len(pref_data.get('data', []))
                municipalities_count = len(pref_data.get('municipalities', {}))
                print(f"   ✅ {pref_name}: {total_points}地点, {municipalities_count}市区町村")

            except Exception as e:
                print(f"   ❌ {pref_name}: エラー - {e}")
                continue

        # キャッシュに保存
        self.save_to_cache(all_data, cache_key)

        print(f"\n{'='*60}")
        print(f"全国データ取得完了: {len(all_data)}/{total}都道府県")
        print(f"{'='*60}\n")

        return all_data

    def fetch_prefecture_data(self, prefecture_code: str, prefecture_name: str,
                            year: str = "2024", use_cache: bool = True) -> Dict:
        """
        特定の都道府県の公示地価データを取得

        Args:
            prefecture_code: 都道府県コード（例: "13"）
            prefecture_name: 都道府県名（例: "東京都"）
            year: 対象年
            use_cache: キャッシュを使用するか

        Returns:
            {
                "prefecture_code": "13",
                "prefecture_name": "東京都",
                "year": "2024",
                "data": [...],  # 公示地価データのリスト
                "municipalities": {...}  # 市区町村別にグループ化
            }
        """
        # キャッシュチェック
        cache_key = f"prefecture_{prefecture_code}_{year}"
        if use_cache:
            cached = self.load_from_cache(cache_key, max_age_days=30)
            if cached:
                return cached

        # APIからデータ取得
        data = self.client.search_land_prices(
            prefecture=prefecture_name,
            year=year
        )

        # 市区町村別にグループ化
        municipalities = self._group_by_municipality(data)

        result = {
            "prefecture_code": prefecture_code,
            "prefecture_name": prefecture_name,
            "year": year,
            "data": data,
            "municipalities": municipalities
        }

        # キャッシュに保存
        self.save_to_cache(result, cache_key)

        return result

    def fetch_city_data(self, prefecture_name: str, city_name: str,
                       years: List[str] = None, use_cache: bool = True) -> Dict:
        """
        特定の市区町村の公示地価データを取得（過去データ含む）

        Args:
            prefecture_name: 都道府県名（例: "東京都"）
            city_name: 市区町村名（例: "千代田区"）
            years: 対象年のリスト（デフォルト: 過去5年）
            use_cache: キャッシュを使用するか

        Returns:
            {
                "prefecture": "東京都",
                "city": "千代田区",
                "current_year": "2024",
                "years": ["2020", "2021", "2022", "2023", "2024"],
                "current_data": [...],  # 最新年のデータ
                "history": {...}  # 住所ごとの年次データ
            }
        """
        if years is None:
            current_year = int(datetime.now().year)
            years = [str(year) for year in range(current_year - 4, current_year + 1)]

        current_year = years[-1]

        # キャッシュチェック
        cache_key = f"city_{prefecture_name}_{city_name}_{current_year}"
        if use_cache:
            cached = self.load_from_cache(cache_key, max_age_days=30)
            if cached:
                return cached

        # 過去データ取得
        history = self.client.search_land_price_history(
            prefecture=prefecture_name,
            city=city_name,
            years=years
        )

        # 最新年のデータ取得
        current_data = self.client.search_land_prices(
            prefecture=prefecture_name,
            city=city_name,
            year=current_year
        )

        result = {
            "prefecture": prefecture_name,
            "city": city_name,
            "current_year": current_year,
            "years": years,
            "current_data": current_data,
            "history": history
        }

        # キャッシュに保存
        self.save_to_cache(result, cache_key)

        return result

    def _group_by_municipality(self, data: List[Dict]) -> Dict[str, List[Dict]]:
        """
        データを市区町村別にグループ化

        Args:
            data: 公示地価データのリスト

        Returns:
            {
                "千代田区": [...],
                "中央区": [...],
                ...
            }
        """
        municipalities = {}

        for item in data:
            # regionフィールドから市区町村名を取得
            region = item.get('region', '').strip()

            if not region:
                continue

            # 市区町村名を正規化（「区」「市」「町」「村」を付ける）
            city = self._normalize_city_name(region)

            if city:
                if city not in municipalities:
                    municipalities[city] = []
                municipalities[city].append(item)

        return municipalities

    def _normalize_city_name(self, region: str) -> str:
        """
        地域名を市区町村名に正規化

        Args:
            region: 地域名（例: "千代田", "八王子", "新島"）

        Returns:
            市区町村名（例: "千代田区", "八王子市", "新島村"）
        """
        if not region:
            return ""

        # 既に「市」「区」「町」「村」で終わっている場合はそのまま返す
        if region.endswith(('市', '区', '町', '村')):
            return region

        # 東京23区の判定
        tokyo_wards = [
            '千代田', '中央', '港', '新宿', '文京', '台東', '墨田', '江東',
            '品川', '目黒', '大田', '世田谷', '渋谷', '中野', '杉並',
            '豊島', '北', '荒川', '板橋', '練馬', '足立', '葛飾', '江戸川'
        ]

        if region in tokyo_wards:
            return f"{region}区"

        # 市の判定（東京都の市）
        tokyo_cities = [
            '八王子', '立川', '武蔵野', '三鷹', '青梅', '府中', '昭島',
            '調布', '町田', '小金井', '小平', '日野', '東村山', '国分寺',
            '国立', '福生', '狛江', '東大和', '清瀬', '東久留米',
            '武蔵村山', '多摩', '稲城', '羽村', 'あきる野', '西東京'
        ]

        if region in tokyo_cities:
            return f"{region}市"

        # 町の判定（東京都の町）
        tokyo_towns = [
            '瑞穂', '日の出', '檜原', '奥多摩'
        ]

        if region in tokyo_towns:
            return f"{region}町"

        # 村の判定（東京都の村）
        tokyo_villages = [
            '大島', '利島', '新島', '神津島', '三宅', '御蔵島',
            '八丈', '青ヶ島', '小笠原'
        ]

        if region in tokyo_villages:
            return f"{region}村"

        # デフォルトは「市」を付ける（他の都道府県の場合）
        return f"{region}市"

    def save_to_cache(self, data: Dict, cache_key: str):
        """
        データをJSON形式でキャッシュに保存

        Args:
            data: 保存するデータ
            cache_key: キャッシュキー
        """
        cache_file = self.cache_dir / f"{cache_key}.json"

        # メタデータ追加
        cache_data = {
            "cached_at": datetime.now().isoformat(),
            "cache_key": cache_key,
            "data": data
        }

        try:
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"⚠️ キャッシュ保存エラー: {e}")

    def load_from_cache(self, cache_key: str, max_age_days: int = 30) -> Optional[Dict]:
        """
        キャッシュからデータを読み込み（期限チェック付き）

        Args:
            cache_key: キャッシュキー
            max_age_days: キャッシュの有効期限（日数）

        Returns:
            キャッシュされたデータ、または None
        """
        cache_file = self.cache_dir / f"{cache_key}.json"

        if not cache_file.exists():
            return None

        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)

            # 期限チェック
            cached_at = datetime.fromisoformat(cache_data['cached_at'])
            age = datetime.now() - cached_at

            if age > timedelta(days=max_age_days):
                print(f"⚠️ キャッシュが期限切れ: {cache_key}（{age.days}日前）")
                return None

            return cache_data['data']

        except Exception as e:
            print(f"⚠️ キャッシュ読み込みエラー: {e}")
            return None

    def clear_cache(self, cache_key: str = None):
        """
        キャッシュをクリア

        Args:
            cache_key: クリアするキャッシュキー（Noneの場合は全て）
        """
        if cache_key:
            cache_file = self.cache_dir / f"{cache_key}.json"
            if cache_file.exists():
                cache_file.unlink()
                print(f"✅ キャッシュをクリア: {cache_key}")
        else:
            for cache_file in self.cache_dir.glob("*.json"):
                cache_file.unlink()
            print("✅ 全てのキャッシュをクリアしました")


# テスト用
if __name__ == "__main__":
    print("地価データ取得モジュール テスト\n")

    fetcher = LandPriceDataFetcher()

    # テスト1: 東京都のデータ取得
    print("テスト1: 東京都のデータ取得")
    print("-" * 60)
    tokyo_data = fetcher.fetch_prefecture_data("13", "東京都", "2024")
    print(f"取得データ数: {len(tokyo_data['data'])}件")
    print(f"市区町村数: {len(tokyo_data['municipalities'])}件")
    print()

    # テスト2: 千代田区のデータ取得
    print("テスト2: 千代田区のデータ取得（過去5年）")
    print("-" * 60)
    chiyoda_data = fetcher.fetch_city_data("東京都", "千代田区")
    print(f"最新データ: {len(chiyoda_data['current_data'])}件")
    print(f"履歴データ: {len(chiyoda_data['history'])}地点")
    print()

    print("✅ テスト完了")
