'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface ToolSidebarCTAProps {
  /** モバイル表示用 */
  mobile?: boolean
}

/**
 * サイドバー用シミュレーターCTA
 * コンパクトなデザインでサイドバーに表示
 */
export function ToolSidebarCTA({ mobile = false }: ToolSidebarCTAProps) {
  return (
    <div className={`bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-100 ${
      mobile ? 'p-6' : 'p-5'
    }`}>
      <p className="text-xl font-bold text-gray-900 mb-4 text-center">
        <span className="block text-sm font-normal text-gray-600 mb-1">
          現役大家さんが開発した、
        </span>
        不動産投資シミュレーター
      </p>
      <Image
        src="/img/kakushin_img01.png"
        alt="不動産投資シミュレーター"
        width={mobile ? 400 : 300}
        height={mobile ? 200 : 150}
        className="w-[90%] h-auto rounded-lg mb-4 mx-auto"
      />
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        {mobile
          ? 'IRR・CCR・DSCR、35年キャッシュフローをワンクリックで算出。物件購入の意思決定をデータで支援します。'
          : '物件情報を入力するだけで、利回り・キャッシュフロー・投資指標を自動計算。投資判断の参考にできます。'
        }
      </p>
      <Link
        href="/tools/simulator"
        className={`inline-flex items-center justify-center w-full bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors ${
          mobile ? 'px-4 py-3' : 'px-4 py-2.5 text-sm'
        }`}
      >
        無料でシミュレーションをする
        <ArrowRight className="h-4 w-4 ml-2" />
      </Link>
    </div>
  )
}
