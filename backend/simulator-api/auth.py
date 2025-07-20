"""
SEC-022: API認証システムの実装
JWT認証ミドルウェアとヘルパー関数
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

# JWT設定
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1時間

# 本番環境でのシークレットキー検証
if os.getenv("ENV", "development") == "production":
    if SECRET_KEY == "your-secret-key-change-this-in-production":
        raise ValueError("本番環境では安全なJWT_SECRET_KEYを設定してください")

# HTTPBearerインスタンス
security = HTTPBearer()


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    JWTアクセストークンを作成
    
    Args:
        data: トークンに含めるデータ
        expires_delta: 有効期限（デフォルトは60分）
    
    Returns:
        エンコードされたJWTトークン
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    """
    JWTトークンを検証
    
    Args:
        credentials: HTTPAuthorizationCredentials
    
    Returns:
        デコードされたトークンペイロード
    
    Raises:
        HTTPException: トークンが無効な場合
    """
    token = credentials.credentials
    
    try:
        # トークンをデコード
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # 有効期限のチェック
        exp = payload.get("exp")
        if exp is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="トークンに有効期限が設定されていません",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # ユーザーIDの確認
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="トークンにユーザー情報が含まれていません",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return payload
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"トークンの検証に失敗しました: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(token_payload: Dict[str, Any] = Security(verify_token)) -> Dict[str, Any]:
    """
    現在のユーザー情報を取得
    
    Args:
        token_payload: 検証済みのトークンペイロード
    
    Returns:
        ユーザー情報
    """
    return {
        "user_id": token_payload.get("sub"),
        "email": token_payload.get("email"),
        "exp": token_payload.get("exp")
    }


# オプション: APIキー認証（代替認証方式）
class APIKeyAuth:
    """APIキー認証クラス"""
    
    def __init__(self):
        self.api_key = os.getenv("API_KEY", None)
        if os.getenv("ENV", "development") == "production" and not self.api_key:
            raise ValueError("本番環境ではAPI_KEYの設定が必須です")
    
    def verify_api_key(self, api_key: str) -> bool:
        """APIキーを検証"""
        if not self.api_key:
            return False
        return api_key == self.api_key


# 開発環境用のモック認証（本番環境では無効）
def get_mock_user() -> Optional[Dict[str, Any]]:
    """開発環境用のモックユーザー（SEC-022対策）"""
    if os.getenv("ENV", "development") != "development":
        return None
    
    return {
        "user_id": "dev-user-123",
        "email": "dev@example.com",
        "exp": (datetime.utcnow() + timedelta(hours=24)).timestamp()
    }