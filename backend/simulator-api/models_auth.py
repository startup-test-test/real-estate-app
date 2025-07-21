"""
SEC-071: 認証関連のPydanticモデル
リクエスト検証の強化
"""

from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator


class TokenRequest(BaseModel):
    """トークンリクエストモデル"""
    email: Optional[EmailStr] = Field(None, description="メールアドレス（開発環境用）")
    password: Optional[str] = Field(None, description="パスワード（開発環境用）")
    supabase_token: Optional[str] = Field(None, description="Supabaseトークン（本番環境用）")
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        """メールアドレスの検証"""
        if v:
            # XSS対策：危険な文字を検出
            dangerous_chars = ['<', '>', '"', "'", '&']
            if any(char in v for char in dangerous_chars):
                raise ValueError('メールアドレスに不正な文字が含まれています')
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """パスワードの基本検証"""
        if v:
            # 最小長チェック
            if len(v) < 6:
                raise ValueError('パスワードは6文字以上である必要があります')
            # 最大長チェック（DoS対策）
            if len(v) > 128:
                raise ValueError('パスワードが長すぎます')
        return v
    
    @field_validator('supabase_token')
    @classmethod
    def validate_supabase_token(cls, v):
        """Supabaseトークンの検証"""
        if v:
            # 基本的な形式チェック
            if len(v) < 10:
                raise ValueError('トークンの形式が不正です')
            # 最大長チェック（DoS対策）
            if len(v) > 2048:
                raise ValueError('トークンが長すぎます')
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "admin@example.com",
                    "password": "secure_password_123"
                },
                {
                    "supabase_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                }
            ]
        }
    }


class TokenResponse(BaseModel):
    """トークンレスポンスモデル"""
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int = Field(3600, description="有効期限（秒）")
    role: str = Field(..., description="ユーザーロール")
    user_id: Optional[str] = Field(None, description="ユーザーID")
    full_name: Optional[str] = Field(None, description="フルネーム")


class UserInfoResponse(BaseModel):
    """ユーザー情報レスポンスモデル"""
    user: dict = Field(..., description="ユーザー情報")
    authenticated: bool = Field(True, description="認証状態")


class ErrorResponse(BaseModel):
    """エラーレスポンスモデル"""
    error: str = Field(..., description="エラーコード")
    message: str = Field(..., description="エラーメッセージ")
    detail: Optional[str] = Field(None, description="詳細情報（開発環境のみ）")
    request_id: Optional[str] = Field(None, description="リクエストID")