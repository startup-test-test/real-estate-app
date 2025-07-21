"""
SEC-051: セッション固定攻撃対策
セッションセキュリティの強化実装
"""

import os
import secrets
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, Tuple, List
from dataclasses import dataclass, field
from collections import defaultdict
import hashlib
import hmac

from fastapi import Request

logger = logging.getLogger(__name__)

# セッションセキュリティ設定
SESSION_ID_LENGTH = 32  # 256ビットのセッションID
SESSION_TIMEOUT_MINUTES = 60  # セッションタイムアウト（分）
MAX_SESSIONS_PER_USER = 5  # ユーザーあたりの最大セッション数
SESSION_ROTATION_INTERVAL = 15  # セッションID回転間隔（分）

# セッション署名用の秘密鍵
SESSION_SECRET = os.getenv("SESSION_SECRET", secrets.token_urlsafe(32))


@dataclass
class SessionData:
    """セッションデータ"""
    session_id: str
    user_id: str
    created_at: datetime
    last_accessed: datetime
    rotated_at: datetime
    ip_address: str
    user_agent: str
    fingerprint: str
    is_active: bool = True
    rotation_count: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)


class SessionSecurityManager:
    """
    セッションセキュリティマネージャー
    セッション固定攻撃対策を含む包括的なセッション管理
    """

    def __init__(self):
        """セッションマネージャーの初期化"""
        # インメモリセッションストア（本番環境ではRedisなどを使用推奨）
        self._sessions: Dict[str, SessionData] = {}
        # ユーザーごとのセッションマッピング
        self._user_sessions: Dict[str, List[str]] = defaultdict(list)
        # セッションID履歴（再利用防止）
        self._session_history: set = set()
        # ブルートフォース防止用のカウンター
        self._failed_attempts: Dict[str, int] = defaultdict(int)

    def generate_session_id(self) -> str:
        """
        暗号学的に安全なセッションIDを生成

        Returns:
            str: 新しいセッションID
        """
        while True:
            # 256ビットのランダムなセッションIDを生成
            session_id = secrets.token_urlsafe(SESSION_ID_LENGTH)

            # 履歴にないことを確認（衝突防止）
            if session_id not in self._session_history:
                self._session_history.add(session_id)
                return session_id

    def create_session_fingerprint(self, request: Request) -> str:
        """
        リクエストからセッションフィンガープリントを生成

        Args:
            request: FastAPIリクエストオブジェクト

        Returns:
            str: セッションフィンガープリント
        """
        # ユーザーエージェントとIPアドレスからフィンガープリントを生成
        user_agent = request.headers.get("User-Agent", "")
        ip_address = request.client.host if request.client else "unknown"
        accept_language = request.headers.get("Accept-Language", "")
        accept_encoding = request.headers.get("Accept-Encoding", "")

        # フィンガープリントデータを結合
        fingerprint_data = f"{user_agent}|{ip_address}|{accept_language}|{accept_encoding}"

        # HMACで署名
        fingerprint = hmac.new(
            SESSION_SECRET.encode(),
            fingerprint_data.encode(),
            hashlib.sha256
        ).hexdigest()

        return fingerprint

    def create_session(self, user_id: str, request: Request) -> Tuple[str, SessionData]:
        """
        新しいセッションを作成（セッション固定攻撃対策）

        Args:
            user_id: ユーザーID
            request: FastAPIリクエストオブジェクト

        Returns:
            Tuple[str, SessionData]: セッションIDとセッションデータ
        """
        # 既存のセッション数をチェック
        user_sessions = self._user_sessions.get(user_id, [])
        if len(user_sessions) >= MAX_SESSIONS_PER_USER:
            # 最も古いセッションを削除
            oldest_session_id = user_sessions[0]
            self.destroy_session(oldest_session_id)
            logger.warning("Max sessions reached for user %s, removing oldest session", user_id)

        # 新しいセッションIDを生成
        session_id = self.generate_session_id()

        # セッションフィンガープリントを生成
        fingerprint = self.create_session_fingerprint(request)

        # セッションデータを作成
        now = datetime.now(timezone.utc)
        session_data = SessionData(
            session_id=session_id,
            user_id=user_id,
            created_at=now,
            last_accessed=now,
            rotated_at=now,
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("User-Agent", ""),
            fingerprint=fingerprint,
            is_active=True,
            rotation_count=0
        )

        # セッションを保存
        self._sessions[session_id] = session_data
        self._user_sessions[user_id].append(session_id)

        logger.info("New session created for user %s: %s...", user_id, session_id[:8])

        return session_id, session_data

    def validate_session(self, session_id: str, request: Request) -> Optional[SessionData]:
        """
        セッションの検証

        Args:
            session_id: セッションID
            request: FastAPIリクエストオブジェクト

        Returns:
            Optional[SessionData]: 有効な場合はセッションデータ、無効な場合はNone
        """
        # セッションの存在確認
        session = self._sessions.get(session_id)
        if not session:
            logger.warning("Session not found: %s...", session_id[:8])
            return None

        # アクティブ状態の確認
        if not session.is_active:
            logger.warning("Inactive session: %s...", session_id[:8])
            return None

        # タイムアウトチェック
        now = datetime.now(timezone.utc)
        timeout_threshold = now - timedelta(minutes=SESSION_TIMEOUT_MINUTES)
        if session.last_accessed < timeout_threshold:
            logger.warning("Session timeout: %s...", session_id[:8])
            self.destroy_session(session_id)
            return None

        # フィンガープリント検証
        current_fingerprint = self.create_session_fingerprint(request)
        if session.fingerprint != current_fingerprint:
            logger.warning(
                "Session fingerprint mismatch for %s... "
                "(possible session hijacking attempt)",
                session_id[:8]
            )
            # セキュリティのため、フィンガープリントが一致しない場合はセッションを無効化
            self.destroy_session(session_id)
            return None

        # IPアドレスの変更をチェック（オプション：厳格なセキュリティ）
        current_ip = request.client.host if request.client else "unknown"
        if session.ip_address != current_ip:
            logger.warning(
                "IP address changed for session %s... "
                "from %s to %s",
                session_id[:8], session.ip_address, current_ip
            )
            # IPアドレス変更を記録（必要に応じてセッションを無効化）
            session.metadata["ip_changes"] = session.metadata.get("ip_changes", 0) + 1

        # 最終アクセス時刻を更新
        session.last_accessed = now

        # セッションローテーションのチェック
        rotation_threshold = session.rotated_at + timedelta(minutes=SESSION_ROTATION_INTERVAL)
        if now > rotation_threshold:
            return self.rotate_session(session_id, request)

        return session

    def rotate_session(self, old_session_id: str, request: Request) -> Optional[SessionData]:
        """
        セッションIDのローテーション（セッション固定攻撃対策）

        Args:
            old_session_id: 既存のセッションID
            request: FastAPIリクエストオブジェクト

        Returns:
            Optional[SessionData]: 新しいセッションデータ
        """
        # 既存のセッションを取得
        old_session = self._sessions.get(old_session_id)
        if not old_session or not old_session.is_active:
            return None

        # 新しいセッションIDを生成
        new_session_id = self.generate_session_id()

        # セッションデータをコピーして更新
        now = datetime.now(timezone.utc)
        new_session = SessionData(
            session_id=new_session_id,
            user_id=old_session.user_id,
            created_at=old_session.created_at,
            last_accessed=now,
            rotated_at=now,
            ip_address=request.client.host if request.client else old_session.ip_address,
            user_agent=request.headers.get("User-Agent", old_session.user_agent),
            fingerprint=self.create_session_fingerprint(request),
            is_active=True,
            rotation_count=old_session.rotation_count + 1,
            metadata=old_session.metadata.copy()
        )

        # 新しいセッションを保存
        self._sessions[new_session_id] = new_session

        # ユーザーセッションマッピングを更新
        user_sessions = self._user_sessions[old_session.user_id]
        if old_session_id in user_sessions:
            user_sessions.remove(old_session_id)
        user_sessions.append(new_session_id)

        # 古いセッションを無効化
        old_session.is_active = False

        logger.info(
            "Session rotated for user %s: "
            "%s... -> %s...",
            old_session.user_id, old_session_id[:8], new_session_id[:8]
        )

        return new_session

    def destroy_session(self, session_id: str) -> bool:
        """
        セッションを破棄

        Args:
            session_id: セッションID

        Returns:
            bool: 成功した場合True
        """
        session = self._sessions.get(session_id)
        if not session:
            return False

        # セッションを無効化
        session.is_active = False

        # ユーザーセッションマッピングから削除
        user_sessions = self._user_sessions.get(session.user_id, [])
        if session_id in user_sessions:
            user_sessions.remove(session_id)

        logger.info("Session destroyed: %s... for user %s", session_id[:8], session.user_id)

        return True

    def destroy_user_sessions(self, user_id: str) -> int:
        """
        特定ユーザーのすべてのセッションを破棄

        Args:
            user_id: ユーザーID

        Returns:
            int: 破棄されたセッション数
        """
        user_sessions = self._user_sessions.get(user_id, [])
        destroyed_count = 0

        for session_id in user_sessions[:]:  # リストのコピーを作成
            if self.destroy_session(session_id):
                destroyed_count += 1

        logger.info("Destroyed %s sessions for user %s", destroyed_count, user_id)

        return destroyed_count

    def clean_expired_sessions(self) -> int:
        """
        期限切れセッションのクリーンアップ

        Returns:
            int: クリーンアップされたセッション数
        """
        now = datetime.now(timezone.utc)
        timeout_threshold = now - timedelta(minutes=SESSION_TIMEOUT_MINUTES)
        cleaned_count = 0

        # 期限切れセッションを特定
        expired_sessions = [
            session_id for session_id, session in self._sessions.items()
            if session.last_accessed < timeout_threshold
        ]

        # 期限切れセッションを削除
        for session_id in expired_sessions:
            if self.destroy_session(session_id):
                cleaned_count += 1

        logger.info("Cleaned up %s expired sessions", cleaned_count)

        return cleaned_count

    def get_user_sessions(self, user_id: str) -> List[SessionData]:
        """
        特定ユーザーのアクティブなセッションを取得

        Args:
            user_id: ユーザーID

        Returns:
            List[SessionData]: アクティブなセッションのリスト
        """
        sessions = []
        for session_id in self._user_sessions.get(user_id, []):
            session = self._sessions.get(session_id)
            if session and session.is_active:
                sessions.append(session)

        return sessions

    def record_failed_attempt(self, identifier: str) -> None:
        """
        失敗したログイン試行を記録（ブルートフォース対策）

        Args:
            identifier: IPアドレスまたはユーザー識別子
        """
        self._failed_attempts[identifier] += 1

        # 一定回数以上失敗した場合の処理
        if self._failed_attempts[identifier] >= 5:
            logger.warning("Multiple failed login attempts from %s", identifier)

    def check_brute_force(self, identifier: str) -> bool:
        """
        ブルートフォース攻撃のチェック

        Args:
            identifier: IPアドレスまたはユーザー識別子

        Returns:
            bool: ブロックすべき場合True
        """
        return self._failed_attempts.get(identifier, 0) >= 5

    def reset_failed_attempts(self, identifier: str) -> None:
        """
        失敗したログイン試行カウンターをリセット

        Args:
            identifier: IPアドレスまたはユーザー識別子
        """
        if identifier in self._failed_attempts:
            del self._failed_attempts[identifier]


# グローバルセッションマネージャーインスタンス
session_manager = SessionSecurityManager()


def create_secure_session(user_id: str, request: Request) -> str:
    """
    セキュアなセッションを作成

    Args:
        user_id: ユーザーID
        request: FastAPIリクエストオブジェクト

    Returns:
        str: セッションID
    """
    session_id, _ = session_manager.create_session(user_id, request)
    return session_id


def validate_and_refresh_session(session_id: str, request: Request) -> Optional[SessionData]:
    """
    セッションの検証と更新

    Args:
        session_id: セッションID
        request: FastAPIリクエストオブジェクト

    Returns:
        Optional[SessionData]: 有効なセッションデータ
    """
    return session_manager.validate_session(session_id, request)


def destroy_session(session_id: str) -> bool:
    """
    セッションを破棄

    Args:
        session_id: セッションID

    Returns:
        bool: 成功した場合True
    """
    return session_manager.destroy_session(session_id)