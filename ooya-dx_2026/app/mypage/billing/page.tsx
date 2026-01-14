import { redirect } from 'next/navigation'

// 無料化対応: 課金管理ページは使用停止
// 将来的に有料機能を追加する場合に備えて、ファイルは残しておく
// 元のコードは page.tsx.bak として保存することを推奨

export default function BillingPage() {
  redirect('/mypage')
}
