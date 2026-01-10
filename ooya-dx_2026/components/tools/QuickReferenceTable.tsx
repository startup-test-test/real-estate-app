'use client'

import React from 'react'

export interface QuickReferenceRow {
  label: string
  value: string
  subValue?: string
}

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
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                {headers[0]}
              </th>
              <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
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
                <td className="border border-gray-300 px-4 py-3 text-gray-900">
                  {row.label}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-right">
                  <span className="font-semibold text-blue-600">{row.value}</span>
                  {row.subValue && (
                    <span className="block text-xs text-gray-500 mt-1">
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
        <p className="text-xs text-gray-500 mt-2">{note}</p>
      )}
    </div>
  )
}
