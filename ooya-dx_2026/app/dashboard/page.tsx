import { redirect } from 'next/navigation'

// 旧URL → 新URLへリダイレクト
export default function DashboardPage() {
  redirect('/mypage')
}
