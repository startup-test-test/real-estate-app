"""
セキュリティヘッダーのテスト (SEC-079)
"""

import pytest
from fastapi.testclient import TestClient
from app import app
from security_headers import validate_security_headers, get_security_headers_config

client = TestClient(app)

class TestSecurityHeaders:
    """セキュリティヘッダーのテスト"""
    
    def test_security_headers_on_get_request(self):
        """GETリクエストでセキュリティヘッダーが追加されるか"""
        response = client.get("/")
        
        # 必須セキュリティヘッダーの確認
        assert 'X-Content-Type-Options' in response.headers
        assert response.headers['X-Content-Type-Options'] == 'nosniff'
        
        assert 'X-Frame-Options' in response.headers
        assert response.headers['X-Frame-Options'] in ['DENY', 'SAMEORIGIN']
        
        assert 'X-XSS-Protection' in response.headers
        assert response.headers['X-XSS-Protection'] == '1; mode=block'
        
        # 追加のセキュリティヘッダー
        assert 'Referrer-Policy' in response.headers
        assert 'Permissions-Policy' in response.headers
        assert 'Content-Security-Policy' in response.headers
        
        # 危険なヘッダーが削除されているか
        assert 'Server' not in response.headers
        assert 'X-Powered-By' not in response.headers
    
    def test_security_headers_on_post_request(self):
        """POSTリクエストでセキュリティヘッダーが追加されるか"""
        # 認証なしでアクセス（401エラーが返るが、ヘッダーは確認できる）
        response = client.post("/api/simulate", json={})
        
        # エラーレスポンスでもセキュリティヘッダーが含まれる
        assert 'X-Content-Type-Options' in response.headers
        assert 'X-Frame-Options' in response.headers
        assert 'Cache-Control' in response.headers
    
    def test_hsts_header_not_on_http(self):
        """HTTP接続ではHSTSヘッダーが追加されないことを確認"""
        # TestClientはデフォルトでHTTPを使用
        response = client.get("/")
        
        # 開発環境ではHSTSが無効またはmax-age=0
        if 'Strict-Transport-Security' in response.headers:
            assert 'max-age=0' in response.headers['Strict-Transport-Security']
    
    def test_csp_header_content(self):
        """CSPヘッダーの内容を確認"""
        response = client.get("/")
        
        csp = response.headers.get('Content-Security-Policy', '')
        
        # 基本的なディレクティブが含まれているか
        assert "default-src" in csp
        assert "script-src" in csp
        assert "style-src" in csp
        assert "frame-ancestors" in csp
    
    def test_cache_control_header(self):
        """Cache-Controlヘッダーが適切に設定されているか"""
        response = client.get("/")
        
        cache_control = response.headers.get('Cache-Control', '')
        
        # キャッシュを無効化する設定が含まれているか
        assert 'no-store' in cache_control or 'no-cache' in cache_control
    
    def test_permissions_policy_header(self):
        """Permissions-Policyヘッダーが適切に設定されているか"""
        response = client.get("/")
        
        permissions = response.headers.get('Permissions-Policy', '')
        
        # 危険な機能が無効化されているか
        assert 'geolocation=()' in permissions or 'geolocation=' in permissions
        assert 'microphone=()' in permissions or 'microphone=' in permissions
        assert 'camera=()' in permissions or 'camera=' in permissions

class TestSecurityHeadersValidation:
    """セキュリティヘッダー検証関数のテスト"""
    
    def test_validate_secure_headers(self):
        """安全なヘッダーセットの検証"""
        headers = {
            'Strict-Transport-Security': 'max-age=31536000',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Content-Security-Policy': "default-src 'self'",
            'Referrer-Policy': 'strict-origin',
            'Permissions-Policy': 'geolocation=()'
        }
        
        result = validate_security_headers(headers)
        
        assert result['secure'] is True
        assert len(result['issues']) == 0
    
    def test_validate_missing_headers(self):
        """必須ヘッダーが不足している場合の検証"""
        headers = {
            'X-Content-Type-Options': 'nosniff'
        }
        
        result = validate_security_headers(headers)
        
        assert result['secure'] is False
        assert len(result['issues']) > 0
        assert any('HSTS' in issue for issue in result['issues'])
        assert any('CSP' in issue for issue in result['issues'])
    
    def test_validate_dangerous_headers(self):
        """危険なヘッダーが含まれている場合の検証"""
        headers = {
            'Strict-Transport-Security': 'max-age=31536000',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Content-Security-Policy': "default-src 'self'",
            'Server': 'Apache/2.4.41',  # 危険：バージョン情報の露出
            'X-Powered-By': 'PHP/7.4.0'  # 危険：技術スタックの露出
        }
        
        result = validate_security_headers(headers)
        
        assert result['secure'] is False
        assert any('Server' in issue for issue in result['issues'])
        assert any('X-Powered-By' in issue for issue in result['issues'])

class TestSecurityHeadersConfig:
    """環境別セキュリティヘッダー設定のテスト"""
    
    def test_development_config(self):
        """開発環境の設定テスト"""
        config = get_security_headers_config('development')
        
        # 開発環境では緩い設定
        assert config['hsts'] == 'max-age=0'
        assert config['x_frame_options'] == 'SAMEORIGIN'
        assert 'localhost' in config['csp']
        assert config['https_only'] is False
    
    def test_production_config(self):
        """本番環境の設定テスト"""
        config = get_security_headers_config('production')
        
        # 本番環境では厳格な設定
        assert 'max-age=31536000' in config['hsts']
        assert 'preload' in config['hsts']
        assert config['x_frame_options'] == 'DENY'
        assert config['referrer_policy'] == 'strict-origin'
        assert config['https_only'] is True
        
        # 多くの機能が無効化されている
        permissions = config['permissions_policy']
        assert 'geolocation=()' in permissions
        assert 'camera=()' in permissions
        assert 'microphone=()' in permissions

if __name__ == '__main__':
    pytest.main([__file__, '-v'])