import { test, expect } from '@playwright/test';

// スクリーンショット収集用のテスト（フォント修正後）
test.describe('フォント修正後のスクリーンショット収集', () => {
  
  test('01_トップページ表示', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/大家DX/);
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/2025-08-31_フォント修正後/01_トップページ表示.png',
      fullPage: true
    });
  });

  test('02_ログインページ遷移', async ({ page }) => {
    await page.goto('/');
    const loginButton = page.getByRole('button', { name: /ログイン|login/i });
    if (await loginButton.count() > 0) {
      await loginButton.click();
    } else {
      await page.getByRole('link', { name: /ログイン|login/i }).click();
    }
    await expect(page).toHaveURL(/.*login/);
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/2025-08-31_フォント修正後/02_ログインページ遷移.png',
      fullPage: true
    });
  });

  test('03_ログインフォーム要素', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/2025-08-31_フォント修正後/03_ログインフォーム要素.png',
      fullPage: true
    });
  });

  test('04_空欄ログインエラー', async ({ page }) => {
    await page.goto('/login');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/2025-08-31_フォント修正後/04_空欄ログインエラー.png',
      fullPage: true
    });
    
    const errorMessage = page.locator('text=/必須|required|入力してください/i');
    const hasError = await errorMessage.count() > 0;
    expect(hasError || await page.locator(':invalid').count() > 0).toBeTruthy();
  });

  test('05_無効メールエラー', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/2025-08-31_フォント修正後/05_無効メールエラー.png',
      fullPage: true
    });
    
    await expect(page).toHaveURL(/.*login/);
  });

  test('06_ページ構造確認', async ({ page }) => {
    await page.goto('/');
    
    const title = await page.title();
    console.log('ページタイトル（文字化け解消確認）:', title);
    
    const buttons = await page.locator('button').allTextContents();
    console.log('ボタンテキスト（文字化け解消確認）:', buttons);
    
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/2025-08-31_フォント修正後/06_ページ構造確認.png',
      fullPage: true
    });
  });

  test('07_デバッグ用', async ({ page }) => {
    await page.goto('/');
    
    // 日本語テキストが含まれる部分をフォーカス
    await page.evaluate(() => {
      const element = document.querySelector('h1');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/2025-08-31_フォント修正後/07_デバッグ用.png',
      fullPage: true
    });
  });
});