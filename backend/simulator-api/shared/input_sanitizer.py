"""
SEC-075: 入力サニタイゼーションモジュール
辞書型データの厳密な検証とサニタイズ
"""

import re
import unicodedata
from typing import Dict, Any, Union, List, Optional, Tuple
from decimal import Decimal, InvalidOperation
import logging

logger = logging.getLogger(__name__)

# 許可する文字パターン
ALLOWED_PROPERTY_NAME_PATTERN = re.compile(r'^[\w\s\-_\.,\(\)（）0-9０-９ぁ-んァ-ヶー一-龥]+$')
ALLOWED_LOCATION_PATTERN = re.compile(r'^[\w\s\-_\.,\(\)（）0-9０-９ぁ-んァ-ヶー一-龥]+$')

# 数値フィールドの制限値
NUMERIC_LIMITS = {
    'monthly_rent': (0, 10_000_000),      # 0円〜1000万円/月
    'vacancy_rate': (0, 100),             # 0%〜100%
    'management_fee': (0, 1_000_000),     # 0円〜100万円
    'fixed_cost': (0, 1_000_000),         # 0円〜100万円
    'property_tax': (0, 100_000_000),     # 0円〜1億円
    'purchase_price': (1, 10_000_000_000), # 1円〜100億円
    'loan_amount': (0, 10_000_000_000),   # 0円〜100億円
    'other_costs': (0, 100_000_000),      # 0円〜1億円
    'renovation_cost': (0, 1_000_000_000), # 0円〜10億円
    'interest_rate': (0, 50),             # 0%〜50%
    'loan_years': (1, 100),               # 1年〜100年
    'holding_years': (1, 100),            # 1年〜100年
    'exit_cap_rate': (0, 50),             # 0%〜50%
    'effective_tax_rate': (0, 100),       # 0%〜100%
    'building_price': (0, 10_000_000_000), # 0円〜100億円
    'depreciation_years': (1, 100),       # 1年〜100年
    'land_area': (0, 1_000_000),          # 0㎡〜100万㎡
    'building_area': (0, 100_000),        # 0㎡〜10万㎡
    'road_price': (0, 100_000_000),       # 0円〜1億円/㎡
    'rent_decline': (0, 50),              # 0%〜50%
    'year_built': (1900, 2100),           # 1900年〜2100年
}

# 文字列フィールドの最大長
STRING_MAX_LENGTHS = {
    'property_name': 200,
    'location': 200,
    'property_type': 50,
    'loan_type': 50,
    'building_structure': 50,
    'structure_type': 50,
}


class InputSanitizationError(ValueError):
    """入力サニタイゼーションエラー"""
    pass


def sanitize_numeric_value(value: Any, field_name: str, 
                         min_val: Optional[float] = None, 
                         max_val: Optional[float] = None) -> float:
    """
    数値をサニタイズして安全な値を返す
    
    Args:
        value: 検証する値
        field_name: フィールド名（エラーメッセージ用）
        min_val: 最小値
        max_val: 最大値
        
    Returns:
        float: サニタイズされた数値
        
    Raises:
        InputSanitizationError: 無効な値の場合
    """
    # Noneまたは空文字の場合
    if value is None or value == '':
        return 0.0
    
    # 文字列の場合は前処理
    if isinstance(value, str):
        # 危険な文字を除去
        value = value.strip()
        # カンマを除去
        value = value.replace(',', '')
        # 全角数字を半角に変換
        value = unicodedata.normalize('NFKC', value)
    
    try:
        # Decimalを使用して精度を保持
        decimal_value = Decimal(str(value))
        
        # 特殊値チェック
        if decimal_value.is_nan() or decimal_value.is_infinite():
            raise InputSanitizationError(f"{field_name}: 無効な数値です")
        
        # float変換
        float_value = float(decimal_value)
        
        # 範囲チェック
        if min_val is not None and float_value < min_val:
            logger.warning(f"{field_name}: 値 {float_value} が最小値 {min_val} 未満です")
            float_value = min_val
        if max_val is not None and float_value > max_val:
            logger.warning(f"{field_name}: 値 {float_value} が最大値 {max_val} を超えています")
            float_value = max_val
        
        return float_value
        
    except (InvalidOperation, ValueError, TypeError) as e:
        logger.error(f"{field_name}: 数値変換エラー - {value} ({type(value)}): {e}")
        raise InputSanitizationError(f"{field_name}: 有効な数値を入力してください")


