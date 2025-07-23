"""
uvicorn_config.pyのユニットテスト
"""

import os
import pytest
from unittest.mock import patch
from uvicorn_config import UvicornConfig, get_safe_uvicorn_kwargs


class TestUvicornConfig:
    """UvicornConfigクラスのテスト"""
    
    def test_development_host_binding(self):
        """開発環境でのホストバインディングテスト"""
        with patch.dict(os.environ, {"ENVIRONMENT": "development"}, clear=True):
            config = UvicornConfig()
            assert config.get_host() == "0.0.0.0"
            assert config.is_production is False
    
    def test_production_host_binding(self):
        """本番環境でのホストバインディングテスト"""
        with patch.dict(os.environ, {"ENVIRONMENT": "production"}, clear=True):
            config = UvicornConfig()
            assert config.get_host() == "127.0.0.1"
            assert config.is_production is True
    
    def test_custom_host_override(self):
        """カスタムホスト設定のテスト"""
        with patch.dict(os.environ, {"UVICORN_HOST": "192.168.1.100"}):
            config = UvicornConfig()
            assert config.get_host() == "192.168.1.100"
    
    def test_port_configuration(self):
        """ポート設定のテスト"""
        # デフォルトポート
        config = UvicornConfig()
        assert config.get_port() == 8000
        
        # 環境変数からのポート
        with patch.dict(os.environ, {"PORT": "3000"}):
            assert config.get_port() == 3000
        
        with patch.dict(os.environ, {"UVICORN_PORT": "5000"}):
            assert config.get_port() == 5000
    
    def test_workers_configuration(self):
        """ワーカー数設定のテスト"""
        config = UvicornConfig()
        
        # 開発環境ではワーカーなし
        with patch.dict(os.environ, {"ENVIRONMENT": "development"}):
            config = UvicornConfig()
            assert config.get_workers() is None
        
        # 本番環境ではワーカー設定あり
        with patch.dict(os.environ, {"ENVIRONMENT": "production"}):
            config = UvicornConfig()
            workers = config.get_workers()
            assert workers is not None
            assert 1 <= workers <= 8
    
    def test_reload_configuration(self):
        """自動リロード設定のテスト"""
        # 開発環境では有効
        with patch.dict(os.environ, {"ENVIRONMENT": "development"}):
            config = UvicornConfig()
            assert config.get_reload() is True
        
        # 本番環境では無効
        with patch.dict(os.environ, {"ENVIRONMENT": "production"}):
            config = UvicornConfig()
            assert config.get_reload() is False
    
    def test_ssl_configuration(self):
        """SSL設定のテスト"""
        config = UvicornConfig()
        
        # SSL設定なし
        ssl_config = config.get_ssl_config()
        assert ssl_config == {}
        
        # SSL設定あり
        with patch.dict(os.environ, {
            "SSL_KEYFILE": "/path/to/key.pem",
            "SSL_CERTFILE": "/path/to/cert.pem"
        }):
            ssl_config = config.get_ssl_config()
            assert ssl_config["ssl_keyfile"] == "/path/to/key.pem"
            assert ssl_config["ssl_certfile"] == "/path/to/cert.pem"
            assert "ssl_ciphers" in ssl_config
    
    def test_production_config_validation(self):
        """本番環境設定の検証テスト"""
        with patch.dict(os.environ, {"ENVIRONMENT": "production"}, clear=True):
            # 新しいインスタンスを作成
            
            # 0.0.0.0バインドで警告
            with patch.dict(os.environ, {"ENVIRONMENT": "production", "UVICORN_HOST": "0.0.0.0"}):
                config = UvicornConfig()
                assert config.validate_config() is False
            
            # 127.0.0.1バインドでもSSLなしで警告
            with patch.dict(os.environ, {"ENVIRONMENT": "production", "UVICORN_HOST": "127.0.0.1"}):
                config = UvicornConfig()
                assert config.validate_config() is False  # SSLなしなのでFalse
    
    def test_get_safe_uvicorn_kwargs(self):
        """安全なUvicornパラメータ取得のテスト"""
        with patch.dict(os.environ, {"ENVIRONMENT": "development"}, clear=True):
            config = UvicornConfig()
            kwargs = get_safe_uvicorn_kwargs()
            assert "host" in kwargs
            assert "port" in kwargs
            assert "reload" in kwargs
            assert kwargs["reload"] is True
        
        with patch.dict(os.environ, {"ENVIRONMENT": "production"}, clear=True):
            config = UvicornConfig()
            kwargs = get_safe_uvicorn_kwargs()
            assert kwargs["reload"] is False
            assert "proxy_headers" in kwargs
            assert kwargs["proxy_headers"] is True