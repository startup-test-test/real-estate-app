import * as dotenv from 'dotenv';
import * as path from 'path';

// .envファイルを読み込む
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * テスト用認証情報の設定
 * 
 * 使い方:
 * 1. .env.example を .env にコピー
 * 2. .env に実際のテスト用認証情報を設定
 * 3. テストファイルでこの設定をインポートして使用
 */
export const testCredentials = {
  // 通常のテストユーザー
  user: {
    email: process.env.TEST_EMAIL || '',
    password: process.env.TEST_PASSWORD || ''
  },
  
  // 管理者テストユーザー
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || '',
    password: process.env.TEST_ADMIN_PASSWORD || ''
  }
};

// 認証情報が設定されているかチェック
export function hasValidCredentials(): boolean {
  return !!(testCredentials.user.email && testCredentials.user.password);
}

// デバッグ用（実際の値は表示しない）
export function debugCredentials(): void {
  console.log('テスト認証情報の状態:');
  console.log('- ユーザーメール設定:', testCredentials.user.email ? '✓' : '✗');
  console.log('- ユーザーパスワード設定:', testCredentials.user.password ? '✓' : '✗');
  console.log('- 管理者メール設定:', testCredentials.admin.email ? '✓' : '✗');
  console.log('- 管理者パスワード設定:', testCredentials.admin.password ? '✓' : '✗');
}