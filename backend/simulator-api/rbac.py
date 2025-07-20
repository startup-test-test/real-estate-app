"""
SEC-074: ロールベースアクセス制御（RBAC）の実装
ユーザーの役割に基づいた権限管理システム
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, Depends, status
from auth import get_current_user
import os
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()


class UserRole(str, Enum):
    """ユーザーロールの定義"""
    ADMIN = "admin"          # 管理者：全権限
    PREMIUM = "premium"      # プレミアムユーザー：高度な機能アクセス
    STANDARD = "standard"    # 標準ユーザー：基本機能のみ
    GUEST = "guest"          # ゲスト：読み取りのみ


class Permission(str, Enum):
    """権限の定義"""
    # シミュレーション関連
    SIMULATE_BASIC = "simulate:basic"           # 基本シミュレーション実行
    SIMULATE_ADVANCED = "simulate:advanced"     # 高度なシミュレーション実行
    SIMULATE_EXPORT = "simulate:export"         # シミュレーション結果のエクスポート
    
    # 市場分析関連
    MARKET_ANALYSIS_BASIC = "market:basic"      # 基本的な市場分析
    MARKET_ANALYSIS_ADVANCED = "market:advanced" # 高度な市場分析
    
    # データ管理関連
    DATA_READ = "data:read"                     # データ読み取り
    DATA_WRITE = "data:write"                   # データ書き込み
    DATA_DELETE = "data:delete"                 # データ削除
    
    # ユーザー管理関連
    USER_MANAGE = "user:manage"                 # ユーザー管理
    ROLE_MANAGE = "role:manage"                 # ロール管理
    
    # API管理関連
    API_FULL_ACCESS = "api:full"                # API完全アクセス


# ロールと権限のマッピング
ROLE_PERMISSIONS: Dict[UserRole, List[Permission]] = {
    UserRole.ADMIN: [
        # 管理者は全権限を持つ
        Permission.SIMULATE_BASIC,
        Permission.SIMULATE_ADVANCED,
        Permission.SIMULATE_EXPORT,
        Permission.MARKET_ANALYSIS_BASIC,
        Permission.MARKET_ANALYSIS_ADVANCED,
        Permission.DATA_READ,
        Permission.DATA_WRITE,
        Permission.DATA_DELETE,
        Permission.USER_MANAGE,
        Permission.ROLE_MANAGE,
        Permission.API_FULL_ACCESS,
    ],
    UserRole.PREMIUM: [
        # プレミアムユーザーは高度な機能にアクセス可能
        Permission.SIMULATE_BASIC,
        Permission.SIMULATE_ADVANCED,
        Permission.SIMULATE_EXPORT,
        Permission.MARKET_ANALYSIS_BASIC,
        Permission.MARKET_ANALYSIS_ADVANCED,
        Permission.DATA_READ,
        Permission.DATA_WRITE,
    ],
    UserRole.STANDARD: [
        # 標準ユーザーは基本機能のみ
        Permission.SIMULATE_BASIC,
        Permission.MARKET_ANALYSIS_BASIC,
        Permission.DATA_READ,
        Permission.DATA_WRITE,
    ],
    UserRole.GUEST: [
        # ゲストは読み取りのみ
        Permission.DATA_READ,
    ]
}


class RBACManager:
    """ロールベースアクセス制御マネージャー"""
    
    def __init__(self):
        # 開発環境でのデフォルトロール設定
        self.default_role = UserRole.STANDARD
        if os.getenv("ENV", "development") == "development":
            # 開発環境では管理者権限をデフォルトに
            self.default_role = UserRole.ADMIN
    
    def get_user_role(self, user: Dict[str, Any]) -> UserRole:
        """
        ユーザーのロールを取得
        
        Args:
            user: ユーザー情報
            
        Returns:
            ユーザーのロール
        """
        # ユーザー情報からロールを取得（デフォルトはSTANDARD）
        role_str = user.get("role", self.default_role.value)
        
        # 有効なロールかチェック
        try:
            return UserRole(role_str)
        except ValueError:
            return self.default_role
    
    def get_user_permissions(self, role: UserRole) -> List[Permission]:
        """
        ロールに基づいて権限リストを取得
        
        Args:
            role: ユーザーロール
            
        Returns:
            権限リスト
        """
        return ROLE_PERMISSIONS.get(role, [])
    
    def has_permission(self, user: Dict[str, Any], permission: Permission) -> bool:
        """
        ユーザーが特定の権限を持っているかチェック
        
        Args:
            user: ユーザー情報
            permission: チェックする権限
            
        Returns:
            権限を持っている場合True
        """
        role = self.get_user_role(user)
        user_permissions = self.get_user_permissions(role)
        return permission in user_permissions
    
    def check_permission(self, user: Dict[str, Any], permission: Permission) -> None:
        """
        権限をチェックし、権限がない場合は例外を発生
        
        Args:
            user: ユーザー情報
            permission: 必要な権限
            
        Raises:
            HTTPException: 権限がない場合
        """
        if not self.has_permission(user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"この操作には '{permission.value}' 権限が必要です"
            )


# シングルトンインスタンス
rbac_manager = RBACManager()


def require_permission(permission: Permission):
    """
    特定の権限を要求するデコレータ/依存性注入
    
    Args:
        permission: 必要な権限
        
    Returns:
        権限チェック済みのユーザー情報
    """
    def permission_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        # 権限チェック
        rbac_manager.check_permission(current_user, permission)
        
        # ユーザー情報にロールと権限を追加
        role = rbac_manager.get_user_role(current_user)
        current_user["role"] = role.value
        current_user["permissions"] = [p.value for p in rbac_manager.get_user_permissions(role)]
        
        return current_user
    
    return permission_checker


def require_any_permission(permissions: List[Permission]):
    """
    複数の権限のうちいずれかを要求するデコレータ/依存性注入
    
    Args:
        permissions: 必要な権限リスト（いずれか1つ）
        
    Returns:
        権限チェック済みのユーザー情報
    """
    def permission_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        # いずれかの権限を持っているかチェック
        has_any = any(rbac_manager.has_permission(current_user, perm) for perm in permissions)
        
        if not has_any:
            permission_names = ", ".join([p.value for p in permissions])
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"この操作には次のいずれかの権限が必要です: {permission_names}"
            )
        
        # ユーザー情報にロールと権限を追加
        role = rbac_manager.get_user_role(current_user)
        current_user["role"] = role.value
        current_user["permissions"] = [p.value for p in rbac_manager.get_user_permissions(role)]
        
        return current_user
    
    return permission_checker


def require_role(required_role: UserRole):
    """
    特定のロールを要求するデコレータ/依存性注入
    
    Args:
        required_role: 必要なロール
        
    Returns:
        ロールチェック済みのユーザー情報
    """
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        role = rbac_manager.get_user_role(current_user)
        
        # 管理者は全てのロール要求を満たす
        if role != UserRole.ADMIN and role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"この操作には '{required_role.value}' ロールが必要です"
            )
        
        current_user["role"] = role.value
        current_user["permissions"] = [p.value for p in rbac_manager.get_user_permissions(role)]
        
        return current_user
    
    return role_checker