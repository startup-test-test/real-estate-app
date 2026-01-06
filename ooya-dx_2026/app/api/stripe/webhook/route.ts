import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

// Webhook は常に動的実行にし、キャッシュやプリレンダーを無効化
export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helpers: 軽いリトライで Stripe 側の伝播遅延やイベント順序を吸収
async function wait(delayMs: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function retrieveSubscriptionWithRetry(
  subscriptionId: string,
  maxAttempts = 4,
  delayMs = 700
): Promise<Stripe.Subscription | null> {
  let last: Stripe.Subscription | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const sub = (await getStripe().subscriptions.retrieve(
        subscriptionId
      )) as unknown as Stripe.Subscription;
      last = sub;
      if ((sub as any)?.current_period_end) return sub;
    } catch (e) {
      if (attempt === maxAttempts) {
        console.warn(
          "Unable to fetch subscription with retry:",
          (e as any)?.message || e
        );
      }
    }
    if (attempt < maxAttempts) await wait(delayMs);
  }
  return last;
}

async function backfillCurrentPeriodEndWhenMissing(
  userId: string,
  subscriptionId: string,
  maxAttempts = 8,
  delayMs = 1500
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const sub = (await retrieveSubscriptionWithRetry(
      subscriptionId,
      1,
      delayMs
    )) as any;
    const cpe: number | undefined = sub?.current_period_end;
    if (cpe) {
      try {
        await prisma.subscription.update({
          where: { userId },
          data: {
            currentPeriodEnd: new Date(cpe * 1000),
          } as any,
        });
      } catch {}
      return;
    }
    if (attempt < maxAttempts) await wait(delayMs);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!webhookSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // イベントタイプごとに処理
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // セッションに必要情報がある場合のみ処理
        if (
          session.client_reference_id &&
          session.customer &&
          session.subscription
        ) {
          const userId = session.client_reference_id as string;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          // Stripe の Subscription を取得（リトライで current_period_end 取得を安定化）
          const sub = await retrieveSubscriptionWithRetry(subscriptionId);

          const status =
            (sub?.status as SubscriptionStatus) ||
            ("incomplete" as SubscriptionStatus);
          const currentPeriodEnd = (sub as any)?.current_period_end
            ? new Date(((sub as any).current_period_end as number) * 1000)
            : null;
          const cancelAt = (sub as any)?.cancel_at
            ? new Date(((sub as any).cancel_at as number) * 1000)
            : null;
          const cancelAtPeriodEnd = Boolean((sub as any)?.cancel_at_period_end);

          try {
            await prisma.subscription.upsert({
              where: { userId },
              update: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                status,
                currentPeriodEnd,
                cancelAt,
                cancelAtPeriodEnd,
              } as any,
              create: {
                userId,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                status,
                currentPeriodEnd,
                cancelAt,
                cancelAtPeriodEnd,
              } as any,
            });
            // もし currentPeriodEnd が未確定なら、遅延再取得でバックフィル
            if (!currentPeriodEnd) {
              await backfillCurrentPeriodEndWhenMissing(userId, subscriptionId);
            }
          } catch (e: any) {
            // 一意制約衝突などの場合は既存レコードに対して updateMany でフォールバック
            const msg = e?.message || String(e);
            console.warn(
              "Webhook upsert failed; applying fallback update.",
              msg
            );
            await prisma.subscription.updateMany({
              where: { stripeSubscriptionId: subscriptionId },
              data: {
                userId,
                stripeCustomerId: customerId,
                status,
                currentPeriodEnd,
                cancelAt,
                cancelAtPeriodEnd,
              } as any,
            });
          }
        }
        break;
      }

      case "customer.subscription.created": {
        const created = event.data.object as Stripe.Subscription;
        const sub = await retrieveSubscriptionWithRetry(created.id);

        const cancelAt = sub?.cancel_at ? new Date(sub.cancel_at * 1000) : null;
        const cancelAtPeriodEnd = Boolean(sub?.cancel_at_period_end);
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: (sub ?? created).id },
          data: {
            status: (sub?.status ?? created.status) as SubscriptionStatus,
            currentPeriodEnd: (sub as any)?.current_period_end
              ? new Date(((sub as any).current_period_end as number) * 1000)
              : (created as any).current_period_end
                ? new Date(
                    ((created as any).current_period_end as number) * 1000
                  )
                : null,
            cancelAt,
            cancelAtPeriodEnd,
          } as any,
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // サブスクリプションのステータス/期日/解約予約を更新
        const cancelAt = subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000)
          : null;
        const cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status as SubscriptionStatus,
            currentPeriodEnd: (subscription as any).current_period_end
              ? new Date((subscription as any).current_period_end * 1000)
              : null,
            cancelAt,
            cancelAtPeriodEnd,
          } as any,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // サブスクリプションをキャンセル済みに更新（終了日時・キャンセル実行時刻も保存）
        const canceledAt = (subscription as any).canceled_at
          ? new Date((subscription as any).canceled_at * 1000)
          : null;
        const cpeSeconds =
          (subscription as any).current_period_end ??
          (subscription as any).ended_at ??
          null;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: "canceled",
            currentPeriodEnd:
              typeof cpeSeconds === "number"
                ? new Date(cpeSeconds * 1000)
                : null,
            cancelAt: canceledAt,
            cancelAtPeriodEnd: false,
          } as any,
        });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof (invoice as any).subscription === "string"
            ? ((invoice as any).subscription as string)
            : undefined;

        if (subId) {
          // 支払い失敗をログに記録（必要に応じてメール送信などの処理を追加）
          console.error(`❌ Payment failed for subscription: ${subId}`);

          // サブスクリプションのステータスを更新
          const sub = (await getStripe().subscriptions.retrieve(
            subId
          )) as unknown as Stripe.Subscription;

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: {
              status: sub.status as SubscriptionStatus,
            } as any,
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof (invoice as any).subscription === "string"
            ? ((invoice as any).subscription as string)
            : undefined;

        if (subId) {
          // 支払い成功時: ステータスと次回請求日を更新
          const sub = (await getStripe().subscriptions.retrieve(
            subId
          )) as unknown as Stripe.Subscription;

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: {
              status: sub.status as SubscriptionStatus,
              currentPeriodEnd: (sub as any).current_period_end
                ? new Date((sub as any).current_period_end * 1000)
                : null,
            } as any,
          });
        }
        break;
      }

      default:
      // 未処理のイベントタイプは無視
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Stripeの生のボディを扱うため、bodyParserを無効化
export const runtime = "nodejs";
