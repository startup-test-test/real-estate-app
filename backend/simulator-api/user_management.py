"""
SEC-073: ユーザー管理APIエンドポイント
管理者向けのユーザー管理機能
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
import logging

from supabase_auth import supabase_auth
from rbac import Permission, UserRole, require_permission
from error_handler import create_auth_error_response, create_permission_error_response
from models import BaseResponse
from pydantic import BaseModel, EmailStr, field_validator

logger = logging.getLogger(__name__)

# ルーター作成
user_router = APIRouter(prefix="/api/users", tags=["user-management"])


class UserCreateRequest(BaseModel):
    """ユーザー作成リクエスト"""
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.STANDARD
    
    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if isinstance(v, str):
            try:
                return UserRole(v)
            except ValueError:
                raise ValueError(f"Invalid role: {v}")
        return v


class UserUpdateRequest(BaseModel):
    """ユーザー更新リクエスト"""
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    
    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            try:
                return UserRole(v)
            except ValueError:
                raise ValueError(f"Invalid role: {v}")
        return v


class UserResponse(BaseModel):
    """ユーザー情報レスポンス"""
    user_id: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: Optional[str] = None
    last_login: Optional[str] = None
    login_count: int = 0


class UserListResponse(BaseResponse):
    """ユーザーリスト取得レスポンス"""
    users: List[UserResponse]
    total_count: int
    page: int
    page_size: int


@user_router.post("/create", response_model=UserResponse)
def create_user(
    request: UserCreateRequest,
    current_user: dict = Depends(require_permission(Permission.USER_MANAGE))
):
    """
    新しいユーザーを作成（管理者のみ）
    
    Args:
        request: ユーザー作成リクエスト
        current_user: 現在のユーザー（管理者権限必要）
        
    Returns:
        作成されたユーザー情報
    """
    try:
        admin_user_id = current_user.get("user_id") or current_user.get("sub")
        logger.info(f"User creation requested by admin: {admin_user_id}")
        
        # ユーザーIDを生成（実際の実装ではSupabaseで生成される）
        import uuid
        new_user_id = str(uuid.uuid4())
        
        # ユーザープロファイルを作成
        profile = supabase_auth.create_user_profile(
            user_id=new_user_id,
            email=request.email,
            full_name=request.full_name,
            role=request.role
        )
        
        return UserResponse(
            user_id=profile.user_id,
            email=profile.email,
            full_name=profile.full_name,
            role=profile.role.value,
            is_active=profile.is_active,
            created_at=profile.created_at.isoformat() if profile.created_at else None,
            last_login=profile.last_login.isoformat() if profile.last_login else None,
            login_count=profile.login_count
        )
        
    except Exception as e:
        logger.error(f"Failed to create user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ユーザー作成に失敗しました"
        )


@user_router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    current_user: dict = Depends(require_permission(Permission.USER_MANAGE))
):
    """
    特定のユーザー情報を取得（管理者のみ）
    
    Args:
        user_id: 取得するユーザーID
        current_user: 現在のユーザー（管理者権限必要）
        
    Returns:
        ユーザー情報
    """
    try:
        profile = supabase_auth.get_user_profile(user_id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ユーザーが見つかりません"
            )
        
        return UserResponse(
            user_id=profile.user_id,
            email=profile.email,
            full_name=profile.full_name,
            role=profile.role.value,
            is_active=profile.is_active,
            created_at=profile.created_at.isoformat() if profile.created_at else None,
            last_login=profile.last_login.isoformat() if profile.last_login else None,
            login_count=profile.login_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ユーザー情報の取得に失敗しました"
        )


@user_router.put("/{user_id}/role", response_model=BaseResponse)
def update_user_role(
    user_id: str,
    new_role: UserRole,
    current_user: dict = Depends(require_permission(Permission.USER_MANAGE))
):
    """
    ユーザーのロールを更新（管理者のみ）
    
    Args:
        user_id: 更新するユーザーID
        new_role: 新しいロール
        current_user: 現在のユーザー（管理者権限必要）
        
    Returns:
        更新結果
    """
    try:
        admin_user_id = current_user.get("user_id") or current_user.get("sub")
        
        # 自分自身のロールは変更できない
        if user_id == admin_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="自分自身のロールは変更できません"
            )
        
        success = supabase_auth.update_user_role(
            user_id=user_id,
            new_role=new_role,
            admin_user_id=admin_user_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="ロールの更新に失敗しました"
            )
        
        return BaseResponse(
            success=True,
            message=f"ユーザーのロールを{new_role.value}に更新しました"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user role for {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ロールの更新に失敗しました"
        )


@user_router.put("/{user_id}/deactivate", response_model=BaseResponse)
def deactivate_user(
    user_id: str,
    current_user: dict = Depends(require_permission(Permission.USER_MANAGE))
):
    """
    ユーザーを無効化（管理者のみ）
    
    Args:
        user_id: 無効化するユーザーID
        current_user: 現在のユーザー（管理者権限必要）
        
    Returns:
        無効化結果
    """
    try:
        admin_user_id = current_user.get("user_id") or current_user.get("sub")
        
        # 自分自身は無効化できない
        if user_id == admin_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="自分自身を無効化することはできません"
            )
        
        success = supabase_auth.deactivate_user(
            user_id=user_id,
            admin_user_id=admin_user_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="ユーザーの無効化に失敗しました"
            )
        
        return BaseResponse(
            success=True,
            message="ユーザーを無効化しました"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to deactivate user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ユーザーの無効化に失敗しました"
        )


@user_router.get("/", response_model=UserListResponse)
def list_users(
    page: int = Query(1, ge=1, description="ページ番号"),
    page_size: int = Query(20, ge=1, le=100, description="ページサイズ"),
    role_filter: Optional[UserRole] = Query(None, description="ロールフィルター"),
    active_only: bool = Query(True, description="アクティブユーザーのみ"),
    current_user: dict = Depends(require_permission(Permission.USER_MANAGE))
):
    """
    ユーザーリストを取得（管理者のみ）
    
    Args:
        page: ページ番号
        page_size: ページサイズ
        role_filter: ロールフィルター
        active_only: アクティブユーザーのみ
        current_user: 現在のユーザー（管理者権限必要）
        
    Returns:
        ユーザーリスト
    """
    try:
        # 実際の実装ではSupabaseのクエリを使用
        # 現在はモック実装として簡単なレスポンスを返す
        
        # 開発環境用のモックデータ
        mock_users = [
            UserResponse(
                user_id="dev-user-123",
                email="admin@example.com",
                full_name="開発管理者",
                role="ADMIN",
                is_active=True,
                created_at=datetime.now().isoformat(),
                last_login=datetime.now().isoformat(),
                login_count=5
            ),
            UserResponse(
                user_id="dev-user-456",
                email="user@example.com",
                full_name="開発ユーザー",
                role="STANDARD",
                is_active=True,
                created_at=datetime.now().isoformat(),
                last_login=datetime.now().isoformat(),
                login_count=3
            )
        ]
        
        # フィルタリング
        filtered_users = mock_users
        if role_filter:
            filtered_users = [u for u in filtered_users if u.role == role_filter.value]
        if active_only:
            filtered_users = [u for u in filtered_users if u.is_active]
        
        # ページング
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_users = filtered_users[start_idx:end_idx]
        
        return UserListResponse(
            success=True,
            users=paginated_users,
            total_count=len(filtered_users),
            page=page,
            page_size=page_size
        )
        
    except Exception as e:
        logger.error(f"Failed to list users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ユーザーリストの取得に失敗しました"
        )