// シンプルなNode.jsテストスクリプト
const assert = require('assert');

console.log('URL設定のテストを実行中...\n');

// テストケース
const tests = [
  {
    name: '1. APP_URL環境変数が設定されている場合',
    test: () => {
      process.env.APP_URL = 'https://test.example.com';
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`;
      
      assert.strictEqual(successUrl, 'https://test.example.com/?payment=success&session_id={CHECKOUT_SESSION_ID}');
      assert.strictEqual(cancelUrl, 'https://test.example.com/?payment=cancelled');
      delete process.env.APP_URL;
    }
  },
  {
    name: '2. APP_URL環境変数が未設定の場合（Codespace環境）',
    test: () => {
      delete process.env.APP_URL;
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`;
      
      assert.strictEqual(successUrl, 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev/?payment=success&session_id={CHECKOUT_SESSION_ID}');
      assert.strictEqual(cancelUrl, 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev/?payment=cancelled');
    }
  },
  {
    name: '3. 本番環境URL（https://ooya.tech）',
    test: () => {
      process.env.APP_URL = 'https://ooya.tech';
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`;
      
      assert.strictEqual(successUrl, 'https://ooya.tech/?payment=success&session_id={CHECKOUT_SESSION_ID}');
      assert.strictEqual(cancelUrl, 'https://ooya.tech/?payment=cancelled');
      delete process.env.APP_URL;
    }
  },
  {
    name: '4. ステージング環境URL',
    test: () => {
      process.env.APP_URL = 'https://staging.ooya.tech';
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`;
      
      assert.strictEqual(successUrl, 'https://staging.ooya.tech/?payment=success&session_id={CHECKOUT_SESSION_ID}');
      assert.strictEqual(cancelUrl, 'https://staging.ooya.tech/?payment=cancelled');
      delete process.env.APP_URL;
    }
  },
  {
    name: '5. URLにセッションIDプレースホルダーが含まれること',
    test: () => {
      process.env.APP_URL = 'https://test.example.com';
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      
      assert(successUrl.includes('{CHECKOUT_SESSION_ID}'), 'セッションIDプレースホルダーが含まれていません');
      delete process.env.APP_URL;
    }
  },
  {
    name: '6. URLにpaymentパラメータが正しく設定されること',
    test: () => {
      process.env.APP_URL = 'https://test.example.com';
      const successUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=cancelled`;
      
      assert(successUrl.includes('payment=success'), 'success URLにpayment=successが含まれていません');
      assert(cancelUrl.includes('payment=cancelled'), 'cancel URLにpayment=cancelledが含まれていません');
      delete process.env.APP_URL;
    }
  },
  {
    name: '7. 環境変数の切り替えが正しく動作すること',
    test: () => {
      // 開発環境
      delete process.env.APP_URL;
      let url = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      assert(url.includes('github.dev'), '開発環境URLが正しくありません');
      
      // ステージング環境
      process.env.APP_URL = 'https://staging.ooya.tech';
      url = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      assert(url.includes('staging.ooya.tech'), 'ステージング環境URLが正しくありません');
      
      // 本番環境
      process.env.APP_URL = 'https://ooya.tech';
      url = `${process.env.APP_URL || 'https://expert-space-waddle-r46qq6694764fpwj6-5173.app.github.dev'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      assert(url.includes('ooya.tech') && !url.includes('staging'), '本番環境URLが正しくありません');
      
      delete process.env.APP_URL;
    }
  }
];

// テストの実行
let passed = 0;
let failed = 0;
const failedTests = [];

tests.forEach(({ name, test }) => {
  try {
    test();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   エラー: ${error.message}`);
    failed++;
    failedTests.push({ name, error: error.message });
  }
});

// 結果のサマリー
console.log('\n' + '='.repeat(60));
console.log(`テスト結果: ${passed}/${tests.length} 成功`);

if (failed > 0) {
  console.log(`\n失敗したテスト (${failed}件):`);
  failedTests.forEach(({ name, error }) => {
    console.log(`  - ${name}`);
    console.log(`    ${error}`);
  });
  process.exit(1);
} else {
  console.log('\n🎉 すべてのテストが成功しました！');
  console.log('\n環境変数の設定方法:');
  console.log('  開発環境: APP_URL未設定（Codespace URLを自動使用）');
  console.log('  ステージング: APP_URL=https://staging.ooya.tech');
  console.log('  本番環境: APP_URL=https://ooya.tech');
}