"""
SEC-075: 入力サニタイゼーションの不備対策
Pydanticモデルによる厳密な入力検証
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from datetime import datetime


class PropertyInputModel(BaseModel):
    """物件シミュレーション入力データのバリデーションモデル"""
    
    # 基本情報
    property_name: str = Field(..., min_length=1, max_length=200, description="物件名")
    location: str = Field(..., min_length=1, max_length=200, description="物件所在地")
    property_type: Literal["apartment", "house", "commercial", "other"] = Field(
        "apartment", description="物件タイプ"
    )
    property_status: Literal["new", "existing", "planning"] = Field(
        "existing", description="物件ステータス"
    )
    
    # 物件価格情報（万円単位）
    purchase_price: float = Field(..., ge=0, le=1000000, description="購入価格（万円）")
    market_value: Optional[float] = Field(None, ge=0, le=1000000, description="市場価格（万円）")
    expected_sale_price: Optional[float] = Field(None, ge=0, le=1000000, description="想定売却価格（万円）")
    
    # 物件詳細
    land_area: float = Field(..., ge=0, le=100000, description="土地面積（㎡）")
    building_area: float = Field(..., ge=0, le=100000, description="建物面積（㎡）")
    road_price: float = Field(0, ge=0, le=10000000, description="路線価（円/㎡）")
    building_price: float = Field(0, ge=0, le=1000000, description="建物価格（万円）")
    
    # 築年数・構造
    building_year: Optional[int] = Field(None, ge=1900, le=2100, description="建築年")
    building_structure: Literal["wood", "steel", "rc", "src", "other"] = Field(
        "wood", description="建物構造"
    )
    depreciation_years: int = Field(22, ge=1, le=100, description="減価償却年数")
    
    # 賃料・空室率
    monthly_rent: float = Field(..., ge=0, le=10000, description="月額賃料（万円）")
    vacancy_rate: float = Field(10, ge=0, le=100, description="空室率（%）")
    rent_decline: float = Field(1, ge=0, le=50, description="年間家賃下落率（%）")
    
    # 運営費用（月額・万円）
    management_fee: float = Field(0, ge=0, le=1000, description="管理費（月額・万円）")
    fixed_cost: float = Field(0, ge=0, le=1000, description="固定費（月額・万円）")
    property_tax: float = Field(0, ge=0, le=10000, description="固定資産税（年額・万円）")
    
    # ローン情報
    loan_amount: float = Field(0, ge=0, le=1000000, description="借入金額（万円）")
    interest_rate: float = Field(2, ge=0, le=20, description="金利（%）")
    loan_years: int = Field(35, ge=1, le=50, description="借入年数")
    loan_type: Literal["元利均等", "元金均等"] = Field("元利均等", description="返済方式")
    
    # その他費用
    other_costs: float = Field(0, ge=0, le=10000, description="その他初期費用（万円）")
    renovation_cost: float = Field(0, ge=0, le=10000, description="リフォーム費用（万円）")
    
    # 保有・売却計画
    holding_years: int = Field(10, ge=1, le=50, description="保有予定年数")
    exit_cap_rate: float = Field(5, ge=0, le=50, description="想定売却時利回り（%）")
    
    # 税金
    effective_tax_rate: float = Field(20, ge=0, le=60, description="実効税率（%）")
    
    # メモ（XSS対策済み）
    memo: Optional[str] = Field(None, max_length=5000, description="メモ")
    
    # URL（バリデーション済み）
    property_url: Optional[str] = Field(None, max_length=2000, description="物件URL")
    
    class Config:
        # サンプル値を含める
        schema_extra = {
            "example": {
                "property_name": "東京マンション101号室",
                "location": "東京都港区",
                "purchase_price": 5000,
                "monthly_rent": 20,
                "land_area": 100,
                "building_area": 80,
                "loan_amount": 4000,
                "interest_rate": 2.0,
                "loan_years": 35
            }
        }
    
    @validator('property_name', 'location', 'memo')
    def sanitize_text_fields(cls, v):
        """テキストフィールドのサニタイゼーション"""
        if v is None:
            return v
        # HTMLタグと危険な文字を除去
        import re
        # HTMLタグを完全に除去
        v = re.sub(r'<[^>]+>', '', v)
        # 危険な文字を除去
        dangerous_chars = ['"', "'", '&', '\x00', '\r']
        for char in dangerous_chars:
            v = v.replace(char, '')
        # 連続した改行を制限
        v = re.sub(r'\n{3,}', '\n\n', v)
        # 危険なイベントハンドラを除去
        v = re.sub(r'on\w+\s*=', '', v, flags=re.IGNORECASE)
        return v.strip()
    
    @validator('purchase_price', 'loan_amount')
    def validate_required_amounts(cls, v, field):
        """必須金額フィールドの検証"""
        if v <= 0:
            raise ValueError(f'{field.name}は0より大きい値を入力してください')
        return v
    
    @validator('loan_amount')
    def validate_loan_amount(cls, v, values):
        """借入金額が購入価格を超えないことを確認"""
        if 'purchase_price' in values and v > values['purchase_price']:
            raise ValueError('借入金額は購入価格を超えることはできません')
        return v
    
    @validator('property_url')
    def validate_url(cls, v):
        """URLの検証"""
        if v is None or v == '':
            return v
        # 危険なプロトコルをブロック
        dangerous_protocols = ['javascript:', 'data:', 'vbscript:', 'file:']
        if any(v.lower().startswith(proto) for proto in dangerous_protocols):
            raise ValueError('無効なURLプロトコルです')
        # 基本的なURL形式チェック
        if not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('URLはhttp://またはhttps://で始まる必要があります')
        return v
    
    @validator('building_year')
    def validate_building_year(cls, v):
        """建築年の妥当性チェック"""
        if v is None:
            return v
        current_year = datetime.now().year
        if v > current_year:
            raise ValueError(f'建築年は{current_year}年以前である必要があります')
        return v
    
    @validator('vacancy_rate', 'rent_decline', 'interest_rate', 'exit_cap_rate', 'effective_tax_rate')
    def validate_percentage(cls, v, field):
        """パーセンテージ値の検証"""
        if v < 0 or v > 100:
            raise ValueError(f'{field.name}は0〜100の範囲で入力してください')
        return v


class SimulationRequestModel(BaseModel):
    """シミュレーションAPIリクエストモデル"""
    property_data: PropertyInputModel
    
    # オプション
    include_cash_flow_table: bool = Field(True, description="キャッシュフロー表を含める")
    include_market_analysis: bool = Field(False, description="市場分析を含める")
    
    class Config:
        schema_extra = {
            "example": {
                "property_data": PropertyInputModel.Config.schema_extra["example"],
                "include_cash_flow_table": True,
                "include_market_analysis": False
            }
        }


class SimulationResponseModel(BaseModel):
    """シミュレーションAPIレスポンスモデル"""
    success: bool
    results: dict
    cash_flow_table: Optional[list] = None
    market_analysis: Optional[dict] = None
    error: Optional[str] = None
    request_id: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "results": {
                    "gross_yield": 4.8,
                    "ccr": 3.2,
                    "roi": 15.5,
                    "dscr": 1.2
                },
                "cash_flow_table": [],
                "request_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }