"""
サーバーサイド入力値検証モジュール
Pydanticを使わないシンプルな実装
"""

import re
from typing import Dict, List, Optional, Any
from datetime import datetime
from error_codes import ErrorCode


def validate_number_range(
    value: Any,
    min_val: float,
    max_val: float,
    field_name: str
) -> Optional[str]:
    """数値の範囲チェック"""
    try:
        num = float(value)
        if num < min_val:
            return f"{field_name}は{min_val}以上で入力してください"
        if num > max_val:
            return f"{field_name}は{max_val}以下で入力してください"
        return None
    except (ValueError, TypeError):
        return f"{field_name}は数値で入力してください"


def validate_string_length(
    value: Any,
    max_length: int,
    field_name: str,
    required: bool = False
) -> Optional[str]:
    """文字列長のチェック"""
    if value is None or value == "":
        if required:
            return f"{field_name}は必須項目です"
        return None
    
    if not isinstance(value, str):
        return f"{field_name}は文字列で入力してください"
    
    if len(value) > max_length:
        return f"{field_name}は{max_length}文字以下で入力してください"
    
    return None


def detect_html_tags(value: str) -> bool:
    """HTMLタグの検出"""
    if not isinstance(value, str):
        return False
    html_pattern = re.compile(r'<[a-zA-Z][^>]*>|<\/[a-zA-Z][^>]*>')
    return bool(html_pattern.search(value))


def validate_url(value: str) -> Optional[str]:
    """URLの安全性チェック"""
    if not value:
        return None
    
    dangerous_protocols = ['javascript:', 'data:', 'vbscript:', 'file:']
    url_lower = value.lower()
    
    for protocol in dangerous_protocols:
        if url_lower.startswith(protocol):
            return "許可されていないプロトコルです"
    
    return None


def validate_image_base64(value: str) -> Optional[str]:
    """Base64画像の検証"""
    if not value:
        return None
    
    if not value.startswith('data:image/'):
        return "画像データの形式が正しくありません"
    
    allowed_formats = ['data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/gif', 'data:image/webp']
    if not any(value.lower().startswith(fmt) for fmt in allowed_formats):
        return "許可されていない画像形式です"
    
    # サイズチェック（5MB以下）
    if len(value) > 6700000:
        return "画像サイズが大きすぎます（5MB以下にしてください）"
    
    return None


def validate_simulator_input(data: Dict[str, Any]) -> Dict[str, List[str]]:
    """シミュレーター入力値の検証"""
    errors = {}
    
    
    # 文字列フィールドの検証
    string_fields = {
        'property_name': {'max_length': 100, 'required': True},
        'location': {'max_length': 200, 'required': True},
        'property_url': {'max_length': 500, 'required': False},
        'property_memo': {'max_length': 1000, 'required': False}
    }
    
    for field, rules in string_fields.items():
        value = data.get(field)
        
        # 文字列長チェック
        error = validate_string_length(
            value, 
            rules['max_length'], 
            field,
            rules['required']
        )
        if error:
            if field not in errors:
                errors[field] = []
            errors[field].append(error)
            continue
        
        # HTMLタグチェック
        if value and detect_html_tags(str(value)):
            if field not in errors:
                errors[field] = []
            errors[field].append(f"{field}にHTMLタグは使用できません")
        
        # URL検証
        if field == 'property_url' and value:
            url_error = validate_url(str(value))
            if url_error:
                if field not in errors:
                    errors[field] = []
                errors[field].append(url_error)
    
    # 数値フィールドの検証
    number_fields = {
        # 必須フィールド
        'purchase_price': {'min': 1, 'max': 100000, 'unit': '万円', 'required': True},
        'monthly_rent': {'min': 0, 'max': 100000000, 'unit': '円', 'required': True},
        'loan_amount': {'min': 0, 'max': 100000, 'unit': '万円', 'required': True},
        'loan_years': {'min': 1, 'max': 50, 'unit': '年', 'required': True},
        'interest_rate': {'min': 0, 'max': 20, 'unit': '%', 'required': True},
        'holding_years': {'min': 1, 'max': 50, 'unit': '年', 'required': True},
        'building_area': {'min': 1, 'max': 100000, 'unit': '㎡', 'required': True},
        # 任意フィールド
        'management_fee': {'min': 0, 'max': 10000000, 'unit': '円', 'required': False},
        'fixed_cost': {'min': 0, 'max': 10000000, 'unit': '円', 'required': False},
        'property_tax': {'min': 0, 'max': 50000000, 'unit': '円', 'required': False},
        'other_costs': {'min': 0, 'max': 50000, 'unit': '万円', 'required': False},
        'renovation_cost': {'min': 0, 'max': 50000, 'unit': '万円', 'required': False},
        'down_payment_ratio': {'min': 0, 'max': 100, 'unit': '%', 'required': False},
        'vacancy_rate': {'min': 0, 'max': 100, 'unit': '%', 'required': False},
        'effective_tax_rate': {'min': 0, 'max': 100, 'unit': '%', 'required': False},
        'land_area': {'min': 0, 'max': 100000, 'unit': '㎡', 'required': False},
        'road_price': {'min': 0, 'max': 100000000, 'unit': '円/㎡', 'required': False},
        'year_built': {'min': 1900, 'max': datetime.now().year + 10, 'unit': '年', 'required': False},
        'expected_sale_price': {'min': 0, 'max': 100000, 'unit': '万円', 'required': False},
        'market_value': {'min': 0, 'max': 100000, 'unit': '万円', 'required': False},
        'exit_cap_rate': {'min': 0, 'max': 100, 'unit': '%', 'required': False},
        'price_decline_rate': {'min': 0, 'max': 100, 'unit': '%', 'required': False},
        'rent_decline': {'min': 0, 'max': 100, 'unit': '%/年', 'required': False},
        'major_repair_cycle': {'min': 0, 'max': 50, 'unit': '年', 'required': False},
        'major_repair_cost': {'min': 0, 'max': 50000, 'unit': '万円', 'required': False},
        'building_price': {'min': 0, 'max': 100000, 'unit': '万円', 'required': False},
        'depreciation_years': {'min': 1, 'max': 50, 'unit': '年', 'required': False}
    }

    for field, rules in number_fields.items():
        value = data.get(field)

        # 必須チェック
        if rules.get('required', False):
            if value is None or value == "":
                if field not in errors:
                    errors[field] = []
                errors[field].append(f"{field}（{rules['unit']}）は必須項目です")
                continue

        # 値が入力されている場合のみ範囲チェック
        if value is not None and value != "":
            error = validate_number_range(
                value,
                rules['min'],
                rules['max'],
                f"{field}（{rules['unit']}）"
            )
            if error:
                if field not in errors:
                    errors[field] = []
                errors[field].append(error)
    
    # 選択式フィールドの検証
    # 借入形式
    if 'loan_type' in data and data['loan_type']:
        allowed_loan_types = ['元利均等', '元金均等']
        if data['loan_type'] not in allowed_loan_types:
            errors['loan_type'] = [f"借入形式は{allowed_loan_types}のいずれかを選択してください"]

    # 建物構造
    if 'property_type' in data and data['property_type']:
        allowed_property_types = ['木造', '軽量鉄骨造', '重量鉄骨造', 'RC造', 'SRC造']
        if data['property_type'] not in allowed_property_types:
            errors['property_type'] = [f"建物構造は{allowed_property_types}のいずれかを選択してください"]

    # 所有形態
    if 'ownership_type' in data and data['ownership_type']:
        allowed_ownership_types = ['個人', '法人']
        if data['ownership_type'] not in allowed_ownership_types:
            errors['ownership_type'] = [f"所有形態は{allowed_ownership_types}のいずれかを選択してください"]

    # 画像の検証
    if 'property_image_base64' in data and data['property_image_base64']:
        image_error = validate_image_base64(data['property_image_base64'])
        if image_error:
            errors['property_image_base64'] = [image_error]

    return errors


