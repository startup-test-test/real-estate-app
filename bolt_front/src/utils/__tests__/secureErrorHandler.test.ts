/**
 * SEC-026: エラー情報の詳細漏洩対策のテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ErrorCode,
  ErrorLevel,
  handleError,
  getDisplayMessage,
  handleApiError,
  setupGlobalErrorHandler,
  handleReactError
} from '../secureErrorHandler';

// 環境変数のモック
const originalEnv = import.meta.env;

describe('SecureErrorHandler', () => {
  beforeEach(() => {
    // console.errorのモック
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    import.meta.env = originalEnv;
  });

  describe('handleError', () => {
    it('本番環境では詳細なエラー情報を隠蔽する', () => {
      // 本番環境をモック
      import.meta.env.MODE = 'production';
      
      const error = new Error('Sensitive database connection error details');
      const result = handleError(error, 'Test Context');
      
      // ユーザー向けメッセージは汎用的
      expect(result.userMessage).not.toContain('database');
      expect(result.userMessage).toBe('データの処理中にエラーが発生しました。');
      
      // console.errorには最小限の情報のみ
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error occurred [${result.requestId}] - Code: ${result.code}`)
      );
    });

    it('開発環境では詳細なエラー情報を表示する', () => {
      // 開発環境をモック
      import.meta.env.MODE = 'development';
      
      const error = new Error('Detailed error for debugging');
      const result = handleError(error, 'Test Context');
      
      // 開発環境では詳細情報が出力される
      expect(console.error).toHaveBeenCalledWith('Context:', 'Test Context');
      expect(console.error).toHaveBeenCalledWith('Original Error:', error);
    });

    it('認証エラーを適切に分類する', () => {
      const authError = new Error('Unauthorized access attempt');
      const result = handleError(authError);
      
      expect(result.code).toBe(ErrorCode.AUTH_FAILED);
      expect(result.userMessage).toBe('認証に失敗しました。再度ログインしてください。');
      expect(result.level).toBe(ErrorLevel.ERROR);
    });

    it('ネットワークエラーを適切に分類する', () => {
      const networkError = new Error('Network connection failed');
      const result = handleError(networkError);
      
      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(result.userMessage).toBe('ネットワーク接続を確認してください。');
    });

    it('検証エラーを適切に分類する', () => {
      const validationError = new Error('Invalid input data');
      const result = handleError(validationError);
      
      expect(result.code).toBe(ErrorCode.VALIDATION_FAILED);
      expect(result.userMessage).toBe('入力内容に誤りがあります。確認して再度お試しください。');
    });
  });

  describe('getDisplayMessage', () => {
    it('エラーオブジェクトから表示用メッセージを取得する', () => {
      const error = new Error('Technical error details');
      const message = getDisplayMessage(error);
      
      // 技術的な詳細は含まれない
      expect(message).not.toContain('Technical error details');
      expect(message).toBe('予期しないエラーが発生しました。');
    });
  });

  describe('handleApiError', () => {
    it('401エラーを適切に処理する', () => {
      const response = new Response('', { status: 401 });
      const result = handleApiError(response);
      
      expect(result.code).toBe(ErrorCode.AUTH_FAILED);
      expect(result.userMessage).toBe('認証に失敗しました。再度ログインしてください。');
    });

    it('403エラーを適切に処理する', () => {
      const response = new Response('', { status: 403 });
      const result = handleApiError(response);
      
      expect(result.code).toBe(ErrorCode.AUTH_INSUFFICIENT_PERMISSION);
      expect(result.userMessage).toBe('この操作を実行する権限がありません。');
    });

    it('400エラーを適切に処理する', () => {
      const response = new Response('', { status: 400 });
      const result = handleApiError(response);
      
      expect(result.code).toBe(ErrorCode.VALIDATION_FAILED);
      expect(result.userMessage).toBe('入力内容に誤りがあります。確認して再度お試しください。');
    });

    it('500エラーを適切に処理する', () => {
      const response = new Response('', { status: 500 });
      const result = handleApiError(response);
      
      expect(result.code).toBe(ErrorCode.API_ERROR);
      expect(result.userMessage).toBe('サーバーとの通信でエラーが発生しました。しばらく待ってから再度お試しください。');
    });
  });

  describe('setupGlobalErrorHandler', () => {
    it('未処理のPromiseエラーをキャッチする', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      setupGlobalErrorHandler();
      
      // unhandledrejectionイベントリスナーが登録されている
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
      
      // errorイベントリスナーが登録されている
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });
  });

  describe('handleReactError', () => {
    it('React Error Boundaryのエラーを処理する', () => {
      const error = new Error('Component render error');
      const errorInfo = {
        componentStack: '\n    at MyComponent\n    at App'
      };
      
      const result = handleReactError(error, errorInfo as any);
      
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.userMessage).toBe('予期しないエラーが発生しました。');
    });
  });

  describe('エラーレベルの判定', () => {
    it('重大なエラーをCRITICALレベルとして分類する', () => {
      const dbError = new Error('Database connection failed');
      const result = handleError(dbError);
      
      expect(result.level).toBe(ErrorLevel.ERROR);
    });

    it('警告レベルのエラーをWARNINGとして分類する', () => {
      const validationError = new Error('Invalid input format');
      const result = handleError(validationError);
      
      expect(result.level).toBe(ErrorLevel.WARNING);
    });
  });

  describe('requestIdの生成', () => {
    it('各エラーに一意のrequestIdが生成される', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      
      const result1 = handleError(error1);
      const result2 = handleError(error2);
      
      expect(result1.requestId).toBeTruthy();
      expect(result2.requestId).toBeTruthy();
      expect(result1.requestId).not.toBe(result2.requestId);
    });
  });
});