"""
SEC-080: 環境変数の不適切な管理対策
セキュアな環境変数管理システム
"""

import os
import logging
import hashlib
from typing import Optional, Dict, Any
from pathlib import Path
from datetime import datetime
import json
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64


logger = logging.getLogger(__name__)


class SecureConfig:
    """セキュアな環境変数管理クラス"""
    
    def __init__(self):
        self._config_cache: Dict[str, Any] = {}
        self._access_log: list = []
        self._encryption_key = self._get_or_create_encryption_key()
        self._load_config()
    
    def _get_or_create_encryption_key(self) -> bytes:
        """暗号化キーを取得または生成"""
        key_file = Path(".config_key")
        
        if key_file.exists():
            with open(key_file, "rb") as f:
                return f.read()
        else:
            # 本番環境では環境変数から取得すべき
            master_key = os.getenv("CONFIG_MASTER_KEY", "default-development-key")
            
            # PBKDF2でキーを導出
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=b'real-estate-app-salt',
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(master_key.encode()))
            
            # 開発環境のみキーファイルを保存
            if os.getenv("ENV", "development") == "development":
                with open(key_file, "wb") as f:
                    f.write(key)
                os.chmod(key_file, 0o600)  # 読み取り権限を制限
            
            return key
    
    def _encrypt_value(self, value: str) -> str:
        """値を暗号化"""
        f = Fernet(self._encryption_key)
        return f.encrypt(value.encode()).decode()
    
    def _decrypt_value(self, encrypted_value: str) -> str:
        """値を復号化"""
        f = Fernet(self._encryption_key)
        return f.decrypt(encrypted_value.encode()).decode()
    
    def _load_config(self):
        """設定をロード"""
        # 環境変数から設定を読み込み
        self._config_cache = {
            # API設定
            "API_URL": os.getenv("API_URL", "http://localhost:8000"),
            "ALLOWED_ORIGINS": os.getenv("ALLOWED_ORIGINS", "http://localhost:5173"),
            
            # データベース設定（機密情報）
            "SUPABASE_URL": os.getenv("SUPABASE_URL", ""),
            "SUPABASE_KEY": os.getenv("SUPABASE_ANON_KEY", ""),
            
            # 認証設定（機密情報）
            "JWT_SECRET_KEY": os.getenv("JWT_SECRET_KEY", ""),
            "JWT_ALGORITHM": os.getenv("JWT_ALGORITHM", "HS256"),
            
            # OpenAI設定（機密情報）
            "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY", ""),
            
            # 環境設定
            "ENV": os.getenv("ENV", "development"),
            "DEBUG": os.getenv("DEBUG", "False").lower() == "true",
            
            # セキュリティ設定
            "RATE_LIMIT_ENABLED": os.getenv("RATE_LIMIT_ENABLED", "True").lower() == "true",
            "RATE_LIMIT_REQUESTS": int(os.getenv("RATE_LIMIT_REQUESTS", "100")),
            "RATE_LIMIT_PERIOD": int(os.getenv("RATE_LIMIT_PERIOD", "3600")),
        }
        
        # 機密情報のマスキング（ログ用）
        self._masked_config = self._mask_sensitive_values()
    
    def _mask_sensitive_values(self) -> Dict[str, Any]:
        """機密情報をマスキング"""
        sensitive_keys = [
            "SUPABASE_KEY", "JWT_SECRET_KEY", "OPENAI_API_KEY",
            "CONFIG_MASTER_KEY", "DATABASE_URL", "SECRET_KEY"
        ]
        
        masked = {}
        for key, value in self._config_cache.items():
            if key in sensitive_keys and value:
                # 最初と最後の4文字のみ表示
                if len(str(value)) > 8:
                    masked[key] = f"{str(value)[:4]}...{str(value)[-4:]}"
                else:
                    masked[key] = "***"
            else:
                masked[key] = value
        
        return masked
    
    def get(self, key: str, default: Optional[Any] = None) -> Any:
        """設定値を取得"""
        # アクセスログを記録
        self._log_access(key)
        
        value = self._config_cache.get(key, default)
        
        # 本番環境で必須の環境変数が設定されていない場合は警告
        if self.is_production() and value == default and key in self._get_required_keys():
            logger.warning(f"Required environment variable {key} is not set in production")
        
        return value
    
    def get_secure(self, key: str) -> Optional[str]:
        """暗号化された設定値を取得して復号化"""
        encrypted_value = self.get(f"{key}_ENCRYPTED")
        if encrypted_value:
            try:
                return self._decrypt_value(encrypted_value)
            except Exception as e:
                logger.error(f"Failed to decrypt {key}: {e}")
                return None
        return self.get(key)
    
    def set_secure(self, key: str, value: str):
        """値を暗号化して設定"""
        encrypted_value = self._encrypt_value(value)
        self._config_cache[f"{key}_ENCRYPTED"] = encrypted_value
    
    def _log_access(self, key: str):
        """設定へのアクセスをログに記録"""
        access_entry = {
            "key": key,
            "timestamp": datetime.now().isoformat(),
            "masked": key in self._get_sensitive_keys()
        }
        self._access_log.append(access_entry)
        
        # 本番環境では機密情報へのアクセスを警告
        if self.is_production() and key in self._get_sensitive_keys():
            logger.info(f"Sensitive configuration accessed: {key}")
    
    def _get_required_keys(self) -> list:
        """本番環境で必須の環境変数リスト"""
        return [
            "SUPABASE_URL",
            "SUPABASE_KEY",
            "JWT_SECRET_KEY",
            "ALLOWED_ORIGINS"
        ]
    
    def _get_sensitive_keys(self) -> list:
        """機密情報を含む環境変数リスト"""
        return [
            "SUPABASE_KEY",
            "JWT_SECRET_KEY",
            "OPENAI_API_KEY",
            "DATABASE_URL",
            "SECRET_KEY",
            "CONFIG_MASTER_KEY"
        ]
    
    def is_production(self) -> bool:
        """本番環境かどうか"""
        return self.get("ENV") == "production"
    
    def is_development(self) -> bool:
        """開発環境かどうか"""
        return self.get("ENV") == "development"
    
    def validate_config(self) -> Dict[str, Any]:
        """設定の検証"""
        validation_results = {
            "valid": True,
            "errors": [],
            "warnings": []
        }
        
        # 必須環境変数のチェック
        if self.is_production():
            for key in self._get_required_keys():
                if not self.get(key):
                    validation_results["valid"] = False
                    validation_results["errors"].append(f"Required variable {key} is not set")
        
        # URLフォーマットの検証
        supabase_url = self.get("SUPABASE_URL")
        if supabase_url and not supabase_url.startswith(("http://", "https://")):
            validation_results["warnings"].append("SUPABASE_URL should start with http:// or https://")
        
        # JWTキーの長さチェック
        jwt_key = self.get("JWT_SECRET_KEY")
        if jwt_key and len(jwt_key) < 32:
            validation_results["warnings"].append("JWT_SECRET_KEY should be at least 32 characters long")
        
        return validation_results
    
    def get_config_summary(self) -> Dict[str, Any]:
        """設定のサマリーを取得（機密情報はマスク）"""
        return {
            "environment": self.get("ENV"),
            "debug": self.get("DEBUG"),
            "config": self._masked_config,
            "validation": self.validate_config(),
            "access_log_count": len(self._access_log)
        }
    
    def export_access_log(self, filepath: Optional[str] = None) -> str:
        """アクセスログをエクスポート"""
        log_data = {
            "export_time": datetime.now().isoformat(),
            "environment": self.get("ENV"),
            "access_log": self._access_log
        }
        
        if filepath:
            with open(filepath, "w") as f:
                json.dump(log_data, f, indent=2)
            return filepath
        else:
            return json.dumps(log_data, indent=2)


# シングルトンインスタンス
config = SecureConfig()


# 便利な関数
def get_config(key: str, default: Optional[Any] = None) -> Any:
    """設定値を取得"""
    return config.get(key, default)


def get_secure_config(key: str) -> Optional[str]:
    """暗号化された設定値を取得"""
    return config.get_secure(key)


def validate_config() -> Dict[str, Any]:
    """設定を検証"""
    return config.validate_config()


def is_production() -> bool:
    """本番環境かどうか"""
    return config.is_production()


def is_development() -> bool:
    """開発環境かどうか"""
    return config.is_development()