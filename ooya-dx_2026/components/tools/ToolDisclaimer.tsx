/**
 * シミュレーター共通の免責事項コンポーネント
 *
 * 全シミュレーターで統一した免責事項を表示するために使用
 * 修正が必要な場合はこのファイルのみを変更すればOK
 */

interface ToolDisclaimerProps {
  /** 最終更新日（例: "2026年1月15日"） */
  lastUpdated?: string
  /** 情報の基準時点（例: "2025年度の税制"） */
  infoDate?: string
  /** 追加の免責事項項目 */
  additionalItems?: string[]
}

export function ToolDisclaimer({
  lastUpdated = '2026年1月15日',
  infoDate = '2025年度の税制',
  additionalItems = [],
}: ToolDisclaimerProps) {
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 mb-2">免責事項</h3>
      <ul className="text-sm text-gray-600 space-y-1">
        <li>・本シミュレーションは、{infoDate}時点の情報をもとに試算しています。</li>
        <li>・本シミュレーターの計算結果は概算値であり、実際の金額は異なる場合があります。</li>
        <li>・本サイトの情報により生じた損害について、当サイト運営者は一切の責任を負いません。</li>
        <li>・最終的な判断は専門家（税理士・宅建業者・司法書士等）にご相談ください。</li>
        {additionalItems.map((item, index) => (
          <li key={index}>・{item}</li>
        ))}
      </ul>
      <p className="text-xs text-gray-500 mt-3">
        最終更新日: {lastUpdated}
      </p>
    </div>
  )
}
