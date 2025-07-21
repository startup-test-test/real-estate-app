"""
SEC-065: 環境変数の直接露出対策
フロントエンドの環境設定を安全に提供するプロキシエンドポイント
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import os
from datetime import datetime, timedelta
import secrets
import hashlib
from auth import verify_token
from rbac import check_permission

router = APIRouter()

# 設定キャッシュ（短期間のみ有効）
_config_cache = {
    "data": None,
    "expires_at": None,
    "token": None
}

def generate_config_token() -> str:
    """一時的な設定アクセストークンを生成"""
    return secrets.token_urlsafe(32)

def get_safe_config() -> Dict[str, Any]:
    """安全な設定情報を取得（機密情報はマスク）"""
    # Supabase URL（公開可能）
    supabase_url = os.getenv("VITE_SUPABASE_URL", "")
    
    # Anon Keyは公開前提だが、一部マスク
    anon_key = os.getenv("VITE_SUPABASE_ANON_KEY", "")
    masked_anon_key = anon_key[:20] + "..." + anon_key[-20:] if len(anon_key) > 40 else anon_key
    
    return {
        "supabase": {
            "url": supabase_url,
            "anon_key_preview": masked_anon_key,
            "has_anon_key": bool(anon_key)
        },
        "features": {
            "auth_enabled": True,
            "mock_auth_enabled": os.getenv("VITE_ENV") != "production",
            "api_base_url": os.getenv("VITE_API_BASE_URL", "/api")
        },
        "environment": {
            "mode": os.getenv("VITE_ENV", "development"),
            "is_production": os.getenv("VITE_ENV") == "production"
        }
    }

@router.get("/api/config/public")
async def get_public_config():
    """公開可能な設定情報を取得"""
    return get_safe_config()

@router.post("/api/config/secure")
async def get_secure_config(user: dict = Depends(verify_token)):
    """認証済みユーザー向けの詳細設定を取得"""
    
    # 権限チェック
    check_permission(user, "view_config")
    
    config = get_safe_config()
    
    # 認証済みユーザーには完全なAnon Keyを提供
    anon_key = os.getenv("VITE_SUPABASE_ANON_KEY", "")
    if anon_key:
        # 一時トークンを生成
        temp_token = generate_config_token()
        
        # キャッシュに保存（5分間有効）
        _config_cache["data"] = {
            "supabase_anon_key": anon_key,
            "token": temp_token
        }
        _config_cache["expires_at"] = datetime.utcnow() + timedelta(minutes=5)
        _config_cache["token"] = temp_token
        
        config["secure_token"] = temp_token
    
    return config

@router.post("/api/config/retrieve")
async def retrieve_secure_data(token: str, user: dict = Depends(verify_token)):
    """一時トークンを使用して機密データを取得"""
    
    # キャッシュの有効期限チェック
    if not _config_cache["data"] or not _config_cache["expires_at"]:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    if datetime.utcnow() > _config_cache["expires_at"]:
        # 期限切れの場合はクリア
        _config_cache["data"] = None
        _config_cache["expires_at"] = None
        _config_cache["token"] = None
        raise HTTPException(status_code=410, detail="Configuration expired")
    
    # トークンの検証
    if token != _config_cache["token"]:
        raise HTTPException(status_code=403, detail="Invalid token")
    
    # データを返して、キャッシュをクリア（一度きりの使用）
    data = _config_cache["data"]
    _config_cache["data"] = None
    _config_cache["expires_at"] = None
    _config_cache["token"] = None
    
    return data

@router.get("/api/config/health")
async def config_health_check():
    """設定プロキシの健全性チェック"""
    return {
        "status": "healthy",
        "has_supabase_config": bool(os.getenv("VITE_SUPABASE_URL")),
        "timestamp": datetime.utcnow().isoformat()
    }