import type { Metadata } from 'next'
import CalculatorsClient from './CalculatorsClient'

export const metadata: Metadata = {
  title: '各種計算ツール - 大家DX',
  description: '不動産投資に必要な各種計算ツールを無料でご利用いただけます。仲介手数料、不動産取得税、登録免許税など。'
}

export default function CalculatorsPage() {
  return <CalculatorsClient />
}
