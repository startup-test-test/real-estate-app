"""
シミュレーションエンドポイント
Vercel Python Functions用
"""

from http.server import BaseHTTPRequestHandler
import json
import os
import traceback
import sys

# 共有モジュールのインポート用にパスを追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from shared.calculations import run_full_simulation
from shared.validations import validate_simulator_input, create_validation_error_response
from shared.error_codes import ErrorCode, SimulatorError, create_error_response


# キャメルケースからスネークケースへの変換マッピング
CAMEL_TO_SNAKE_MAPPING = {
    'propertyTax': 'property_tax',
    'fixedCost': 'fixed_cost',
    'managementFee': 'management_fee',
    'renovationCost': 'renovation_cost',
    'monthlyRent': 'monthly_rent',
    'purchasePrice': 'purchase_price',
    'loanAmount': 'loan_amount',
    'interestRate': 'interest_rate',
    'loanYears': 'loan_years',
    'loanType': 'loan_type',
    'otherCosts': 'other_costs',
    'vacancyRate': 'vacancy_rate',
    'buildingPrice': 'building_price',
    'depreciationYears': 'depreciation_years',
    'effectiveTaxRate': 'effective_tax_rate',
    'holdingYears': 'holding_years',
    'expectedSalePrice': 'expected_sale_price',
    'buildingPriceForDepreciation': 'building_price',
    'exitCapRate': 'exit_cap_rate',
    'priceDeclineRate': 'price_decline_rate',
    'rentDecline': 'rent_decline',
    'majorRepairCycle': 'major_repair_cycle',
    'majorRepairCost': 'major_repair_cost',
    'landArea': 'land_area',
    'roadPrice': 'road_price',
    'buildingArea': 'building_area',
    'yearBuilt': 'year_built',
    'propertyType': 'property_type',
    'marketValue': 'market_value',
    'propertyName': 'property_name',
    'propertyUrl': 'property_url',
    'propertyMemo': 'property_memo',
    'ownershipType': 'ownership_type',
    'propertyImageBase64': 'property_image_base64'
}


def convert_camel_to_snake(data: dict) -> dict:
    """キャメルケースからスネークケースへの変換"""
    for camel_key, snake_key in CAMEL_TO_SNAKE_MAPPING.items():
        if camel_key in data:
            data[snake_key] = data.get(camel_key)
    return data


def normalize_empty_values(data: dict) -> dict:
    """空文字列やNoneを数値フィールドの場合は0に変換"""
    numeric_fields = [
        'purchase_price', 'monthly_rent', 'loan_amount', 'loan_years',
        'interest_rate', 'holding_years', 'building_area',
        'management_fee', 'fixed_cost', 'property_tax',
        'other_costs', 'renovation_cost', 'down_payment_ratio',
        'vacancy_rate', 'effective_tax_rate', 'land_area',
        'road_price', 'year_built', 'expected_sale_price',
        'market_value', 'exit_cap_rate', 'price_decline_rate',
        'rent_decline', 'major_repair_cycle', 'major_repair_cost',
        'building_price', 'depreciation_years'
    ]

    for field in numeric_fields:
        if field in data:
            value = data[field]
            if value == "" or value is None or (isinstance(value, str) and value.strip() == ""):
                data[field] = 0

    return data


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """シミュレーション実行"""
        try:
            # リクエストボディを読み取り
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            property_data = json.loads(post_data.decode('utf-8'))

            # キャメルケースからスネークケースへの変換
            property_data = convert_camel_to_snake(property_data)

            # 入力値のバリデーション
            validation_errors = validate_simulator_input(property_data)

            if validation_errors:
                error_response = create_validation_error_response(validation_errors)
                self._send_json_response(400, error_response)
                return

            # 空文字列を0に変換
            property_data = normalize_empty_values(property_data)

            # シミュレーション実行
            result = run_full_simulation(property_data)
            self._send_json_response(200, result)

        except SimulatorError as e:
            self._send_json_response(500, e.to_dict())

        except ZeroDivisionError:
            error_response = create_error_response(
                ErrorCode.CALC_DIVISION_BY_ZERO,
                status_code=500
            )
            self._send_json_response(500, error_response)

        except OverflowError:
            error_response = create_error_response(
                ErrorCode.CALC_OVERFLOW,
                status_code=500
            )
            self._send_json_response(500, error_response)

        except ValueError as e:
            error_response = create_error_response(
                ErrorCode.CALC_INVALID_PARAMETER,
                status_code=500,
                detail=str(e)
            )
            self._send_json_response(500, error_response)

        except json.JSONDecodeError:
            error_response = create_error_response(
                ErrorCode.VALIDATION_INVALID_FORMAT,
                status_code=400,
                detail="Invalid JSON format"
            )
            self._send_json_response(400, error_response)

        except Exception as e:
            print(f"[ERROR] Simulation error: {str(e)}")
            print(f"[ERROR] Error type: {type(e).__name__}")
            print(f"[ERROR] Stack trace:\n{traceback.format_exc()}")

            error_detail = f"{type(e).__name__}: {str(e)}"
            is_dev = os.getenv("ENV") == "development"

            error_response = create_error_response(
                ErrorCode.SYSTEM_GENERAL,
                status_code=500,
                detail=error_detail if is_dev else "予期しないエラーが発生しました"
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
