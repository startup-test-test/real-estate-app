"""
SEC-071: 追加のPydanticモデル定義
リクエスト検証の強化とセキュリティ向上
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime


class BaseRequestModel(BaseModel):
    """基本リクエストモデル"""
    
    model_config = ConfigDict(
        # 余分なフィールドを禁止（セキュリティ向上）
        extra='forbid',
        # 文字列の前後の空白を自動削除
        str_strip_whitespace=True,
        # 大きすぎる入力を防ぐ
        str_max_length=10000
    )


class SimulationRequestModelV2(BaseRequestModel):
    """シミュレーションリクエストの改良版"""
    property_data: Dict[str, Any] = Field(..., description="物件データ")
    include_cash_flow_table: bool = Field(True, description="キャッシュフロー表を含める")
    include_market_analysis: bool = Field(False, description="市場分析を含める")
    
    @field_validator('property_data')
    @classmethod
    def validate_property_data(cls, v):
        """物件データの検証"""
        # 必須フィールドの確認
        required_fields = ['purchase_price', 'monthly_rent', 'land_area', 'building_area']
        for field in required_fields:
            if field not in v:
                raise ValueError(f'{field}は必須項目です')
        
        # データ型の検証
        numeric_fields = [
            'purchase_price', 'monthly_rent', 'land_area', 'building_area',
            'loan_amount', 'interest_rate', 'loan_years', 'holding_years'
        ]
        
        for field in numeric_fields:
            if field in v:
                try:
                    float(v[field])
                except (TypeError, ValueError):
                    raise ValueError(f'{field}は数値である必要があります')
        
        # 範囲検証
        validations = {
            'purchase_price': (0, 1000000),  # 0〜100億円
            'monthly_rent': (0, 10000),      # 0〜1億円
            'land_area': (0, 100000),        # 0〜10万㎡
            'building_area': (0, 100000),    # 0〜10万㎡
            'loan_amount': (0, 1000000),     # 0〜100億円
            'interest_rate': (0, 20),        # 0〜20%
            'loan_years': (1, 50),           # 1〜50年
            'holding_years': (1, 50)         # 1〜50年
        }
        
        for field, (min_val, max_val) in validations.items():
            if field in v:
                value = float(v[field])
                if not min_val <= value <= max_val:
                    raise ValueError(
                        f'{field}は{min_val}〜{max_val}の範囲内である必要があります'
                    )
        
        return v


class PaginationParams(BaseModel):
    """ページネーションパラメータ"""
    page: int = Field(1, ge=1, le=1000, description="ページ番号")
    page_size: int = Field(20, ge=1, le=100, description="ページサイズ")
    sort_by: Optional[str] = Field(None, max_length=50, description="ソートフィールド")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="ソート順")


class FilterParams(BaseModel):
    """フィルタリングパラメータ"""
    start_date: Optional[datetime] = Field(None, description="開始日")
    end_date: Optional[datetime] = Field(None, description="終了日")
    status: Optional[List[str]] = Field(None, max_items=10, description="ステータスフィルター")
    
    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_dates(cls, v):
        """日付の妥当性チェック"""
        if v:
            # 未来の日付を制限（必要に応じて）
            if v > datetime.now():
                raise ValueError('未来の日付は指定できません')
            # 古すぎる日付を制限
            if v.year < 2000:
                raise ValueError('2000年以降の日付を指定してください')
        return v


class SecurityHeaders(BaseModel):
    """セキュリティヘッダー設定"""
    x_content_type_options: str = Field("nosniff", description="Content-Type Options")
    x_frame_options: str = Field("DENY", description="Frame Options")
    x_xss_protection: str = Field("1; mode=block", description="XSS Protection")
    strict_transport_security: str = Field(
        "max-age=31536000; includeSubDomains",
        description="Strict Transport Security"
    )
    content_security_policy: Optional[str] = Field(
        None,
        description="Content Security Policy"
    )


class RateLimitInfo(BaseModel):
    """レート制限情報"""
    limit: int = Field(..., description="リクエスト上限")
    remaining: int = Field(..., description="残りリクエスト数")
    reset: datetime = Field(..., description="リセット時刻")
    retry_after: Optional[int] = Field(None, description="次回リトライまでの秒数")