"""
SEC-069: エラーメッセージの詳細露出対策 - バックエンド実装
セキュアなエラーレスポンスとロギング
"""

import os
import logging
import traceback
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse

# 環境設定を関数として定義（テスト時に動的に変更可能）
def is_production():
    """本番環境かどうかを判定"""
    return os.getenv("ENV", "development") == "production"

# ロガーの設定
logger = logging.getLogger(__name__)

# エラーコード定義
ERROR_CODES = {
    # 認証関連
    "AUTH_FAILED": "AUTH_001",
    "AUTH_EXPIRED": "AUTH_002",
    "AUTH_INVALID": "AUTH_003",

    # API関連
    "API_VALIDATION": "API_004",
    "API_NOT_FOUND": "API_005",
    "API_METHOD_NOT_ALLOWED": "API_006",

    # データ関連
    "DATA_VALIDATION": "DATA_001",
    "DATA_NOT_FOUND": "DATA_002",
    "DATA_CONFLICT": "DATA_003",

    # 計算関連
    "CALC_ERROR": "CALC_001",
    "CALC_OVERFLOW": "CALC_002",

    # システム関連
    "INTERNAL_ERROR": "SYS_001",
    "RATE_LIMIT": "RATE_001",
    "SERVICE_UNAVAILABLE": "SYS_002"
}

# ユーザー向けメッセージ
USER_MESSAGES = {
    ERROR_CODES["AUTH_FAILED"]: "認証に失敗しました",
    ERROR_CODES["AUTH_EXPIRED"]: "認証の有効期限が切れました",
    ERROR_CODES["AUTH_INVALID"]: "無効な認証情報です",

    ERROR_CODES["API_VALIDATION"]: "入力データが正しくありません",
    ERROR_CODES["API_NOT_FOUND"]: "リソースが見つかりません",
    ERROR_CODES["API_METHOD_NOT_ALLOWED"]: "許可されていない操作です",

    ERROR_CODES["DATA_VALIDATION"]: "データの検証に失敗しました",
    ERROR_CODES["DATA_NOT_FOUND"]: "データが見つかりません",
    ERROR_CODES["DATA_CONFLICT"]: "データの競合が発生しました",

    ERROR_CODES["CALC_ERROR"]: "計算エラーが発生しました",
    ERROR_CODES["CALC_OVERFLOW"]: "計算結果が処理可能な範囲を超えています",

    ERROR_CODES["INTERNAL_ERROR"]: "システムエラーが発生しました",
    ERROR_CODES["RATE_LIMIT"]: "リクエストが多すぎます。しばらく待ってからお試しください",
    ERROR_CODES["SERVICE_UNAVAILABLE"]: "サービスが一時的に利用できません"
}

class SecureErrorHandler:
    """セキュアなエラーハンドリングクラス"""

    @staticmethod
    def get_error_code(status_code: int, error_type: Optional[str] = None) -> str:
        """ステータスコードとエラータイプからエラーコードを取得"""
        # error_typeは将来の拡張用（現在は未使用）
        _ = error_type
        if status_code == 400:
            return ERROR_CODES["API_VALIDATION"]
        if status_code == 401:
            return ERROR_CODES["AUTH_FAILED"]
        if status_code == 403:
            return ERROR_CODES["AUTH_INVALID"]
        if status_code == 404:
            return ERROR_CODES["API_NOT_FOUND"]
        if status_code == 405:
            return ERROR_CODES["API_METHOD_NOT_ALLOWED"]
        if status_code == 409:
            return ERROR_CODES["DATA_CONFLICT"]
        if status_code == 429:
            return ERROR_CODES["RATE_LIMIT"]
        if status_code == 503:
            return ERROR_CODES["SERVICE_UNAVAILABLE"]
        return ERROR_CODES["INTERNAL_ERROR"]

    @staticmethod
    def create_error_response(
        status_code: int,
        error_code: str,
        detail: Optional[str] = None,
        request_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """エラーレスポンスを作成"""
        # status_codeは将来の拡張用（現在は未使用）
        _ = status_code
        # ユーザー向けメッセージを取得
        user_message = USER_MESSAGES.get(error_code, "エラーが発生しました")

        response = {
            "error": {
                "code": error_code,
                "message": user_message,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        }

        # リクエストIDがあれば追加
        if request_id:
            response["error"]["request_id"] = request_id

        # 開発環境のみ詳細情報を追加
        if not is_production() and detail:
            response["error"]["detail"] = detail

        return response

    @staticmethod
    def log_error(
        error: Exception,
        request: Optional[Request] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """エラーをログに記録し、リクエストIDを返す"""
        request_id = str(uuid.uuid4())

        # ログに記録する情報を構築
        log_data = {
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error_type": type(error).__name__,
            "error_message": str(error),
        }

        # リクエスト情報を追加
        if request:
            log_data.update({
                "method": request.method,
                "url": str(request.url),
                "client_host": request.client.host if request.client else None,
                "headers": dict(request.headers) if not is_production() else None
            })

        # コンテキスト情報を追加
        if context:
            log_data["context"] = context

        # スタックトレースを追加（本番環境では最小限）
        if is_production():
            log_data["traceback"] = traceback.format_exception_only(type(error), error)
        else:
            log_data["traceback"] = traceback.format_exc()

        # エラーレベルでログ出力
        logger.error("Error occurred: %s", request_id, extra=log_data)

        return request_id

def handle_http_exception(request: Request, exc: HTTPException) -> JSONResponse:
    """HTTPExceptionをセキュアに処理"""
    error_code = SecureErrorHandler.get_error_code(exc.status_code)
    request_id = SecureErrorHandler.log_error(exc, request)

    response_data = SecureErrorHandler.create_error_response(
        status_code=exc.status_code,
        error_code=error_code,
        detail=exc.detail if not is_production() else None,
        request_id=request_id
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=response_data
    )

def handle_general_exception(request: Request, exc: Exception) -> JSONResponse:
    """一般的な例外をセキュアに処理"""
    # エラーの種類を判定
    error_message = str(exc).lower()

    if "validation" in error_message:
        status_code = 400
        error_code = ERROR_CODES["DATA_VALIDATION"]
    elif "not found" in error_message:
        status_code = 404
        error_code = ERROR_CODES["DATA_NOT_FOUND"]
    elif "overflow" in error_message:
        status_code = 400
        error_code = ERROR_CODES["CALC_OVERFLOW"]
    else:
        status_code = 500
        error_code = ERROR_CODES["INTERNAL_ERROR"]

    request_id = SecureErrorHandler.log_error(exc, request)

    response_data = SecureErrorHandler.create_error_response(
        status_code=status_code,
        error_code=error_code,
        detail=str(exc) if not is_production() else None,
        request_id=request_id
    )

    return JSONResponse(
        status_code=status_code,
        content=response_data
    )

def create_validation_error_response(field: str, message: str) -> HTTPException:
    """バリデーションエラーのHTTPExceptionを作成"""
    if is_production():
        # 本番環境では一般的なメッセージ
        detail = "入力データが正しくありません"
    else:
        # 開発環境では詳細情報
        detail = f"{field}: {message}"

    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail
    )

def create_auth_error_response(message: str = "認証が必要です") -> HTTPException:
    """認証エラーのHTTPExceptionを作成"""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message if not is_production() else "認証が必要です",
        headers={"WWW-Authenticate": "Bearer"}
    )

def create_permission_error_response(message: str = "権限がありません") -> HTTPException:
    """権限エラーのHTTPExceptionを作成"""
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=message if not is_production() else "この操作を実行する権限がありません"
    )
