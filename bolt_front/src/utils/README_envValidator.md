# 環境変数検証ユーティリティ (SEC-007対応)

## 概要
環境変数の厳密な検証と安全な管理を行うユーティリティです。SEC-007のセキュリティ課題に対応し、環境変数の検証不足による脆弱性を防ぎます。

## 主な機能

### 1. 環境変数の厳密な検証
- 必須チェック
- 空文字列チェック
- パターンマッチング（正規表現）
- カスタムバリデーター

### 2. Supabase環境変数の専用検証
- URL形式の検証（HTTPSのみ許可、開発環境ではHTTPも許可）
- Anon Key（JWT形式）の検証
- 本番環境でのエラー情報隠蔽

### 3. セキュアな環境変数取得
- 型安全な環境変数取得（string/number/boolean）
- デフォルト値のサポート
- エラーハンドリング

### 4. デバッグ支援機能
- 環境変数値のマスク表示
- 開発/本番環境の判定
- モック認証の制御（SEC-002対応）

## 使用方法

### 基本的な環境変数検証
```typescript
import { validateEnvVariables } from '@/utils/envValidator'

const variables = [
  {
    name: 'API_KEY',
    value: process.env.API_KEY,
    required: true,
    pattern: /^[A-Za-z0-9]+$/
  },
  {
    name: 'API_URL',
    value: process.env.API_URL,
    required: true,
    validator: (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }
  }
]

const validated = validateEnvVariables(variables)
```

### Supabase環境変数の検証
```typescript
import { validateSupabaseEnv } from '@/utils/envValidator'

// supabase.ts内で使用
const { supabaseUrl, supabaseAnonKey } = validateSupabaseEnv()
```

### 環境変数の安全な取得
```typescript
import { getEnvVariable, getTypedEnvVariable } from '@/utils/envValidator'

// 文字列の取得
const apiKey = getEnvVariable('API_KEY', 'default-key')

// 数値の取得
const port = getTypedEnvVariable('PORT', 'number', 3000)

// ブール値の取得
const debugMode = getTypedEnvVariable('DEBUG', 'boolean', false)
```

### デバッグ用マスク表示
```typescript
import { maskEnvValue } from '@/utils/envValidator'

console.log('API Key:', maskEnvValue(apiKey, 4))
// 出力例: "abcd*********wxyz"
```

## セキュリティ上の注意点

1. **本番環境でのエラー情報**
   - 本番環境では詳細なエラー情報を隠蔽
   - 開発環境でのみ詳細なデバッグ情報を表示

2. **環境変数のログ出力**
   - 機密情報はマスク表示機能を使用
   - 完全な値をログに出力しない

3. **検証の厳密性**
   - 全ての環境変数に適切な検証を実装
   - カスタムバリデーターで業務要件に応じた検証

## テスト
15個のユニットテストを実装済み：
- 必須チェック、空文字列チェック
- パターンマッチング、カスタムバリデーション
- Supabase環境変数の検証
- エラーハンドリング
- マスク表示機能

```bash
npm test envValidator.test.ts
```

## 関連ファイル
- `/src/utils/envValidator.ts` - 実装
- `/src/utils/__tests__/envValidator.test.ts` - テスト
- `/src/lib/supabase.ts` - 使用例