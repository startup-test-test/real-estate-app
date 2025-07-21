/**
 * SEC-025: レート制限の実装
 * API呼び出しの頻度を制御してDoS攻撃を防止
 */

interface RateLimitConfig {
  maxRequests: number;      // 最大リクエスト数
  windowMs: number;         // 時間枠（ミリ秒）
  blockDurationMs?: number; // ブロック期間（ミリ秒）
}

interface RequestInfo {
  count: number;
  firstRequestTime: number;
  blockedUntil?: number;
}

export class RateLimiter {
  private requests: Map<string, RequestInfo> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private config: RateLimitConfig) {
    // デフォルト値の設定
    this.config.blockDurationMs = config.blockDurationMs || 60000; // デフォルト1分間ブロック

    // 定期的に古いエントリをクリーンアップ
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.windowMs);
  }

  /**
   * リクエストが許可されるかチェック
   * @param identifier ユーザーまたはリソースの識別子
   * @returns 許可される場合true、制限される場合false
   */
  public async checkLimit(identifier: string): Promise<boolean> {
    const now = Date.now();
    const requestInfo = this.requests.get(identifier);

    // ブロック中かチェック
    if (requestInfo?.blockedUntil && now < requestInfo.blockedUntil) {
      return false;
    }

    // 新規または期限切れのリクエスト
    if (!requestInfo || now - requestInfo.firstRequestTime >= this.config.windowMs) {
      this.requests.set(identifier, {
        count: 1,
        firstRequestTime: now,
        blockedUntil: undefined
      });
      return true;
    }

    // リクエスト数をカウント
    if (requestInfo.count < this.config.maxRequests) {
      requestInfo.count++;
      return true;
    }

    // 制限超過 - ブロック設定
    requestInfo.blockedUntil = now + this.config.blockDurationMs!;
    return false;
  }

  /**
   * 残りリクエスト数を取得
   * @param identifier ユーザーまたはリソースの識別子
   */
  public getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requestInfo = this.requests.get(identifier);

    if (!requestInfo || now - requestInfo.firstRequestTime >= this.config.windowMs) {
      return this.config.maxRequests;
    }

    if (requestInfo.blockedUntil && now < requestInfo.blockedUntil) {
      return 0;
    }

    return Math.max(0, this.config.maxRequests - requestInfo.count);
  }

  /**
   * リセットまでの時間を取得（ミリ秒）
   * @param identifier ユーザーまたはリソースの識別子
   */
  public getResetTime(identifier: string): number {
    const now = Date.now();
    const requestInfo = this.requests.get(identifier);

    if (!requestInfo) {
      return 0;
    }

    if (requestInfo.blockedUntil && now < requestInfo.blockedUntil) {
      return requestInfo.blockedUntil - now;
    }

    const timeElapsed = now - requestInfo.firstRequestTime;
    const resetTime = this.config.windowMs - timeElapsed;
    return Math.max(0, resetTime);
  }

  /**
   * 特定のユーザーのレート制限をリセット
   * @param identifier ユーザーまたはリソースの識別子
   */
  public reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * 古いエントリをクリーンアップ
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, info] of this.requests.entries()) {
      // ブロック期間が終了し、かつウィンドウ期間も過ぎたエントリを削除
      if (
        (!info.blockedUntil || now >= info.blockedUntil) &&
        now - info.firstRequestTime >= this.config.windowMs
      ) {
        this.requests.delete(identifier);
      }
    }
  }

  /**
   * リソースのクリーンアップ
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.requests.clear();
  }
}

// デフォルトのレート制限設定
export const defaultRateLimitConfigs = {
  // API呼び出し用（1分間に10回まで）
  api: {
    maxRequests: 10,
    windowMs: 60 * 1000,
    blockDurationMs: 5 * 60 * 1000 // 5分間ブロック
  },
  // シミュレーション実行用（5分間に5回まで）
  simulation: {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000,
    blockDurationMs: 10 * 60 * 1000 // 10分間ブロック
  },
  // ファイルアップロード用（1分間に5回まで）
  upload: {
    maxRequests: 5,
    windowMs: 60 * 1000,
    blockDurationMs: 5 * 60 * 1000 // 5分間ブロック
  }
};

// グローバルインスタンス
export const apiRateLimiter = new RateLimiter(defaultRateLimitConfigs.api);
export const simulationRateLimiter = new RateLimiter(defaultRateLimitConfigs.simulation);
export const uploadRateLimiter = new RateLimiter(defaultRateLimitConfigs.upload);