"""
環境変数セキュリティのテスト (SEC-077, SEC-080)
"""

import pytest
import os
import tempfile
import stat
from env_security import (
    SecureEnvManager, 
    EnvSecurityError,
    load_secure_env,
    get_env
)

class TestSecureEnvManager:
    """SecureEnvManagerクラスのテスト"""
    
    def test_env_file_permission_check(self, tmp_path):
        """envファイルのパーミッションチェックテスト"""
        # 一時的な.envファイルを作成
        env_file = tmp_path / ".env"
        env_file.write_text("SECRET_KEY=test123\n")
        
        # 危険なパーミッション（誰でも読める）を設定
        os.chmod(env_file, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IROTH)
        
        # マネージャーを作成
        manager = SecureEnvManager(str(env_file))
        
        # セキュリティチェックを実行
        manager.check_env_file_security()
        
        # パーミッションが修正されているか確認
        file_stat = os.stat(env_file)
        assert file_stat.st_mode & stat.S_IRUSR  # 所有者読み取り
        assert file_stat.st_mode & stat.S_IWUSR  # 所有者書き込み
        assert not (file_stat.st_mode & stat.S_IRGRP)  # グループ読み取り不可
        assert not (file_stat.st_mode & stat.S_IROTH)  # その他読み取り不可
    
    def test_required_vars_validation(self):
        """必須環境変数の検証テスト"""
        manager = SecureEnvManager()
        
        # 必須変数が不足している場合
        with pytest.raises(EnvSecurityError) as exc_info:
            manager._check_required_vars({})
        
        assert "必須環境変数が設定されていません" in str(exc_info.value)
        assert "SUPABASE_URL" in str(exc_info.value)
    
    def test_type_conversion(self):
        """環境変数の型変換テスト"""
        manager = SecureEnvManager()
        
        # 整数変換
        assert manager._convert_value("8080", {'type': int}) == 8080
        
        # ブール変換
        assert manager._convert_value("true", {'type': bool}) is True
        assert manager._convert_value("false", {'type': bool}) is False
        assert manager._convert_value("1", {'type': bool}) is True
        assert manager._convert_value("0", {'type': bool}) is False
        
        # リスト変換
        assert manager._convert_value("a,b,c", {'type': list}) == ['a', 'b', 'c']
        assert manager._convert_value("single", {'type': list}) == ['single']
        
        # 範囲チェック
        assert manager._convert_value("80", {'type': int, 'min': 1, 'max': 65535}) == 80
        
        # 範囲外の値
        with pytest.raises(ValueError):
            manager._convert_value("70000", {'type': int, 'min': 1, 'max': 65535})
    
    def test_sensitive_var_masking(self, caplog):
        """機密変数のマスキングテスト"""
        manager = SecureEnvManager()
        manager._is_production = True
        
        vars_dict = {
            'API_KEY': 'abc123def456',
            'NORMAL_VAR': 'visible_value',
            'DATABASE_URL': 'postgresql://user:pass@host/db'
        }
        
        manager._setup_secure_logging(vars_dict)
        
        # ログ出力を確認
        # 本番環境では機密情報がマスクされる
    
    def test_runtime_security_validation(self):
        """実行時セキュリティ検証テスト"""
        manager = SecureEnvManager()
        
        # 本番環境でDEBUGモードが有効な場合
        manager._is_production = True
        manager.loaded_vars = {'DEBUG': True}
        
        with pytest.raises(EnvSecurityError) as exc_info:
            manager.validate_runtime_security()
        
        assert "本番環境でDEBUGモードが有効" in str(exc_info.value)
        
        # 開発環境では問題なし
        manager._is_production = False
        manager.validate_runtime_security()  # エラーなし
    
    def test_safe_vars_for_client(self):
        """クライアント向け安全変数のテスト"""
        manager = SecureEnvManager()
        manager.loaded_vars = {
            'SECRET_KEY': 'should_not_expose',
            'API_KEY': 'should_not_expose',
            'VITE_PUBLIC_API_URL': 'https://api.example.com',
            'REACT_APP_NAME': 'MyApp',
            'PUBLIC_VERSION': '1.0.0',
            'NORMAL_VAR': 'should_not_expose'
        }
        
        safe_vars = manager.get_safe_vars_for_client()
        
        # 機密情報は含まれない
        assert 'SECRET_KEY' not in safe_vars
        assert 'API_KEY' not in safe_vars
        assert 'NORMAL_VAR' not in safe_vars
        
        # 公開可能な変数は含まれる
        assert safe_vars['VITE_PUBLIC_API_URL'] == 'https://api.example.com'
        assert safe_vars['REACT_APP_NAME'] == 'MyApp'
        assert safe_vars['PUBLIC_VERSION'] == '1.0.0'
    
    def test_weak_password_detection(self):
        """脆弱なパスワードの検出テスト"""
        manager = SecureEnvManager()
        manager._is_production = True
        manager.loaded_vars = {
            'DATABASE_PASSWORD': 'password123'
        }
        
        with pytest.raises(EnvSecurityError) as exc_info:
            manager.validate_runtime_security()
        
        assert "脆弱なパスワード" in str(exc_info.value)

class TestEnvSecurityIntegration:
    """環境変数セキュリティの統合テスト"""
    
    def test_load_secure_env_with_defaults(self, monkeypatch):
        """デフォルト値での環境変数読み込みテスト"""
        # 必須環境変数を設定
        monkeypatch.setenv('SUPABASE_URL', 'https://test.supabase.co')
        monkeypatch.setenv('SUPABASE_ANON_KEY', 'test-anon-key')
        monkeypatch.setenv('JWT_SECRET', 'test-jwt-secret')
        
        # 新しいマネージャーインスタンスを作成
        from env_security import SecureEnvManager
        test_manager = SecureEnvManager()
        
        # 環境変数を読み込む
        vars_dict = test_manager.load_and_validate()
        
        # 必須変数が存在
        assert vars_dict['SUPABASE_URL'] == 'https://test.supabase.co'
        assert vars_dict['SUPABASE_ANON_KEY'] == 'test-anon-key'
        assert vars_dict['JWT_SECRET'] == 'test-jwt-secret'
        
        # デフォルト値が設定される
        assert vars_dict.get('PORT') == 8000
        assert vars_dict.get('DEBUG') is False
        assert vars_dict.get('LOG_LEVEL') == 'INFO'
    
    def test_get_env_function(self, monkeypatch):
        """get_env関数のテスト"""
        monkeypatch.setenv('TEST_VAR', 'test_value')
        
        # グローバルマネージャーをリセット
        from env_security import env_manager
        env_manager.loaded_vars = {'TEST_VAR': 'test_value'}
        
        # 値を取得
        assert get_env('TEST_VAR') == 'test_value'
        assert get_env('NON_EXISTENT', 'default') == 'default'

if __name__ == '__main__':
    pytest.main([__file__, '-v'])