/**
 * Subscription helper functions
 * 残日数計算とフォーマット関数
 */

/**
 * 解約予定日までの残日数を計算
 * @param cancelAt - 解約予定日時（ISO文字列またはnull）
 * @returns 残日数（0以上の整数）
 */
export const calculateRemainingDays = (cancelAt: string | null | undefined): number => {
  if (!cancelAt) return 0
  
  try {
    const cancelDate = new Date(cancelAt)
    const now = new Date()
    
    // 無効な日付の場合は0を返す
    if (isNaN(cancelDate.getTime())) {
      console.error('Invalid cancel date:', cancelAt)
      return 0
    }
    
    // ミリ秒単位の差分を日数に変換（切り上げ）
    const diffMs = cancelDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    // 負の値の場合は0を返す
    return diffDays > 0 ? diffDays : 0
  } catch (error) {
    console.error('Error calculating remaining days:', error)
    return 0
  }
}

/**
 * 残日数を人間が読みやすい形式にフォーマット
 * @param days - 残日数
 * @returns フォーマットされた文字列
 */
export const formatRemainingTime = (days: number): string => {
  if (days <= 0) return '本日で終了'
  if (days === 1) return 'あと1日'
  // シンプルに日数で表示
  return `あと${days}日`
}

/**
 * 解約日を日本語形式でフォーマット
 * @param cancelAt - 解約予定日時（ISO文字列）
 * @returns フォーマットされた日付文字列
 */
export const formatCancelDate = (cancelAt: string | null | undefined): string => {
  if (!cancelAt) return '未定'
  
  try {
    const date = new Date(cancelAt)
    
    // 無効な日付の場合
    if (isNaN(date.getTime())) {
      console.error('Invalid date for formatting:', cancelAt)
      return '日付エラー'
    }
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting cancel date:', error)
    return '日付エラー'
  }
}

/**
 * サブスクリプションのステータスを判定
 * @param subscription - サブスクリプションオブジェクト
 * @returns ステータス情報
 */
export const getSubscriptionStatus = (subscription: any) => {
  // サブスクリプションが存在しない場合
  if (!subscription) {
    return {
      isActive: false,
      isPremium: false,
      isCanceling: false,
      remainingDays: 0,
      displayText: '無料プラン',
      statusColor: 'gray'
    }
  }
  
  // 解約予定がある場合
  if (subscription.cancel_at_period_end && subscription.cancel_at) {
    const remainingDays = calculateRemainingDays(subscription.cancel_at)
    return {
      isActive: true,
      isPremium: true,
      isCanceling: true,
      remainingDays,
      displayText: `プレミアム会員（${formatRemainingTime(remainingDays)}）`,
      statusColor: 'amber'
    }
  }
  
  // アクティブなプレミアムプラン
  if (subscription.status === 'active') {
    return {
      isActive: true,
      isPremium: true,
      isCanceling: false,
      remainingDays: null,
      displayText: 'プレミアム会員',
      statusColor: 'yellow'
    }
  }
  
  // その他のステータス
  return {
    isActive: false,
    isPremium: false,
    isCanceling: false,
    remainingDays: 0,
    displayText: '無料プラン',
    statusColor: 'gray'
  }
}

/**
 * 次回請求日をフォーマット
 * @param periodEnd - 期間終了日時（ISO文字列）
 * @returns フォーマットされた日付文字列
 */
export const formatNextBillingDate = (periodEnd: string | null | undefined): string => {
  if (!periodEnd) return '未定'
  
  try {
    const date = new Date(periodEnd)
    
    if (isNaN(date.getTime())) {
      return '日付エラー'
    }
    
    // 次回請求日は期間終了日の翌日
    const nextBilling = new Date(date)
    nextBilling.setDate(nextBilling.getDate() + 1)
    
    return nextBilling.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting next billing date:', error)
    return '日付エラー'
  }
}