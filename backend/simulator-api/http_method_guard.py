"""
SEC-082: HTTPメソッド制限の不備対策
各エンドポイントで許可されたHTTPメソッドのみを受け入れるガード
"""

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class HTTPMethodGuard:
    """HTTPメソッド制限を強制するガードクラス"""
    
    def __init__(self):
        # 各エンドポイントで許可されるメソッドの定義
        self.allowed_methods = {
            "/": ["GET", "HEAD"],
            "/api/auth/token": ["POST"],
            "/api/auth/me": ["GET", "HEAD"],
            "/api/simulate": ["POST"],
            "/api/market-analysis": ["POST"],
            "/docs": ["GET", "HEAD"],
            "/openapi.json": ["GET", "HEAD"],
            "/redoc": ["GET", "HEAD"]
        }
        
        # デフォルトで許可するメソッド（静的ファイルなど）
        self.default_allowed_methods = ["GET", "HEAD", "OPTIONS"]
        
        # 完全にブロックする危険なメソッド
        self.dangerous_methods = ["TRACE", "TRACK", "CONNECT"]
    
    def check_method(self, path: str, method: str) -> bool:
        """
        指定されたパスとメソッドの組み合わせが許可されているかチェック
        
        Args:
            path: リクエストパス
            method: HTTPメソッド
            
        Returns:
            bool: 許可されている場合True
        """
        # 危険なメソッドは常にブロック
        if method in self.dangerous_methods:
            logger.warning(f"Dangerous HTTP method blocked: {method} {path}")
            return False
        
        # OPTIONSメソッドは常に許可（CORS対応）
        if method == "OPTIONS":
            return True
        
        # パスの正規化（末尾のスラッシュを除去）
        normalized_path = path.rstrip("/") if path != "/" else path
        
        # 完全一致でチェック
        if normalized_path in self.allowed_methods:
            allowed = self.allowed_methods[normalized_path]
            return method in allowed
        
        # プレフィックスマッチでチェック
        for pattern, methods in self.allowed_methods.items():
            if normalized_path.startswith(pattern):
                return method in methods
        
        # デフォルトの許可メソッドをチェック
        return method in self.default_allowed_methods
    
    def get_allowed_methods(self, path: str) -> List[str]:
        """
        指定されたパスで許可されているメソッドのリストを取得
        
        Args:
            path: リクエストパス
            
        Returns:
            List[str]: 許可されているメソッドのリスト
        """
        normalized_path = path.rstrip("/") if path != "/" else path
        
        if normalized_path in self.allowed_methods:
            return self.allowed_methods[normalized_path] + ["OPTIONS"]
        
        # プレフィックスマッチ
        for pattern, methods in self.allowed_methods.items():
            if normalized_path.startswith(pattern):
                return methods + ["OPTIONS"]
        
        return self.default_allowed_methods


# シングルトンインスタンス
method_guard = HTTPMethodGuard()


async def http_method_middleware(request: Request, call_next):
    """
    HTTPメソッドを制限するミドルウェア
    
    Args:
        request: HTTPリクエスト
        call_next: 次のミドルウェア
        
    Returns:
        Response: HTTPレスポンス
    """
    method = request.method
    path = request.url.path
    
    # メソッドが許可されているかチェック
    if not method_guard.check_method(path, method):
        allowed_methods = method_guard.get_allowed_methods(path)
        
        # CORSヘッダーを準備
        cors_headers = {
            "Allow": ", ".join(allowed_methods),
            "X-Content-Type-Options": "nosniff"
        }
        
        # オリジンをチェックしてCORSヘッダーを追加
        origin = request.headers.get("origin")
        if origin:
            # 簡易的なオリジンチェック（GitHubとRenderのドメインを許可）
            allowed_patterns = [
                "localhost",
                "127.0.0.1",
                ".app.github.dev",
                ".onrender.com"
            ]
            
            is_allowed = any(pattern in origin for pattern in allowed_patterns)
            if is_allowed:
                cors_headers["Access-Control-Allow-Origin"] = origin
                cors_headers["Access-Control-Allow-Credentials"] = "true"
                cors_headers["Access-Control-Allow-Methods"] = ", ".join(allowed_methods)
                cors_headers["Access-Control-Allow-Headers"] = "*"
        
        # 405 Method Not Allowedを返す
        return JSONResponse(
            status_code=405,
            content={
                "error": "METHOD_NOT_ALLOWED",
                "message": f"Method {method} not allowed for {path}",
                "allowed_methods": allowed_methods
            },
            headers=cors_headers
        )
    
    # リクエストを処理
    response = await call_next(request)
    
    # レスポンスヘッダーにセキュリティヘッダーを追加
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    return response


def validate_http_method(method: str, allowed: List[str]) -> None:
    """
    HTTPメソッドを検証するヘルパー関数
    
    Args:
        method: リクエストメソッド
        allowed: 許可されたメソッドのリスト
        
    Raises:
        HTTPException: メソッドが許可されていない場合
    """
    if method not in allowed:
        raise HTTPException(
            status_code=405,
            detail={
                "error": "METHOD_NOT_ALLOWED",
                "message": f"Method {method} not allowed",
                "allowed_methods": allowed
            },
            headers={
                "Allow": ", ".join(allowed)
            }
        )