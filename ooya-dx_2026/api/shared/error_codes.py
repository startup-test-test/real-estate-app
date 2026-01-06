"""
エラーコード定義モジュール
Vercel Python Functions用
"""

from enum import Enum
from typing import Dict, Any, Optional


class ErrorCode(Enum):
    """エラーコード定義"""

    # バリデーションエラー (4000番台)
    VALIDATION_REQUIRED_FIELD = "E4001"
    VALIDATION_INVALID_RANGE = "E4002"
    VALIDATION_INVALID_FORMAT = "E4003"
    VALIDATION_HTML_DETECTED = "E4004"
    VALIDATION_URL_INVALID = "E4005"
    VALIDATION_IMAGE_TOO_LARGE = "E4006"
    VALIDATION_STRING_TOO_LONG = "E4007"

    # 計算エラー (5000番台)
    CALC_DIVISION_BY_ZERO = "E5001"
    CALC_INVALID_PARAMETER = "E5002"
    CALC_OVERFLOW = "E5003"
    CALC_NEGATIVE_VALUE = "E5004"
    CALC_LOAN_CALCULATION = "E5005"
    CALC_IRR_FAILED = "E5006"
    CALC_TAX_CALCULATION = "E5007"
    CALC_DEPRECIATION = "E5008"

    # システムエラー (5500番台)
    SYSTEM_GENERAL = "E5500"
    SYSTEM_DATABASE = "E5501"
    SYSTEM_TIMEOUT = "E5502"
    SYSTEM_MEMORY = "E5503"
    SYSTEM_DEPENDENCY = "E5504"

    # 外部APIエラー (6000番台)
    API_CONNECTION = "E6001"
    API_TIMEOUT = "E6002"
    API_INVALID_RESPONSE = "E6003"
    API_RATE_LIMIT = "E6004"


# エラーメッセージ定義
ERROR_MESSAGES: Dict[str, str] = {
    # バリデーションエラー
    ErrorCode.VALIDATION_REQUIRED_FIELD.value: "必須項目が入力されていません",
    ErrorCode.VALIDATION_INVALID_RANGE.value: "入力値が有効範囲外です",
    ErrorCode.VALIDATION_INVALID_FORMAT.value: "入力形式が正しくありません",
    ErrorCode.VALIDATION_HTML_DETECTED.value: "HTMLタグが検出されました",
    ErrorCode.VALIDATION_URL_INVALID.value: "URLの形式が正しくありません",
    ErrorCode.VALIDATION_IMAGE_TOO_LARGE.value: "画像サイズが大きすぎます",
    ErrorCode.VALIDATION_STRING_TOO_LONG.value: "文字数が制限を超えています",

    # 計算エラー
    ErrorCode.CALC_DIVISION_BY_ZERO.value: "ゼロ除算エラーが発生しました",
    ErrorCode.CALC_INVALID_PARAMETER.value: "計算パラメータが不正です",
    ErrorCode.CALC_OVERFLOW.value: "計算結果がオーバーフローしました",
    ErrorCode.CALC_NEGATIVE_VALUE.value: "負の値が許可されていない項目です",
    ErrorCode.CALC_LOAN_CALCULATION.value: "ローン計算でエラーが発生しました",
    ErrorCode.CALC_IRR_FAILED.value: "IRR計算が収束しませんでした",
    ErrorCode.CALC_TAX_CALCULATION.value: "税金計算でエラーが発生しました",
    ErrorCode.CALC_DEPRECIATION.value: "減価償却計算でエラーが発生しました",

    # システムエラー
    ErrorCode.SYSTEM_GENERAL.value: "システムエラーが発生しました",
    ErrorCode.SYSTEM_DATABASE.value: "データベースエラーが発生しました",
    ErrorCode.SYSTEM_TIMEOUT.value: "処理がタイムアウトしました",
    ErrorCode.SYSTEM_MEMORY.value: "メモリ不足エラーが発生しました",
    ErrorCode.SYSTEM_DEPENDENCY.value: "依存サービスでエラーが発生しました",

    # 外部APIエラー
    ErrorCode.API_CONNECTION.value: "外部APIへの接続に失敗しました",
    ErrorCode.API_TIMEOUT.value: "外部APIへのリクエストがタイムアウトしました",
    ErrorCode.API_INVALID_RESPONSE.value: "外部APIから不正なレスポンスを受信しました",
    ErrorCode.API_RATE_LIMIT.value: "APIのレート制限に達しました",
}


