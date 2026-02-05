import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'よくある質問 | 大家DX',
  description: '大家DXに関するよくある質問と回答をまとめました。',
  alternates: {
    canonical: '/faq',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
