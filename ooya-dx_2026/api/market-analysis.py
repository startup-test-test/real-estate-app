"""
市場分析エンドポイント
Vercel Python Functions用
"""

from http.server import BaseHTTPRequestHandler
import json
import os
import random
import traceback
import sys

# 共有モジュールのインポート用にパスを追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from shared.validations import validate_market_analysis_input, create_validation_error_response
from shared.error_codes import ErrorCode, create_error_response


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """市場分析実行"""
        try:
            # リクエストボディを読み取り
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            request = json.loads(post_data.decode('utf-8'))

            # 入力値のバリデーション
            validation_errors = validate_market_analysis_input(request)

            if validation_errors:
                error_response = create_validation_error_response(validation_errors)
                self._send_json_response(400, error_response)
                return

            # パラメータ取得
            location = request.get('location', '')
            land_area = request.get('land_area', 0)
            year_built = request.get('year_built', 2000)
            purchase_price = request.get('purchase_price', 0)

            # ユーザー物件の平米単価を計算
            user_unit_price = purchase_price * 10000 / land_area / 10000 if land_area > 0 else 0

            # サンプルデータを生成（実際のAPIは後で実装）
            similar_properties = []
            for _ in range(15):
                unit_price = user_unit_price * (1 + random.uniform(-0.3, 0.3))
                area = land_area * (1 + random.uniform(-0.3, 0.3))

                similar_properties.append({
                    '取引時期': f"2024年Q{random.randint(1, 4)}",
                    '所在地': f"{location[:6] if location else '東京都'}***",
                    '面積(㎡)': round(area, 1),
                    '築年': year_built + random.randint(-10, 10),
                    '構造': random.choice(['木造', '鉄骨造', 'RC']),
                    '取引価格(万円)': round(area * unit_price),
                    '平米単価(万円/㎡)': round(unit_price, 2),
                    '最寄駅': '品川',
                    '駅距離': f"{random.randint(5, 15)}分"
                })

            # 統計を計算
            prices = [prop['平米単価(万円/㎡)'] for prop in similar_properties]
            prices.sort()
            n = len(prices)
            median_price = prices[n//2] if n % 2 == 1 else (prices[n//2-1] + prices[n//2]) / 2
            mean_price = sum(prices) / len(prices)
            variance = sum((x - mean_price) ** 2 for x in prices) / len(prices)
            std_price = variance ** 0.5

            # 価格評価
            deviation = ((user_unit_price - median_price) / median_price * 100) if median_price > 0 else 0

            if deviation < -20:
                evaluation = ""
            elif deviation < -10:
                evaluation = ""
            elif deviation < 5:
                evaluation = ""
            elif deviation < 15:
                evaluation = ""
            else:
                evaluation = ""

            result = {
                "similar_properties": similar_properties,
                "statistics": {
                    "median_price": round(median_price, 2),
                    "mean_price": round(mean_price, 2),
                    "std_price": round(std_price, 2),
                    "user_price": round(user_unit_price, 2),
                    "deviation": round(deviation, 1),
                    "evaluation": evaluation
                }
            }

            self._send_json_response(200, result)

        except json.JSONDecodeError:
            error_response = create_error_response(
                ErrorCode.VALIDATION_INVALID_FORMAT,
                status_code=400,
                detail="Invalid JSON format"
            )
            self._send_json_response(400, error_response)

        except Exception as e:
            is_dev = os.getenv("ENV") == "development"
            if is_dev:
                print(f"Error: {str(e)}")
                print(traceback.format_exc())

            error_response = create_error_response(
                ErrorCode.SYSTEM_GENERAL,
                status_code=500,
                detail="市場分析の実行中にエラーが発生しました"
            )
            self._send_json_response(500, error_response)

    def do_OPTIONS(self):
        """CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def _send_json_response(self, status_code: int, data: dict):
        """JSON レスポンスを送信"""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
