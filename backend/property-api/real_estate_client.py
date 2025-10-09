"""
不動産情報ライブラリAPI クライアント
"""
import os
import requests
from typing import Dict, List, Optional
from datetime import datetime
import json

class RealEstateAPIClient:
    """国土交通省 不動産情報ライブラリAPIクライアント"""
    
    def __init__(self):
        self.base_url = "https://www.reinfolib.mlit.go.jp/ex-api/external"
        # GitHub SecretsのVITE_REAL_ESTATE_API_KEYを使用
        self.api_key = os.getenv("VITE_REAL_ESTATE_API_KEY", os.getenv("MAIN_REAL_ESTATE_API_KEY", os.getenv("REAL_ESTATE_API_KEY", "")))
        self.headers = {
            "Ocp-Apim-Subscription-Key": self.api_key
        }
        
        # 都道府県コードマッピング
        self.prefecture_codes = {
            "北海道": "01", "青森県": "02", "岩手県": "03", "宮城県": "04",
            "秋田県": "05", "山形県": "06", "福島県": "07", "茨城県": "08",
            "栃木県": "09", "群馬県": "10", "埼玉県": "11", "千葉県": "12",
            "東京都": "13", "神奈川県": "14", "新潟県": "15", "富山県": "16",
            "石川県": "17", "福井県": "18", "山梨県": "19", "長野県": "20",
            "岐阜県": "21", "静岡県": "22", "愛知県": "23", "三重県": "24",
            "滋賀県": "25", "京都府": "26", "大阪府": "27", "兵庫県": "28",
            "奈良県": "29", "和歌山県": "30", "鳥取県": "31", "島根県": "32",
            "岡山県": "33", "広島県": "34", "山口県": "35", "徳島県": "36",
            "香川県": "37", "愛媛県": "38", "高知県": "39", "福岡県": "40",
            "佐賀県": "41", "長崎県": "42", "熊本県": "43", "大分県": "44",
            "宮崎県": "45", "鹿児島県": "46", "沖縄県": "47"
        }
        
        # 取引種類マッピング
        self.trade_types = {
            "01": "土地",
            "02": "戸建て",
            "03": "林地",
            "04": "農地",
            "05": "宅地見込地",
            "07": "マンション"
        }

    def search_real_estate_prices(
        self,
        prefecture: str,
        city: Optional[str] = None,
        district: Optional[str] = None,
        trade_types: List[str] = None,
        from_year: int = None,
        from_quarter: int = None,
        to_year: int = None,
        to_quarter: int = None
    ) -> Dict:
        """
        不動産取引価格を検索
        
        Args:
            prefecture: 都道府県名
            city: 市区町村名
            district: 地区名
            trade_types: 取引種類コードのリスト ["01", "02"]
            from_year: 開始年
            from_quarter: 開始四半期 (1-4)
            to_year: 終了年
            to_quarter: 終了四半期 (1-4)
            
        Returns:
            検索結果の辞書
        """
        
        if not self.api_key:
            return {
                "error": "APIキーが設定されていません",
                "total_count": 0,
                "search_count": 0,
                "results": []
            }
        
        # 都道府県コードを取得
        prefecture_code = self.prefecture_codes.get(prefecture)
        if not prefecture_code:
            return {
                "error": f"都道府県 '{prefecture}' が見つかりません",
                "total_count": 0,
                "search_count": 0,
                "results": []
            }
        
        # デフォルト値設定
        if not from_year:
            from_year = datetime.now().year
        if not from_quarter:
            from_quarter = 1
        if not to_year:
            to_year = from_year
        if not to_quarter:
            to_quarter = 4
            
        all_results = []
        
        # 期間内の各四半期でAPIを呼び出し
        for year in range(from_year, to_year + 1):
            start_q = from_quarter if year == from_year else 1
            end_q = to_quarter if year == to_year else 4
            
            for quarter in range(start_q, end_q + 1):
                params = {
                    "year": year,
                    "area": prefecture_code,
                    "quarter": quarter
                }
                
                try:
                    response = requests.get(
                        f"{self.base_url}/XIT001",
                        headers=self.headers,
                        params=params,
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        # APIレスポンスは小文字のキーを使用
                        if data.get("status") == "OK" and data.get("data"):
                            all_results.extend(data["data"])
                    
                except Exception as e:
                    print(f"API呼び出しエラー: {e}")
        
        # 結果をフィルタリング
        filtered_results = self._filter_results(
            all_results, city, district, trade_types
        )
        
        # 結果を整形
        formatted_results = self._format_results(filtered_results)
        
        return {
            "total_count": len(all_results),
            "search_count": len(formatted_results),
            "search_conditions": {
                "location": f"{prefecture} {city or ''} {district or ''}".strip(),
                "types": [self.trade_types.get(t, t) for t in (trade_types or [])],
                "period": f"{from_year}年第{from_quarter}四半期 から {to_year}年第{to_quarter}四半期"
            },
            "results": formatted_results
        }
    
    def _filter_results(
        self,
        results: List[Dict],
        city: Optional[str],
        district: Optional[str],
        trade_types: Optional[List[str]]
    ) -> List[Dict]:
        """結果をフィルタリング"""
        filtered = results
        
        # 市区町村でフィルタ
        if city:
            filtered = [r for r in filtered if city in r.get("Municipality", "")]
        
        # 地区でフィルタ
        if district:
            filtered = [r for r in filtered if district in r.get("DistrictName", "")]
        
        # 取引種類でフィルタ
        if trade_types:
            filtered = [r for r in filtered if self._get_type_code(r.get("Type", "")) in trade_types]
        
        return filtered
    
    def _get_type_code(self, type_name: str) -> str:
        """取引種類名からコードを取得"""
        # APIから返される実際の値とのマッピング
        api_type_mapping = {
            "宅地(土地)": "01",
            "宅地(土地と建物)": "02",  # 戸建て
            "林地": "03",
            "農地": "04",
            "宅地見込地": "05",
            "中古マンション等": "07"
        }

        # 完全一致でチェック
        for api_name, code in api_type_mapping.items():
            if api_name == type_name:
                return code

        # 部分一致でもチェック（フォールバック）
        if "土地と建物" in type_name:
            return "02"
        elif "マンション" in type_name:
            return "07"
        elif "宅地(土地)" in type_name:
            return "01"

        return ""
    
    def _format_results(self, results: List[Dict]) -> List[Dict]:
        """結果を整形"""
        formatted = []
        
        for i, r in enumerate(results, 1):
            # 価格を数値に変換
            price = 0
            price_str = r.get("TradePrice", "0")
            try:
                price = int(price_str)
            except:
                pass
            
            # 面積を数値に変換
            area = 0
            area_str = r.get("Area", "0")
            try:
                area = float(area_str)
            except:
                pass

            # 建物面積を取得（マンションの場合はAreaが専有面積、戸建ての場合はTotalFloorAreaが延床面積）
            building_area = 0
            type_name = r.get("Type", "")
            if "マンション" in type_name:
                # マンションの場合：Areaが専有面積
                building_area = area
                land_area = 0  # マンションは土地面積なし
            else:
                # 戸建て・土地の場合：Areaが土地面積、TotalFloorAreaが延床面積
                land_area = area
                building_area_str = r.get("TotalFloorArea", "0")
                try:
                    building_area = float(building_area_str) if building_area_str else 0
                except:
                    pass

            # ㎡単価を計算（建物がある場合は建物面積、土地のみの場合は土地面積で計算）
            calc_area = building_area if building_area > 0 else land_area
            unit_price = price / calc_area if calc_area > 0 else 0
            tsubo_price = unit_price * 3.306  # 坪単価

            # 最寄駅と駅距離の情報
            # 注意：不動産情報ライブラリAPIの仕様書によると、
            # 不動産取引価格情報には最寄駅・駅距離のフィールドが含まれていません
            station_name = "-"
            station_distance = "-"

            formatted.append({
                "no": i,
                "type": r.get("Type", ""),
                "price_type": r.get("PriceCategory", "不動産取引価格情報"),
                "location": f"{r.get('Municipality', '')} {r.get('DistrictName', '')}",
                "region": r.get("Region", ""),
                "station": station_name,
                "station_distance": station_distance,
                "price": price,
                "price_formatted": f"{price/10000:,.0f}万円" if price > 0 else "",
                "land_area": land_area,
                "building_area": building_area,
                "build_year": r.get("BuildingYear", ""),
                "structure": r.get("Structure", ""),
                "floor_plan": r.get("FloorPlan", ""),
                "use": r.get("Use", ""),
                "purpose": r.get("Purpose", ""),
                "land_shape": r.get("LandShape", ""),
                "road_width": float(r.get("Frontage", 0) or 0),
                "road_type": self._get_road_type(r.get("Classification", "")),
                "road_direction": r.get("Direction", ""),
                "breadth": r.get("Breadth", ""),
                "city_planning": r.get("CityPlanning", ""),
                "coverage_ratio": int(r.get("CoverageRatio", 0) or 0),
                "floor_area_ratio": int(r.get("FloorAreaRatio", 0) or 0),
                "renovation": r.get("Renovation", ""),
                "remarks": r.get("Remarks", ""),
                "trade_period": r.get("Period", ""),
                "unit_price": int(unit_price),
                "unit_price_formatted": f"{unit_price/10000:.1f}万円" if unit_price > 0 else "",
                "tsubo_price": int(tsubo_price),
                "tsubo_price_formatted": f"{tsubo_price/10000:.1f}万円" if tsubo_price > 0 else "",
                # 坪単価（APIから取得）
                "price_per_unit": r.get("PricePerUnit", ""),
                "price_per_unit_formatted": f"{int(r.get('PricePerUnit', 0))/10000:,.1f}万円" if r.get('PricePerUnit') and str(r.get('PricePerUnit')).isdigit() else ""
            })
        
        return formatted
    
    def _get_road_type(self, classification: str) -> str:
        """道路種別を判定"""
        if "国道" in classification:
            return "国道"
        elif "都道府県道" in classification:
            return "都道府県道"
        elif "市町村道" in classification:
            return "市道"
        elif "私道" in classification:
            return "私道"
        elif classification:
            return "公道"
        return ""
    
    def get_prefectures(self) -> List[Dict[str, str]]:
        """都道府県リストを取得"""
        return [
            {"code": code, "name": name}
            for name, code in self.prefecture_codes.items()
        ]
    
    def get_cities(self, prefecture_code: str) -> List[Dict[str, str]]:
        """指定された都道府県の市区町村リストを取得"""
        try:
            cities = {}
            current_year = datetime.now().year
            
            # 過去数四半期のデータを試行してデータを取得
            for year in range(current_year, current_year - 2, -1):
                for quarter in range(4, 0, -1):
                    # 未来の四半期はスキップ
                    if year == current_year and quarter > ((datetime.now().month - 1) // 3 + 1):
                        continue
                        
                    params = {
                        "year": year,
                        "area": prefecture_code,
                        "quarter": quarter
                    }
                    
                    response = requests.get(
                        f"{self.base_url}/XIT001",
                        headers=self.headers,
                        params=params,
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("status") == "OK" and data.get("data"):
                            # 市区町村の重複を除去してリスト化
                            for item in data["data"]:
                                if item.get("MunicipalityCode") and item.get("Municipality"):
                                    code = item["MunicipalityCode"]
                                    name = item["Municipality"]
                                    cities[code] = name
                            
                            # データが見つかったら十分な数があれば終了
                            if len(cities) > 5:
                                break
                
                # データが見つかったら終了
                if cities:
                    break
            
            # ソートして返す
            return [
                {"code": code, "name": name}
                for code, name in sorted(cities.items(), key=lambda x: x[1])
            ]
            
        except Exception as e:
            print(f"市区町村取得エラー: {e}")
            return []
    
    def get_districts(self, prefecture_code: str, municipality_code: str = None) -> List[str]:
        """指定された都道府県・市区町村の地区名リストを取得"""
        try:
            districts = set()
            current_year = datetime.now().year
            
            # 過去数四半期のデータを試行してデータを取得
            for year in range(current_year, current_year - 2, -1):
                for quarter in range(4, 0, -1):
                    # 未来の四半期はスキップ
                    if year == current_year and quarter > ((datetime.now().month - 1) // 3 + 1):
                        continue
                        
                    params = {
                        "year": year,
                        "area": prefecture_code,
                        "quarter": quarter
                    }
                    
                    response = requests.get(
                        f"{self.base_url}/XIT001",
                        headers=self.headers,
                        params=params,
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("status") == "OK" and data.get("data"):
                            # 地区名の重複を除去してリスト化
                            for item in data["data"]:
                                # 市区町村コードが指定されている場合はフィルタリング
                                if municipality_code and item.get("MunicipalityCode") != municipality_code:
                                    continue
                                    
                                district = item.get("DistrictName", "").strip()
                                if district:
                                    districts.add(district)
                            
                            # データが見つかったら十分な数があれば終了
                            if len(districts) > 10:
                                break
                
                # データが見つかったら終了
                if districts:
                    break
            
            # ソートして返す
            return sorted(list(districts))

        except Exception as e:
            print(f"地区名取得エラー: {e}")
            return []

    def search_land_prices(self, prefecture: str, city: Optional[str] = None,
                          district: Optional[str] = None, year: str = "2024") -> List[Dict]:
        """
        公示地価データを取得

        Args:
            prefecture: 都道府県名
            city: 市区町村名（オプション）
            district: 地区名（オプション）
            year: 対象年（デフォルト: 2024）

        Returns:
            公示地価データのリスト
        """
        # 都道府県コードを取得
        prefecture_code = self.prefecture_codes.get(prefecture)
        if not prefecture_code:
            return []

        # APIエンドポイント
        url = f"{self.base_url}/XCT001"

        # パラメータ設定
        params = {
            "year": year,
            "area": prefecture_code,
            "division": "00"  # 住宅地
        }

        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)

            if response.status_code == 200:
                data = response.json()

                if data.get("status") == "OK" and data.get("data"):
                    all_results = data["data"]

                    # フィルタリング用のリストと重複チェック用のセット
                    filtered_results = []
                    seen_addresses = set()

                    for item in all_results:
                        # 地域名と住所を取得
                        region_name = item.get("標準地番号 地域名", "")
                        address = item.get("標準地 所在地 所在地番", "")

                        # 地区名でフィルタリング
                        if district and district not in address:
                            continue

                        # 重複チェック（住所ベースで重複を除去）
                        if address in seen_addresses:
                            continue
                        seen_addresses.add(address)

                        # データを整形
                        price = int(item.get("1㎡当たりの価格", 0))

                        filtered_results.append({
                            "region": region_name,
                            "address": address,
                            "full_address": f"{prefecture}{city if city else ''}{address}",
                            "price_per_sqm": price,
                            "price_per_tsubo": int(price * 3.30578),
                            "change_rate": item.get("変動率", ""),
                            "price_time": item.get("価格時点", ""),
                            "station": item.get("標準地 交通施設の状況 交通施設", ""),
                            "station_distance": item.get("標準地 交通施設の状況 距離", ""),
                            "use_district": item.get("標準地 法令上の規制等 用途地域", ""),
                            "building_coverage": item.get("標準地 法令上の規制等 指定建蔽率", ""),
                            "floor_area_ratio": item.get("標準地 法令上の規制等 指定容積率", ""),
                            "latitude": item.get("位置座標 緯度", ""),
                            "longitude": item.get("位置座標 経度", "")
                        })

                    return filtered_results

        except Exception as e:
            print(f"公示地価データ取得エラー: {e}")

        return []

    def search_land_price_history(self, prefecture: str, city: Optional[str] = None,
                                 district: Optional[str] = None, years: List[str] = None) -> Dict[str, List[Dict]]:
        """
        複数年の公示地価データを取得して住所ごとにグループ化

        Args:
            prefecture: 都道府県名
            city: 市区町村名（オプション）
            district: 地区名（オプション）
            years: 対象年のリスト（デフォルト: 過去5年）

        Returns:
            住所をキーとした年次データの辞書
        """
        if years is None:
            # デフォルトで過去5年のデータを取得
            current_year = 2024
            years = [str(year) for year in range(current_year - 4, current_year + 1)]

        # 年次ごとのデータを収集
        all_data = {}

        for year in years:
            year_data = self.search_land_prices(prefecture, city, district, year)

            for item in year_data:
                address = item["address"]

                if address not in all_data:
                    all_data[address] = {
                        "address": address,
                        "full_address": item["full_address"],
                        "station": item["station"],
                        "station_distance": item["station_distance"],
                        "use_district": item["use_district"],
                        "yearly_prices": []
                    }

                all_data[address]["yearly_prices"].append({
                    "year": int(year),
                    "price_per_sqm": item["price_per_sqm"],
                    "price_per_tsubo": item["price_per_tsubo"],
                    "change_rate": item["change_rate"]
                })

        # 年次でソート
        for address in all_data:
            all_data[address]["yearly_prices"].sort(key=lambda x: x["year"])

        return all_data