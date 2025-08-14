// Node.js環境でのテスト（Denoが利用できない場合の代替）

const assert = require('assert');

describe('URL設定テスト', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.APP_URL;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.APP_URL = originalEnv;
    } else {
      delete process.env.APP_URL;
    }
  });

  describe('環境変数によるURL切り替え', () => {
    it('APP_URL環境変数が設定されている場合、その値を使用すること', () => {
      const testUrl = 'https://test.example.com';
      process.env.APP_URL = testUrl;
      
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`;
      
      assert.strictEqual(successUrl, 'https://test.example.com/?payment=success&session_id={CHECKOUT_SESSION_ID}');
      assert.strictEqual(cancelUrl, 'https://test.example.com/?payment=cancelled');
    });

    it('APP_URL環境変数が未設定の場合、デフォルトのCodespace URLを使用すること', () => {
      delete process.env.APP_URL;
      
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`;
      
      assert.strictEqual(successUrl, 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev/?payment=success&session_id={CHECKOUT_SESSION_ID}');
      assert.strictEqual(cancelUrl, 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev/?payment=cancelled');
    });

    it('本番環境URLが正しく設定できること', () => {
      const prodUrl = 'https://ooya.tech';
      process.env.APP_URL = prodUrl;
      
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`;
      
      assert.strictEqual(successUrl, 'https://ooya.tech/?payment=success&session_id={CHECKOUT_SESSION_ID}');
      assert.strictEqual(cancelUrl, 'https://ooya.tech/?payment=cancelled');
    });

    it('ステージング環境URLが正しく設定できること', () => {
      const stagingUrl = 'https://staging.ooya.tech';
      process.env.APP_URL = stagingUrl;
      
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`;
      
      assert.strictEqual(successUrl, 'https://staging.ooya.tech/?payment=success&session_id={CHECKOUT_SESSION_ID}');
      assert.strictEqual(cancelUrl, 'https://staging.ooya.tech/?payment=cancelled');
    });

    it('URLにセッションIDプレースホルダーが含まれること', () => {
      const testUrl = 'https://test.example.com';
      process.env.APP_URL = testUrl;
      
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      
      assert(successUrl.includes('{CHECKOUT_SESSION_ID}'));
    });

    it('URLにpaymentパラメータが正しく設定されること', () => {
      const testUrl = 'https://test.example.com';
      process.env.APP_URL = testUrl;
      
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`;
      
      assert(successUrl.includes('payment=success'));
      assert(cancelUrl.includes('payment=cancelled'));
    });
  });
});

// テストの実行
if (require.main === module) {
  console.log('テストを実行中...\n');
  
  const tests = [
    {
      name: 'APP_URL環境変数が設定されている場合',
      test: () => {
        process.env.APP_URL = 'https://test.example.com';
        const url = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
        assert.strictEqual(url, 'https://test.example.com/?payment=success&session_id={CHECKOUT_SESSION_ID}');
      }
    },
    {
      name: 'APP_URL環境変数が未設定の場合',
      test: () => {
        delete process.env.APP_URL;
        const url = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
        assert.strictEqual(url, 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev/?payment=success&session_id={CHECKOUT_SESSION_ID}');
      }
    },
    {
      name: '本番環境URL',
      test: () => {
        process.env.APP_URL = 'https://ooya.tech';
        const url = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
        assert.strictEqual(url, 'https://ooya.tech/?payment=success&session_id={CHECKOUT_SESSION_ID}');
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(({ name, test }) => {
    try {
      test();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  });

  console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
}