def sanitize_string_value(value: Any, field_name: str, 
                         max_length: Optional[int] = None,
                         allowed_pattern: Optional[re.Pattern] = None) -> str:
    """
    文字列をサニタイズして安全な値を返す
    
    Args:
        value: 検証する値
        field_name: フィールド名（エラーメッセージ用）
        max_length: 最大文字数
        allowed_pattern: 許可する文字パターン
        
    Returns:
        str: サニタイズされた文字列
    """
    # 文字列に変換
    if value is None:
        return ''
    
    str_value = str(value)
    
    # 制御文字を除去
    str_value = ''.join(char for char in str_value if not unicodedata.category(char).startswith('C'))
    
    # HTMLタグを除去
    str_value = re.sub(r'<[^>]+>', '', str_value)
    
    # スクリプト関連の文字列を除去
    dangerous_patterns = [
        r'javascript:', r'vbscript:', r'onload=', r'onerror=', r'onclick=',
        r'<script', r'</script', r'eval\(', r'expression\(', r'alert\('
    ]
    for pattern in dangerous_patterns:
        str_value = re.sub(pattern, '', str_value, flags=re.IGNORECASE)
    
    # SQLインジェクション対策
    sql_keywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'UNION', 'SELECT', 'TABLE']
    for keyword in sql_keywords:
        if keyword in str_value.upper():
            logger.warning(f"{field_name}: SQLキーワード '{keyword}' を検出しました")
            # 大文字小文字両方を削除
            str_value = re.sub(keyword, '', str_value, flags=re.IGNORECASE)
    
    # 許可パターンチェック
    if allowed_pattern and not allowed_pattern.match(str_value):
        # 許可されない文字を除去
        if field_name in ['property_name', 'location']:
            # 日本語対応のため、より寛容な処理
            str_value = re.sub(r'[^\w\s\-_\.,\(\)（）0-9０-９ぁ-んァ-ヶー一-龥]', '', str_value)
        else:
            # 英数字と基本的な記号のみ
            str_value = re.sub(r'[^a-zA-Z0-9\s\-_\.,]', '', str_value)
    
    # 前後の空白を除去
    str_value = str_value.strip()
    
    # 最大長チェック
    if max_length and len(str_value) > max_length:
        str_value = str_value[:max_length]
    
    return str_value


def sanitize_calculation_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    計算用入力データを包括的にサニタイズ
    
    Args:
        data: 入力データ辞書
        
    Returns:
        Dict[str, Any]: サニタイズされたデータ
        
    Raises:
        InputSanitizationError: 致命的な検証エラーの場合
    """
    sanitized = {}
    errors = []
    
    # 数値フィールドのサニタイズ
    for field, (min_val, max_val) in NUMERIC_LIMITS.items():
        if field in data:
            try:
                # 単位変換が必要なフィールド
                if field in ['purchase_price', 'loan_amount', 'building_price']:
                    # 万円単位で入力されることを想定
                    raw_value = sanitize_numeric_value(data[field], field, min_val/10000, max_val/10000)
                    sanitized[field] = raw_value  # 万円単位のまま保持
                else:
                    sanitized[field] = sanitize_numeric_value(data[field], field, min_val, max_val)
            except InputSanitizationError as e:
                errors.append(str(e))
                # デフォルト値を設定
                sanitized[field] = min_val if min_val > 0 else 0
    
    # 文字列フィールドのサニタイズ
    string_validations = {
        'property_name': ALLOWED_PROPERTY_NAME_PATTERN,
        'location': ALLOWED_LOCATION_PATTERN,
        'property_type': None,
        'loan_type': None,
        'building_structure': None,
        'structure_type': None,
    }
    
    for field, pattern in string_validations.items():
        if field in data:
            max_length = STRING_MAX_LENGTHS.get(field, 200)
            sanitized[field] = sanitize_string_value(
                data[field], field, max_length, pattern
            )
    
    # 特殊な検証
    # ローン額が購入価格を超えないようにする
    if 'loan_amount' in sanitized and 'purchase_price' in sanitized:
        if sanitized['loan_amount'] > sanitized['purchase_price']:
            logger.warning("ローン額が購入価格を超えています")
            sanitized['loan_amount'] = sanitized['purchase_price']
    
    # 保有年数がローン年数を超えないようにする
    if 'holding_years' in sanitized and 'loan_years' in sanitized:
        if sanitized['holding_years'] > sanitized['loan_years']:
            logger.warning("保有年数がローン年数を超えています")
            # この場合は警告のみで、値は変更しない（繰り上げ返済のケースがあるため）
    
    # デフォルト値の設定
    defaults = {
        'loan_type': '元利均等',
        'property_type': '不明',
        'vacancy_rate': 5.0,
        'management_fee': 5.0,
        'effective_tax_rate': 30.0,
    }
    
    for field, default_value in defaults.items():
        if field not in sanitized:
            sanitized[field] = default_value
    
    # エラーがある場合はログに記録
    if errors:
        logger.warning(f"入力サニタイゼーションで {len(errors)} 件のエラー: {errors}")
    
    return sanitized


def validate_calculation_safety(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    計算の安全性を検証（DoS攻撃防止）
    
    Args:
        data: サニタイズ済みデータ
        
    Returns:
        Tuple[bool, Optional[str]]: (安全かどうか, エラーメッセージ)
    """
    # 極端な値の組み合わせチェック
    loan_years = data.get('loan_years', 0)
    interest_rate = data.get('interest_rate', 0)
    
    # 複利計算の爆発を防ぐ
    if loan_years > 50 and interest_rate > 10:
        return False, "長期間かつ高金利の組み合わせは計算できません"
    
    # メモリ消費攻撃を防ぐ
    if loan_years > 100:
        return False, "ローン期間が長すぎます"
    
    # 0除算を防ぐ（購入価格が必須の計算の場合のみチェック）
    if 'purchase_price' in data and data.get('purchase_price', 0) == 0:
        return False, "購入価格は0より大きい値を入力してください"
    
    return True, None


# エクスポート用の統合関数
def sanitize_and_validate_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    入力データのサニタイズと検証を実行
    
    Args:
        data: 生の入力データ
        
    Returns:
        Dict[str, Any]: サニタイズ・検証済みデータ
        
    Raises:
        InputSanitizationError: 検証エラーの場合
    """
    # サニタイズ実行
    sanitized_data = sanitize_calculation_input(data)
    
    # 安全性検証
    is_safe, error_msg = validate_calculation_safety(sanitized_data)
    if not is_safe:
        raise InputSanitizationError(error_msg)
    
    return sanitized_data