# 詳細な対処法
ERROR_SOLUTIONS: Dict[str, str] = {
    # バリデーションエラー
    ErrorCode.VALIDATION_REQUIRED_FIELD.value: "赤色で表示されている必須項目を入力してください",
    ErrorCode.VALIDATION_INVALID_RANGE.value: "入力値を有効な範囲内に修正してください",
    ErrorCode.VALIDATION_INVALID_FORMAT.value: "正しい形式で入力してください",
    ErrorCode.VALIDATION_HTML_DETECTED.value: "HTMLタグを除去して再入力してください",
    ErrorCode.VALIDATION_URL_INVALID.value: "https://で始まる正しいURL形式で入力してください",
    ErrorCode.VALIDATION_IMAGE_TOO_LARGE.value: "10MB以下の画像を使用してください",
    ErrorCode.VALIDATION_STRING_TOO_LONG.value: "文字数を減らして再入力してください",

    # 計算エラー
    ErrorCode.CALC_DIVISION_BY_ZERO.value: "入力値を確認し、0以外の値を入力してください",
    ErrorCode.CALC_INVALID_PARAMETER.value: "入力値を確認し、正しい値を入力してください",
    ErrorCode.CALC_OVERFLOW.value: "より小さな値を入力してください",
    ErrorCode.CALC_NEGATIVE_VALUE.value: "0以上の値を入力してください",
    ErrorCode.CALC_LOAN_CALCULATION.value: "ローン条件を確認してください",
    ErrorCode.CALC_IRR_FAILED.value: "投資条件を見直してください",
    ErrorCode.CALC_TAX_CALCULATION.value: "税率設定を確認してください",
    ErrorCode.CALC_DEPRECIATION.value: "建物価格と耐用年数を確認してください",

    # システムエラー
    ErrorCode.SYSTEM_GENERAL.value: "しばらく待ってから再度お試しください",
    ErrorCode.SYSTEM_DATABASE.value: "システム管理者にお問い合わせください",
    ErrorCode.SYSTEM_TIMEOUT.value: "入力データを簡略化するか、時間をおいて再試行してください",
    ErrorCode.SYSTEM_MEMORY.value: "システム管理者にお問い合わせください",
    ErrorCode.SYSTEM_DEPENDENCY.value: "しばらく待ってから再度お試しください",

    # 外部APIエラー
    ErrorCode.API_CONNECTION.value: "ネットワーク接続を確認してください",
    ErrorCode.API_TIMEOUT.value: "しばらく待ってから再度お試しください",
    ErrorCode.API_INVALID_RESPONSE.value: "システム管理者にお問い合わせください",
    ErrorCode.API_RATE_LIMIT.value: "しばらく待ってから再度お試しください",
}


class SimulatorError(Exception):
    """シミュレーターエラー基底クラス"""

    def __init__(
        self,
        error_code: ErrorCode,
        detail: Optional[str] = None,
        field: Optional[str] = None,
        value: Optional[Any] = None
    ):
        self.error_code = error_code.value
        self.message = ERROR_MESSAGES.get(error_code.value, "不明なエラー")
        self.solution = ERROR_SOLUTIONS.get(error_code.value, "システム管理者にお問い合わせください")
        self.detail = detail
        self.field = field
        self.value = value

        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        """エラー情報を辞書形式で返す"""
        result = {
            "error_code": self.error_code,
            "message": self.message,
            "solution": self.solution
        }

        if self.detail:
            result["detail"] = self.detail
        if self.field:
            result["field"] = self.field
        if self.value is not None:
            result["value"] = str(self.value)

        return result


def create_error_response(
    error_code: ErrorCode,
    status_code: int = 500,
    detail: Optional[str] = None,
    field: Optional[str] = None,
    value: Optional[Any] = None
) -> Dict[str, Any]:
    """エラーレスポンスを生成"""
    error = SimulatorError(error_code, detail, field, value)
    return {
        **error.to_dict(),
        "status_code": status_code
    }
