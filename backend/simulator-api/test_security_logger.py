"""
security_logger.pyのユニットテスト
"""

import os
import json
import pytest
from pathlib import Path
from datetime import datetime
from security_logger import SecurityLogger


class TestSecurityLogger:
    """SecurityLoggerクラスのテスト"""
    
    @pytest.fixture
    def temp_log_dir(self, tmp_path):
        """一時的なログディレクトリ"""
        return tmp_path / "test_logs"
    
    @pytest.fixture
    def logger(self, temp_log_dir):
        """テスト用SecurityLoggerインスタンス"""
        return SecurityLogger(name="test_security", log_dir=str(temp_log_dir))
    
    def test_log_authentication_attempt_success(self, logger):
        """認証成功ログのテスト"""
        logger.log_authentication_attempt(
            user_id="test_user",
            success=True,
            ip_address="192.168.1.100",
            user_agent="Mozilla/5.0 Test",
            additional_info={"method": "password"}
        )
        
        # ログファイルの確認
        log_file = Path(logger.log_dir) / "security_events.log"
        assert log_file.exists()
        
        with open(log_file, 'r') as f:
            log_content = f.read()
            assert "authentication_attempt" in log_content
            assert "test_user" in log_content
            assert "192.168.*.100" in log_content  # IPマスキング確認
    
    def test_log_authentication_attempt_failure(self, logger):
        """認証失敗ログのテスト"""
        logger.log_authentication_attempt(
            user_id="test_user",
            success=False,
            ip_address="10.0.0.1",
            user_agent="Suspicious Bot",
            additional_info={"reason": "invalid_password"}
        )
        
        # アラートログファイルの確認
        alert_file = Path(logger.log_dir) / "security_alerts.log"
        assert alert_file.exists()
    
    def test_sensitive_data_sanitization(self, logger):
        """機密情報のサニタイズテスト"""
        logger.log_suspicious_activity(
            activity_type="data_leak_attempt",
            details={
                "password": "secret123",
                "api_key": "sk-1234567890",
                "normal_data": "visible",
                "token": "eyJ0eXAiOiJKV1QiLCJhbGc"
            },
            user_id="attacker"
        )
        
        log_file = Path(logger.log_dir) / "security_events.log"
        with open(log_file, 'r') as f:
            log_content = f.read()
            # 機密情報がマスクされていることを確認
            assert "secret123" not in log_content
            assert "sk-1234567890" not in log_content
            assert "visible" in log_content
            assert "***" in log_content
    
    def test_ip_address_masking(self, logger):
        """IPアドレスマスキングのテスト"""
        test_cases = [
            ("192.168.1.100", "192.168.*.100"),
            ("10.0.0.1", "10.0.*.1"),
            ("127.0.0.1", "127.0.*.1"),
        ]
        
        for original_ip, masked_ip in test_cases:
            logger.log_data_access(
                user_id="test_user",
                resource_type="property",
                resource_id="123",
                action="read",
                success=True
            )
            
            # IPマスキングのテスト（内部メソッド）
            masked = logger._mask_ip(original_ip)
            assert masked == masked_ip
    
    def test_log_authorization_failure(self, logger):
        """認可失敗ログのテスト"""
        logger.log_authorization_failure(
            user_id="unauthorized_user",
            resource="/api/admin",
            permission="ADMIN_ACCESS",
            ip_address="192.168.1.50"
        )
        
        alert_file = Path(logger.log_dir) / "security_alerts.log"
        assert alert_file.exists()
    
    def test_log_security_config_change(self, logger):
        """セキュリティ設定変更ログのテスト"""
        logger.log_security_config_change(
            changed_by="admin_user",
            change_type="password_policy",
            old_value={"min_length": 8},
            new_value={"min_length": 12}
        )
        
        log_file = Path(logger.log_dir) / "security_events.log"
        with open(log_file, 'r') as f:
            log_content = f.read()
            assert "security_config_change" in log_content
            assert "password_policy" in log_content
    
    def test_log_security_scan_result(self, logger):
        """セキュリティスキャン結果ログのテスト"""
        logger.log_security_scan_result(
            scan_type="vulnerability_scan",
            results={
                "threats_found": 2,
                "vulnerabilities": ["SQL Injection", "XSS"]
            }
        )
        
        # 脅威が見つかった場合はアラートログに記録
        alert_file = Path(logger.log_dir) / "security_alerts.log"
        assert alert_file.exists()
    
    def test_get_recent_events(self, logger):
        """最近のイベント取得テスト"""
        # いくつかのイベントをログに記録
        for i in range(5):
            logger.log_authentication_attempt(
                user_id=f"user_{i}",
                success=True,
                ip_address="127.0.0.1",
                user_agent="Test"
            )
        
        # 最近のイベントを取得
        events = logger.get_recent_events(limit=3)
        assert len(events) <= 3
        
        # 特定のイベントタイプでフィルタ
        auth_events = logger.get_recent_events(
            event_type="authentication_attempt",
            limit=10
        )
        assert all(e["event_type"] == "authentication_attempt" for e in auth_events)
    
    def test_log_file_permissions(self, logger):
        """ログファイルのパーミッションテスト"""
        if os.name != 'nt':  # Unix系OSの場合のみ
            log_dir_path = Path(logger.log_dir)
            # ディレクトリのパーミッションが700であることを確認
            dir_stat = log_dir_path.stat()
            assert oct(dir_stat.st_mode)[-3:] == "700"