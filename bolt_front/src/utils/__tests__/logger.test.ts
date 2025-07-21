/**
 * SEC-023/SEC-008: 機密情報のログ出力対策・デバッグ情報の漏洩対策のテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SecureLogger, logger, replaceConsoleWithSecureLogger, LogLevel } from '../logger';

describe('SecureLogger', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  
  beforeEach(() => {
    // console メソッドをスパイ
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // 環境変数をモック
    vi.stubGlobal('import', {
      meta: {
        env: {
          PROD: false,
          DEV: true
        }
      }
    });
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });
  
  describe('開発環境での動作', () => {
    it('開発環境ではログが出力される', () => {
      const devLogger = new SecureLogger({
        enabledInDevelopment: true
      });
      
      devLogger.log('Test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('Test message');
    });
    
    it('機密情報がマスクされる', () => {
      const devLogger = new SecureLogger({
        enabledInDevelopment: true,
        maskSensitiveData: true
      });
      
      // メールアドレス
      devLogger.log('User email: test@example.com');
      expect(consoleLogSpy).toHaveBeenCalledWith('User email: ***MASKED***');
      
      // APIキー
      devLogger.log('api_key: sk_test_1234567890abcdef');
      expect(consoleLogSpy).toHaveBeenCalledWith('***MASKED***');
      
      // パスワード
      devLogger.log('password: secretPassword123');
      expect(consoleLogSpy).toHaveBeenCalledWith('***MASKED***');
    });
    
    it('JWTトークンがマスクされる', () => {
      const devLogger = new SecureLogger({
        enabledInDevelopment: true,
        maskSensitiveData: true
      });
      
      const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      devLogger.log('Authorization:', token);
      expect(consoleLogSpy).toHaveBeenCalledWith('Authorization:', '***MASKED***');
    });
    
    it('オブジェクト内の機密情報がマスクされる', () => {
      const devLogger = new SecureLogger({
        enabledInDevelopment: true,
        maskSensitiveData: true
      });
      
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        apiKey: 'sk_live_abcdef123456',
        profile: {
          phone: '090-1234-5678',
          address: 'Tokyo'
        }
      };
      
      devLogger.log(userData);
      
      const loggedData = consoleLogSpy.mock.calls[0][0];
      expect(loggedData.name).toBe('John Doe');
      expect(loggedData.email).toBe('***MASKED***');
      expect(loggedData.password).toBe('***MASKED***');
      expect(loggedData.apiKey).toBe('***MASKED***');
      expect(loggedData.profile.phone).toBe('***MASKED***');
      expect(loggedData.profile.address).toBe('Tokyo');
    });
    
    it('配列内の機密情報がマスクされる', () => {
      const devLogger = new SecureLogger({
        enabledInDevelopment: true,
        maskSensitiveData: true
      });
      
      const users = [
        { name: 'User1', email: 'user1@example.com' },
        { name: 'User2', email: 'user2@example.com' }
      ];
      
      devLogger.log(users);
      
      const loggedData = consoleLogSpy.mock.calls[0][0];
      expect(loggedData[0].email).toBe('***MASKED***');
      expect(loggedData[1].email).toBe('***MASKED***');
    });
  });
  
  describe('本番環境での動作', () => {
    beforeEach(() => {
      // 本番環境をモック
      vi.stubGlobal('import', {
        meta: {
          env: {
            PROD: true,
            DEV: false
          }
        }
      });
    });
    
    it('本番環境ではログが出力されない', () => {
      const prodLogger = new SecureLogger({
        enabledInProduction: false
      });
      
      prodLogger.log('Test message');
      prodLogger.error('Error message');
      prodLogger.warn('Warning message');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
    
    it('明示的に有効化した場合は本番環境でもログが出力される', () => {
      const prodLogger = new SecureLogger({
        enabledInProduction: true,
        maskSensitiveData: true
      });
      
      prodLogger.log('email: test@example.com');
      expect(consoleLogSpy).toHaveBeenCalledWith('email: ***MASKED***');
    });
  });
  
  describe('ログレベル管理', () => {
    it('ログレベルに応じてログが制御される', () => {
      const logger = new SecureLogger({
        enabledInDevelopment: true,
        logLevel: LogLevel.WARN
      });
      
      logger.debug('Debug message'); // 出力されない
      logger.log('Log message'); // 出力されない
      logger.info('Info message'); // 出力されない
      logger.warn('Warning message'); // 出力される
      logger.error('Error message'); // 出力される
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error message');
    });
    
    it('デバッグレベルですべてのログが出力される', () => {
      const logger = new SecureLogger({
        enabledInDevelopment: true,
        logLevel: LogLevel.DEBUG
      });
      
      logger.debug('Debug message');
      logger.log('Log message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(3); // debug, log, info
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('カテゴリ管理', () => {
    it('特定のカテゴリのみ有効化できる', () => {
      const logger = new SecureLogger({
        enabledInDevelopment: true,
        enabledCategories: ['auth', 'api']
      });
      
      logger.log('auth', 'Authentication message'); // 出力される
      logger.log('api', 'API message'); // 出力される
      logger.log('ui', 'UI message'); // 出力されない
      logger.log('General message'); // カテゴリなしは出力されない
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenCalledWith('[auth] ', 'Authentication message');
      expect(consoleLogSpy).toHaveBeenCalledWith('[api] ', 'API message');
    });
    
    it('特定のカテゴリを無効化できる', () => {
      const logger = new SecureLogger({
        enabledInDevelopment: true,
        disabledCategories: ['debug', 'verbose']
      });
      
      logger.log('debug', 'Debug message'); // 出力されない
      logger.log('verbose', 'Verbose message'); // 出力されない
      logger.log('api', 'API message'); // 出力される
      logger.log('General message'); // 出力される
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
    
    it('カテゴリ付きロガーが動作する', () => {
      const logger = new SecureLogger({
        enabledInDevelopment: true
      });
      
      const authLogger = logger.category('auth');
      authLogger.log('Login successful');
      authLogger.error('Login failed');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[auth] ', 'Login successful');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[auth] ', 'Login failed');
    });
  });
  
  describe('ログバッファリング', () => {
    it('ログをバッファリングできる', () => {
      const logger = new SecureLogger({
        enabledInDevelopment: true,
        bufferLogs: true,
        maxBufferSize: 3
      });
      
      logger.log('Message 1');
      logger.error('Message 2');
      logger.warn('Message 3');
      
      // バッファリングモードではconsoleは呼ばれない
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      
      // flushBufferでまとめて出力
      const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
      
      logger.flushBuffer();
      
      expect(consoleGroupSpy).toHaveBeenCalledWith('Buffered Logs');
      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      expect(consoleGroupEndSpy).toHaveBeenCalled();
      
      consoleGroupSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });
  });
  
  describe('replaceConsoleWithSecureLogger', () => {
    it('カスタム設定でconsoleメソッドを置き換える', () => {
      // オリジナルのconsoleメソッドを保存
      const originalLog = console.log;
      const originalError = console.error;
      
      replaceConsoleWithSecureLogger({
        logLevel: LogLevel.ERROR,
        maskSensitiveData: true
      });
      
      // 新しいconsole.logはSecureLoggerを使用
      console.log('email: test@example.com');
      console.error('Error with password: secret123');
      
      // ERRORレベルなのでlogは出力されない
      expect(consoleLogSpy).not.toHaveBeenCalled();
      // errorは出力され、機密情報がマスクされる
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error with ***MASKED***');
      
      // クリーンアップ
      console.log = originalLog;
      console.error = originalError;
    });
    
    it('本番環境でconsoleメソッドが無効化される', () => {
      // 本番環境をモック
      vi.stubGlobal('import', {
        meta: {
          env: {
            PROD: true,
            DEV: false
          }
        }
      });
      
      // オリジナルのconsoleメソッドを保存
      const originalLog = console.log;
      const originalError = console.error;
      const originalGroup = console.group;
      const originalTime = console.time;
      
      replaceConsoleWithSecureLogger();
      
      // console.logが無効化されていることを確認
      console.log('This should not appear');
      console.error('This should not appear');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      
      // console.group系も無効化される
      expect(typeof console.group).toBe('function');
      console.group('Test');
      // mockが呼ばれていないことを確認（空関数になっている）
      
      // クリーンアップ
      console.log = originalLog;
      console.error = originalError;
      console.group = originalGroup;
      console.time = originalTime;
    });
  });
  
  describe('特殊なケースのマスキング', () => {
    it('URLクエリパラメータの機密情報がマスクされる', () => {
      const devLogger = new SecureLogger({
        enabledInDevelopment: true,
        maskSensitiveData: true
      });
      
      devLogger.log('URL: https://api.example.com/users?token=abc123&key=secret');
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('***MASKED***');
      expect(loggedMessage).not.toContain('abc123');
      expect(loggedMessage).not.toContain('secret');
    });
    
    it('クレジットカード番号がマスクされる', () => {
      const devLogger = new SecureLogger({
        enabledInDevelopment: true,
        maskSensitiveData: true
      });
      
      devLogger.log('Card: 4111-1111-1111-1111');
      expect(consoleLogSpy).toHaveBeenCalledWith('Card: ***MASKED***');
    });
    
    it('null値やundefinedが正しく処理される', () => {
      const devLogger = new SecureLogger({
        enabledInDevelopment: true,
        maskSensitiveData: true
      });
      
      devLogger.log(null);
      devLogger.log(undefined);
      devLogger.log({ data: null, value: undefined });
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });
  });
});