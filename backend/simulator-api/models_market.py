"""
市場分析用のPydanticモデル
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any


class MarketAnalysisRequestModel(BaseModel):
    """市場分析リクエストモデル"""
    
    location: str = Field(..., min_length=1, max_length=200, description="物件所在地")
    land_area: float = Field(..., ge=0, le=100000, description="土地面積（㎡）")
    year_built: int = Field(2000, ge=1900, le=2100, description="建築年")
    purchase_price: float = Field(..., ge=0, le=1000000, description="購入価格（万円）")
    
    @field_validator('location')
    @classmethod
    def sanitize_location(cls, v):
        """場所のサニタイゼーション"""
        # 危険な文字を除去
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00', '\r', '\n\n\n']
        for char in dangerous_chars:
            v = v.replace(char, '')
        return v.strip()
    
    @field_validator('purchase_price', 'land_area')
    @classmethod
    def validate_positive(cls, v):
        """正の値であることを確認"""
        if v <= 0:
            raise ValueError('値は0より大きい値を入力してください')
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "location": "東京都港区",
                "land_area": 100,
                "year_built": 2020,
                "purchase_price": 5000
            }
        }
    }


class SimilarPropertyModel(BaseModel):
    """類似物件モデル"""
    
    transaction_period: str = Field(alias='取引時期')
    location: str = Field(alias='所在地')
    area_sqm: float = Field(alias='面積(㎡)')
    year_built: int = Field(alias='築年')
    structure: str = Field(alias='構造')
    transaction_price: float = Field(alias='取引価格(万円)')
    unit_price: float = Field(alias='平米単価(万円/㎡)')
    nearest_station: str = Field(alias='最寄駅')
    station_distance: str = Field(alias='駅距離')
    
    class Config:
        allow_population_by_field_name = True


class MarketStatisticsModel(BaseModel):
    """市場統計モデル"""
    
    median_price: float = Field(..., description="中央値価格")
    mean_price: float = Field(..., description="平均価格")
    std_price: float = Field(..., description="標準偏差")
    user_price: float = Field(..., description="ユーザー物件価格")
    deviation: float = Field(..., description="偏差率（%）")
    evaluation: str = Field(..., description="価格評価")


class MarketAnalysisResponseModel(BaseModel):
    """市場分析レスポンスモデル"""
    
    similar_properties: List[Dict[str, Any]]
    statistics: MarketStatisticsModel
    
    class Config:
        schema_extra = {
            "example": {
                "similar_properties": [
                    {
                        "取引時期": "2024年Q1",
                        "所在地": "東京都港区***",
                        "面積(㎡)": 100.5,
                        "築年": 2020,
                        "構造": "RC",
                        "取引価格(万円)": 5500,
                        "平米単価(万円/㎡)": 54.7,
                        "最寄駅": "品川",
                        "駅距離": "10分"
                    }
                ],
                "statistics": {
                    "median_price": 55.0,
                    "mean_price": 56.2,
                    "std_price": 5.3,
                    "user_price": 50.0,
                    "deviation": -9.1,
                    "evaluation": "適正価格"
                }
            }
        }