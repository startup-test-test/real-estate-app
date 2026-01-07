import { redirect } from 'next/navigation'

// 旧URL → 新URLへリダイレクト
export default function BillingPage() {
  redirect('/mypage/billing')
}
