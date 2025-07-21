"""
SEC-073: バックエンド認証システムの完全実装
Supabase認証統合とユーザー管理機能
"""

import os
import logging
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

import jwt
from passlib.context import CryptContext
from supabase import create_client, Client
from fastapi import HTTPException, status

from rbac import UserRole, Permission, rbac_manager
from error_handler import create_auth_error_response

logger = logging.getLogger(__name__)

# パスワードハッシュ化設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Supabase設定
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


@dataclass
class UserProfile:
    """ユーザープロファイルデータクラス"""
    user_id: str
    email: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.STANDARD
    is_active: bool = True
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    login_count: int = 0
    permissions: List[Permission] = None
    
    def __post_init__(self):
        if self.permissions is None:
            self.permissions = rbac_manager.get_user_permissions(self.role)


class SupabaseAuthManager:
    """Supabase認証マネージャー"""
    
    def __init__(self):
        self.supabase: Optional[Client] = None
        self.service_supabase: Optional[Client] = None
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Supabaseクライアントを初期化"""
        try:
            if SUPABASE_URL and SUPABASE_KEY:
                self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
                logger.info("Supabase client initialized")
                
            if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                self.service_supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                logger.info("Supabase service client initialized")
                
        except Exception as e:
            logger.error(f"Failed to initialize Supabase clients: {e}")
            # 開発環境では警告のみ、本番環境では例外を発生
            if not os.getenv("DEVELOPMENT_MODE"):
                raise RuntimeError("Supabase initialization failed")
    
    def verify_supabase_token(self, token: str) -> Dict[str, Any]:
        """
        Supabaseトークンを検証
        
        Args:
            token: JWT トークン
            
        Returns:
            ユーザー情報辞書
            
        Raises:
            HTTPException: 認証失敗時
        """
        if not self.supabase:
            logger.warning("Supabase client not initialized, falling back to mock auth")
            return self._mock_token_verification(token)
        
        try:
            # Supabaseセッション検証
            response = self.supabase.auth.get_user(token)
            
            if not response.user:
                raise create_auth_error_response("無効なトークンです")
            
            user_data = response.user
            
            # データベースからユーザープロファイルを取得
            profile = self.get_user_profile(user_data.id)
            
            if not profile or not profile.is_active:
                raise create_auth_error_response("アカウントが無効です")
            
            # ログイン記録を更新
            self.update_login_record(user_data.id)
            
            return {
                "user_id": user_data.id,
                "email": user_data.email,
                "role": profile.role,
                "permissions": profile.permissions,
                "full_name": profile.full_name,
                "last_login": profile.last_login,
                "is_active": profile.is_active
            }
            
        except Exception as e:
            logger.error(f"Supabase token verification failed: {e}")
            raise create_auth_error_response("認証に失敗しました")
    
    def _mock_token_verification(self, token: str) -> Dict[str, Any]:
        """開発環境用のモック認証"""
        try:
            # 開発環境用の簡易JWT検証
            payload = jwt.decode(token, "dev-secret", algorithms=["HS256"])
            user_id = payload.get("sub", "dev-user-123")
            email = payload.get("email", "dev@example.com")
            
            # 開発環境用のロール決定
            role = UserRole.ADMIN  # 開発環境では管理者権限
            permissions = rbac_manager.get_user_permissions(role)
            
            return {
                "user_id": user_id,
                "email": email,
                "role": role,
                "permissions": permissions,
                "full_name": "開発ユーザー",
                "last_login": datetime.now(timezone.utc),
                "is_active": True
            }
            
        except Exception as e:
            logger.error(f"Mock token verification failed: {e}")
            raise create_auth_error_response("開発環境での認証に失敗しました")
    
    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """
        ユーザープロファイルを取得
        
        Args:
            user_id: ユーザーID
            
        Returns:
            ユーザープロファイル または None
        """
        if not self.service_supabase:
            return self._get_mock_profile(user_id)
        
        try:
            response = self.service_supabase.table('user_profiles').select('*').eq('user_id', user_id).single().execute()
            
            if response.data:
                data = response.data
                return UserProfile(
                    user_id=data['user_id'],
                    email=data['email'],
                    full_name=data.get('full_name'),
                    role=UserRole(data.get('role', 'STANDARD')),
                    is_active=data.get('is_active', True),
                    created_at=datetime.fromisoformat(data['created_at']) if data.get('created_at') else None,
                    last_login=datetime.fromisoformat(data['last_login']) if data.get('last_login') else None,
                    login_count=data.get('login_count', 0)
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get user profile for {user_id}: {e}")
            return None
    
    def _get_mock_profile(self, user_id: str) -> UserProfile:
        """開発環境用のモックプロファイル"""
        return UserProfile(
            user_id=user_id,
            email="dev@example.com",
            full_name="開発ユーザー",
            role=UserRole.ADMIN,
            is_active=True,
            created_at=datetime.now(timezone.utc),
            last_login=datetime.now(timezone.utc),
            login_count=1
        )
    
    def create_user_profile(self, user_id: str, email: str, full_name: Optional[str] = None, 
                          role: UserRole = UserRole.STANDARD) -> UserProfile:
        """
        新しいユーザープロファイルを作成
        
        Args:
            user_id: ユーザーID
            email: メールアドレス
            full_name: フルネーム
            role: ユーザーロール
            
        Returns:
            作成されたユーザープロファイル
        """
        if not self.service_supabase:
            logger.warning("Service client not available, returning mock profile")
            return self._get_mock_profile(user_id)
        
        try:
            profile_data = {
                'user_id': user_id,
                'email': email,
                'full_name': full_name,
                'role': role.value,
                'is_active': True,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'login_count': 0
            }
            
            response = self.service_supabase.table('user_profiles').insert(profile_data).execute()
            
            if response.data:
                logger.info(f"User profile created for {email}")
                return UserProfile(**profile_data)
            
            raise Exception("Failed to create user profile")
            
        except Exception as e:
            logger.error(f"Failed to create user profile for {email}: {e}")
            raise
    
    def update_login_record(self, user_id: str) -> None:
        """
        ログイン記録を更新
        
        Args:
            user_id: ユーザーID
        """
        if not self.service_supabase:
            return
        
        try:
            update_data = {
                'last_login': datetime.now(timezone.utc).isoformat(),
                'login_count': 1  # TODO: インクリメント実装
            }
            
            self.service_supabase.table('user_profiles').update(update_data).eq('user_id', user_id).execute()
            
        except Exception as e:
            logger.error(f"Failed to update login record for {user_id}: {e}")
    
    def update_user_role(self, user_id: str, new_role: UserRole, admin_user_id: str) -> bool:
        """
        ユーザーロールを更新（管理者のみ）
        
        Args:
            user_id: 対象ユーザーID
            new_role: 新しいロール
            admin_user_id: 管理者ユーザーID
            
        Returns:
            更新成功/失敗
        """
        if not self.service_supabase:
            return False
        
        try:
            # 管理者権限チェック
            admin_profile = self.get_user_profile(admin_user_id)
            if not admin_profile or admin_profile.role != UserRole.ADMIN:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="管理者権限が必要です"
                )
            
            # ロール更新
            update_data = {
                'role': new_role.value,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            
            response = self.service_supabase.table('user_profiles').update(update_data).eq('user_id', user_id).execute()
            
            if response.data:
                logger.info(f"User role updated: {user_id} -> {new_role.value}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to update user role for {user_id}: {e}")
            return False
    
    def deactivate_user(self, user_id: str, admin_user_id: str) -> bool:
        """
        ユーザーを無効化（管理者のみ）
        
        Args:
            user_id: 対象ユーザーID  
            admin_user_id: 管理者ユーザーID
            
        Returns:
            無効化成功/失敗
        """
        if not self.service_supabase:
            return False
        
        try:
            # 管理者権限チェック
            admin_profile = self.get_user_profile(admin_user_id)
            if not admin_profile or admin_profile.role != UserRole.ADMIN:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="管理者権限が必要です"
                )
            
            # ユーザー無効化
            update_data = {
                'is_active': False,
                'deactivated_at': datetime.now(timezone.utc).isoformat()
            }
            
            response = self.service_supabase.table('user_profiles').update(update_data).eq('user_id', user_id).execute()
            
            if response.data:
                logger.info(f"User deactivated: {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to deactivate user {user_id}: {e}")
            return False
    
    def hash_password(self, password: str) -> str:
        """パスワードをハッシュ化"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """パスワードを検証"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def generate_password_reset_token(self, user_id: str) -> str:
        """パスワードリセットトークンを生成"""
        payload = {
            'user_id': user_id,
            'type': 'password_reset',
            'exp': datetime.now(timezone.utc) + timedelta(hours=1),
            'jti': secrets.token_urlsafe(16)
        }
        
        secret = os.getenv("JWT_SECRET_KEY", "fallback-secret")
        return jwt.encode(payload, secret, algorithm="HS256")
    
    def verify_password_reset_token(self, token: str) -> Optional[str]:
        """パスワードリセットトークンを検証"""
        try:
            secret = os.getenv("JWT_SECRET_KEY", "fallback-secret")
            payload = jwt.decode(token, secret, algorithms=["HS256"])
            
            if payload.get('type') != 'password_reset':
                return None
                
            return payload.get('user_id')
            
        except jwt.ExpiredSignatureError:
            logger.warning("Password reset token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid password reset token")
            return None


# グローバルインスタンス
supabase_auth = SupabaseAuthManager()


def get_authenticated_user(token: str) -> Dict[str, Any]:
    """
    認証されたユーザー情報を取得（統合エントリーポイント）
    
    Args:
        token: 認証トークン
        
    Returns:
        ユーザー情報辞書
    """
    return supabase_auth.verify_supabase_token(token)