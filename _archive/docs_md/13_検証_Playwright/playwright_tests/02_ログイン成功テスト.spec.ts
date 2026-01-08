import { test, expect } from '@playwright/test';
import { testCredentials, hasValidCredentials } from './test-auth.config';

/**
 * ログイン成功テスト
 * 
 * 実行前に必要な準備:
 * 1. .env.example を .env にコピー
 * 2. .env ファイルに実際のテスト用認証情報を設定
 * 3. テストを実行
 */

// 認証情報が設定されている場合のみテストを実行
test.describe('ログイン成功テスト（要認証情報）', () => {
  
  test.skip(!hasValidCredentials(), 'テスト用認証情報が設定されていません');
  
  test.beforeEach(async ({ page }) => {
    // テスト前にログインページへ移動
    await page.goto('/login');
  });

  test('正しい認証情報でログインできる', async ({ page }) => {
    // ログイン前のスクリーンショット
    await page.screenshot({ 
      path: `../テスト結果_スクリーンショット/ログイン前.png`,
      fullPage: true 
    });
    
    // メールアドレスを入力
    await page.fill('input[type="email"]', testCredentials.user.email);
    
    // パスワードを入力
    await page.fill('input[type="password"]', testCredentials.user.password);
    
    // 入力後のスクリーンショット
    await page.screenshot({ 
      path: `../テスト結果_スクリーンショット/ログイン情報入力後.png`,
      fullPage: true 
    });
    
    // ログインボタンをクリック
    await page.click('button[type="submit"]');
    
    // ログイン成功後のリダイレクトを待つ
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 10000
    });
    
    // ダッシュボードまたはホームページにいることを確認
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    // ログイン成功後のスクリーンショット
    await page.screenshot({ 
      path: `../テスト結果_スクリーンショット/ログイン成功後.png`,
      fullPage: true 
    });
  });

  test('ログイン後にプロフィールページにアクセスできる', async ({ page }) => {
    // ログイン処理
    await page.fill('input[type="email"]', testCredentials.user.email);
    await page.fill('input[type="password"]', testCredentials.user.password);
    await page.click('button[type="submit"]');
    
    // ログイン完了を待つ
    await page.waitForURL((url) => !url.pathname.includes('/login'));
    
    // プロフィールページへ移動（URLは実際のアプリに合わせて調整）
    await page.goto('/profile');
    
    // プロフィールページのスクリーンショット
    await page.screenshot({ 
      path: `../テスト結果_スクリーンショット/プロフィールページ.png`,
      fullPage: true 
    });
    
    // プロフィールページの要素が表示されることを確認
    // ※実際のページ構造に合わせて調整が必要
    await expect(page).toHaveURL(/.*profile/);
  });

  test('ログアウトできる', async ({ page }) => {
    // まずログイン
    await page.fill('input[type="email"]', testCredentials.user.email);
    await page.fill('input[type="password"]', testCredentials.user.password);
    await page.click('button[type="submit"]');
    
    // ログイン完了を待つ
    await page.waitForURL((url) => !url.pathname.includes('/login'));
    
    // ログアウトボタンを探してクリック
    // ※実際のアプリケーションのUIに合わせて調整が必要
    const logoutButton = page.getByRole('button', { name: /ログアウト|logout|sign out/i });
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
    } else {
      // メニュー内にある場合
      const userMenu = page.getByRole('button', { name: /menu|user|account/i });
      if (await userMenu.count() > 0) {
        await userMenu.click();
        await page.getByRole('button', { name: /ログアウト|logout|sign out/i }).click();
      }
    }
    
    // ログアウト後、ログインページまたはトップページにリダイレクトされることを確認
    await page.waitForURL((url) => {
      return url.pathname === '/' || url.pathname.includes('/login');
    });
  });
});

// 認証情報が設定されていない場合の警告テスト
test.describe('認証情報未設定の警告', () => {
  test.skip(hasValidCredentials(), '認証情報が設定済みです');
  test('認証情報を設定してください', async () => {
    console.log('\n========================================');
    console.log('⚠️  テスト用認証情報が設定されていません');
    console.log('========================================');
    console.log('以下の手順で設定してください：');
    console.log('1. .env.example を .env にコピー');
    console.log('2. .env ファイルに実際のテスト用認証情報を設定');
    console.log('   TEST_EMAIL=your-test-email@example.com');
    console.log('   TEST_PASSWORD=your-test-password');
    console.log('3. テストを再実行');
    console.log('========================================\n');
    
    // このテストは常にパスする（情報表示のみ）
    expect(true).toBe(true);
  });
});