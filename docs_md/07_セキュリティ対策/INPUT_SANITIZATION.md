# 入力サニタイゼーション実装ガイド（SEC-075）

## 概要

不動産投資シミュレーターにおける入力値の包括的なサニタイゼーションを実装しました。これにより、XSS、SQLインジェクション、DoS攻撃などの脆弱性を防ぎます。

## 実装内容

### 1. 入力サニタイゼーションモジュール (`shared/input_sanitizer.py`)

#### 主な機能
- **数値サニタイゼーション**: 安全な数値変換と範囲制限
- **文字列サニタイゼーション**: 危険な文字パターンの除去
- **包括的検証**: 辞書型データの一括サニタイゼーション
- **DoS攻撃防止**: 計算爆弾の検出と防止

### 2. サニタイゼーション機能

#### 2.1 数値サニタイゼーション (`sanitize_numeric_value`)

```python
# 機能：
# - カンマ区切り数値の処理
# - 全角数字の半角変換
# - 特殊値（NaN、Infinity）の検出と拒否
# - 範囲制限の適用

# 例：
sanitize_numeric_value("1,000,000", "monthly_rent", 0, 10_000_000)
# => 1000000.0

sanitize_numeric_value("１２３４５", "amount")
# => 12345.0

sanitize_numeric_value(float('inf'), "rate")
# => InputSanitizationError
```

#### 2.2 文字列サニタイゼーション (`sanitize_string_value`)

```python
# 保護機能：
# - 制御文字の除去
# - HTMLタグの除去
# - スクリプトインジェクションパターンの除去
# - SQLインジェクションキーワードの除去
# - 最大長制限

# 例：
sanitize_string_value("<script>alert('xss')</script>", "property_name")
# => "'xss')"

sanitize_string_value("'; DROP TABLE properties; --", "location")
# => "  properties "
```

### 3. フィールド別の制限値

#### 3.1 数値フィールドの制限

| フィールド名 | 最小値 | 最大値 | 単位 |
|------------|--------|---------|------|
| monthly_rent | 0 | 10,000,000 | 円/月 |
| vacancy_rate | 0 | 100 | % |
| management_fee | 0 | 1,000,000 | 円 |
| purchase_price | 1 | 10,000,000,000 | 円（万円単位で入力） |
| loan_amount | 0 | 10,000,000,000 | 円（万円単位で入力） |
| interest_rate | 0 | 50 | % |
| loan_years | 1 | 100 | 年 |
| holding_years | 1 | 100 | 年 |

#### 3.2 文字列フィールドの制限

| フィールド名 | 最大長 | 許可パターン |
|------------|--------|-------------|
| property_name | 200 | 日本語、英数字、基本記号 |
| location | 200 | 日本語、英数字、基本記号 |
| property_type | 50 | 英数字、基本記号 |
| loan_type | 50 | 英数字、基本記号 |

### 4. 特殊な検証ロジック

#### 4.1 関連フィールドの整合性チェック

```python
# ローン額が購入価格を超えないようにする
if sanitized['loan_amount'] > sanitized['purchase_price']:
    sanitized['loan_amount'] = sanitized['purchase_price']

# 保有年数とローン年数の関係を警告
if sanitized['holding_years'] > sanitized['loan_years']:
    logger.warning("保有年数がローン年数を超えています")
```

#### 4.2 DoS攻撃防止

```python
# 極端な複利計算の防止
if loan_years > 50 and interest_rate > 10:
    return False, "長期間かつ高金利の組み合わせは計算できません"

# メモリ消費攻撃の防止
if loan_years > 100:
    return False, "ローン期間が長すぎます"
```

### 5. 統合方法

#### 5.1 calculations.pyへの統合

```python
from .input_sanitizer import (
    sanitize_and_validate_input,
    InputSanitizationError
)

def validate_and_extract_data(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """入力データを検証して安全な値を抽出"""
    try:
        # 包括的なサニタイゼーションを実行
        safe_data = sanitize_and_validate_input(property_data)
        
        # DoS攻撃対策の追加検証
        safe_data = validate_calculation_params(safe_data)
        return safe_data
    except (InputSanitizationError, DoSProtectionError):
        raise
```

#### 5.2 エラーハンドリング

```python
try:
    sanitized_data = sanitize_and_validate_input(user_input)
    result = run_full_simulation(sanitized_data)
except InputSanitizationError as e:
    return {"error": f"入力エラー: {str(e)}"}
except DoSProtectionError as e:
    return {"error": f"計算エラー: {str(e)}"}
```

## セキュリティ考慮事項

### 1. 多層防御

1. **入力層**: フロントエンドでの基本検証
2. **API層**: Pydanticによる型検証
3. **処理層**: 包括的サニタイゼーション
4. **計算層**: DoS攻撃防止

### 2. ログとモニタリング

```python
# 悪意のある入力の検出時にログ記録
logger.warning(f"{field_name}: SQLキーワード 'DROP' を検出しました")
logger.warning(f"{field_name}: 値 {value} が最大値 {max_val} を超えています")
```

### 3. デフォルト値の安全性

```python
# 安全なデフォルト値の設定
defaults = {
    'loan_type': '元利均等',
    'property_type': '不明',
    'vacancy_rate': 5.0,  # 5%
    'management_fee': 5.0,  # 5%
    'effective_tax_rate': 30.0,  # 30%
}
```

## テスト方法

### 1. 基本的なサニタイゼーションテスト

```python
# テスト実行
python -m pytest test_input_sanitizer.py -v

# カバレッジ確認
python -m pytest test_input_sanitizer.py --cov=shared.input_sanitizer
```

### 2. 統合テスト

```python
# 実際のAPIエンドポイントでテスト
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "property_name": "<script>alert(1)</script>",
    "monthly_rent": "1,000,000",
    "purchase_price": "5000"
  }'
```

## トラブルシューティング

### 1. 文字化けが発生する場合

**原因**: Unicode正規化の不具合

**対策**:
```python
# unicodedata.normalize('NFKC', value)を確認
# 必要に応じて正規化方法を調整
```

### 2. 正当な入力が拒否される場合

**原因**: 過度に厳格な検証ルール

**対策**:
```python
# ALLOWED_PROPERTY_NAME_PATTERNを調整
# 許可する文字パターンを拡張
```

### 3. パフォーマンスの問題

**原因**: 正規表現の複雑さ

**対策**:
```python
# 正規表現をプリコンパイル
COMPILED_PATTERN = re.compile(pattern)
# 単純な文字列操作に置き換え
```

## ベストプラクティス

1. **早期検証**: できるだけ早い段階で入力を検証
2. **明確なエラーメッセージ**: ユーザーに分かりやすいエラーを返す
3. **ログ記録**: 悪意のある入力の試行を記録
4. **定期的な更新**: 新しい攻撃パターンに対応

## 今後の改善点

1. **機械学習による異常検知**: 通常と異なるパターンの検出
2. **レート制限**: 同一IPからの大量リクエスト制限
3. **CAPTCHA統合**: 自動化攻撃の防止
4. **入力履歴分析**: 攻撃パターンの分析と対策

## 関連資料

- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)