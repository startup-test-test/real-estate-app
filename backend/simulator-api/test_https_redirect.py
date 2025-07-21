"""
HTTPSリダイレクトミドルウェアのテスト
"""

import pytest
from fastapi import FastAPI, Request
from starlette.testclient import TestClient
from unittest.mock import patch

from https_redirect import HTTPSRedirectMiddleware, check_https_config


# テスト用のFastAPIアプリケーション
def create_test_app(force_https: bool = True) -> FastAPI:
    """テスト用アプリケーションを作成"""
    app = FastAPI()
    
    # HTTPSリダイレクトミドルウェアを追加
    app.add_middleware(HTTPSRedirectMiddleware, force_https=force_https)
    
    @app.get("/")
    async def root():
        return {"message": "Hello World"}
    
    @app.get("/test")
    async def test():
        return {"test": "success"}
    
    @app.get("/https-status")
    async def https_status(request: Request):
        return check_https_config(request)
    
    return app


class TestHTTPSRedirectMiddleware:
    """HTTPSリダイレクトミドルウェアのテスト"""

    def test_http_to_https_redirect(self):
        """HTTPからHTTPSへのリダイレクトテスト"""
        app = create_test_app(force_https=True)
        client = TestClient(app)
        
        # HTTPリクエストを送信
        response = client.get("/", follow_redirects=False)
        
        # リダイレクトされることを確認
        assert response.status_code == 308
        assert response.headers["location"].startswith("https://")
        assert response.headers["location"].endswith("/")

    def test_https_no_redirect(self):
        """HTTPS接続では リダイレクトしないことをテスト"""
        app = create_test_app(force_https=True)
        client = TestClient(app)
        
        # HTTPSリクエストをシミュレート（X-Forwarded-Protoヘッダーを使用）
        response = client.get("/", headers={"X-Forwarded-Proto": "https"})
        
        # リダイレクトされないことを確認
        assert response.status_code == 200
        assert response.json() == {"message": "Hello World"}

    def test_hsts_header_on_https(self):
        """HTTPS接続でHSTSヘッダーが設定されることをテスト"""
        app = create_test_app(force_https=True)
        client = TestClient(app)
        
        # HTTPSリクエストをシミュレート
        response = client.get("/", headers={"X-Forwarded-Proto": "https"})
        
        # HSTSヘッダーが設定されていることを確認
        assert "Strict-Transport-Security" in response.headers
        hsts_header = response.headers["Strict-Transport-Security"]
        assert "max-age=" in hsts_header
        assert "includeSubDomains" in hsts_header
        assert "preload" in hsts_header

    def test_no_hsts_header_on_http(self):
        """HTTP接続でHSTSヘッダーが設定されないことをテスト"""
        app = create_test_app(force_https=True)
        client = TestClient(app)
        
        # HTTPリクエストを送信（リダイレクトを無効化）
        response = client.get("/", follow_redirects=False)
        
        # HSTSヘッダーが設定されていないことを確認
        assert "Strict-Transport-Security" not in response.headers

    def test_cloudflare_https_detection(self):
        """CloudflareのHTTPS検出テスト"""
        app = create_test_app(force_https=True)
        client = TestClient(app)
        
        # CloudflareのCF-Visitorヘッダーを使用
        response = client.get("/", headers={
            "CF-Visitor": '{"scheme":"https","request_headers":{"Accept":"*/*"}}'
        })
        
        # リダイレクトされないことを確認
        assert response.status_code == 200
        assert response.json() == {"message": "Hello World"}

    def test_query_params_preserved(self):
        """クエリパラメータが保持されることをテスト"""
        app = create_test_app(force_https=True)
        client = TestClient(app)
        
        # クエリパラメータ付きのHTTPリクエスト
        response = client.get("/test?param1=value1&param2=value2", follow_redirects=False)
        
        # リダイレクトURLにクエリパラメータが含まれることを確認
        assert response.status_code == 308
        location = response.headers["location"]
        assert "https://" in location
        assert "param1=value1" in location
        assert "param2=value2" in location

    def test_force_https_disabled(self):
        """HTTPS強制が無効の場合のテスト"""
        app = create_test_app(force_https=False)
        client = TestClient(app)
        
        # HTTPリクエストを送信
        response = client.get("/")
        
        # リダイレクトされないことを確認
        assert response.status_code == 200
        assert response.json() == {"message": "Hello World"}

    @patch('https_redirect.ALLOWED_HOSTS', ['example.com', 'www.example.com'])
    def test_host_header_validation(self):
        """ホストヘッダー検証のテスト"""
        app = create_test_app(force_https=True)
        client = TestClient(app)
        
        # 不正なホストヘッダーでリクエスト
        response = client.get("/", headers={"Host": "evil.com"}, follow_redirects=False)
        
        # リダイレクトされるが、ホストが制限されることを確認
        assert response.status_code == 308
        location = response.headers["location"]
        assert "example.com" in location  # デフォルトホストが使用される

    def test_redirect_code_configuration(self):
        """リダイレクトコードの設定テスト"""
        app = FastAPI()
        app.add_middleware(HTTPSRedirectMiddleware, force_https=True, redirect_code=301)
        
        @app.get("/")
        async def root():
            return {"message": "Hello"}
        
        client = TestClient(app)
        response = client.get("/", follow_redirects=False)
        
        # 301リダイレクトコードが使用されることを確認
        assert response.status_code == 301


class TestCheckHTTPSConfig:
    """check_https_config関数のテスト"""

    def test_check_https_config_http(self):
        """HTTP接続の設定チェック"""
        app = create_test_app()
        client = TestClient(app)
        
        response = client.get("/https-status")
        data = response.json()
        
        assert data["url_scheme"] == "http"
        assert data["is_secure"] is False
        assert data["force_https_enabled"] is True

    def test_check_https_config_https(self):
        """HTTPS接続の設定チェック"""
        app = create_test_app()
        client = TestClient(app)
        
        response = client.get("/https-status", headers={"X-Forwarded-Proto": "https"})
        data = response.json()
        
        assert data["forwarded_proto"] == "https"
        assert data["is_secure"] is True
        assert data["hsts_enabled"] is True
        assert data["hsts_max_age"] is not None

    def test_check_https_config_cloudflare(self):
        """Cloudflare経由の設定チェック"""
        app = create_test_app()
        client = TestClient(app)
        
        response = client.get("/https-status", headers={
            "CF-Visitor": '{"scheme":"https"}'
        })
        data = response.json()
        
        assert data["cloudflare_https"] is True
        assert data["is_secure"] is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])