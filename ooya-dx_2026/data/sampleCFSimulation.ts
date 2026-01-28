/**
 * CFシミュレーター用サンプル物件データ
 * 初回ユーザー向けの体験用物件
 */

import { CFSimulationData } from '@/hooks/useCFSimulations';

export const sampleCFSimulation: CFSimulationData = {
  id: 'cf-sample-001',
  userId: 'sample',
  name: '【サンプル】CFシミュレーション',

  // 入力データ
  inputData: {
    propertyName: '【サンプル】CFシミュレーション',
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

  // キャッシュフローテーブル（サンプル）
  cashFlowTable: [
    { '年次': 1, '実効収入': 3420000, '経費': 700000, 'ローン返済': 1626000, '営業CF': 1094000, '累計CF': 1094000, '借入残高': 43740000 },
    { '年次': 2, '実効収入': 3386000, '経費': 707000, 'ローン返済': 1626000, '営業CF': 1053000, '累計CF': 2147000, '借入残高': 42460000 },
    { '年次': 3, '実効収入': 3352000, '経費': 714000, 'ローン返済': 1626000, '営業CF': 1012000, '累計CF': 3159000, '借入残高': 41150000 },
    { '年次': 4, '実効収入': 3319000, '経費': 721000, 'ローン返済': 1626000, '営業CF': 972000, '累計CF': 4131000, '借入残高': 39810000 },
    { '年次': 5, '実効収入': 3286000, '経費': 728000, 'ローン返済': 1626000, '営業CF': 932000, '累計CF': 5063000, '借入残高': 38440000 },
  ],

  status: '検討中',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * サンプルCFシミュレーションかどうかを判定
 */
export const isSampleCFSimulation = (id: string): boolean => {
  return id === 'cf-sample-001';
};
