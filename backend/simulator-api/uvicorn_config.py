"""
SEC-062: Uvicornセキュア設定
本番環境での安全なホストバインディング設定
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class UvicornConfig:
    """Uvicornの環境別設定"""
    
    def __init__(self):
        self.environment = os.getenv('ENVIRONMENT', os.getenv('ENV', 'development')).lower()
        self.is_production = self.environment in ('production', 'prod')
        
    def get_host(self) -> str:
        """
        環境に応じた適切なホストアドレスを返す
        
        Returns:
            str: ホストアドレス
        """
        # 環境変数から取得（デフォルトは環境依存）
        default_host = "127.0.0.1" if self.is_production else "0.0.0.0"
        host = os.getenv("UVICORN_HOST", default_host)
        
        # 本番環境での0.0.0.0バインドを警告
        if self.is_production and host == "0.0.0.0":
            logger.warning(
                "WARNING: Binding to 0.0.0.0 in production environment. "
                "Consider using 127.0.0.1 or specific interface address."
            )
        
        return host
    
    def get_port(self) -> int:
        """
        環境に応じたポート番号を返す
        
        Returns:
            int: ポート番号
        """
        # 環境変数から取得（デフォルト: 8000）
        return int(os.getenv("PORT", os.getenv("UVICORN_PORT", "8000")))
    
    def get_workers(self) -> Optional[int]:
        """
        ワーカー数を返す（本番環境のみ）
        
        Returns:
            Optional[int]: ワーカー数
        """
        if not self.is_production:
            return None
        
        # CPUコア数に基づいて計算
        import multiprocessing
        cpu_count = multiprocessing.cpu_count()
        default_workers = min(cpu_count * 2 + 1, 8)  # 最大8ワーカー
        
        return int(os.getenv("UVICORN_WORKERS", str(default_workers)))
    
    def get_reload(self) -> bool:
        """
        自動リロード設定を返す
        
        Returns:
            bool: 自動リロードの有効/無効
        """
        # 本番環境では常に無効
        if self.is_production:
            return False
        
        return os.getenv("UVICORN_RELOAD", "true").lower() == "true"
    
    def get_access_log(self) -> bool:
        """
        アクセスログ設定を返す
        
        Returns:
            bool: アクセスログの有効/無効
        """
        # デフォルト: 本番環境では有効
        default = self.is_production
        return os.getenv("UVICORN_ACCESS_LOG", str(default)).lower() == "true"
    
    def get_ssl_config(self) -> dict:
        """
        SSL設定を返す
        
        Returns:
            dict: SSL設定
        """
        ssl_config = {}
        
        # SSL証明書のパス
        ssl_keyfile = os.getenv("SSL_KEYFILE")
        ssl_certfile = os.getenv("SSL_CERTFILE")
        
        if ssl_keyfile and ssl_certfile:
            ssl_config["ssl_keyfile"] = ssl_keyfile
            ssl_config["ssl_certfile"] = ssl_certfile
            
            # SSL暗号スイート（セキュアな設定）
            ssl_config["ssl_ciphers"] = os.getenv(
                "SSL_CIPHERS",
                "TLSv1.2:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4"
            )
        
        return ssl_config
    
    def get_config(self) -> dict:
        """
        Uvicorn設定の完全な辞書を返す
        
        Returns:
            dict: Uvicorn設定
        """
        config = {
            "host": self.get_host(),
            "port": self.get_port(),
            "reload": self.get_reload(),
            "access_log": self.get_access_log(),
        }
        
        # ワーカー数（本番環境のみ）
        workers = self.get_workers()
        if workers:
            config["workers"] = workers
        
        # SSL設定
        ssl_config = self.get_ssl_config()
        config.update(ssl_config)
        
        # その他の設定
        if self.is_production:
            # 本番環境での追加設定
            config["proxy_headers"] = True  # X-Forwarded-*ヘッダーを信頼
            config["forwarded_allow_ips"] = "*"  # プロキシからの転送を許可
            config["server_header"] = False  # サーバーヘッダーを非表示
            config["date_header"] = False  # 日付ヘッダーを非表示
        
        return config
    
    def validate_config(self) -> bool:
        """
        設定の妥当性を検証
        
        Returns:
            bool: 設定が妥当な場合True
        """
        host = self.get_host()
        
        # 本番環境での推奨設定チェック
        if self.is_production:
            warnings = []
            
            if host == "0.0.0.0":
                warnings.append("Binding to 0.0.0.0 in production")
            
            if not self.get_ssl_config():
                warnings.append("SSL not configured in production")
            
            if warnings:
                logger.warning(
                    "Security warnings for production environment: %s",
                    ", ".join(warnings)
                )
                return False
        
        return True


def get_safe_uvicorn_kwargs() -> dict:
    """
    安全なUvicorn起動パラメータを取得
    
    Returns:
        dict: Uvicorn起動パラメータ
    """
    # 新しいインスタンスを作成（環境変数の変更に対応）
    uvicorn_config = UvicornConfig()
    config = uvicorn_config.get_config()
    
    # 設定を検証
    if not uvicorn_config.validate_config():
        logger.warning("Uvicorn configuration validation failed")
    
    logger.info(
        "Uvicorn configuration: host=%s, port=%d, workers=%s, ssl=%s",
        config["host"],
        config["port"],
        config.get("workers", 1),
        bool(config.get("ssl_keyfile"))
    )
    
    return config


# 使用例
if __name__ == "__main__":
    import json
    config = get_safe_uvicorn_kwargs()
    print("Uvicorn configuration:")
    print(json.dumps(config, indent=2))