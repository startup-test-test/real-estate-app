import { Metadata } from 'next'
import { ComponentShowcase } from './ComponentShowcase'

export const metadata: Metadata = {
  title: 'コンポーネント一覧 | 開発者用',
  robots: 'noindex, nofollow',
}

export default function ComponentsPage() {
  return <ComponentShowcase />
}
