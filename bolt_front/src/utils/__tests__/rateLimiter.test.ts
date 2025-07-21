/**
 * SEC-025: レート制限のテスト
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimiter } from '../rateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  const testConfig = {
    maxRequests: 3,
    windowMs: 1000, // 1秒
    blockDurationMs: 2000 // 2秒
  };

  beforeEach(() => {
    vi.useFakeTimers();
    rateLimiter = new RateLimiter(testConfig);
  });

  afterEach(() => {
    rateLimiter.destroy();
    vi.useRealTimers();
  });

  describe('基本的なレート制限', () => {
    it('制限内のリクエストは許可される', async () => {
      const identifier = 'user1';
      
      expect(await rateLimiter.checkLimit(identifier)).toBe(true);
      expect(await rateLimiter.checkLimit(identifier)).toBe(true);
      expect(await rateLimiter.checkLimit(identifier)).toBe(true);
    });

    it('制限を超えたリクエストは拒否される', async () => {
      const identifier = 'user1';
      
      // 3回まで許可
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      
      // 4回目は拒否
      expect(await rateLimiter.checkLimit(identifier)).toBe(false);
    });

    it('異なるユーザーは独立してカウントされる', async () => {
      const user1 = 'user1';
      const user2 = 'user2';
      
      // user1: 3回
      await rateLimiter.checkLimit(user1);
      await rateLimiter.checkLimit(user1);
      await rateLimiter.checkLimit(user1);
      
      // user2: まだ許可される
      expect(await rateLimiter.checkLimit(user2)).toBe(true);
    });
  });

  describe('時間枠のリセット', () => {
    it('時間枠が過ぎるとカウントがリセットされる', async () => {
      const identifier = 'user1';
      
      // 制限まで使用
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      expect(await rateLimiter.checkLimit(identifier)).toBe(false);
      
      // 3秒経過（ブロック期間2秒を超える）
      vi.advanceTimersByTime(3001);
      
      // リセットされて再び許可される
      expect(await rateLimiter.checkLimit(identifier)).toBe(true);
    });
  });

  describe('ブロック機能', () => {
    it('制限超過後はブロック期間中拒否される', async () => {
      const identifier = 'user1';
      
      // 制限まで使用
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      
      // ブロックされる
      expect(await rateLimiter.checkLimit(identifier)).toBe(false);
      
      // 1秒後（時間枠はリセットされるが、まだブロック中）
      vi.advanceTimersByTime(1001);
      expect(await rateLimiter.checkLimit(identifier)).toBe(false);
      
      // さらに1秒後（ブロック解除）
      vi.advanceTimersByTime(1000);
      expect(await rateLimiter.checkLimit(identifier)).toBe(true);
    });
  });

  describe('残りリクエスト数の取得', () => {
    it('残りリクエスト数を正しく返す', async () => {
      const identifier = 'user1';
      
      expect(rateLimiter.getRemainingRequests(identifier)).toBe(3);
      
      await rateLimiter.checkLimit(identifier);
      expect(rateLimiter.getRemainingRequests(identifier)).toBe(2);
      
      await rateLimiter.checkLimit(identifier);
      expect(rateLimiter.getRemainingRequests(identifier)).toBe(1);
      
      await rateLimiter.checkLimit(identifier);
      expect(rateLimiter.getRemainingRequests(identifier)).toBe(0);
    });

    it('ブロック中は0を返す', async () => {
      const identifier = 'user1';
      
      // 制限まで使用
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier); // ブロック
      
      expect(rateLimiter.getRemainingRequests(identifier)).toBe(0);
    });
  });

  describe('リセット時間の取得', () => {
    it('リセットまでの時間を正しく返す', async () => {
      const identifier = 'user1';
      
      await rateLimiter.checkLimit(identifier);
      
      // 初回リクエスト直後
      expect(rateLimiter.getResetTime(identifier)).toBeCloseTo(1000, -2);
      
      // 500ms経過
      vi.advanceTimersByTime(500);
      expect(rateLimiter.getResetTime(identifier)).toBeCloseTo(500, -2);
    });

    it('ブロック中はブロック解除までの時間を返す', async () => {
      const identifier = 'user1';
      
      // ブロックされる
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      
      expect(rateLimiter.getResetTime(identifier)).toBeCloseTo(2000, -2);
      
      // 1秒経過
      vi.advanceTimersByTime(1000);
      expect(rateLimiter.getResetTime(identifier)).toBeCloseTo(1000, -2);
    });
  });

  describe('手動リセット', () => {
    it('特定ユーザーのレート制限をリセットできる', async () => {
      const identifier = 'user1';
      
      // 制限まで使用
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      expect(await rateLimiter.checkLimit(identifier)).toBe(false);
      
      // リセット
      rateLimiter.reset(identifier);
      
      // 再び許可される
      expect(await rateLimiter.checkLimit(identifier)).toBe(true);
      expect(rateLimiter.getRemainingRequests(identifier)).toBe(2);
    });
  });

  describe('クリーンアップ', () => {
    it('古いエントリが自動的にクリーンアップされる', async () => {
      const identifier = 'user1';
      
      await rateLimiter.checkLimit(identifier);
      
      // 時間枠 + ブロック期間が経過
      vi.advanceTimersByTime(3001);
      
      // 新規リクエストとして扱われる
      expect(await rateLimiter.checkLimit(identifier)).toBe(true);
      expect(rateLimiter.getRemainingRequests(identifier)).toBe(2);
    });
  });
});

describe('実際の使用シナリオ', () => {
  it('API呼び出しのレート制限シナリオ', async () => {
    const apiLimiter = new RateLimiter({
      maxRequests: 10,
      windowMs: 60000, // 1分
      blockDurationMs: 300000 // 5分
    });

    const userId = 'user123';
    let successCount = 0;

    // 10回まで成功
    for (let i = 0; i < 10; i++) {
      if (await apiLimiter.checkLimit(userId)) {
        successCount++;
      }
    }
    expect(successCount).toBe(10);

    // 11回目は失敗
    expect(await apiLimiter.checkLimit(userId)).toBe(false);
    expect(apiLimiter.getRemainingRequests(userId)).toBe(0);

    apiLimiter.destroy();
  });

  it('ファイルアップロードのレート制限シナリオ', async () => {
    const uploadLimiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 60000, // 1分
      blockDurationMs: 300000 // 5分
    });

    const userId = 'user456';
    
    // 5回まで許可
    for (let i = 0; i < 5; i++) {
      expect(await uploadLimiter.checkLimit(userId)).toBe(true);
    }

    // 6回目は拒否
    expect(await uploadLimiter.checkLimit(userId)).toBe(false);

    uploadLimiter.destroy();
  });
});