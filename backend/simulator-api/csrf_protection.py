"""
CSRFトークン保護機能の実装
Cross-Site Request Forgery (CSRF) 攻撃から保護するための包括的な実装
"""

import os
import secrets
import hmac
import hashlib
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Optional, Tuple, Any
from dataclasses import dataclass
import base64

from fastapi import Request, HTTPException, Form
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

# CSRF設定
CSRF_TOKEN_LENGTH = 32  # 256ビットのトークン
CSRF_TOKEN_LIFETIME_MINUTES = 60  # トークンの有効期限（分）
CSRF_HEADER_NAME = "X-CSRF-Token"
CSRF_COOKIE_NAME = "csrf_token"
CSRF_FIELD_NAME = "_csrf_token"
CSRF_SECRET_KEY = secrets.token_urlsafe(32)  # 本番環境では環境変数から取得

# 安全なHTTPメソッド（CSRF保護不要）
SAFE_METHODS = {"GET", "HEAD", "OPTIONS", "TRACE"}


@dataclass
class CSRFToken:
    """CSRFトークンデータ"""
    token: str
    created_at: datetime
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

    def is_expired(self) -> bool:
        """トークンが期限切れかチェック"""
        now = datetime.now(timezone.utc)
        expiry_time = self.created_at + timedelta(minutes=CSRF_TOKEN_LIFETIME_MINUTES)
        return now > expiry_time


