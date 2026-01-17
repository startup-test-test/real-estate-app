/**
 * シミュレーター直下の注記コンポーネント
 *
 * 計算結果の直後に表示する短い注意文
 * 全シミュレーターで統一して使用
 */

export function CalculatorNote() {
  return (
    <div className="mt-4 text-sm text-gray-600">
      <p>※本計算結果は概算値です。実際の金額は異なる場合があります。</p>
      <p className="mt-1">※最終的な判断は専門家（税理士・宅建業者・司法書士等）にご相談ください。</p>
    </div>
  )
}
