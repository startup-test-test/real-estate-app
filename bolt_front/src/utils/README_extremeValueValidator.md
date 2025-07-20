# 極端な値の検証ユーティリティ (SEC-013対応)

## 概要
数値入力フィールドに対する極端な値の検証を行うユーティリティです。SEC-013のセキュリティ課題に対応し、JavaScriptの数値限界値や特殊な入力パターンによる脆弱性を防ぎます。

## 主な機能

### 1. 極端な値の検出
- JavaScriptの数値限界値（MAX_SAFE_INTEGER等）の検出
- 科学記法での極端に大きな値の検出
- 16進数、8進数、2進数表記の拒否
- 同じ数字の連続入力の検出
- 数学定数（π、e等）の直接入力の検出

### 2. フィールドタイプ別の検証
- **価格フィールド**: 10万円〜100億円の範囲
- **パーセンテージ**: 0%〜100%の範囲
- **年数**: 1年〜100年の範囲
- **面積**: 0.01㎡〜100万㎡の範囲

### 3. 入力値の前処理
- 全角数字を半角に変換
- カンマの除去
- 余分な空白の除去
- 複数の小数点の修正
- 先頭の0の除去（0.xxxを除く）

### 4. 複数フィールド間の論理的整合性チェック
- 極端な利回り（50%超または0.1%未満）の検出
- 極端な容積率（2000%超）の検出
- LTV（借入比率）100%超の検出
- 極端な㎡単価の検出

## 使用方法

### 基本的な極端値検証
```typescript
import { validateExtremeValue } from '@/utils/extremeValueValidator'

// 価格フィールドの検証
const result = validateExtremeValue('10000000', 'price')
if (!result.isValid) {
  console.error(result.message)
} else {
  const sanitizedValue = result.sanitizedValue // 10000000
}
```

### 入力値の前処理
```typescript
import { preprocessExtremeInput } from '@/utils/extremeValueValidator'

const processed = preprocessExtremeInput('１，０００，０００')
// 結果: '1000000'
```

### 複数フィールドの整合性チェック
```typescript
import { validateFieldCombinations } from '@/utils/extremeValueValidator'

const fields = {
  purchasePrice: 1000000,   // 100万円
  monthlyRent: 500000,      // 50万円
  landArea: 100,
  buildingArea: 200,
  loanAmount: 2000000
}

const result = validateFieldCombinations(fields)
if (!result.isValid) {
  result.messages.forEach(msg => console.error(msg))
}
```

## 検出される極端な値のパターン

### 1. 数値限界値
- `Number.MAX_SAFE_INTEGER` (9007199254740991)
- `Number.MAX_VALUE` (1.7976931348623157e+308)
- `Infinity`, `-Infinity`
- `NaN`

### 2. 特殊な入力パターン
- 科学記法: `1e100`, `9e15`
- 16進数: `0xFF`, `0xff`
- 8進数: `0o777`
- 2進数: `0b1111`
- 同じ数字の連続: `1111111111`（10桁以上）
- 数学定数: `Math.PI`, `Math.E`

### 3. 実用的でない値
- 物件価格: 10万円未満、100億円超
- 利回り: 0.1%未満、50%超
- 容積率: 2000%超
- LTV: 100%超
- ㎡単価: 1000円/㎡未満、5000万円/㎡超

## セキュリティ上の注意点

1. **入力長の制限**
   - 20文字を超える入力は自動的に拒否
   - メモリ消費攻撃を防止

2. **型変換の安全性**
   - `parseFloat`による安全な数値変換
   - 文字列操作による前処理

3. **エラーメッセージ**
   - ユーザーフレンドリーなメッセージ
   - 技術的詳細は隠蔽

## テスト
25個のユニットテストを実装済み：
- 価格フィールドの範囲検証
- パーセンテージの範囲検証
- 特殊な値の検出
- 入力の前処理
- フィールド間の整合性チェック

```bash
npm test extremeValueValidator.test.ts
```

## 関連ファイル
- `/src/utils/extremeValueValidator.ts` - 実装
- `/src/utils/__tests__/extremeValueValidator.test.ts` - テスト
- `/src/pages/Simulator.tsx` - 使用例（handleInputChange関数）

## SEC-017との関係
- SEC-017: 基本的な数値検証（NaN、Infinity、範囲チェック）
- SEC-013: 極端な値の追加検証（特殊パターン、フィールド間整合性）
- 両方を組み合わせることで、より堅牢な数値入力検証を実現