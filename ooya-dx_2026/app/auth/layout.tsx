import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン・登録｜大家DX',
  description: '大家DXサービスへのログイン・新規登録',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}