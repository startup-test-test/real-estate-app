import { test, expect } from '@playwright/test';

/**
 * 認証機能 検証項目テスト
 * 対応シート: 01_認証機能_検証項目シート.md
 */

test.describe('認証機能の検証', () => {
  
  // L001: 正常ログイン
  test('L001: 正常ログイン - 登録済みメールアドレスとパスワードでログイン', async ({ page }) => {
    await page.goto('/login');
    
    // テスト用の認証情報（実際のテストアカウントに置き換えてください）
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!');
    
    await page.click('button[type="submit"]');
    
    // ダッシュボードへの遷移を確認
    await expect(page).toHaveURL(/dashboard|simulator/, { timeout: 10000 });
    
    console.log('✅ L001: 正常ログイン - PASS');
  });

  // L002: 無効なメールアドレス
  test('L002: 無効なメールアドレス形式でログイン試行', async ({ page }) => {
    await page.goto('/login');
    
    // 不正な形式のメールアドレス
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'Test123!');
    
    await page.click('button[type="submit"]');
    
    // エラーメッセージまたはバリデーションエラーの確認
    const hasValidationError = await page.locator(':invalid').count() > 0;
    const hasErrorMessage = await page.locator('text=/無効|不正|正しい/i').count() > 0;
    
    expect(hasValidationError || hasErrorMessage).toBeTruthy();
    
    console.log('✅ L002: 無効なメールアドレス - PASS');
  });

  // L005: 空欄での送信
  test('L005: 空欄での送信 - バリデーションエラー', async ({ page }) => {
    await page.goto('/login');
    
    // 何も入力せずに送信
    await page.click('button[type="submit"]');
    
    // ページがログイン画面のままであることを確認
    await expect(page).toHaveURL(/login/);
    
    // HTML5バリデーションまたはカスタムエラーメッセージ
    const hasRequiredError = await page.locator(':invalid').count() > 0;
    const hasErrorMessage = await page.locator('text=/必須|required|入力/i').count() > 0;
    
    expect(hasRequiredError || hasErrorMessage).toBeTruthy();
    
    console.log('✅ L005: 空欄での送信 - PASS');
  });

  // L006: パスワードマスキング
  test('L006: パスワードマスキング確認', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    // type属性がpasswordであることを確認
    const inputType = await passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
    
    console.log('✅ L006: パスワードマスキング - PASS');
  });
});

test.describe('サインアップ機能の検証', () => {
  
  // S004: メール形式チェック
  test('S004: 不正な形式のメールアドレス入力', async ({ page }) => {
    // サインアップページがある場合
    const signupUrl = '/signup';
    const response = await page.goto(signupUrl);
    
    if (response?.ok()) {
      await page.fill('input[type="email"]', 'invalid@');
      
      // フォーカスを外してバリデーションを発火
      await page.press('input[type="email"]', 'Tab');
      
      const hasValidationError = await page.locator('input[type="email"]:invalid').count() > 0;
      expect(hasValidationError).toBeTruthy();
      
      console.log('✅ S004: メール形式チェック - PASS');
    } else {
      console.log('⚠️ S004: サインアップページが見つかりません');
    }
  });
});

test.describe('パスワードリセット機能の検証', () => {
  
  // P001: リセットメール送信
  test('P001: パスワードリセットページの確認', async ({ page }) => {
    await page.goto('/login');
    
    // パスワードリセットリンクを探す
    const resetLink = page.locator('a:has-text("パスワードを忘れた"), a:has-text("Forgot password")');
    
    if (await resetLink.count() > 0) {
      await resetLink.click();
      await expect(page).toHaveURL(/reset-password|forgot/);
      
      // メールアドレス入力欄の確認
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();
      
      console.log('✅ P001: パスワードリセットページ - PASS');
    } else {
      console.log('⚠️ P001: パスワードリセットリンクが見つかりません');
    }
  });
});

// デバッグ用：現在のページ構造を確認
test('DEBUG: ログインページの構造確認', async ({ page }) => {
  await page.goto('/login');
  
  // スクリーンショットを保存
  await page.screenshot({ path: 'screenshots/login-page.png', fullPage: true });
  
  // フォーム要素を確認
  const forms = await page.locator('form').count();
  console.log(`フォーム数: ${forms}`);
  
  // input要素を確認
  const inputs = await page.locator('input').count();
  console.log(`入力欄数: ${inputs}`);
  
  // ボタンを確認
  const buttons = await page.locator('button').allTextContents();
  console.log('ボタン:', buttons);
  
  // リンクを確認
  const links = await page.locator('a').allTextContents();
  console.log('リンク:', links.filter(l => l.trim()));
});