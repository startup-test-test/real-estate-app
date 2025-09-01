import { test, expect } from '@playwright/test';

// 簡単なテスト例 - トップページの確認
test.describe('基本動作確認', () => {
  
  test('トップページが表示される', async ({ page }) => {
    // ページにアクセス
    await page.goto('/');
    
    // タイトルを確認
    await expect(page).toHaveTitle(/大家DX/);
    
    // スクリーンショットを撮る（デバッグ用）
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/トップページ.png',
      fullPage: true
    });
  });

  test('ログインページに遷移できる', async ({ page }) => {
    // トップページにアクセス
    await page.goto('/');
    
    // ログインボタンをクリック（ボタンのテキストで探す）
    const loginButton = page.getByRole('button', { name: /ログイン|login/i });
    if (await loginButton.count() > 0) {
      await loginButton.click();
    } else {
      // リンクの場合
      await page.getByRole('link', { name: /ログイン|login/i }).click();
    }
    
    // URLが/loginに変わることを確認
    await expect(page).toHaveURL(/.*login/);
    
    // ログインページのスクリーンショット
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/ログインページ遷移後.png',
      fullPage: true
    });
  });

  test('ログインフォームの要素が存在する', async ({ page }) => {
    // ログインページに直接アクセス
    await page.goto('/login');
    
    // メールアドレス入力欄があるか
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    // パスワード入力欄があるか
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    // ログインボタンがあるか
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    // ログインフォーム要素のスクリーンショット
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/ログインフォーム要素.png',
      fullPage: true
    });
  });
});

// もう少し実践的なテスト
test.describe('ログイン機能の検証', () => {
  
  test('空欄でログインしようとするとエラーになる', async ({ page }) => {
    await page.goto('/login');
    
    // 何も入力せずにログインボタンをクリック
    await page.locator('button[type="submit"]').click();
    
    // エラー表示のスクリーンショット
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/空欄ログインエラー.png',
      fullPage: true
    });
    
    // エラーメッセージまたは必須フィールドの警告が表示されるはず
    // （実際のエラーメッセージに合わせて調整が必要）
    const errorMessage = page.locator('text=/必須|required|入力してください/i');
    const hasError = await errorMessage.count() > 0;
    
    // HTML5のバリデーションか、カスタムエラーメッセージがあることを確認
    expect(hasError || await page.locator(':invalid').count() > 0).toBeTruthy();
  });

  test('無効なメールアドレス形式でエラーになる', async ({ page }) => {
    await page.goto('/login');
    
    // 無効なメールアドレスを入力
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    
    // ログインボタンをクリック
    await page.locator('button[type="submit"]').click();
    
    // エラーが表示されるか、まだログインページにいることを確認
    await page.waitForTimeout(1000); // 少し待つ
    
    // 無効メールエラーのスクリーンショット
    await page.screenshot({ 
      path: '../テスト結果_スクリーンショット/無効メールエラー.png',
      fullPage: true
    });
    
    await expect(page).toHaveURL(/.*login/);
  });
});

// デバッグ用の便利なテスト
test.describe('デバッグ用', () => {
  
  test('現在のページ構造を確認', async ({ page }) => {
    await page.goto('/');
    
    // ページのHTMLを出力（構造を理解するため）
    const title = await page.title();
    console.log('ページタイトル:', title);
    
    // すべてのボタンを探す
    const buttons = await page.locator('button').allTextContents();
    console.log('ボタン一覧:', buttons);
    
    // すべてのリンクを探す
    const links = await page.locator('a').allTextContents();
    console.log('リンク一覧:', links);
  });
});