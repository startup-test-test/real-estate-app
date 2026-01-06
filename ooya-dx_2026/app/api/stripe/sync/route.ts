import { NextRequest, NextResponse } from "next/server";
import { getStripe, extractCurrentPeriodEndSeconds } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth/server";
import { SubscriptionStatus } from "@prisma/client";

// フォールバック用: Checkout からの戻り時に、webhook 未反映でも DB を同期待ち/更新する
export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId が必要です" },
        { status: 400 }
      );
    }

    // Checkout セッションを取得
    const session = await getStripe().checkout.sessions.retrieve(
      sessionId as string
    );

    // セッションの所有者を確認（改ざん防止）
    if (session.client_reference_id !== user.id) {
      return NextResponse.json(
        { error: "不正なリクエストです" },
        { status: 403 }
      );
    }

    if (!session.subscription || !session.customer) {
      return NextResponse.json(
        { error: "サブスクリプション情報が見つかりません" },
        { status: 404 }
      );
    }

    const subscription = await getStripe().subscriptions.retrieve(
      session.subscription as string
    );
    const cpe = extractCurrentPeriodEndSeconds(subscription as any);
    const currentPeriodEnd = cpe ? new Date(cpe * 1000) : null;
    const cancelAt = subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000)
      : null;
    const cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);

    // DB をアップサート
    const saved = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        status: subscription.status as SubscriptionStatus,
        currentPeriodEnd,
        cancelAt,
        cancelAtPeriodEnd,
      } as any,
      create: {
        userId: user.id,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        status: subscription.status as SubscriptionStatus,
        currentPeriodEnd,
        cancelAt,
        cancelAtPeriodEnd,
      } as any,
    });

    return NextResponse.json({ subscription: saved });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "同期に失敗しました" }, { status: 500 });
  }
}
