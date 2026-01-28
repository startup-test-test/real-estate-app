import type { Metadata } from 'next'
import { MypageLayoutClient } from './MypageLayoutClient'

export const metadata: Metadata = {
  title: '収益シミュレーション - 大家DX',
  description: '保存したシミュレーションの管理を行えます。'
}

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MypageLayoutClient>{children}</MypageLayoutClient>
}
