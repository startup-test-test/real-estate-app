/**
 * SEC-069: エラーハンドラーのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SecureErrorHandler, ERROR_CODES, setupGlobalErrorHandler } from '../errorHandler';

describe('SecureErrorHandler', () => {
  beforeEach(() => {
    // コンソールエラーをモック
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('handle', () => {
    it('ネットワークエラーを適切に処理すること', () => {
      const error = new Error('Network request failed');
      const result = SecureErrorHandler.handle(error);
      
      expect(result.code).toBe(ERROR_CODES.API_NETWORK);
      expect(result.userMessage).toBe('ネットワークエラーが発生しました。接続を確認してください。');
    });
    
    it('タイムアウトエラーを適切に処理すること', () => {
      const error = new Error('Request timeout');
      const result = SecureErrorHandler.handle(error);
      
      expect(result.code).toBe(ERROR_CODES.API_TIMEOUT);
      expect(result.userMessage).toBe('リクエストがタイムアウトしました。もう一度お試しください。');
    });
    
    it('認証エラーを適切に処理すること', () => {
      const error = new Error('Unauthorized access');
      const result = SecureErrorHandler.handle(error);
      
      expect(result.code).toBe(ERROR_CODES.AUTH_FAILED);
      expect(result.userMessage).toBe('ログインに失敗しました。もう一度お試しください。');
    });
    
    it('権限エラーを適切に処理すること', () => {
      const error = new Error('Permission denied');
      const result = SecureErrorHandler.handle(error);
      
      expect(result.code).toBe(ERROR_CODES.PERMISSION_DENIED);
      expect(result.userMessage).toBe('この操作を実行する権限がありません。');
    });
    
    it('未知のエラーを適切に処理すること', () => {
      const error = new Error('Something went wrong');
      const result = SecureErrorHandler.handle(error);
      
      expect(result.code).toBe(ERROR_CODES.UNKNOWN);
      expect(result.userMessage).toBe('予期しないエラーが発生しました。');
    });
    
    it('開発環境では詳細情報を含むこと', () => {
      // 開発環境をモック
      vi.stubGlobal('import', {
        meta: {
          env: {
            ...import.meta.env,
            DEV: true
          }
        }
      });
      
      const error = new Error('Test error');
      const context = { userId: '123' };
      const result = SecureErrorHandler.handle(error, context);
      
      expect(result.logMessage).toContain('Test error');
      expect(result.context).toEqual(context);
      
      vi.unstubAllGlobals();
    });
    
    it('本番環境では詳細情報を隠蔽すること', () => {
      // 本番環境をモック
      vi.stubGlobal('import', {
        meta: {
          env: {
            ...import.meta.env,
            DEV: false
          }
        }
      });
      
      const error = new Error('Test error with sensitive info');
      const context = { apiKey: 'secret' };
      const result = SecureErrorHandler.handle(error, context);
      
      expect(result.logMessage).toBeUndefined();
      expect(result.context).toBeUndefined();
      
      vi.unstubAllGlobals();
    });
  });
  
  describe('handleApiResponse', () => {
    it('400エラーをバリデーションエラーとして処理すること', async () => {
      const response = new Response('{"error": "Invalid input"}', { status: 400 });
      const result = await SecureErrorHandler.handleApiResponse(response);
      
      expect(result.code).toBe(ERROR_CODES.API_VALIDATION);
      expect(result.userMessage).toBe('入力内容に誤りがあります。確認してください。');
    });
    
    it('401エラーを認証エラーとして処理すること', async () => {
      const response = new Response('', { status: 401 });
      const result = await SecureErrorHandler.handleApiResponse(response);
      
      expect(result.code).toBe(ERROR_CODES.AUTH_FAILED);
      expect(result.userMessage).toBe('ログインに失敗しました。もう一度お試しください。');
    });
    
    it('429エラーをレート制限エラーとして処理すること', async () => {
      const response = new Response('', { status: 429 });
      const result = await SecureErrorHandler.handleApiResponse(response);
      
      expect(result.code).toBe(ERROR_CODES.RATE_LIMIT);
      expect(result.userMessage).toBe('リクエストが多すぎます。しばらく待ってからお試しください。');
    });
    
    it('500エラーをサーバーエラーとして処理すること', async () => {
      const response = new Response('', { status: 500 });
      const result = await SecureErrorHandler.handleApiResponse(response);
      
      expect(result.code).toBe(ERROR_CODES.API_SERVER);
      expect(result.userMessage).toBe('サーバーエラーが発生しました。しばらく待ってからお試しください。');
    });
  });
  
  describe('log', () => {
    it('開発環境では詳細なログを出力すること', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            ...import.meta.env,
            DEV: true
          }
        }
      });
      
      const error = new Error('Test error');
      SecureErrorHandler.log(error, { userId: '123' });
      
      expect(console.error).toHaveBeenCalledWith(
        'Error Details:',
        expect.objectContaining({
          code: ERROR_CODES.UNKNOWN,
          message: '予期しないエラーが発生しました。',
          details: expect.stringContaining('Test error'),
          context: { userId: '123' }
        })
      );
      
      vi.unstubAllGlobals();
    });
    
    it('本番環境では最小限のログのみ出力すること', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            ...import.meta.env,
            DEV: false
          }
        }
      });
      
      const error = new Error('Sensitive error info');
      SecureErrorHandler.log(error, { apiKey: 'secret' });
      
      expect(console.error).toHaveBeenCalledWith(
        `Error [${ERROR_CODES.UNKNOWN}]: 予期しないエラーが発生しました。`
      );
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('Sensitive error info')
      );
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('secret')
      );
      
      vi.unstubAllGlobals();
    });
  });
});

describe('setupGlobalErrorHandler', () => {
  let unhandledRejectionHandler: ((event: any) => void) | null = null;
  let errorHandler: ((event: any) => void) | null = null;
  
  beforeEach(() => {
    // イベントリスナーをモック
    vi.spyOn(window, 'addEventListener').mockImplementation((event: string, handler: any) => {
      if (event === 'unhandledrejection') {
        unhandledRejectionHandler = handler;
      } else if (event === 'error') {
        errorHandler = handler;
      }
    });
    
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('グローバルエラーハンドラーが設定されること', () => {
    setupGlobalErrorHandler();
    
    expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
  });
  
  it('未処理のPromiseエラーをキャッチすること', () => {
    setupGlobalErrorHandler();
    
    const event = {
      reason: new Error('Unhandled promise rejection'),
      promise: Promise.reject(),
      preventDefault: vi.fn()
    };
    
    if (unhandledRejectionHandler) {
      unhandledRejectionHandler(event);
    }
    
    expect(console.error).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });
  
  it('通常のエラーをキャッチすること', () => {
    setupGlobalErrorHandler();
    
    const event = {
      error: new Error('Runtime error'),
      filename: 'test.js',
      lineno: 10,
      colno: 5,
      preventDefault: vi.fn()
    };
    
    if (errorHandler) {
      errorHandler(event);
    }
    
    expect(console.error).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });
});