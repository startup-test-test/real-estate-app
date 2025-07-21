"""
CSRFトークン保護機能のテスト
"""

import pytest
import asyncio
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch
import json
import base64

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

from csrf_protection import (
    CSRFProtection, CSRFToken, generate_csrf_token,
    validate_csrf_token, get_csrf_token_from_request,
    CSRF_HEADER_NAME, CSRF_COOKIE_NAME, CSRF_FIELD_NAME
)


class TestCSRFProtection:
    """CSRFProtectionクラスのテスト"""

    def setup_method(self):
        """テストセットアップ"""
        self.csrf = CSRFProtection()
        # クリーンな状態でテスト開始
        self.csrf._tokens.clear()
        self.csrf._used_tokens.clear()

    def test_generate_token(self):
        """トークン生成のテスト"""
        # 基本的なトークン生成
        token = self.csrf.generate_token()
        assert token is not None
        assert '.' in token
        assert len(token) > 50  # 十分な長さがあることを確認

        # ユーザーIDとセッションIDを含むトークン生成
        user_id = "test_user_123"
        session_id = "test_session_456"
        token2 = self.csrf.generate_token(user_id, session_id)
        assert token2 != token  # 異なるトークンが生成される
        
        # トークンが保存されていることを確認
        assert token in self.csrf._tokens
        assert self.csrf._tokens[token].user_id is None
        assert self.csrf._tokens[token2].user_id == user_id
        assert self.csrf._tokens[token2].session_id == session_id

    def test_validate_token_success(self):
        """トークン検証成功のテスト"""
        user_id = "test_user"
        session_id = "test_session"
        token = self.csrf.generate_token(user_id, session_id)
        
        # 正しいトークンの検証
        assert self.csrf.validate_token(token, user_id, session_id) is True

    def test_validate_token_invalid_format(self):
        """不正な形式のトークン検証テスト"""
        # ドットなしのトークン
        assert self.csrf.validate_token("invalid_token_without_dot") is False
        
        # 空のトークン
        assert self.csrf.validate_token("") is False

    def test_validate_token_invalid_signature(self):
        """不正な署名のトークン検証テスト"""
        token = self.csrf.generate_token()
        # 署名部分を改ざん
        payload, _ = token.rsplit('.', 1)
        tampered_token = f"{payload}.invalid_signature"
        assert self.csrf.validate_token(tampered_token) is False

    def test_validate_token_expired(self):
        """期限切れトークンの検証テスト"""
        # 古いタイムスタンプでトークンを作成
        with patch('csrf_protection.datetime') as mock_datetime:
            # 2時間前の時刻を設定
            old_time = datetime.now(timezone.utc) - timedelta(hours=2)
            mock_datetime.now.return_value = old_time
            mock_datetime.fromisoformat = datetime.fromisoformat
            
            token = self.csrf.generate_token()
        
        # 現在時刻で検証（期限切れ）
        assert self.csrf.validate_token(token) is False

    def test_validate_token_replay_attack(self):
        """リプレイ攻撃防止のテスト"""
        token = self.csrf.generate_token()
        
        # 最初の検証は成功
        assert self.csrf.validate_token(token) is True
        
        # 同じトークンの再利用は失敗
        assert self.csrf.validate_token(token) is False

    def test_validate_token_user_mismatch(self):
        """ユーザーID不一致のテスト"""
        user_id = "user1"
        token = self.csrf.generate_token(user_id=user_id)
        
        # 異なるユーザーIDでの検証は失敗
        assert self.csrf.validate_token(token, user_id="user2") is False
        
        # 正しいユーザーIDでの検証は成功
        assert self.csrf.validate_token(token, user_id=user_id) is True

    def test_validate_token_session_mismatch(self):
        """セッションID不一致のテスト"""
        session_id = "session1"
        token = self.csrf.generate_token(session_id=session_id)
        
        # 異なるセッションIDでの検証は失敗
        assert self.csrf.validate_token(token, session_id="session2") is False
        
        # 正しいセッションIDでの検証は成功
        assert self.csrf.validate_token(token, session_id=session_id) is True

    def test_get_token_from_request_header(self):
        """リクエストヘッダーからのトークン取得テスト"""
        # モックリクエストを作成
        request = Mock(spec=Request)
        token = "test_token_from_header"
        request.headers = {CSRF_HEADER_NAME: token}
        request.cookies = {}
        request.method = "POST"
        
        # ヘッダーからトークンを取得
        retrieved_token = self.csrf.get_token_from_request(request)
        assert retrieved_token == token

    def test_get_token_from_request_cookie(self):
        """リクエストクッキーからのトークン取得テスト"""
        # モックリクエストを作成
        request = Mock(spec=Request)
        token = "test_token_from_cookie"
        request.headers = {}
        request.cookies = {CSRF_COOKIE_NAME: token}
        request.method = "POST"
        
        # クッキーからトークンを取得
        retrieved_token = self.csrf.get_token_from_request(request)
        assert retrieved_token == token

    def test_get_token_from_request_form(self):
        """フォームデータからのトークン取得テスト"""
        # モックリクエストを作成
        request = Mock(spec=Request)
        token = "test_token_from_form"
        request.headers = {}
        request.cookies = {}
        request.method = "POST"
        request.state = Mock()
        request.state.form_data = {CSRF_FIELD_NAME: token}
        
        # フォームからトークンを取得
        retrieved_token = self.csrf.get_token_from_request(request)
        assert retrieved_token == token

    @pytest.mark.asyncio
    async def test_validate_request_safe_method(self):
        """安全なHTTPメソッドのテスト"""
        # GETリクエストはCSRF検証をスキップ
        request = Mock(spec=Request)
        request.method = "GET"
        
        result = await self.csrf.validate_request(request)
        assert result is True

    @pytest.mark.asyncio
    async def test_validate_request_missing_token(self):
        """トークンなしリクエストのテスト"""
        request = Mock(spec=Request)
        request.method = "POST"
        request.headers = {}
        request.cookies = {}
        request.url = Mock()
        request.url.path = "/test"
        
        with pytest.raises(HTTPException) as exc_info:
            await self.csrf.validate_request(request)
        
        assert exc_info.value.status_code == 403
        assert "CSRF token missing" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_validate_request_invalid_token(self):
        """無効なトークンのリクエストテスト"""
        request = Mock(spec=Request)
        request.method = "POST"
        request.headers = {CSRF_HEADER_NAME: "invalid_token"}
        request.cookies = {}
        request.url = Mock()
        request.url.path = "/test"
        
        with pytest.raises(HTTPException) as exc_info:
            await self.csrf.validate_request(request)
        
        assert exc_info.value.status_code == 403
        assert "Invalid CSRF token" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_validate_request_success(self):
        """有効なトークンのリクエストテスト"""
        # トークンを生成
        user_id = "test_user"
        session_id = "test_session"
        token = self.csrf.generate_token(user_id, session_id)
        
        # モックリクエストを作成
        request = Mock(spec=Request)
        request.method = "POST"
        request.headers = {CSRF_HEADER_NAME: token}
        request.cookies = {}
        request.url = Mock()
        request.url.path = "/test"
        
        # 検証成功
        result = await self.csrf.validate_request(request, user_id, session_id)
        assert result is True

    def test_clean_expired_tokens(self):
        """期限切れトークンのクリーンアップテスト"""
        # 通常のトークンを生成
        token1 = self.csrf.generate_token()
        
        # 期限切れトークンを手動で作成
        expired_token = CSRFToken(
            token="expired_token",
            created_at=datetime.now(timezone.utc) - timedelta(hours=2),
            user_id="test_user"
        )
        self.csrf._tokens["expired_token"] = expired_token
        self.csrf._used_tokens.add("expired_token")
        
        # クリーンアップ実行
        cleaned_count = self.csrf.clean_expired_tokens()
        
        # 期限切れトークンが削除されたことを確認
        assert cleaned_count == 1
        assert "expired_token" not in self.csrf._tokens
        assert "expired_token" not in self.csrf._used_tokens
        assert token1 in self.csrf._tokens  # 通常のトークンは残る

    def test_create_csrf_cookie_response(self):
        """CSRFクッキーレスポンスのテスト"""
        # モックレスポンスを作成
        response = Mock(spec=JSONResponse)
        response.set_cookie = Mock()
        
        token = "test_csrf_token"
        result = self.csrf.create_csrf_cookie_response(response, token)
        
        # set_cookieが正しいパラメータで呼ばれたことを確認
        response.set_cookie.assert_called_once()
        call_args = response.set_cookie.call_args
        
        assert call_args[1]['key'] == CSRF_COOKIE_NAME
        assert call_args[1]['value'] == token
        assert call_args[1]['httponly'] is True
        assert call_args[1]['secure'] is True
        assert call_args[1]['samesite'] == "strict"
        assert result == response


class TestHelperFunctions:
    """ヘルパー関数のテスト"""

    def test_generate_csrf_token_helper(self):
        """generate_csrf_tokenヘルパー関数のテスト"""
        token = generate_csrf_token("user123", "session456")
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 50

    @pytest.mark.asyncio
    async def test_validate_csrf_token_helper(self):
        """validate_csrf_tokenヘルパー関数のテスト"""
        # トークンを生成
        token = generate_csrf_token()
        
        # モックリクエストを作成
        request = Mock(spec=Request)
        request.method = "POST"
        request.headers = {CSRF_HEADER_NAME: token}
        request.cookies = {}
        request.url = Mock()
        request.url.path = "/test"
        
        # 検証成功
        result = await validate_csrf_token(request)
        assert result is True

    def test_get_csrf_token_from_request_helper(self):
        """get_csrf_token_from_requestヘルパー関数のテスト"""
        # モックリクエストを作成
        request = Mock(spec=Request)
        token = "helper_test_token"
        request.headers = {CSRF_HEADER_NAME: token}
        request.cookies = {}
        
        # トークン取得
        retrieved_token = get_csrf_token_from_request(request)
        assert retrieved_token == token


if __name__ == "__main__":
    pytest.main([__file__, "-v"])