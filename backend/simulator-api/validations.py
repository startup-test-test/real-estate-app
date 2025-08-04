"""
サーバーサイド入力値検証モジュール
Pydanticを使用した厳密な型チェックとバリデーション
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
import re
from datetime import datetime


class SimulatorInput(BaseModel):
    """シミュレーター入力データのバリデーションモデル"""
    
    # 物件情報（文字列）
    propertyName: str = Field(..., min_length=1, max_length=100, description="物件名")
    location: str = Field(..., min_length=1, max_length=200, description="住所")
    propertyUrl: Optional[str] = Field(None, max_length=500, description="物件URL")
    propertyMemo: Optional[str] = Field(None, max_length=1000, description="メモ")
    
    # 物件情報（数値）
    purchasePrice: float = Field(..., ge=1, le=100000, description="購入価格（万円）")
    monthlyRent: float = Field(0, ge=0, le=10000, description="月額賃料（万円）")
    managementFee: float = Field(0, ge=0, le=1000, description="管理費・修繕積立金（万円）")
    propertyTax: float = Field(0, ge=0, le=5000, description="年間固定資産税（万円）")
    
    # ローン情報
    downPaymentRatio: float = Field(20, ge=0, le=100, description="頭金比率（%）")
    loanYears: int = Field(35, ge=1, le=50, description="ローン期間（年）")
    interestRate: float = Field(1.5, ge=0, le=20, description="借入金利（%）")
    
    # 物件詳細
    buildingArea: Optional[float] = Field(None, ge=1, le=100000, description="建物面積（㎡）")
    landArea: Optional[float] = Field(None, ge=0, le=100000, description="土地面積（㎡）")
    yearBuilt: Optional[int] = Field(None, ge=1900, le=datetime.now().year + 10, description="築年")
    
    # 投資条件
    holdingYears: int = Field(10, ge=1, le=50, description="保有年数")
    majorRepairCost: float = Field(0, ge=0, le=50000, description="大規模修繕費用（万円）")
    
    # 減価償却
    buildingPriceForDepreciation: Optional[float] = Field(None, ge=0, le=100000, description="建物価格（減価償却用）（万円）")
    depreciationYears: Optional[int] = Field(None, ge=1, le=50, description="減価償却年数")
    
    # 画像
    propertyImageBase64: Optional[str] = Field(None, description="物件画像（Base64）")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "propertyName": "サンプル物件",
                "location": "東京都渋谷区",
                "purchasePrice": 5000,
                "monthlyRent": 20,
                "managementFee": 5,
                "propertyTax": 10,
                "downPaymentRatio": 20,
                "loanYears": 35,
                "interestRate": 1.5,
                "holdingYears": 10
            }
        }
    }
    
    @field_validator('propertyName', 'location', 'propertyUrl', 'propertyMemo')
    @classmethod
    def no_html_tags(cls, v):
        """HTMLタグが含まれていないことを確認"""
        if v is None:
            return v
        
        # HTMLタグのパターン（厳密版）
        html_pattern = re.compile(r'<[a-zA-Z][^>]*>|<\/[a-zA-Z][^>]*>')
        if html_pattern.search(v):
            raise ValueError('HTMLタグは使用できません')
        
        return v
    
    @field_validator('propertyUrl')
    @classmethod
    def validate_url(cls, v):
        """URLの安全性チェック"""
        if v is None or v == '':
            return v
        
        # 危険なプロトコルのチェック
        dangerous_protocols = ['javascript:', 'data:', 'vbscript:', 'file:']
        url_lower = v.lower()
        
        for protocol in dangerous_protocols:
            if url_lower.startswith(protocol):
                raise ValueError('許可されていないプロトコルです')
        
        return v
    
    @field_validator('propertyImageBase64')
    @classmethod
    def validate_image_base64(cls, v):
        """Base64画像の検証"""
        if v is None or v == '':
            return v
        
        # Base64画像の基本的な形式チェック
        if not v.startswith('data:image/'):
            raise ValueError('画像データの形式が正しくありません')
        
        # 画像形式の確認（jpeg, png, gif, webpのみ許可）
        allowed_formats = ['data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/gif', 'data:image/webp']
        if not any(v.lower().startswith(fmt) for fmt in allowed_formats):
            raise ValueError('許可されていない画像形式です')
        
        # サイズチェック（5MB以下）
        # Base64は元のサイズの約1.33倍になるため、6.7MB以下をチェック
        if len(v) > 6700000:
            raise ValueError('画像サイズが大きすぎます（5MB以下にしてください）')
        
        return v


class MarketAnalysisInput(BaseModel):
    """市場分析リクエストのバリデーションモデル"""
    
    location: str = Field(..., min_length=1, max_length=200, description="所在地")
    land_area: float = Field(..., ge=0, le=100000, description="土地面積（㎡）")
    year_built: int = Field(..., ge=1900, le=datetime.now().year + 10, description="築年")
    purchase_price: float = Field(..., ge=1, le=100000, description="購入価格（万円）")
    
    @field_validator('location')
    @classmethod
    def no_html_tags_location(cls, v):
        """HTMLタグが含まれていないことを確認"""
        html_pattern = re.compile(r'<[a-zA-Z][^>]*>|<\/[a-zA-Z][^>]*>')
        if html_pattern.search(v):
            raise ValueError('所在地にHTMLタグは使用できません')
        return v


def create_validation_error_response(errors: list) -> dict:
    """バリデーションエラーレスポンスの統一フォーマット"""
    error_messages = []
    
    for error in errors:
        field = error.get('loc', ['不明'])[0]
        msg = error.get('msg', 'エラーが発生しました')
        
        # エラーメッセージを日本語化
        if 'less than or equal to' in msg:
            value = msg.split('less than or equal to')[1].strip()
            error_messages.append(f"{field}: {value}以下で入力してください")
        elif 'greater than or equal to' in msg:
            value = msg.split('greater than or equal to')[1].strip()
            error_messages.append(f"{field}: {value}以上で入力してください")
        elif 'ensure this value has at most' in msg:
            value = msg.split('at most')[1].split('characters')[0].strip()
            error_messages.append(f"{field}: {value}文字以下で入力してください")
        elif 'ensure this value has at least' in msg:
            value = msg.split('at least')[1].split('characters')[0].strip()
            error_messages.append(f"{field}: {value}文字以上で入力してください")
        elif 'field required' in msg:
            error_messages.append(f"{field}: 必須項目です")
        else:
            error_messages.append(f"{field}: {msg}")
    
    return {
        "error": "入力値にエラーがあります",
        "details": error_messages,
        "status_code": 400
    }