"""
SEC-071: 入力検証とサニタイゼーション
セキュアな入力処理のためのバリデーター集
"""

import re
import logging
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


class InputValidator:
    """入力値検証クラス"""
    
    # 危険な文字パターン
    DANGEROUS_PATTERNS = [
        r'<script[^>]*>.*?</script>',  # スクリプトタグ
        r'javascript:',                 # JavaScriptプロトコル
        r'on\w+\s*=',                  # イベントハンドラ
        r'<iframe[^>]*>',              # iframeタグ
        r'<object[^>]*>',              # objectタグ
        r'<embed[^>]*>',               # embedタグ
        r'<link[^>]*>',                # linkタグ（CSS injection）
        r'<meta[^>]*>',                # metaタグ
        r'expression\s*\(',            # CSS expression
        r'import\s+',                  # ES6 import
        r'require\s*\(',               # CommonJS require
    ]
    
    # SQLインジェクションパターン
    SQL_PATTERNS = [
        r"'\s*(or|and)\s*'?\d*\s*=\s*'?\d*",     # ' or '1'='1
        r"'\s*or\s*'1'\s*=\s*'1",                 # ' or '1'='1 (simple version)
        r'(--\s*$)',                              # SQL comment
        r'(;\s*drop\s+)',                         # ; drop
        r'(;\s*delete\s+)',                       # ; delete
        r'(;\s*update\s+)',                       # ; update
        r'(;\s*insert\s+)',                       # ; insert
        r'union\s+select',                        # union select
        r'select\s+.*\s+from',                    # select from
    ]
    
    @classmethod
    def sanitize_string(cls, value: str, field_name: str = "input") -> str:
        """
        文字列のサニタイゼーション
        
        Args:
            value: 検証する値
            field_name: フィールド名（エラーメッセージ用）
            
        Returns:
            サニタイズされた文字列
            
        Raises:
            HTTPException: 危険なパターンが検出された場合
        """
        if not isinstance(value, str):
            return value
        
        # 空文字列は許可
        if not value:
            return value
        
        # 最大長チェック（DoS対策）
        if len(value) > 10000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name}が長すぎます（最大10000文字）"
            )
        
        # 危険なパターンチェック
        value_lower = value.lower()
        
        # XSS攻撃パターン
        for pattern in cls.DANGEROUS_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE | re.DOTALL):
                logger.warning(
                    f"Dangerous pattern detected in {field_name}: {pattern}"
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{field_name}に不正な文字が含まれています"
                )
        
        # SQLインジェクションパターン
        for pattern in cls.SQL_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE):
                logger.warning(
                    f"SQL injection pattern detected in {field_name}: {pattern}"
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{field_name}に不正な文字が含まれています"
                )
        
        # 基本的なサニタイゼーション
        # HTMLエンティティのエスケープ
        value = value.replace('&', '&amp;')
        value = value.replace('<', '&lt;')
        value = value.replace('>', '&gt;')
        value = value.replace('"', '&quot;')
        value = value.replace("'", '&#x27;')
        
        # 制御文字の除去
        value = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', value)
        
        return value.strip()
    
    @classmethod
    def validate_numeric(cls, value: Any, field_name: str,
                        min_value: Optional[float] = None,
                        max_value: Optional[float] = None) -> float:
        """
        数値の検証
        
        Args:
            value: 検証する値
            field_name: フィールド名
            min_value: 最小値
            max_value: 最大値
            
        Returns:
            検証済みの数値
            
        Raises:
            HTTPException: 検証エラー
        """
        try:
            num_value = float(value)
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name}は数値である必要があります"
            )
        
        # NaN, Infinity チェック
        if not (-1e308 < num_value < 1e308):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name}の値が無効です"
            )
        
        # 範囲チェック
        if min_value is not None and num_value < min_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name}は{min_value}以上である必要があります"
            )
        
        if max_value is not None and num_value > max_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name}は{max_value}以下である必要があります"
            )
        
        return num_value
    
    @classmethod
    def validate_property_data(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        物件データの完全な検証とサニタイゼーション
        
        Args:
            data: 物件データ
            
        Returns:
            検証・サニタイズ済みのデータ
        """
        validated = {}
        
        # 文字列フィールドのサニタイゼーション
        string_fields = [
            'property_name', 'location', 'property_type',
            'property_status', 'building_structure', 'memo', 'property_url'
        ]
        
        for field in string_fields:
            if field in data:
                validated[field] = cls.sanitize_string(
                    str(data[field]), field
                )
        
        # 数値フィールドの検証
        numeric_validations = {
            'purchase_price': (0, 1000000),      # 0〜100億円
            'market_value': (0, 1000000),        # 0〜100億円
            'expected_sale_price': (0, 1000000), # 0〜100億円
            'monthly_rent': (0, 10000),          # 0〜1億円
            'land_area': (0, 100000),            # 0〜10万㎡
            'building_area': (0, 100000),        # 0〜10万㎡
            'road_price': (0, 10000000),         # 0〜1000万円/㎡
            'building_price': (0, 1000000),      # 0〜100億円
            'management_fee': (0, 1000),         # 0〜1億円
            'fixed_cost': (0, 1000),             # 0〜1億円
            'property_tax': (0, 10000),          # 0〜100億円
            'loan_amount': (0, 1000000),         # 0〜100億円
            'initial_cost': (0, 10000),          # 0〜100億円
            'renovation_cost': (0, 10000),       # 0〜100億円
        }
        
        for field, (min_val, max_val) in numeric_validations.items():
            if field in data:
                validated[field] = cls.validate_numeric(
                    data[field], field, min_val, max_val
                )
        
        # パーセンテージフィールドの検証（0-100%）
        percentage_fields = [
            'vacancy_rate', 'rent_decline', 'interest_rate',
            'exit_cap_rate', 'effective_tax_rate'
        ]
        
        for field in percentage_fields:
            if field in data:
                validated[field] = cls.validate_numeric(
                    data[field], field, 0, 100
                )
        
        # 年数フィールドの検証
        year_validations = {
            'building_year': (1900, 2100),
            'depreciation_years': (1, 100),
            'loan_years': (1, 50),
            'holding_years': (1, 50)
        }
        
        for field, (min_val, max_val) in year_validations.items():
            if field in data:
                validated[field] = int(cls.validate_numeric(
                    data[field], field, min_val, max_val
                ))
        
        # 論理検証
        if 'loan_amount' in validated and 'purchase_price' in validated:
            if validated['loan_amount'] > validated['purchase_price']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="借入金額は購入価格を超えることはできません"
                )
        
        # 必須フィールドチェック
        required_fields = [
            'purchase_price', 'monthly_rent', 'land_area', 'building_area'
        ]
        
        for field in required_fields:
            if field not in validated:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{field}は必須項目です"
                )
        
        return validated
    
    @classmethod
    def validate_list(cls, items: List[Any], field_name: str,
                     max_items: int = 100) -> List[Any]:
        """
        リストの検証
        
        Args:
            items: リスト
            field_name: フィールド名
            max_items: 最大アイテム数
            
        Returns:
            検証済みリスト
        """
        if not isinstance(items, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name}はリストである必要があります"
            )
        
        if len(items) > max_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name}の最大アイテム数は{max_items}です"
            )
        
        return items