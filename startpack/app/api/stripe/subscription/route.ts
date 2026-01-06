import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // ユーザーのサブスクリプション情報を取得
    try {
      const sub = await prisma.subscription.findFirst({
        where: { userId: user.id },
      });

      if (!sub) return NextResponse.json({ subscription: null });

      const payload = {
        id: (sub as any).id,
        status: (sub as any).status,
        stripeCustomerId: (sub as any).stripeCustomerId,
        stripeSubscriptionId: (sub as any).stripeSubscriptionId,
        currentPeriodEnd: (sub as any).currentPeriodEnd ?? null,
        cancelAt: (sub as any).cancelAt ?? null,
        cancelAtPeriodEnd: Boolean((sub as any).cancelAtPeriodEnd ?? false),
      };

      return NextResponse.json({ subscription: payload });
    } catch (e: any) {
      const msg = e?.message || String(e);
      console.warn(
        "subscription route fallback (likely schema out of date):",
        msg
      );
      return NextResponse.json({ subscription: null });
    }
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
