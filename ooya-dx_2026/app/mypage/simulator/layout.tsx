import type { Metadata } from 'next'
import { SimulatorLayoutClient } from './SimulatorLayoutClient'

export const metadata: Metadata = {
  title: '賃貸経営シミュレーター - 大家DX',
  description: '賃貸物件の収益性を詳細にシミュレーション'
}

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SimulatorLayoutClient>{children}</SimulatorLayoutClient>
}
