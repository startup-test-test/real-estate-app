"""
セキュリティヘッダーミドルウェア (SEC-079対応)
重要なHTTPセキュリティヘッダーを追加
"""

from fastapi import Request
from fastapi.responses import Response
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """セキュリティヘッダーを追加するミドルウェア"""
    
    def __init__(self, app, **options):
        """
        ミドルウェアの初期化
        
        Args:
            app: FastAPIアプリケーション
            **options: オプション設定
        """
        self.app = app
        self.options = options
        
        # デフォルトのセキュリティヘッダー
        self.default_headers = {
            # HSTS (HTTP Strict Transport Security)
            'Strict-Transport-Security': options.get(
                'hsts', 
                'max-age=31536000; includeSubDomains'
            ),
            
            # X-Content-Type-Options
            'X-Content-Type-Options': 'nosniff',
            
            # X-Frame-Options
            'X-Frame-Options': options.get('x_frame_options', 'DENY'),
            
            # X-XSS-Protection (レガシーブラウザ向け)
            'X-XSS-Protection': '1; mode=block',
            
            # Referrer-Policy
            'Referrer-Policy': options.get(
                'referrer_policy',
                'strict-origin-when-cross-origin'
            ),
            
            # Permissions-Policy (Feature-Policyの後継)
            'Permissions-Policy': options.get(
                'permissions_policy',
                'geolocation=(), microphone=(), camera=()'
            ),
            
            # Content-Security-Policy
            'Content-Security-Policy': options.get(
                'csp',
                self._get_default_csp()
            ),
            
            # X-Permitted-Cross-Domain-Policies
            'X-Permitted-Cross-Domain-Policies': 'none',
            
            # X-Download-Options (IE向け)
            'X-Download-Options': 'noopen',
            
            # Cache-Control (機密情報のキャッシュ防止)
            'Cache-Control': options.get(
                'cache_control',
                'no-store, no-cache, must-revalidate, private'
            )
        }
        
        # 環境に応じてHSTSを調整
        self.is_https_only = options.get('https_only', True)
        
    def _get_default_csp(self) -> str:
        """
        デフォルトのCSPポリシーを取得
        
        Returns:
            CSPポリシー文字列
        """
        return (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        リクエストを処理し、セキュリティヘッダーを追加
        
        Args:
            request: HTTPリクエスト
            call_next: 次のミドルウェア/ハンドラー
            
        Returns:
            セキュリティヘッダー付きレスポンス
        """
        # リクエストを処理
        response = await call_next(request)
        
        # セキュリティヘッダーを追加
        for header, value in self.default_headers.items():
            # HSTSはHTTPS接続時のみ
            if header == 'Strict-Transport-Security':
                # プロトコルを確認
                is_https = request.url.scheme == 'https'
                forwarded_proto = request.headers.get('X-Forwarded-Proto', '')
                
                if not (is_https or forwarded_proto == 'https'):
                    continue  # HTTPSでない場合はHSTSを追加しない
            
            # ヘッダーが既に設定されていない場合のみ追加
            if header not in response.headers:
                response.headers[header] = value
        
        # セキュリティ関連の不要なヘッダーを削除
        headers_to_remove = ['Server', 'X-Powered-By']
        for header in headers_to_remove:
            if header in response.headers:
                del response.headers[header]
        
        return response

def get_security_headers_config(environment: str = 'production') -> dict:
    """
    環境に応じたセキュリティヘッダー設定を取得
    
    Args:
        environment: 環境名 (production, development, etc.)
        
    Returns:
        セキュリティヘッダー設定
    """
    if environment == 'development':
        return {
            'hsts': 'max-age=0',  # 開発環境ではHSTSを無効化
            'x_frame_options': 'SAMEORIGIN',  # 開発ツール用に緩和
            'csp': (
                "default-src 'self' http://localhost:* ws://localhost:*; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: http: https:; "
                "connect-src 'self' http://localhost:* ws://localhost:* https://*.supabase.co wss://*.supabase.co; "
                "frame-ancestors 'self' http://localhost:*"
            ),
            'cache_control': 'no-cache',
            'https_only': False
        }
    else:
        # 本番環境では厳格な設定
        return {
            'hsts': 'max-age=31536000; includeSubDomains; preload',
            'x_frame_options': 'DENY',
            'referrer_policy': 'strict-origin',
            'permissions_policy': (
                'accelerometer=(), ambient-light-sensor=(), autoplay=(), '
                'battery=(), camera=(), cross-origin-isolated=(), '
                'display-capture=(), document-domain=(), encrypted-media=(), '
                'execution-while-not-rendered=(), execution-while-out-of-viewport=(), '
                'fullscreen=(self), geolocation=(), gyroscope=(), keyboard-map=(), '
                'magnetometer=(), microphone=(), midi=(), navigation-override=(), '
                'payment=(), picture-in-picture=(), publickey-credentials-get=(), '
                'screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), '
                'xr-spatial-tracking=()'
            ),
            'cache_control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
            'https_only': True
        }

# レスポンスヘッダーのセキュリティチェック関数
def validate_security_headers(headers: dict) -> dict:
    """
    レスポンスヘッダーのセキュリティをチェック
    
    Args:
        headers: チェックするヘッダー
        
    Returns:
        チェック結果
    """
    issues = []
    recommendations = []
    
    # 必須セキュリティヘッダーのチェック
    required_headers = {
        'Strict-Transport-Security': 'HSTSが設定されていません',
        'X-Content-Type-Options': 'MIMEタイプスニッフィング防止が設定されていません',
        'X-Frame-Options': 'クリックジャッキング防止が設定されていません',
        'Content-Security-Policy': 'CSPが設定されていません'
    }
    
    for header, message in required_headers.items():
        if header not in headers:
            issues.append(message)
            
    # 推奨セキュリティヘッダーのチェック
    recommended_headers = {
        'Referrer-Policy': 'Referrer-Policyの設定を推奨します',
        'Permissions-Policy': 'Permissions-Policyの設定を推奨します'
    }
    
    for header, message in recommended_headers.items():
        if header not in headers:
            recommendations.append(message)
    
    # 危険なヘッダーのチェック
    dangerous_headers = ['Server', 'X-Powered-By', 'X-AspNet-Version']
    for header in dangerous_headers:
        if header in headers:
            issues.append(f'{header}ヘッダーが露出しています')
    
    return {
        'secure': len(issues) == 0,
        'issues': issues,
        'recommendations': recommendations
    }