class CSRFProtection:
    """
    CSRFトークン保護実装
    ダブルサブミットクッキーパターンとシンクロナイザートークンパターンの組み合わせ
    """

    def __init__(self):
        """CSRF保護マネージャーの初期化"""
        # インメモリトークンストア（本番環境ではRedisなどを使用推奨）
        self._tokens: Dict[str, CSRFToken] = {}
        # リプレイ攻撃防止用の使用済みトークンセット
        self._used_tokens: set = set()

    def generate_token(self, user_id: Optional[str] = None, 
                      session_id: Optional[str] = None) -> str:
        """
        新しいCSRFトークンを生成

        Args:
            user_id: ユーザーID（オプション）
            session_id: セッションID（オプション）

        Returns:
            str: CSRFトークン
        """
        # ランダムな値を生成
        random_value = secrets.token_urlsafe(CSRF_TOKEN_LENGTH)
        
        # タイムスタンプを追加
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # トークンペイロードを作成
        payload = {
            "random": random_value,
            "timestamp": timestamp,
            "user_id": user_id,
            "session_id": session_id
        }
        
        # ペイロードをJSON化してbase64エンコード
        payload_json = json.dumps(payload, separators=(',', ':'))
        payload_bytes = payload_json.encode('utf-8')
        payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode('utf-8')
        
        # HMACで署名
        signature = hmac.new(
            CSRF_SECRET_KEY.encode(),
            payload_b64.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # トークンを結合
        token = f"{payload_b64}.{signature}"
        
        # トークンを保存
        csrf_token = CSRFToken(
            token=token,
            created_at=datetime.now(timezone.utc),
            user_id=user_id,
            session_id=session_id
        )
        self._tokens[token] = csrf_token
        
        logger.info("CSRF token generated for user: %s, session: %s", user_id, session_id)
        
        return token

    def validate_token(self, token: str, user_id: Optional[str] = None,
                      session_id: Optional[str] = None) -> bool:
        """
        CSRFトークンを検証

        Args:
            token: 検証するトークン
            user_id: ユーザーID（オプション）
            session_id: セッションID（オプション）

        Returns:
            bool: 有効な場合True
        """
        try:
            # トークンの形式をチェック
            if '.' not in token:
                logger.warning("Invalid CSRF token format")
                return False
            
            # ペイロードと署名を分離
            payload_b64, signature = token.rsplit('.', 1)
            
            # 署名を検証
            expected_signature = hmac.new(
                CSRF_SECRET_KEY.encode(),
                payload_b64.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(signature, expected_signature):
                logger.warning("CSRF token signature mismatch")
                return False
            
            # ペイロードをデコード
            payload_bytes = base64.urlsafe_b64decode(payload_b64.encode())
            payload = json.loads(payload_bytes.decode('utf-8'))
            
            # タイムスタンプを検証
            token_timestamp = datetime.fromisoformat(payload['timestamp'])
            if (datetime.now(timezone.utc) - token_timestamp) > timedelta(minutes=CSRF_TOKEN_LIFETIME_MINUTES):
                logger.warning("CSRF token expired")
                return False
            
            # 使用済みトークンのチェック
            if token in self._used_tokens:
                logger.warning("CSRF token already used (replay attack prevention)")
                return False
            
            # ユーザーIDとセッションIDの検証
            if user_id and payload.get('user_id') != user_id:
                logger.warning("CSRF token user_id mismatch")
                return False
            
            if session_id and payload.get('session_id') != session_id:
                logger.warning("CSRF token session_id mismatch")
                return False
            
            # トークンを使用済みとしてマーク
            self._used_tokens.add(token)
            
            logger.info("CSRF token validated successfully")
            return True
            
        except Exception as e:
            logger.error("CSRF token validation error: %s", str(e))
            return False

    def get_token_from_request(self, request: Request) -> Optional[str]:
        """
        リクエストからCSRFトークンを取得

        Args:
            request: FastAPIリクエスト

        Returns:
            Optional[str]: トークンまたはNone
        """
        # 1. ヘッダーから取得を試みる
        token = request.headers.get(CSRF_HEADER_NAME)
        if token:
            return token
        
        # 2. クッキーから取得を試みる
        token = request.cookies.get(CSRF_COOKIE_NAME)
        if token:
            return token
        
        # 3. フォームデータから取得を試みる（POSTリクエストの場合）
        if request.method == "POST":
            # フォームデータは非同期で読み込む必要があるため、
            # ミドルウェアで事前に処理する必要がある
            form_data = getattr(request.state, "form_data", None)
            if form_data and isinstance(form_data, dict):
                token = form_data.get(CSRF_FIELD_NAME)
                if token:
                    return token
        
        return None

    async def validate_request(self, request: Request, 
                             user_id: Optional[str] = None,
                             session_id: Optional[str] = None) -> bool:
        """
        リクエストのCSRF保護を検証

        Args:
            request: FastAPIリクエスト
            user_id: ユーザーID（オプション）
            session_id: セッションID（オプション）

        Returns:
            bool: 有効な場合True

        Raises:
            HTTPException: CSRF検証失敗時
        """
        # 開発環境でCSRF保護を無効化
        if os.getenv("DISABLE_CSRF_PROTECTION", "false").lower() == "true":
            logger.warning("CSRF protection is disabled (development mode)")
            return True
            
        # 安全なメソッドはスキップ
        if request.method in SAFE_METHODS:
            return True
        
        # トークンを取得
        token = self.get_token_from_request(request)
        if not token:
            logger.warning("CSRF token missing for %s request to %s", 
                         request.method, request.url.path)
            raise HTTPException(
                status_code=403,
                detail="CSRF token missing"
            )
        
        # トークンを検証
        if not self.validate_token(token, user_id, session_id):
            logger.warning("Invalid CSRF token for %s request to %s", 
                         request.method, request.url.path)
            raise HTTPException(
                status_code=403,
                detail="Invalid CSRF token"
            )
        
        return True

    def clean_expired_tokens(self) -> int:
        """
        期限切れトークンのクリーンアップ

        Returns:
            int: クリーンアップされたトークン数
        """
        expired_tokens = []
        
        for token_str, token_obj in self._tokens.items():
            if token_obj.is_expired():
                expired_tokens.append(token_str)
        
        for token_str in expired_tokens:
            del self._tokens[token_str]
            # 使用済みトークンからも削除
            self._used_tokens.discard(token_str)
        
        logger.info("Cleaned up %d expired CSRF tokens", len(expired_tokens))
        
        return len(expired_tokens)

    def create_csrf_cookie_response(self, response: JSONResponse, token: str) -> JSONResponse:
        """
        CSRFトークンをクッキーに設定

        Args:
            response: FastAPIレスポンス
            token: CSRFトークン

        Returns:
            JSONResponse: クッキーが設定されたレスポンス
        """
        response.set_cookie(
            key=CSRF_COOKIE_NAME,
            value=token,
            max_age=CSRF_TOKEN_LIFETIME_MINUTES * 60,
            httponly=True,
            secure=True,  # HTTPS環境でのみ送信
            samesite="strict",  # CSRF攻撃を防ぐ
            path="/"
        )
        return response


# グローバルCSRF保護インスタンス
csrf_protection = CSRFProtection()


# ヘルパー関数
def generate_csrf_token(user_id: Optional[str] = None, 
                       session_id: Optional[str] = None) -> str:
    """
    新しいCSRFトークンを生成

    Args:
        user_id: ユーザーID（オプション）
        session_id: セッションID（オプション）

    Returns:
        str: CSRFトークン
    """
    return csrf_protection.generate_token(user_id, session_id)


async def validate_csrf_token(request: Request,
                            user_id: Optional[str] = None,
                            session_id: Optional[str] = None) -> bool:
    """
    リクエストのCSRFトークンを検証

    Args:
        request: FastAPIリクエスト
        user_id: ユーザーID（オプション）
        session_id: セッションID（オプション）

    Returns:
        bool: 有効な場合True

    Raises:
        HTTPException: CSRF検証失敗時
    """
    return await csrf_protection.validate_request(request, user_id, session_id)


def get_csrf_token_from_request(request: Request) -> Optional[str]:
    """
    リクエストからCSRFトークンを取得

    Args:
        request: FastAPIリクエスト

    Returns:
        Optional[str]: トークンまたはNone
    """
    return csrf_protection.get_token_from_request(request)