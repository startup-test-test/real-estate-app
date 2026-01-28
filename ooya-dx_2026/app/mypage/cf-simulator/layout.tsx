import type { Metadata } from 'next'
import { CFSimulatorLayoutClient } from './CFSimulatorLayoutClient'

export const metadata: Metadata = {
  title: 'CFシミュレーション - 大家DX',
  description: '賃貸物件のキャッシュフローを詳細にシミュレーション'
}

export default function CFSimulatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CFSimulatorLayoutClient>{children}</CFSimulatorLayoutClient>
}
