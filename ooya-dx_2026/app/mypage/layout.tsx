import type { Metadata } from 'next'
import { MypageLayoutClient } from './MypageLayoutClient'

export const metadata: Metadata = {
  title: 'マイページ - 大家DX',
  description: 'サービスの管理、シミュレーション、請求管理を行えます。'
}

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MypageLayoutClient>{children}</MypageLayoutClient>
}
