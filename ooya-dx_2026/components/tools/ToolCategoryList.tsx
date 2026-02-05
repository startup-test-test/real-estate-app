'use client'

import Link from 'next/link'
import { ArrowRight, Percent, BarChart3, Building2, Receipt, Wallet, Calendar, LucideIcon } from 'lucide-react'

// カテゴリ別ツールデータ
const toolCategories: {
  category: string
  icon: LucideIcon
  tools: { href: string; title: string }[]
}[] = [
  {
    category: '利回りを計算したい',
    icon: Percent,
    tools: [
      { href: '/tools/yield-rate', title: '表面利回り・実質利回り' },
      { href: '/tools/cap-rate', title: 'キャップレート' },
      { href: '/tools/income-capitalization', title: '収益還元（直接還元法）' },
      { href: '/tools/assessed-value', title: '積算評価' },
      { href: '/tools/replacement-cost', title: '再調達価格' },
    ]
  },
  {
    category: '収益性を分析したい',
    icon: BarChart3,
    tools: [
      { href: '/tools/noi', title: 'NOI（営業純収益）' },
      { href: '/tools/ccr', title: 'CCR（自己資金配当率）' },
      { href: '/tools/dscr', title: 'DSCR（返済余力）' },
      { href: '/tools/npv', title: 'NPV（正味現在価値）' },
      { href: '/tools/roi', title: 'ROI（投資利益率）' },
    ]
  },
  {
    category: 'ローンを計算したい',
    icon: Building2,
    tools: [
      { href: '/tools/mortgage-loan', title: '住宅ローン返済額' },
      { href: '/tools/ltv', title: 'LTV（借入比率）' },
      { href: '/tools/cf', title: 'CF（キャッシュフロー）' },
    ]
  },
  {
    category: '税金・費用を計算したい',
    icon: Receipt,
    tools: [
      { href: '/tools/acquisition-tax', title: '不動産取得税' },
      { href: '/tools/registration-tax', title: '登録免許税' },
      { href: '/tools/stamp-tax', title: '印紙税' },
      { href: '/tools/brokerage', title: '仲介手数料' },
      { href: '/tools/corporate-tax', title: '法人税' },
    ]
  },
  {
    category: '売却時の手取りを知りたい',
    icon: Wallet,
    tools: [
      { href: '/tools/sale-proceeds', title: '売却手取り' },
      { href: '/tools/capital-gains-tax', title: '譲渡所得税' },
      { href: '/tools/depreciation', title: '減価償却' },
    ]
  },
  {
    category: '長期収支を把握したい',
    icon: Calendar,
    tools: [
      { href: '/tools/irr', title: 'IRR（内部収益率）' },
      { href: '/tools/dcf', title: 'DCF法' },
      { href: '/tools/dead-cross', title: 'デッドクロス' },
    ]
  },
]

interface ToolCategoryListProps {
  /** モバイル表示用スタイル */
  mobile?: boolean
}

/**
 * ツールカテゴリ一覧
 * サイドバーやモバイル用に表示
 */
export function ToolCategoryList({ mobile = false }: ToolCategoryListProps) {
  return (
    <div>
      <p className={`font-bold text-gray-900 pb-2 border-b border-dashed border-gray-900 ${
        mobile ? 'text-base mb-3' : 'text-lg mb-4'
      }`}>
        無料で使える計算ツール
        <span className="text-sm font-medium text-white bg-primary-600 px-2 py-0.5 rounded ml-2">
          全24種類
        </span>
      </p>
      <div className="space-y-4">
        {toolCategories.map((category) => {
          const IconComponent = category.icon
          return (
            <div key={category.category}>
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className="h-5 w-5 text-primary-600" />
                <p className="text-base font-bold text-gray-900">{category.category}</p>
              </div>
              <div className={`space-y-1 ${mobile ? 'ml-6' : 'ml-6'}`}>
                {category.tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`block text-sm text-gray-700 hover:text-primary-600 rounded-lg transition-colors ${
                      mobile
                        ? 'py-2 px-3 bg-gray-50 hover:bg-gray-100'
                        : 'py-1.5 px-2 hover:bg-gray-50'
                    }`}
                  >
                    {tool.title}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link
          href="/tools"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
        >
          すべての計算ツールを見る
          <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </div>
    </div>
  )
}
