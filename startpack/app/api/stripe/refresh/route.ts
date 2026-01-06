import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { getStripe, extractCurrentPeriodEndSeconds } from "@/lib/stripe";
import { SubscriptionStatus } from "@prisma/client";

export async function POST(_req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user)
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const local = await prisma.subscription.findFirst({
      where: { userId: user.id },
    });
    if (!local?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "サブスクリプションが見つかりません" },
        { status: 404 }
      );
    }

    const remote = await getStripe().subscriptions.retrieve(
      local.stripeSubscriptionId
    );

    const cpe = extractCurrentPeriodEndSeconds(remote as any);
    const currentPeriodEnd = cpe ? new Date(cpe * 1000) : null;
    const cancelAt = remote.cancel_at
      ? new Date(remote.cancel_at * 1000)
      : null;
    const cancelAtPeriodEnd = Boolean(remote.cancel_at_period_end);

    const saved = await prisma.subscription.update({
      where: { id: local.id },
      data: {
        status: remote.status as SubscriptionStatus,
        currentPeriodEnd,
        cancelAt,
        cancelAtPeriodEnd,
      },
    });

    return NextResponse.json({ subscription: saved });
  } catch (error) {
    console.error("Refresh subscription error:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
