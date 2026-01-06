import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // ユーザーのサブスクリプション情報を取得
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id },
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'サブスクリプションが見つかりません' },
        { status: 404 }
      )
    }

    // return_urlの確認
    const returnUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/billing`
      : 'http://localhost:3002/billing'

    // Stripeカスタマーポータルセッションを作成
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Portal session error:', error)
    return NextResponse.json(
      { 
        error: 'エラーが発生しました',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
