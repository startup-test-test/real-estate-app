#!/usr/bin/env python3
"""
SEC-051: セッション固定攻撃対策のテストスクリプト
"""

import sys
import time
import json
import logging
from datetime import datetime, timedelta, timezone
from unittest.mock import Mock

# テスト対象のモジュールをインポート
from session_security import (
    SessionSecurityManager, SessionData,
    create_secure_session, validate_and_refresh_session,
    destroy_session, session_manager
)

# ロガー設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TestResult:
    """テスト結果を管理するクラス"""
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []

    def add_result(self, test_name: str, passed: bool, message: str = ""):
        """テスト結果を追加"""
        self.results.append({
            "test": test_name,
            "passed": passed,
            "message": message
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1

    def print_summary(self):
        """テスト結果のサマリーを表示"""
        print("\n" + "="*60)
        print("テスト結果サマリー")
        print("="*60)
        for result in self.results:
            status = "✓" if result["passed"] else "✗"
            print(f"{status} {result['test']}: {result['message']}")
        
        print(f"\n合計: {self.passed + self.failed} テスト")
        print(f"成功: {self.passed}")
        print(f"失敗: {self.failed}")
        print("="*60)
        
        return self.failed == 0


def create_mock_request(ip_address="192.168.1.1", user_agent="Mozilla/5.0"):
    """モックリクエストオブジェクトを作成"""
    request = Mock()
    request.client = Mock()
    request.client.host = ip_address
    request.headers = {
        "User-Agent": user_agent,
        "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br"
    }
    return request


def test_session_creation():
    """セッション作成のテスト"""
    results = TestResult()
    manager = SessionSecurityManager()
    
    # テスト1: 新しいセッションの作成
    try:
        request = create_mock_request()
        session_id, session_data = manager.create_session("user123", request)
        
        if len(session_id) > 30 and session_data.user_id == "user123":
            results.add_result("セッション作成", True, "新しいセッションが作成された")
        else:
            results.add_result("セッション作成", False, "セッションIDが短すぎるか、ユーザーIDが不正")
    except Exception as e:
        results.add_result("セッション作成", False, str(e))
    
    # テスト2: セッションIDの一意性
    try:
        session_ids = set()
        for i in range(100):
            sid, _ = manager.create_session(f"user{i}", request)
            session_ids.add(sid)
        
        if len(session_ids) == 100:
            results.add_result("セッションID一意性", True, "100個のセッションIDがすべて異なる")
        else:
            results.add_result("セッションID一意性", False, "重複するセッションIDが生成された")
    except Exception as e:
        results.add_result("セッションID一意性", False, str(e))
    
    # テスト3: ユーザーあたりの最大セッション数
    try:
        manager._user_sessions.clear()
        manager._sessions.clear()
        
        # 最大数を超えるセッションを作成
        sessions = []
        for i in range(7):  # MAX_SESSIONS_PER_USER = 5
            sid, _ = manager.create_session("same_user", request)
            sessions.append(sid)
        
        # 最初の2つのセッションが削除されているか確認
        active_sessions = manager.get_user_sessions("same_user")
        if len(active_sessions) == 5:
            results.add_result("最大セッション数制限", True, "古いセッションが自動削除された")
        else:
            results.add_result("最大セッション数制限", False, f"アクティブセッション数: {len(active_sessions)}")
    except Exception as e:
        results.add_result("最大セッション数制限", False, str(e))
    
    return results


def test_session_validation():
    """セッション検証のテスト"""
    results = TestResult()
    manager = SessionSecurityManager()
    
    # テスト1: 有効なセッションの検証
    try:
        request = create_mock_request()
        session_id, _ = manager.create_session("user456", request)
        
        validated = manager.validate_session(session_id, request)
        if validated and validated.user_id == "user456":
            results.add_result("有効なセッション検証", True, "正常に検証された")
        else:
            results.add_result("有効なセッション検証", False, "検証に失敗")
    except Exception as e:
        results.add_result("有効なセッション検証", False, str(e))
    
    # テスト2: 無効なセッションIDの検証
    try:
        invalid_session = manager.validate_session("invalid_session_id", request)
        if invalid_session is None:
            results.add_result("無効なセッションID", True, "正しく拒否された")
        else:
            results.add_result("無効なセッションID", False, "無効なセッションが受け入れられた")
    except Exception as e:
        results.add_result("無効なセッションID", False, str(e))
    
    # テスト3: フィンガープリント検証（異なるIPアドレス）
    try:
        request1 = create_mock_request(ip_address="192.168.1.1")
        session_id, _ = manager.create_session("user789", request1)
        
        # 異なるIPアドレスから検証
        request2 = create_mock_request(ip_address="10.0.0.1")
        validated = manager.validate_session(session_id, request2)
        
        if validated is None:
            results.add_result("フィンガープリント検証", True, "異なる環境からのアクセスを拒否")
        else:
            results.add_result("フィンガープリント検証", False, "フィンガープリント不一致を検出できなかった")
    except Exception as e:
        results.add_result("フィンガープリント検証", False, str(e))
    
    # テスト4: セッションタイムアウト
    try:
        request = create_mock_request()
        session_id, session_data = manager.create_session("timeout_user", request)
        
        # タイムアウト時刻を過去に設定
        session_data.last_accessed = datetime.now(timezone.utc) - timedelta(hours=2)
        
        validated = manager.validate_session(session_id, request)
        if validated is None:
            results.add_result("セッションタイムアウト", True, "期限切れセッションを正しく無効化")
        else:
            results.add_result("セッションタイムアウト", False, "期限切れセッションが有効と判定された")
    except Exception as e:
        results.add_result("セッションタイムアウト", False, str(e))
    
    return results


def test_session_rotation():
    """セッションローテーションのテスト"""
    results = TestResult()
    manager = SessionSecurityManager()
    
    # テスト1: セッションIDのローテーション
    try:
        request = create_mock_request()
        old_session_id, old_session = manager.create_session("rotate_user", request)
        
        # ローテーション時刻を過去に設定して強制的にローテーション
        old_session.rotated_at = datetime.now(timezone.utc) - timedelta(minutes=20)
        
        # 検証時にローテーションが発生
        new_session = manager.validate_session(old_session_id, request)
        
        if new_session and new_session.session_id != old_session_id:
            results.add_result("セッションローテーション", True, "新しいセッションIDが生成された")
        else:
            results.add_result("セッションローテーション", False, "セッションIDが変更されなかった")
    except Exception as e:
        results.add_result("セッションローテーション", False, str(e))
    
    # テスト2: 古いセッションIDの無効化
    try:
        request = create_mock_request()
        old_session_id, old_session = manager.create_session("rotate_user2", request)
        old_session.rotated_at = datetime.now(timezone.utc) - timedelta(minutes=20)
        
        # ローテーション実行
        manager.validate_session(old_session_id, request)
        
        # 古いセッションIDで再度検証
        old_validation = manager.validate_session(old_session_id, request)
        
        if old_validation is None or not old_session.is_active:
            results.add_result("古いセッションID無効化", True, "古いセッションIDが無効化された")
        else:
            results.add_result("古いセッションID無効化", False, "古いセッションIDがまだ有効")
    except Exception as e:
        results.add_result("古いセッションID無効化", False, str(e))
    
    # テスト3: ローテーションカウント
    try:
        request = create_mock_request()
        session_id, session = manager.create_session("rotate_count_user", request)
        
        # 複数回ローテーション
        for i in range(3):
            session.rotated_at = datetime.now(timezone.utc) - timedelta(minutes=20)
            new_session = manager.validate_session(session_id, request)
            if new_session:
                session_id = new_session.session_id
                session = new_session
        
        if session.rotation_count == 3:
            results.add_result("ローテーションカウント", True, f"正しくカウント: {session.rotation_count}回")
        else:
            results.add_result("ローテーションカウント", False, f"カウントが不正: {session.rotation_count}回")
    except Exception as e:
        results.add_result("ローテーションカウント", False, str(e))
    
    return results


def test_session_destruction():
    """セッション破棄のテスト"""
    results = TestResult()
    manager = SessionSecurityManager()
    
    # テスト1: 単一セッションの破棄
    try:
        request = create_mock_request()
        session_id, _ = manager.create_session("destroy_user", request)
        
        # セッションを破棄
        destroyed = manager.destroy_session(session_id)
        
        # 破棄されたセッションの検証
        validated = manager.validate_session(session_id, request)
        
        if destroyed and validated is None:
            results.add_result("セッション破棄", True, "セッションが正常に破棄された")
        else:
            results.add_result("セッション破棄", False, "セッションの破棄に失敗")
    except Exception as e:
        results.add_result("セッション破棄", False, str(e))
    
    # テスト2: ユーザーの全セッション破棄
    try:
        request = create_mock_request()
        user_id = "multi_session_user"
        
        # 複数のセッションを作成
        sessions = []
        for i in range(3):
            sid, _ = manager.create_session(user_id, request)
            sessions.append(sid)
        
        # すべてのセッションを破棄
        destroyed_count = manager.destroy_user_sessions(user_id)
        
        # 破棄されたセッションの確認
        active_sessions = manager.get_user_sessions(user_id)
        
        if destroyed_count == 3 and len(active_sessions) == 0:
            results.add_result("全セッション破棄", True, f"{destroyed_count}個のセッションを破棄")
        else:
            results.add_result("全セッション破棄", False, f"破棄: {destroyed_count}、残存: {len(active_sessions)}")
    except Exception as e:
        results.add_result("全セッション破棄", False, str(e))
    
    return results


def test_brute_force_protection():
    """ブルートフォース攻撃対策のテスト"""
    results = TestResult()
    manager = SessionSecurityManager()
    
    # テスト1: 失敗カウンターの増加
    try:
        ip_address = "192.168.1.100"
        
        # 複数回の失敗を記録
        for i in range(6):
            manager.record_failed_attempt(ip_address)
        
        # ブロック状態の確認
        is_blocked = manager.check_brute_force(ip_address)
        
        if is_blocked:
            results.add_result("ブルートフォース検出", True, "5回以上の失敗でブロック")
        else:
            results.add_result("ブルートフォース検出", False, "ブロックされなかった")
    except Exception as e:
        results.add_result("ブルートフォース検出", False, str(e))
    
    # テスト2: 失敗カウンターのリセット
    try:
        ip_address = "192.168.1.101"
        
        # 失敗を記録してからリセット
        for i in range(3):
            manager.record_failed_attempt(ip_address)
        
        manager.reset_failed_attempts(ip_address)
        
        # リセット後の状態確認
        is_blocked = manager.check_brute_force(ip_address)
        
        if not is_blocked:
            results.add_result("失敗カウンターリセット", True, "カウンターが正常にリセットされた")
        else:
            results.add_result("失敗カウンターリセット", False, "リセット後もブロック状態")
    except Exception as e:
        results.add_result("失敗カウンターリセット", False, str(e))
    
    return results


def test_session_cleanup():
    """期限切れセッションのクリーンアップテスト"""
    results = TestResult()
    manager = SessionSecurityManager()
    
    try:
        request = create_mock_request()
        
        # アクティブなセッションを作成
        active_sessions = []
        for i in range(3):
            sid, _ = manager.create_session(f"active_user{i}", request)
            active_sessions.append(sid)
        
        # 期限切れセッションを作成
        expired_sessions = []
        for i in range(2):
            sid, session = manager.create_session(f"expired_user{i}", request)
            # 最終アクセス時刻を過去に設定
            session.last_accessed = datetime.now(timezone.utc) - timedelta(hours=2)
            expired_sessions.append(sid)
        
        # クリーンアップ実行
        cleaned_count = manager.clean_expired_sessions()
        
        # 結果確認
        active_count = 0
        expired_count = 0
        
        for sid in active_sessions:
            if manager._sessions.get(sid) and manager._sessions[sid].is_active:
                active_count += 1
        
        for sid in expired_sessions:
            session = manager._sessions.get(sid)
            if not session or not session.is_active:
                expired_count += 1
        
        if cleaned_count == 2 and active_count == 3 and expired_count == 2:
            results.add_result("期限切れセッションクリーンアップ", True, 
                             f"{cleaned_count}個のセッションをクリーンアップ")
        else:
            results.add_result("期限切れセッションクリーンアップ", False,
                             f"クリーンアップ: {cleaned_count}、アクティブ: {active_count}、期限切れ: {expired_count}")
    except Exception as e:
        results.add_result("期限切れセッションクリーンアップ", False, str(e))
    
    return results


def test_integration():
    """統合テスト - グローバルセッションマネージャーの使用"""
    results = TestResult()
    
    # テスト1: create_secure_session関数
    try:
        request = create_mock_request()
        session_id = create_secure_session("integration_user", request)
        
        if session_id and len(session_id) > 30:
            results.add_result("create_secure_session", True, "セッションが作成された")
        else:
            results.add_result("create_secure_session", False, "セッション作成に失敗")
    except Exception as e:
        results.add_result("create_secure_session", False, str(e))
    
    # テスト2: validate_and_refresh_session関数
    try:
        request = create_mock_request()
        session_id = create_secure_session("refresh_user", request)
        
        # 検証と更新
        session_data = validate_and_refresh_session(session_id, request)
        
        if session_data and session_data.user_id == "refresh_user":
            results.add_result("validate_and_refresh_session", True, "セッションが検証された")
        else:
            results.add_result("validate_and_refresh_session", False, "セッション検証に失敗")
    except Exception as e:
        results.add_result("validate_and_refresh_session", False, str(e))
    
    # テスト3: destroy_session関数
    try:
        request = create_mock_request()
        session_id = create_secure_session("destroy_test_user", request)
        
        # セッション破棄
        destroyed = destroy_session(session_id)
        
        # 破棄後の検証
        session_data = validate_and_refresh_session(session_id, request)
        
        if destroyed and session_data is None:
            results.add_result("destroy_session関数", True, "セッションが破棄された")
        else:
            results.add_result("destroy_session関数", False, "セッション破棄に失敗")
    except Exception as e:
        results.add_result("destroy_session関数", False, str(e))
    
    return results


def main():
    """メインテスト実行関数"""
    print("SEC-051: セッション固定攻撃対策テストを開始します...")
    print("="*60)
    
    all_results = []
    
    # 各テストグループを実行
    print("\n[1/7] セッション作成のテスト...")
    results1 = test_session_creation()
    all_results.append(results1)
    
    print("\n[2/7] セッション検証のテスト...")
    results2 = test_session_validation()
    all_results.append(results2)
    
    print("\n[3/7] セッションローテーションのテスト...")
    results3 = test_session_rotation()
    all_results.append(results3)
    
    print("\n[4/7] セッション破棄のテスト...")
    results4 = test_session_destruction()
    all_results.append(results4)
    
    print("\n[5/7] ブルートフォース対策のテスト...")
    results5 = test_brute_force_protection()
    all_results.append(results5)
    
    print("\n[6/7] セッションクリーンアップのテスト...")
    results6 = test_session_cleanup()
    all_results.append(results6)
    
    print("\n[7/7] 統合テスト...")
    results7 = test_integration()
    all_results.append(results7)
    
    # 全体のサマリー
    total_passed = sum(r.passed for r in all_results)
    total_failed = sum(r.failed for r in all_results)
    
    print("\n" + "="*60)
    print("全体のテスト結果")
    print("="*60)
    
    for i, results in enumerate(all_results, 1):
        print(f"\nテストグループ {i}:")
        results.print_summary()
    
    print(f"\n総合結果:")
    print(f"合計テスト数: {total_passed + total_failed}")
    print(f"成功: {total_passed}")
    print(f"失敗: {total_failed}")
    
    if total_failed == 0:
        print("\n✅ すべてのテストが成功しました！")
        print("SEC-051: セッション固定攻撃対策が正常に動作しています。")
        print("\n実装された主な機能:")
        print("- ログイン時の新しいセッションID発行")
        print("- セッションIDの定期的なローテーション")
        print("- セッションフィンガープリント検証")
        print("- セッションタイムアウト管理")
        print("- ブルートフォース攻撃対策")
        print("- ユーザーあたりのセッション数制限")
        return 0
    else:
        print(f"\n❌ {total_failed}個のテストが失敗しました。")
        return 1


if __name__ == "__main__":
    sys.exit(main())