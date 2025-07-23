"""
SEC-078: セキュリティイベントログシステム
セキュリティ関連のイベントを適切に記録・管理
"""

import os
import logging
import logging.handlers
from datetime import datetime, timezone
import json
import hashlib
from typing import Optional, Dict, Any
from pathlib import Path
import re


class SecurityLogger:
    """セキュリティイベント専用ロガー"""
    
    def __init__(self, name: str = "security", log_dir: str = "logs/security"):
        """
        セキュリティロガーの初期化
        
        Args:
            name: ロガー名
            log_dir: ログディレクトリ
        """
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        
        # ログディレクトリの作成（セキュアなパーミッション）
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
        # Unixシステムでのパーミッション設定（所有者のみ読み書き可能）
        if os.name != 'nt':  # Windows以外
            os.chmod(self.log_dir, 0o700)
        
        # ハンドラーの設定
        self._setup_handlers()
    
    def _setup_handlers(self):
        """ログハンドラーの設定"""
        # 既存のハンドラーをクリア
        self.logger.handlers.clear()
        
        # ローテーティングファイルハンドラー（セキュリティイベント用）
        security_file = self.log_dir / "security_events.log"
        security_handler = logging.handlers.RotatingFileHandler(
            security_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=10,
            encoding='utf-8'
        )
        security_handler.setLevel(logging.INFO)
        
        # 重要なセキュリティアラート用ハンドラー
        alert_file = self.log_dir / "security_alerts.log"
        alert_handler = logging.handlers.RotatingFileHandler(
            alert_file,
            maxBytes=5 * 1024 * 1024,  # 5MB
            backupCount=5,
            encoding='utf-8'
        )
        alert_handler.setLevel(logging.WARNING)
        
        # フォーマッターの設定
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(name)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        security_handler.setFormatter(formatter)
        alert_handler.setFormatter(formatter)
        
        # ハンドラーを追加
        self.logger.addHandler(security_handler)
        self.logger.addHandler(alert_handler)
        
        # 本番環境ではコンソール出力を無効化
        if os.getenv('ENVIRONMENT', 'development').lower() not in ('production', 'prod'):
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)
    
    def _sanitize_data(self, data: Any) -> Any:
        """
        機密情報をサニタイズ
        
        Args:
            data: サニタイズするデータ
            
        Returns:
            サニタイズされたデータ
        """
        if isinstance(data, dict):
            sanitized = {}
            sensitive_keys = {
                'password', 'token', 'secret', 'api_key', 'private_key',
                'access_token', 'refresh_token', 'authorization', 'cookie',
                'session_id', 'csrf_token', 'credit_card', 'ssn'
            }
            
            for key, value in data.items():
                if any(sensitive in key.lower() for sensitive in sensitive_keys):
                    # 機密情報をマスク
                    if isinstance(value, str) and len(value) > 4:
                        sanitized[key] = f"{value[:2]}{'*' * (len(value) - 4)}{value[-2:]}"
                    else:
                        sanitized[key] = "***"
                else:
                    sanitized[key] = self._sanitize_data(value)
            return sanitized
        elif isinstance(data, list):
            return [self._sanitize_data(item) for item in data]
        elif isinstance(data, str):
            # IPアドレスの部分マスク
            ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
            return re.sub(ip_pattern, lambda m: self._mask_ip(m.group()), data)
        else:
            return data
    
    def _mask_ip(self, ip: str) -> str:
        """IPアドレスの部分マスク"""
        parts = ip.split('.')
        if len(parts) == 4:
            return f"{parts[0]}.{parts[1]}.*.{parts[3]}"
        return ip
    
    def _generate_event_id(self, event_type: str, user_id: str) -> str:
        """イベントIDの生成"""
        timestamp = datetime.now(timezone.utc).isoformat()
        data = f"{event_type}:{user_id}:{timestamp}"
        return hashlib.sha256(data.encode()).hexdigest()[:16]
    
    def log_authentication_attempt(self, user_id: str, success: bool, 
                                  ip_address: str, user_agent: str,
                                  additional_info: Optional[Dict] = None):
        """
        認証試行のログ
        
        Args:
            user_id: ユーザーID
            success: 成功/失敗
            ip_address: IPアドレス
            user_agent: User-Agent
            additional_info: 追加情報
        """
        event_data = {
            "event_type": "authentication_attempt",
            "event_id": self._generate_event_id("auth", user_id),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "success": success,
            "ip_address": self._mask_ip(ip_address),
            "user_agent": user_agent[:200],  # 長さ制限
            "additional_info": self._sanitize_data(additional_info or {})
        }
        
        level = logging.INFO if success else logging.WARNING
        self.logger.log(level, json.dumps(event_data, ensure_ascii=False))
    
    def log_authorization_failure(self, user_id: str, resource: str, 
                                 permission: str, ip_address: str):
        """
        認可失敗のログ
        
        Args:
            user_id: ユーザーID
            resource: リソース
            permission: 要求された権限
            ip_address: IPアドレス
        """
        event_data = {
            "event_type": "authorization_failure",
            "event_id": self._generate_event_id("authz", user_id),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "resource": resource,
            "permission": permission,
            "ip_address": self._mask_ip(ip_address)
        }
        
        self.logger.warning(json.dumps(event_data, ensure_ascii=False))
    
    def log_suspicious_activity(self, activity_type: str, details: Dict,
                               user_id: Optional[str] = None,
                               ip_address: Optional[str] = None):
        """
        疑わしい活動のログ
        
        Args:
            activity_type: 活動タイプ
            details: 詳細情報
            user_id: ユーザーID
            ip_address: IPアドレス
        """
        event_data = {
            "event_type": "suspicious_activity",
            "event_id": self._generate_event_id("suspicious", user_id or "unknown"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "activity_type": activity_type,
            "user_id": user_id,
            "ip_address": self._mask_ip(ip_address) if ip_address else None,
            "details": self._sanitize_data(details)
        }
        
        self.logger.error(json.dumps(event_data, ensure_ascii=False))
    
    def log_security_config_change(self, changed_by: str, change_type: str,
                                  old_value: Any, new_value: Any):
        """
        セキュリティ設定変更のログ
        
        Args:
            changed_by: 変更者
            change_type: 変更タイプ
            old_value: 旧値
            new_value: 新値
        """
        event_data = {
            "event_type": "security_config_change",
            "event_id": self._generate_event_id("config", changed_by),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "changed_by": changed_by,
            "change_type": change_type,
            "old_value": self._sanitize_data(old_value),
            "new_value": self._sanitize_data(new_value)
        }
        
        self.logger.info(json.dumps(event_data, ensure_ascii=False))
    
    def log_data_access(self, user_id: str, resource_type: str,
                       resource_id: str, action: str, success: bool):
        """
        データアクセスのログ
        
        Args:
            user_id: ユーザーID
            resource_type: リソースタイプ
            resource_id: リソースID
            action: アクション
            success: 成功/失敗
        """
        event_data = {
            "event_type": "data_access",
            "event_id": self._generate_event_id("data", user_id),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "action": action,
            "success": success
        }
        
        self.logger.info(json.dumps(event_data, ensure_ascii=False))
    
    def log_security_scan_result(self, scan_type: str, results: Dict):
        """
        セキュリティスキャン結果のログ
        
        Args:
            scan_type: スキャンタイプ
            results: スキャン結果
        """
        event_data = {
            "event_type": "security_scan",
            "event_id": self._generate_event_id("scan", scan_type),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "scan_type": scan_type,
            "results": self._sanitize_data(results)
        }
        
        level = logging.WARNING if results.get("threats_found", 0) > 0 else logging.INFO
        self.logger.log(level, json.dumps(event_data, ensure_ascii=False))
    
    def get_recent_events(self, event_type: Optional[str] = None,
                         limit: int = 100) -> list:
        """
        最近のイベントを取得（監査用）
        
        Args:
            event_type: イベントタイプ（フィルタ用）
            limit: 取得件数上限
            
        Returns:
            イベントリスト
        """
        events = []
        log_file = self.log_dir / "security_events.log"
        
        if not log_file.exists():
            return events
        
        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()[-limit:]  # 最後のN行を取得
                
            for line in lines:
                try:
                    # ログメッセージからJSONを抽出
                    json_start = line.find('{')
                    if json_start != -1:
                        event = json.loads(line[json_start:])
                        if not event_type or event.get("event_type") == event_type:
                            events.append(event)
                except json.JSONDecodeError:
                    continue
                    
        except Exception as e:
            self.logger.error(f"Failed to read recent events: {e}")
        
        return events[-limit:]  # 最新のものから返す


# シングルトンインスタンス
security_logger = SecurityLogger()


# 便利なエクスポート
log_authentication_attempt = security_logger.log_authentication_attempt
log_authorization_failure = security_logger.log_authorization_failure
log_suspicious_activity = security_logger.log_suspicious_activity
log_security_config_change = security_logger.log_security_config_change
log_data_access = security_logger.log_data_access
log_security_scan_result = security_logger.log_security_scan_result