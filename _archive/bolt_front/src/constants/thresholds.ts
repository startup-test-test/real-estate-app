/**
 * メトリクス判定しきい値定数
 */

export interface MetricThreshold {
  excellent: number;
  good: number;
  warning: number;
}

export const metricThresholds: Record<string, MetricThreshold> = {
  IRR: { excellent: 15, good: 10, warning: 5 },
  CCR: { excellent: 12, good: 8, warning: 5 },
  DSCR: { excellent: 1.5, good: 1.3, warning: 1.1 },
  '表面利回り': { excellent: 8, good: 6, warning: 4 },
  '月間CF': { excellent: 50000, good: 20000, warning: 0 },
  '年間CF': { excellent: 600000, good: 240000, warning: 0 },
  'NOI': { excellent: 1000000, good: 500000, warning: 100000 },
  'ROI': { excellent: 15, good: 10, warning: 5 },
  'LTV': { excellent: 70, good: 80, warning: 90 }, // 逆転論理（低いほど良い）
  '売却益': { excellent: 500, good: 100, warning: 0 }
};

/**
 * メトリクスの評価レベルを取得
 * @param metricName メトリクス名
 * @param value 評価する値
 * @param isReverse 逆転論理かどうか（低いほど良い指標の場合true）
 * @returns 評価レベル ('excellent' | 'good' | 'warning')
 */
export const getMetricLevel = (
  metricName: string,
  value: number,
  isReverse: boolean = false
): 'excellent' | 'good' | 'warning' => {
  const threshold = metricThresholds[metricName];
  if (!threshold) return 'warning';

  if (isReverse) {
    // LTVなど、低いほど良い指標
    if (value <= threshold.excellent) return 'excellent';
    if (value <= threshold.good) return 'good';
    return 'warning';
  } else {
    // 一般的な指標（高いほど良い）
    if (value >= threshold.excellent) return 'excellent';
    if (value >= threshold.good) return 'good';
    return 'warning';
  }
};