def validate_market_analysis_input(data: Dict[str, Any]) -> Dict[str, List[str]]:
    """市場分析入力値の検証"""
    errors = {}
    
    # 必須フィールドのチェック
    required_fields = ['location', 'land_area', 'year_built', 'purchase_price']
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == "":
            errors[field] = [f"{field}は必須項目です"]
    
    # locationの検証
    if 'location' in data and data['location']:
        error = validate_string_length(data['location'], 200, 'location', True)
        if error:
            errors['location'] = [error]
        elif detect_html_tags(str(data['location'])):
            errors['location'] = ["所在地にHTMLタグは使用できません"]
    
    # 数値フィールドの検証
    if 'land_area' in data and data['land_area'] is not None:
        error = validate_number_range(data['land_area'], 0, 100000, '土地面積（㎡）')
        if error:
            errors['land_area'] = [error]
    
    if 'year_built' in data and data['year_built'] is not None:
        error = validate_number_range(data['year_built'], 1900, datetime.now().year + 10, '築年')
        if error:
            errors['year_built'] = [error]
    
    if 'purchase_price' in data and data['purchase_price'] is not None:
        error = validate_number_range(data['purchase_price'], 1, 100000, '購入価格（万円）')
        if error:
            errors['purchase_price'] = [error]
    
    return errors


def create_validation_error_response(errors: Dict[str, List[str]]) -> dict:
    """バリデーションエラーレスポンスの統一フォーマット"""
    error_messages = []
    error_details = []
    
    for field, messages in errors.items():
        for msg in messages:
            error_messages.append(msg)
            # エラーコードを判定
            if "必須" in msg:
                error_code = ErrorCode.VALIDATION_REQUIRED_FIELD
            elif "範囲" in msg or "以上" in msg or "以下" in msg:
                error_code = ErrorCode.VALIDATION_INVALID_RANGE
            elif "HTML" in msg:
                error_code = ErrorCode.VALIDATION_HTML_DETECTED
            elif "URL" in msg:
                error_code = ErrorCode.VALIDATION_URL_INVALID
            elif "文字" in msg:
                error_code = ErrorCode.VALIDATION_STRING_TOO_LONG
            elif "画像" in msg:
                error_code = ErrorCode.VALIDATION_IMAGE_TOO_LARGE
            else:
                error_code = ErrorCode.VALIDATION_INVALID_FORMAT
            
            error_details.append({
                "field": field,
                "message": msg,
                "error_code": error_code.value
            })
    
    # 最初のエラーコードをメインコードとして使用
    main_error_code = error_details[0]["error_code"] if error_details else ErrorCode.VALIDATION_INVALID_FORMAT.value
    
    return {
        "error": "入力値にエラーがあります",
        "error_code": main_error_code,
        "details": error_messages,
        "error_details": error_details,
        "status_code": 400
    }