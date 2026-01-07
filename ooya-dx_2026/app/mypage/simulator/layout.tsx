import type { Metadata } from 'next'
import { SimulatorLayoutClient } from './SimulatorLayoutClient'

export const metadata: Metadata = {
  title: '収益シミュレーター - 大家DX',
  description: '賃貸物件の収益性を詳細にシミュレーション'
}

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SimulatorLayoutClient>{children}</SimulatorLayoutClient>
}
