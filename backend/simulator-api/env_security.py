"""
環境変数セキュリティ管理モジュール (SEC-077, SEC-080対応)
.envファイルの露出リスクと環境変数の不適切な管理を防ぐ
"""

import os
import sys
import logging
from typing import Dict, List, Optional, Any, Set
from pathlib import Path
import stat
from dotenv import dotenv_values

logger = logging.getLogger(__name__)

class EnvSecurityError(Exception):
    """環境変数セキュリティエラー"""
    pass

class SecureEnvManager:
    """セキュアな環境変数管理クラス"""
    
    # 機密性の高い環境変数のパターン
    SENSITIVE_PATTERNS = {
        'DATABASE_URL', 'DB_URL', 'DB_PASSWORD',
        'SECRET_KEY', 'API_KEY', 'JWT_SECRET',
        'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
        'AWS_SECRET_ACCESS_KEY', 'AZURE_SECRET',
        'OPENAI_API_KEY', 'STRIPE_SECRET_KEY',
        'SMTP_PASSWORD', 'REDIS_PASSWORD'
    }
    
    # 必須環境変数
    REQUIRED_VARS = {
        'SUPABASE_URL': 'Supabase URL',
        'SUPABASE_ANON_KEY': 'Supabase Anonymous Key',
        'JWT_SECRET': 'JWT署名用秘密鍵'
    }
    
    # 環境変数の型と検証ルール
    ENV_VALIDATION_RULES = {
        'PORT': {'type': int, 'min': 1, 'max': 65535, 'default': 8000},
        'DEBUG': {'type': bool, 'default': False},
        'LOG_LEVEL': {'type': str, 'choices': ['DEBUG', 'INFO', 'WARNING', 'ERROR'], 'default': 'INFO'},
        'CORS_ORIGINS': {'type': list, 'default': ['http://localhost:3000']},
        'MAX_REQUEST_SIZE': {'type': int, 'min': 1, 'max': 100, 'default': 10},  # MB
        'SESSION_TIMEOUT': {'type': int, 'min': 1, 'max': 86400, 'default': 3600},  # 秒
        'ENABLE_DOCS': {'type': bool, 'default': False}  # 本番環境ではFalse
    }
    
    def __init__(self, env_file: Optional[str] = None):
        """
        環境変数マネージャーの初期化
        
        Args:
            env_file: .envファイルのパス
        """
        self.env_file = env_file or '.env'
        self.loaded_vars: Dict[str, Any] = {}
        self._is_production = self._detect_environment()
        
    def _detect_environment(self) -> bool:
        """
        本番環境かどうかを検出
        
        Returns:
            本番環境の場合True
        """
        env = os.getenv('ENVIRONMENT', os.getenv('ENV', 'development')).lower()
        return env in ('production', 'prod')
    
    def check_env_file_security(self) -> None:
        """
        .envファイルのセキュリティをチェック
        
        Raises:
            EnvSecurityError: セキュリティ問題が見つかった場合
        """
        if not os.path.exists(self.env_file):
            # .envファイルが存在しない場合は問題なし（環境変数から読み込む）
            return
            
        # ファイルのパーミッションをチェック
        file_stat = os.stat(self.env_file)
        mode = file_stat.st_mode
        
        # グループ・その他への読み取り権限があるかチェック
        if mode & stat.S_IRGRP or mode & stat.S_IROTH:
            # 権限を修正
            os.chmod(self.env_file, stat.S_IRUSR | stat.S_IWUSR)  # 600
            logger.warning(f".envファイルの権限を修正しました: {self.env_file}")
        
        # .gitignoreに含まれているかチェック
        gitignore_path = Path('.gitignore')
        if gitignore_path.exists():
            with open(gitignore_path, 'r') as f:
                gitignore_content = f.read()
                if '.env' not in gitignore_content:
                    logger.error(".envファイルが.gitignoreに含まれていません！")
                    raise EnvSecurityError(".envファイルを.gitignoreに追加してください")
    
    def load_and_validate(self) -> Dict[str, Any]:
        """
        環境変数を読み込み、検証する
        
        Returns:
            検証済みの環境変数
            
        Raises:
            EnvSecurityError: 検証エラー
        """
        # .envファイルのセキュリティチェック
        self.check_env_file_security()
        
        # 環境変数を読み込む（システム環境変数を優先）
        if os.path.exists(self.env_file):
            file_vars = dotenv_values(self.env_file)
        else:
            file_vars = {}
            
        # システム環境変数とマージ（システム環境変数が優先）
        merged_vars = {**file_vars}
        for key in file_vars:
            if key in os.environ:
                merged_vars[key] = os.environ[key]
        
        # システム環境変数のみの項目も追加
        for key, value in os.environ.items():
            if key not in merged_vars:
                merged_vars[key] = value
        
        # 必須環境変数のチェック
        self._check_required_vars(merged_vars)
        
        # 型検証と変換
        validated_vars = self._validate_and_convert(merged_vars)
        
        # 機密情報のログ出力防止
        self._setup_secure_logging(validated_vars)
        
        self.loaded_vars = validated_vars
        return validated_vars
    
    def _check_required_vars(self, vars_dict: Dict[str, str]) -> None:
        """
        必須環境変数をチェック
        
        Args:
            vars_dict: 環境変数の辞書
            
        Raises:
            EnvSecurityError: 必須変数が不足している場合
        """
        missing_vars = []
        for var_name, description in self.REQUIRED_VARS.items():
            if var_name not in vars_dict or not vars_dict[var_name]:
                missing_vars.append(f"{var_name} ({description})")
        
        if missing_vars:
            raise EnvSecurityError(
                f"必須環境変数が設定されていません: {', '.join(missing_vars)}"
            )
    
    def _validate_and_convert(self, vars_dict: Dict[str, str]) -> Dict[str, Any]:
        """
        環境変数を検証し、適切な型に変換
        
        Args:
            vars_dict: 環境変数の辞書
            
        Returns:
            検証・変換済みの環境変数
        """
        validated = {}
        
        # すべての環境変数をコピー
        for key, value in vars_dict.items():
            validated[key] = value
        
        # 検証ルールがある変数を処理
        for var_name, rules in self.ENV_VALIDATION_RULES.items():
            if var_name in vars_dict:
                value = vars_dict[var_name]
                validated[var_name] = self._convert_value(value, rules)
            elif 'default' in rules:
                validated[var_name] = rules['default']
        
        return validated
    
    def _convert_value(self, value: str, rules: Dict[str, Any]) -> Any:
        """
        値を適切な型に変換
        
        Args:
            value: 変換する値
            rules: 変換ルール
            
        Returns:
            変換後の値
        """
        var_type = rules.get('type', str)
        
        try:
            if var_type == bool:
                return value.lower() in ('true', '1', 'yes', 'on')
            elif var_type == int:
                int_value = int(value)
                if 'min' in rules and int_value < rules['min']:
                    raise ValueError(f"値が最小値 {rules['min']} より小さい")
                if 'max' in rules and int_value > rules['max']:
                    raise ValueError(f"値が最大値 {rules['max']} より大きい")
                return int_value
            elif var_type == list:
                # カンマ区切りのリストとして解析
                return [item.strip() for item in value.split(',') if item.strip()]
            elif var_type == str:
                if 'choices' in rules and value not in rules['choices']:
                    raise ValueError(f"許可されていない値: {value}")
                return value
            else:
                return value
        except ValueError as e:
            logger.error(f"環境変数の変換エラー: {e}")
            if 'default' in rules:
                return rules['default']
            raise
    
    def _setup_secure_logging(self, vars_dict: Dict[str, Any]) -> None:
        """
        機密情報のログ出力を防止する設定
        
        Args:
            vars_dict: 環境変数の辞書
        """
        # ログレベルの設定
        log_level = vars_dict.get('LOG_LEVEL', 'INFO')
        logging.getLogger().setLevel(getattr(logging, log_level))
        
        # 本番環境では機密情報をログに出力しない
        if self._is_production:
            # 機密環境変数のマスキング
            for key in vars_dict:
                if any(pattern in key.upper() for pattern in self.SENSITIVE_PATTERNS):
                    # 値の一部のみを表示
                    if isinstance(vars_dict[key], str) and len(vars_dict[key]) > 4:
                        masked_value = vars_dict[key][:2] + '*' * (len(vars_dict[key]) - 4) + vars_dict[key][-2:]
                        logger.info(f"環境変数 {key} が設定されました: {masked_value}")
                    else:
                        logger.info(f"環境変数 {key} が設定されました: [MASKED]")
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        環境変数を取得
        
        Args:
            key: 環境変数名
            default: デフォルト値
            
        Returns:
            環境変数の値
        """
        return self.loaded_vars.get(key, default)
    
    def get_safe_vars_for_client(self) -> Dict[str, Any]:
        """
        クライアントに公開しても安全な環境変数のみを取得
        
        Returns:
            公開可能な環境変数
        """
        safe_vars = {}
        unsafe_patterns = self.SENSITIVE_PATTERNS
        
        for key, value in self.loaded_vars.items():
            # 機密性の高い変数は除外
            if not any(pattern in key.upper() for pattern in unsafe_patterns):
                # 特定のプレフィックスを持つ変数のみ公開
                if key.startswith(('VITE_', 'REACT_APP_', 'PUBLIC_')):
                    safe_vars[key] = value
        
        return safe_vars
    
    def validate_runtime_security(self) -> None:
        """
        実行時のセキュリティチェック
        
        Raises:
            EnvSecurityError: セキュリティ問題が見つかった場合
        """
        # SEC-081: デバッグモードの本番環境チェック
        if self._is_production and self.get('DEBUG', False):
            raise EnvSecurityError(
                "本番環境でDEBUGモードが有効になっています！"
            )
        
        # SEC-060: FastAPIドキュメントの本番環境チェック
        if self._is_production and self.get('ENABLE_DOCS', False):
            logger.warning("本番環境でAPIドキュメントが有効になっています")
        
        # 機密情報が環境変数に直接含まれているかチェック
        for key, value in self.loaded_vars.items():
            if isinstance(value, str):
                # ハードコードされた機密情報のパターン
                if 'password123' in value.lower() or 'secret123' in value.lower():
                    raise EnvSecurityError(
                        f"環境変数 {key} に脆弱なパスワードが含まれています"
                    )

# グローバルインスタンス
env_manager = SecureEnvManager()

def load_secure_env() -> Dict[str, Any]:
    """
    セキュアな環境変数を読み込む
    
    Returns:
        検証済みの環境変数
    """
    return env_manager.load_and_validate()

def get_env(key: str, default: Any = None) -> Any:
    """
    環境変数を安全に取得
    
    Args:
        key: 環境変数名
        default: デフォルト値
        
    Returns:
        環境変数の値
    """
    return env_manager.get(key, default)