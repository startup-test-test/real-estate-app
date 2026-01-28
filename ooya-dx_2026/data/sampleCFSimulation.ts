/**
 * CFシミュレーター用サンプル物件データ
 * 初回ユーザー向けの体験用物件
 */

import { CFSimulationData } from '@/hooks/useCFSimulations';

// 35年分のキャッシュフローテーブルを生成
const generateCashFlowTable = () => {
  const table = [];
  let cumulativeCF = 0;
  let loanBalance = 45000000; // 4500万円

  // 毎年のローン元金返済額（概算）
  const annualPrincipal = 45000000 / 35;

  for (let year = 1; year <= 35; year++) {
    // 家賃は毎年1%減少
    const monthlyRent = 300000 * Math.pow(0.99, year - 1);
    const annualRent = monthlyRent * 12;
    // 空室率5%を考慮
    const effectiveIncome = Math.round(annualRent * 0.95);

    // 経費（管理費5% + 固定資産税1%）
    const managementFee = Math.round(annualRent * 0.05);
    const propertyTax = 500000; // 固定
    const expenses = managementFee + propertyTax;

    // ローン返済（元利均等）
    const interestPayment = Math.round(loanBalance * 0.015);
    const loanPayment = Math.round(annualPrincipal + interestPayment);

    // 年間CF
    const annualCF = effectiveIncome - expenses - loanPayment;
    cumulativeCF += annualCF;

    // 借入残高を減少
    loanBalance = Math.max(0, loanBalance - annualPrincipal);

    table.push({
      '年次': year,
      '実効収入': effectiveIncome,
      '経費': expenses,
      'ローン返済': loanPayment,
      '営業CF': annualCF,
      '累計CF': cumulativeCF,
      '借入残高': Math.round(loanBalance),
    });
  }

  return table;
};

export const sampleCFSimulation: CFSimulationData = {
  id: 'cf-sample-001',
  userId: 'sample',
  name: '【サンプル】品川区 1棟アパート',

  // 入力データ
  inputData: {
    propertyName: '【サンプル】品川区 1棟アパート',
    purchasePrice: 5000,      // 5,000万円
    monthlyRent: 30,          // 30万円/月
    loanAmount: 4500,         // 4,500万円（頭金10%）
    interestRate: 1.5,        // 金利1.5%
    loanYears: 35,            // 35年ローン
  },

  // 計算結果（事前計算済み）
  results: {
    surfaceYield: 7.20,       // 表面利回り 7.2%
    netYield: 5.40,           // 実質利回り 5.4%
    annualCashFlow: 82,       // 年間CF 82万円
    noi: 270,                 // NOI 270万円
    irr: 9.5,                 // IRR 9.5%
    ccr: 16.4,                // CCR 16.4%
    dscr: 1.48,               // DSCR 1.48
    ltv: 90.0,                // LTV 90%
  },

  // キャッシュフローテーブル（35年分）
  cashFlowTable: generateCashFlowTable(),

  status: '検討中',
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:00:00.000Z',
};

/**
 * サンプルCFシミュレーションかどうかを判定
 */
export const isSampleCFSimulation = (id: string): boolean => {
  return id === 'cf-sample-001';
};
