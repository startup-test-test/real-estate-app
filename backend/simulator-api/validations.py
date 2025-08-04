"""
サーバーサイド入力値検証モジュール
Pydanticを使わないシンプルな実装
"""

import re
from typing import Dict, List, Optional, Any
from datetime import datetime


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
        'purchase_price': {'min': 1, 'max': 100000, 'unit': '万円'},
        'monthly_rent': {'min': 0, 'max': 100000000, 'unit': '円'},  # 最大1億円/月
        'management_fee': {'min': 0, 'max': 10000000, 'unit': '円'},  # 最大1000万円/月
        'property_tax': {'min': 0, 'max': 50000000, 'unit': '円'},  # 最大5000万円/年
        'down_payment_ratio': {'min': 0, 'max': 100, 'unit': '%'},
        'loan_years': {'min': 1, 'max': 50, 'unit': '年'},
        'interest_rate': {'min': 0, 'max': 20, 'unit': '%'},
        'building_area': {'min': 1, 'max': 100000, 'unit': '㎡'},
        'land_area': {'min': 0, 'max': 100000, 'unit': '㎡'},
        'year_built': {'min': 1900, 'max': datetime.now().year + 10, 'unit': '年'},
        'holding_years': {'min': 1, 'max': 50, 'unit': '年'},
        'major_repair_cost': {'min': 0, 'max': 50000, 'unit': '万円'},
        'building_price': {'min': 0, 'max': 100000, 'unit': '万円'},
        'depreciation_years': {'min': 1, 'max': 50, 'unit': '年'}
    }
    
    for field, rules in number_fields.items():
        value = data.get(field)
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
    
    for field, messages in errors.items():
        for msg in messages:
            error_messages.append(msg)
    
    return {
        "error": "入力値にエラーがあります",
        "details": error_messages,
        "status_code": 400
    }