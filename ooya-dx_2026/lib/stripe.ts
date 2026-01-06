import Stripe from "stripe";

// Stripe インスタンスの初期化を遅延させ、環境変数未設定時のビルド失敗を回避
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  _stripe = new Stripe(key, { typescript: true });
  return _stripe;
}

// 価格IDを環境変数から取得
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!;

// サブスクリプションのステータスを日本語に変換
export function getSubscriptionStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "有効";
    case "trialing":
      return "トライアル中";
    case "past_due":
      return "支払い遅延";
    case "canceled":
      return "キャンセル済み";
    case "incomplete":
      return "未完了";
    case "unpaid":
      return "未払い";
    default:
      return status;
  }
}

// サブスクリプションの状態を判定
export function isSubscriptionActive(status: string): boolean {
  return status === "active" || status === "trialing";
}

// current_period_end がイベントによって SubscriptionItem 側にしか無いケースに対応
export function extractCurrentPeriodEndSeconds(sub: any): number | null {
  // 1) 通常の subscription.current_period_end
  const direct = sub?.current_period_end as number | undefined;
  if (typeof direct === "number" && direct > 0) return direct;

  // 2) items.data[0].current_period_end（classic billing など）
  const items = sub?.items?.data as any[] | undefined;
  const fromItem = items?.find(
    (i) => typeof i?.current_period_end === "number"
  );
  if (fromItem?.current_period_end)
    return fromItem.current_period_end as number;

  return null;
}
