'use client'

// =================================================================
// 早見表コンポーネント（2列・3列対応）
// =================================================================

/** 2列用の行データ */
export interface QuickReferenceRow {
  label: string
  value: string
  subValue?: string
}

/** 3列用の行データ */
export interface QuickReferenceRow3Col {
  label: string
  value1: string
  value2: string
}

/** ヘッダーの補足情報（3列用） */
export interface HeaderWithSub {
  title: string
  sub?: string
}

// =================================================================
// 2列の早見表
// =================================================================
interface QuickReferenceTableProps {
  title: string
  description?: string
  headers: [string, string]
  rows: QuickReferenceRow[]
  note?: string
}

export function QuickReferenceTable({
  title,
  description,
  headers,
  rows,
  note
}: QuickReferenceTableProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">
                {headers[0]}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">
                {headers[1]}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="border border-gray-300 px-3 py-2 text-gray-900">
                  {row.label}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  <span className="font-semibold text-blue-600">{row.value}</span>
                  {row.subValue && (
                    <span className="block text-xs text-gray-500">
                      {row.subValue}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {note && (
        <p className="text-xs text-gray-500 mt-2 whitespace-pre-line">{note}</p>
      )}
    </div>
  )
}

// =================================================================
// 3列の早見表（比較用）
// =================================================================
interface QuickReferenceTable3ColProps {
  title: string
  description?: string
  headers: [string, HeaderWithSub, HeaderWithSub]
  rows: QuickReferenceRow3Col[]
  note?: string
}

/**
 * 3列の早見表（比較用）
 *
 * 使用例:
 * <QuickReferenceTable3Col
 *   title="贈与税額早見表"
 *   headers={[
 *     '贈与金額',
 *     { title: '特例税率', sub: '父母・祖父母→子・孫' },
 *     { title: '一般税率', sub: 'その他の贈与' },
 *   ]}
 *   rows={[
 *     { label: '100万円', value1: '0円', value2: '0円' },
 *     { label: '200万円', value1: '9万円', value2: '9万円' },
 *   ]}
 * />
 */
export function QuickReferenceTable3Col({
  title,
  description,
  headers,
  rows,
  note
}: QuickReferenceTable3ColProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">
                {headers[0]}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">
                <span className="block">{headers[1].title}</span>
                {headers[1].sub && (
                  <span className="block text-xs font-normal text-gray-500">{headers[1].sub}</span>
                )}
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">
                <span className="block">{headers[2].title}</span>
                {headers[2].sub && (
                  <span className="block text-xs font-normal text-gray-500">{headers[2].sub}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="border border-gray-300 px-3 py-2 text-gray-900">
                  {row.label}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-blue-600">
                  {row.value1}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-blue-600">
                  {row.value2}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {note && (
        <p className="text-xs text-gray-500 mt-2 whitespace-pre-line">{note}</p>
      )}
    </div>
  )
}
