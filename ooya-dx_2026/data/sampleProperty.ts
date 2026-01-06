/**
 * サンプル物件データ
 * 初回ユーザー向けのチュートリアル用物件
 */

export const sampleProperty = {
  id: 'sample-property-001',
  isSample: true,  // サンプル物件識別フラグ
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'sample',
  title: '【サンプル】シミュレーション',
  
  // シミュレーション基本データ
  simulation_data: {
    // 物件基本情報
    propertyName: '【サンプル】シミュレーション',
    purchasePrice: 2800,  // 2,800万円（万円単位）
    
    // 収入情報
    monthlyRent: 125000,  // 月額賃料 12.5万円（円単位）
    annualIncome: 1500000,  // 年間収入 150万円
    
    // 管理費・経費
    managementFee: 8500,  // 管理費 8,500円/月
    repairReserve: 6500,  // 修繕積立金 6,500円/月
    propertyManagementFee: 6250,  // 管理委託料 6,250円/月（賃料の5%）
    
    // ローン情報
    loanAmount: 2520,  // 借入額 2,520万円（頭金10%）
    downPayment: 280,  // 頭金 280万円
    interestRate: 2.3,  // 金利 2.3%
    loanTerms: 35,  // 借入期間 35年
    
    // その他費用
    propertyTax: 84000,  // 固定資産税 年間8.4万円
    insuranceFee: 12000,  // 火災保険料 年間1.2万円
    
    // 売却想定
    saleYears: 10,  // 10年後売却想定
    salePrice: 2520,  // 売却価格 2,520万円（10%下落想定）
    
    // 入居率
    occupancyRate: 95,  // 入居率 95%
    
    // その他設定
    depreciationYears: 47,  // 減価償却年数（RC造）
    expenseRatio: 20,  // 経費率 20%
  },
  
  // 計算結果（事前計算済み）
  results: {
    // 利回り指標
    surfaceYield: 5.36,  // 表面利回り 5.36%
    netYield: 4.12,  // 実質利回り 4.12%
    
    // キャッシュフロー
    monthlyCashFlow: 15800,  // 月間CF 1.58万円
    annualCashFlow: 189600,  // 年間CF 18.96万円
    
    // 10年後指標
    cumulativeCashFlowAt10: 1896000,  // 10年累計CF 189.6万円
    cumulativeCashFlowWithSaleAt10: 3150000,  // 売却込み累計CF 315万円
    
    // 収益効率指標
    roi: 11.25,  // ROI 11.25%（売却込み10年）
    irr: 8.7,  // IRR 8.7%
    dscr: 1.23,  // DSCR 1.23倍
    
    // 回収期間
    paybackPeriod: 14.8,  // 資金回収期間 14.8年
  },
  
  // 表示用メタデータ
  metadata: {
    badge: 'サンプル',
    badgeColor: 'bg-blue-500',
    description: 'クリックしてシミュレーションを体験してみましょう',
    tooltip: 'これはサンプル物件です。実際の物件データではありません。',
    features: [
      '渋谷駅徒歩8分',
      '築10年 RC造',
      '専有面積 25.5㎡',
      '8階/14階建',
      '南向き',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',  // モダンなマンションの画像
  }
};

/**
 * サンプル物件を表示するかどうかを判定
 */
export const shouldShowSampleProperty = (
  userProperties: any[],
  hasSeenTutorial: boolean
): boolean => {
  // 実物件が1件もない && チュートリアルを見ていない
  return userProperties.length === 0 && !hasSeenTutorial;
};

/**
 * チュートリアル完了状態の保存
 */
export const markTutorialAsCompleted = (userId: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`tutorial_completed_${userId}`, 'true');
};

/**
 * チュートリアル完了状態の確認
 */
export const hasTutorialBeenCompleted = (userId: string): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`tutorial_completed_${userId}`) === 'true';
};

/**
 * サンプル物件かどうかを判定
 */
export const isSampleProperty = (property: any): boolean => {
  return property?.isSample === true || property?.id === 'sample-property-001';
};