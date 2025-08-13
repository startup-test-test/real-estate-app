import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateRemainingDays,
  formatRemainingTime,
  formatCancelDate,
  getSubscriptionStatus,
  formatNextBillingDate
} from '../subscriptionHelpers';

describe('subscriptionHelpers', () => {
  // 現在時刻を固定
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-08-13T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateRemainingDays', () => {
    it('未来の日付に対して正しい残日数を返す', () => {
      const cancelAt = '2025-08-20T12:00:00Z';
      expect(calculateRemainingDays(cancelAt)).toBe(7);
    });

    it('同日の場合は1を返す', () => {
      const cancelAt = '2025-08-13T23:59:59Z';
      expect(calculateRemainingDays(cancelAt)).toBe(1);
    });

    it('過去の日付に対して0を返す', () => {
      const cancelAt = '2025-08-10T12:00:00Z';
      expect(calculateRemainingDays(cancelAt)).toBe(0);
    });

    it('nullの場合は0を返す', () => {
      expect(calculateRemainingDays(null)).toBe(0);
    });

    it('undefinedの場合は0を返す', () => {
      expect(calculateRemainingDays(undefined)).toBe(0);
    });

    it('無効な日付文字列の場合は0を返す', () => {
      expect(calculateRemainingDays('invalid-date')).toBe(0);
    });

    it('30日後の場合は30を返す', () => {
      const cancelAt = '2025-09-12T12:00:00Z';
      expect(calculateRemainingDays(cancelAt)).toBe(30);
    });
  });

  describe('formatRemainingTime', () => {
    it('0日の場合「本日で終了」を返す', () => {
      expect(formatRemainingTime(0)).toBe('本日で終了');
    });

    it('1日の場合「あと1日」を返す', () => {
      expect(formatRemainingTime(1)).toBe('あと1日');
    });

    it('7日の場合「あと7日」を返す', () => {
      expect(formatRemainingTime(7)).toBe('あと7日');
    });

    it('14日の場合「あと2週間」を返す', () => {
      expect(formatRemainingTime(14)).toBe('あと2週間');
    });

    it('15日の場合「あと2週間1日」を返す', () => {
      expect(formatRemainingTime(15)).toBe('あと2週間1日');
    });

    it('30日の場合「あと4週間2日」を返す', () => {
      expect(formatRemainingTime(30)).toBe('あと4週間2日');
    });

    it('31日の場合「あと約1ヶ月1日」を返す', () => {
      expect(formatRemainingTime(31)).toBe('あと約1ヶ月1日');
    });

    it('60日の場合「あと2ヶ月」を返す', () => {
      expect(formatRemainingTime(60)).toBe('あと2ヶ月');
    });

    it('負の値の場合「本日で終了」を返す', () => {
      expect(formatRemainingTime(-1)).toBe('本日で終了');
    });
  });

  describe('formatCancelDate', () => {
    it('有効な日付を日本語形式でフォーマット', () => {
      const cancelAt = '2025-08-20T12:00:00Z';
      expect(formatCancelDate(cancelAt)).toMatch(/2025年8月/);
    });

    it('nullの場合「未定」を返す', () => {
      expect(formatCancelDate(null)).toBe('未定');
    });

    it('undefinedの場合「未定」を返す', () => {
      expect(formatCancelDate(undefined)).toBe('未定');
    });

    it('無効な日付の場合「日付エラー」を返す', () => {
      expect(formatCancelDate('invalid-date')).toBe('日付エラー');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('サブスクリプションがない場合は無料プランステータスを返す', () => {
      const status = getSubscriptionStatus(null);
      expect(status).toEqual({
        isActive: false,
        isPremium: false,
        isCanceling: false,
        remainingDays: 0,
        displayText: '無料プラン',
        statusColor: 'gray'
      });
    });

    it('アクティブなプレミアムプランの場合', () => {
      const subscription = {
        status: 'active',
        cancel_at_period_end: false,
        cancel_at: null
      };
      const status = getSubscriptionStatus(subscription);
      expect(status).toEqual({
        isActive: true,
        isPremium: true,
        isCanceling: false,
        remainingDays: null,
        displayText: 'プレミアム会員',
        statusColor: 'yellow'
      });
    });

    it('解約予定のプレミアムプランの場合', () => {
      const subscription = {
        status: 'active',
        cancel_at_period_end: true,
        cancel_at: '2025-08-20T12:00:00Z'
      };
      const status = getSubscriptionStatus(subscription);
      expect(status.isActive).toBe(true);
      expect(status.isPremium).toBe(true);
      expect(status.isCanceling).toBe(true);
      expect(status.remainingDays).toBe(7);
      expect(status.displayText).toContain('プレミアム会員');
      expect(status.displayText).toContain('あと');
      expect(status.statusColor).toBe('amber');
    });

    it('期限切れのサブスクリプションの場合', () => {
      const subscription = {
        status: 'canceled',
        cancel_at_period_end: false,
        cancel_at: null
      };
      const status = getSubscriptionStatus(subscription);
      expect(status).toEqual({
        isActive: false,
        isPremium: false,
        isCanceling: false,
        remainingDays: 0,
        displayText: '無料プラン',
        statusColor: 'gray'
      });
    });
  });

  describe('formatNextBillingDate', () => {
    it('有効な日付の翌日を返す', () => {
      const periodEnd = '2025-08-20T12:00:00Z';
      const result = formatNextBillingDate(periodEnd);
      expect(result).toContain('2025/8/21');
    });

    it('nullの場合「未定」を返す', () => {
      expect(formatNextBillingDate(null)).toBe('未定');
    });

    it('undefinedの場合「未定」を返す', () => {
      expect(formatNextBillingDate(undefined)).toBe('未定');
    });

    it('無効な日付の場合「日付エラー」を返す', () => {
      expect(formatNextBillingDate('invalid-date')).toBe('日付エラー');
    });
  });
});