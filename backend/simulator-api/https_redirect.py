"""
SEC-072: HTTPSリダイレクトミドルウェア
HTTP接続を自動的にHTTPSへリダイレクト
"""

import logging
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import RedirectResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os

logger = logging.getLogger(__name__)

# 環境変数から設定を取得
FORCE_HTTPS = os.getenv("FORCE_HTTPS", "true").lower() == "true"
HTTPS_REDIRECT_CODE = int(os.getenv("HTTPS_REDIRECT_CODE", "308"))  # 308: Permanent Redirect
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",") if os.getenv("ALLOWED_HOSTS") else []
HSTS_MAX_AGE = int(os.getenv("HSTS_MAX_AGE", "31536000"))  # 1年（秒）
HSTS_INCLUDE_SUBDOMAINS = os.getenv("HSTS_INCLUDE_SUBDOMAINS", "true").lower() == "true"
HSTS_PRELOAD = os.getenv("HSTS_PRELOAD", "true").lower() == "true"


class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """
    HTTPSリダイレクトミドルウェア
    HTTP接続をHTTPSへ自動的にリダイレクトし、セキュリティヘッダーを追加
    """

    def __init__(self, app, force_https: bool = None, redirect_code: int = None):
        """
        ミドルウェアの初期化

        Args:
            app: FastAPIアプリケーション
            force_https: HTTPSを強制するか（デフォルト: 環境変数から取得）
            redirect_code: リダイレクトコード（デフォルト: 308）
        """
        super().__init__(app)
        self.force_https = force_https if force_https is not None else FORCE_HTTPS
        self.redirect_code = redirect_code if redirect_code is not None else HTTPS_REDIRECT_CODE

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        リクエストを処理してHTTPSリダイレクトを実行

        Args:
            request: HTTPリクエスト
            call_next: 次のミドルウェア/ハンドラー

        Returns:
            Response: HTTPレスポンス
        """
        # 開発環境やHTTPS強制が無効の場合はスキップ
        if not self.force_https:
            return await call_next(request)

        # プロトコルを判定
        # X-Forwarded-Protoヘッダーをチェック（プロキシ経由の場合）
        forwarded_proto = request.headers.get("X-Forwarded-Proto", "").lower()
        
        # CloudflareのCF-Visitor ヘッダーもチェック
        cf_visitor = request.headers.get("CF-Visitor", "")
        is_https_cf = '"scheme":"https"' in cf_visitor
        
        # リクエストのURLスキームをチェック
        is_https = (
            request.url.scheme == "https" or 
            forwarded_proto == "https" or
            is_https_cf
        )

        # HTTPの場合はHTTPSへリダイレクト
        if not is_https:
            # ホストの検証（ホストヘッダーインジェクション対策）
            host = request.headers.get("Host", "")
            if ALLOWED_HOSTS and host not in ALLOWED_HOSTS:
                logger.warning("Invalid host header: %s", host)
                # 不正なホストの場合はデフォルトホストを使用
                host = ALLOWED_HOSTS[0] if ALLOWED_HOSTS else "localhost"

            # HTTPSのURLを構築
            https_url = request.url.replace(scheme="https")
            
            # クエリパラメータを保持
            if request.url.query:
                https_url = https_url.include_query_params(**dict(request.query_params))

            logger.info("Redirecting HTTP to HTTPS: %s -> %s", request.url, https_url)

            # リダイレクトレスポンスを返す
            return RedirectResponse(
                url=str(https_url),
                status_code=self.redirect_code
            )

        # HTTPS接続の場合は通常の処理を続行
        response = await call_next(request)

        # HSTS（HTTP Strict Transport Security）ヘッダーを追加
        if is_https:
            hsts_header = f"max-age={HSTS_MAX_AGE}"
            if HSTS_INCLUDE_SUBDOMAINS:
                hsts_header += "; includeSubDomains"
            if HSTS_PRELOAD:
                hsts_header += "; preload"
            
            response.headers["Strict-Transport-Security"] = hsts_header

        return response


def check_https_config(request: Request) -> dict:
    """
    HTTPS設定の状態をチェック

    Args:
        request: HTTPリクエスト

    Returns:
        dict: HTTPS設定の状態
    """
    forwarded_proto = request.headers.get("X-Forwarded-Proto", "").lower()
    cf_visitor = request.headers.get("CF-Visitor", "")
    is_https_cf = '"scheme":"https"' in cf_visitor

    return {
        "url_scheme": request.url.scheme,
        "forwarded_proto": forwarded_proto,
        "cloudflare_https": is_https_cf,
        "is_secure": request.url.scheme == "https" or forwarded_proto == "https" or is_https_cf,
        "force_https_enabled": FORCE_HTTPS,
        "hsts_enabled": FORCE_HTTPS,
        "hsts_max_age": HSTS_MAX_AGE if FORCE_HTTPS else None,
        "headers": {
            "Host": request.headers.get("Host", ""),
            "X-Forwarded-Proto": forwarded_proto,
            "CF-Visitor": cf_visitor
        }
    }


# ミドルウェアのファクトリ関数
def create_https_redirect_middleware(force_https: bool = None) -> type:
    """
    HTTPSリダイレクトミドルウェアを作成

    Args:
        force_https: HTTPSを強制するか

    Returns:
        HTTPSRedirectMiddleware: ミドルウェアクラス
    """
    class ConfiguredHTTPSRedirectMiddleware(HTTPSRedirectMiddleware):
        def __init__(self, app):
            super().__init__(app, force_https=force_https)
    
    return ConfiguredHTTPSRedirectMiddleware