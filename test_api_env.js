// 環境判定とAPI URLのテスト
console.log('=== 環境判定テスト開始 ===\n');

// 環境判定ロジックの実装
const Environment = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  CODESPACES: 'codespaces',
  LOCAL: 'local'
};

const API_URLS = {
  [Environment.PRODUCTION]: 'https://real-estate-app-1-iii4.onrender.com',
  [Environment.DEVELOPMENT]: 'https://real-estate-app-rwf1.onrender.com',
  [Environment.CODESPACES]: 'https://real-estate-app-rwf1.onrender.com',
  [Environment.LOCAL]: 'https://real-estate-app-rwf1.onrender.com'
};

function getEnvironment(hostname) {
  if (hostname === 'ooya.tech') {
    return Environment.PRODUCTION;
  }
  if (hostname === 'dev.ooya.tech') {
    return Environment.DEVELOPMENT;
  }
  if (hostname.includes('.app.github.dev')) {
    return Environment.CODESPACES;
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return Environment.LOCAL;
  }
  return Environment.DEVELOPMENT;
}

function getApiUrl(hostname) {
  const env = getEnvironment(hostname);
  return API_URLS[env];
}

// テストケース
const testCases = [
  { hostname: 'localhost', expected: 'LOCAL', expectedUrl: 'https://real-estate-app-rwf1.onrender.com' },
  { hostname: '127.0.0.1', expected: 'LOCAL', expectedUrl: 'https://real-estate-app-rwf1.onrender.com' },
  { hostname: 'test-123.app.github.dev', expected: 'CODESPACES', expectedUrl: 'https://real-estate-app-rwf1.onrender.com' },
  { hostname: 'dev.ooya.tech', expected: 'DEVELOPMENT', expectedUrl: 'https://real-estate-app-rwf1.onrender.com' },
  { hostname: 'ooya.tech', expected: 'PRODUCTION', expectedUrl: 'https://real-estate-app-1-iii4.onrender.com' },
  { hostname: 'unknown.com', expected: 'DEVELOPMENT', expectedUrl: 'https://real-estate-app-rwf1.onrender.com' }
];

let passed = 0;
let failed = 0;

console.log('📋 テストケース実行:\n');
testCases.forEach((test, index) => {
  const env = getEnvironment(test.hostname);
  const url = getApiUrl(test.hostname);
  const envMatch = env.toUpperCase() === test.expected;
  const urlMatch = url === test.expectedUrl;
  const success = envMatch && urlMatch;
  
  console.log(`Test ${index + 1}: ${test.hostname}`);
  console.log(`  環境: ${env} (期待値: ${test.expected}) ${envMatch ? '✅' : '❌'}`);
  console.log(`  URL: ${url}`);
  console.log(`  期待URL: ${test.expectedUrl} ${urlMatch ? '✅' : '❌'}`);
  console.log(`  結果: ${success ? '✅ PASS' : '❌ FAIL'}\n`);
  
  if (success) passed++;
  else failed++;
});

console.log('=== テスト結果 ===');
console.log(`✅ 成功: ${passed}/${testCases.length}`);
console.log(`❌ 失敗: ${failed}/${testCases.length}`);
console.log(`成功率: ${(passed / testCases.length * 100).toFixed(1)}%`);

// 全テスト成功の場合
if (failed === 0) {
  console.log('\n🎉 すべてのテストが成功しました！');
  process.exit(0);
} else {
  console.log('\n⚠️ 一部のテストが失敗しました');
  process.exit(1);
}