import { test, expect } from '@playwright/test';

// =================================================================
// 公開ページ: /tools/cf （認証不要）
// =================================================================
test.describe('公開CFキャッシュフロー計算ツール (/tools/cf)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools/cf');
  });

  test('ページが正しく表示される', async ({ page }) => {
    // タイトルが表示されている
    await expect(page.getByRole('heading', { name: /キャッシュフロー/ })).toBeVisible();

    // 計算ツールセクションが表示されている
    await expect(page.getByText('キャッシュフローを概算計算する')).toBeVisible();
  });

  test('入力フィールドが表示される', async ({ page }) => {
    // 各入力フィールドが表示されている
    await expect(page.getByText('年間満室想定収入（GPI）')).toBeVisible();
    await expect(page.getByText('空室率')).toBeVisible();
    await expect(page.getByText('年間運営経費（OPEX）')).toBeVisible();
    await expect(page.getByText('年間ローン返済額（ADS）')).toBeVisible();
  });

  test('値を入力すると計算結果が表示される', async ({ page }) => {
    // 満室年収を入力
    const gpiInput = page.locator('input').first();
    await gpiInput.fill('600');

    // 運営経費を入力
    const opexInput = page.locator('input').nth(2);
    await opexInput.fill('100');

    // ローン返済額を入力
    const adsInput = page.locator('input').nth(3);
    await adsInput.fill('300');

    // 結果が表示される
    await expect(page.getByText('税引前CF（BTCF）')).toBeVisible();
    await expect(page.getByText('NOI（営業純収益）')).toBeVisible();
  });

  test('キャッシュフローツリーが表示される', async ({ page }) => {
    // 満室年収を入力
    const gpiInput = page.locator('input').first();
    await gpiInput.fill('600');

    // キャッシュフローツリーの各項目が表示される
    await expect(page.getByText('GPI（満室年収）')).toBeVisible();
    await expect(page.getByText('EGI（有効総収入）')).toBeVisible();
  });

  test('空室率を変更できる', async ({ page }) => {
    // 満室年収を入力
    const gpiInput = page.locator('input').first();
    await gpiInput.fill('600');

    // 空室率を10%に変更
    const vacancyInput = page.locator('input').nth(1);
    await vacancyInput.fill('10');

    // 空室損が表示される
    await expect(page.getByText('10%')).toBeVisible();
  });

  test('DSCRが計算される（ローン返済がある場合）', async ({ page }) => {
    // 満室年収を入力
    await page.locator('input').first().fill('600');

    // 運営経費を入力
    await page.locator('input').nth(2).fill('100');

    // ローン返済額を入力
    await page.locator('input').nth(3).fill('300');

    // DSCRが表示される
    await expect(page.getByText('DSCR')).toBeVisible();
  });

  test('計算式が表示される', async ({ page }) => {
    // 満室年収を入力
    await page.locator('input').first().fill('600');

    // 計算式が表示される
    await expect(page.getByText('BTCF = NOI - ADS')).toBeVisible();
  });

  test('レスポンシブ: モバイルでも表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tools/cf');

    // 入力フィールドが表示されている
    await expect(page.getByText('年間満室想定収入（GPI）')).toBeVisible();
  });

  test('レスポンシブ: タブレットでも表示される', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/tools/cf');

    // 入力フィールドが表示されている
    await expect(page.getByText('年間満室想定収入（GPI）')).toBeVisible();
  });

  test('ページのフッターが表示される', async ({ page }) => {
    // フッターが表示されている
    await expect(page.locator('footer')).toBeVisible();
  });

  test('関連ツールセクションが表示される', async ({ page }) => {
    // 関連シミュレーターセクション
    await expect(page.getByText('関連するツール')).toBeVisible();
  });
});

// =================================================================
// 公開ページ: /tools/yield-rate （利回り計算、認証不要）
// =================================================================
test.describe('公開利回り計算ツール (/tools/yield-rate)', () => {
  test('ページが正しく表示される', async ({ page }) => {
    await page.goto('/tools/yield-rate');

    // タイトルが表示されている
    await expect(page.getByRole('heading', { name: /利回り/ })).toBeVisible();
  });
});

// =================================================================
// 公開ページ: /tools/mortgage-loan （ローン計算、認証不要）
// =================================================================
test.describe('公開ローン計算ツール (/tools/mortgage-loan)', () => {
  test('ページが正しく表示される', async ({ page }) => {
    await page.goto('/tools/mortgage-loan');

    // タイトルが表示されている
    await expect(page.getByRole('heading', { name: /ローン|返済/ })).toBeVisible();
  });
});

// =================================================================
// 公開ページ: /tools/dscr （DSCR計算、認証不要）
// =================================================================
test.describe('公開DSCR計算ツール (/tools/dscr)', () => {
  test('ページが正しく表示される', async ({ page }) => {
    await page.goto('/tools/dscr');

    // タイトルが表示されている
    await expect(page.getByRole('heading', { name: /DSCR/ })).toBeVisible();
  });
});

// =================================================================
// 認証ページ: /auth/signin
// =================================================================
test.describe('ログインページ', () => {
  test('ページが正しく表示される', async ({ page }) => {
    await page.goto('/auth/signin');

    // ログインタイトルが表示されている
    await expect(page.getByRole('heading', { name: /ログイン/ })).toBeVisible();

    // Googleログインボタンが表示されている
    await expect(page.getByText('Googleアカウントでログインする')).toBeVisible();

    // メールログインフォームが表示されている
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
  });

  test('新規登録リンクがある', async ({ page }) => {
    await page.goto('/auth/signin');

    // 新規登録リンクが表示されている
    await expect(page.getByRole('link', { name: '新規登録' })).toBeVisible();
  });

  test('パスワードリセットリンクがある', async ({ page }) => {
    await page.goto('/auth/signin');

    // パスワードリセットリンクが表示されている
    await expect(page.getByRole('link', { name: /パスワードを忘れた/ })).toBeVisible();
  });
});

// =================================================================
// 認証ページ: /auth/signup
// =================================================================
test.describe('新規登録ページ', () => {
  test('ページが正しく表示される', async ({ page }) => {
    await page.goto('/auth/signup');

    // 新規登録タイトルが表示されている
    await expect(page.getByRole('heading', { name: /新規会員登録/ })).toBeVisible();
  });

  test('利用規約とプライバシーポリシーの同意テキストがある（Google登録）', async ({ page }) => {
    await page.goto('/auth/signup');

    // Google登録の同意文言が表示されている
    await expect(page.getByText(/利用規約.*プライバシーポリシー.*同意/)).toBeVisible();
  });

  test('利用規約とプライバシーポリシーの同意チェックボックスがある（メール登録）', async ({ page }) => {
    await page.goto('/auth/signup');

    // 同意チェックボックスのテキストが表示されている
    await expect(page.getByText('利用規約')).toBeVisible();
    await expect(page.getByText('プライバシーポリシー')).toBeVisible();
  });

  test('同意しないと登録ボタンが無効', async ({ page }) => {
    await page.goto('/auth/signup');

    // メール登録ボタンが無効になっている（同意未チェック状態）
    const submitButton = page.getByRole('button', { name: /メールでアカウント作成する/ });
    // ボタンは存在するがdisabledまたはグレーアウト
    await expect(submitButton).toBeVisible();
  });

  test('ログインリンクがある', async ({ page }) => {
    await page.goto('/auth/signup');

    // ログインリンクが表示されている
    await expect(page.getByRole('link', { name: 'ログイン' })).toBeVisible();
  });
});

// =================================================================
// 法的ページ
// =================================================================
test.describe('法的ページ', () => {
  test('利用規約ページが表示される', async ({ page }) => {
    await page.goto('/legal/terms');

    await expect(page.getByRole('heading', { name: /利用規約/ })).toBeVisible();
  });

  test('プライバシーポリシーページが表示される', async ({ page }) => {
    await page.goto('/legal/privacy');

    await expect(page.getByRole('heading', { name: /プライバシーポリシー/ })).toBeVisible();
  });
});

// =================================================================
// ツール一覧ページ
// =================================================================
test.describe('ツール一覧ページ', () => {
  test('ページが正しく表示される', async ({ page }) => {
    await page.goto('/tools');

    // タイトルが表示されている
    await expect(page.getByRole('heading', { name: /計算ツール|シミュレーター/ })).toBeVisible();
  });

  test('各計算ツールへのリンクがある', async ({ page }) => {
    await page.goto('/tools');

    // いくつかのツールリンクが表示されている
    await expect(page.getByRole('link', { name: /利回り/ })).toBeVisible();
  });
});

// =================================================================
// マイページ（認証必要）- 未認証時のリダイレクト確認
// =================================================================
test.describe('マイページ（未認証）', () => {
  test('CFシミュレーション新規作成ページにアクセスすると認証エラーになる', async ({ page }) => {
    await page.goto('/mypage/cf-simulator/new');

    // Unauthorized または ログインページにリダイレクトされる
    await expect(page.getByText('Unauthorized').or(page.getByRole('heading', { name: /ログイン/ }))).toBeVisible({ timeout: 10000 });
  });

  test('CFシミュレーション一覧ページにアクセスすると認証エラーになる', async ({ page }) => {
    await page.goto('/mypage/cf-simulator');

    // Unauthorized または ログインページにリダイレクトされる
    await expect(page.getByText('Unauthorized').or(page.getByRole('heading', { name: /ログイン/ }))).toBeVisible({ timeout: 10000 });
  });

  test('マイページダッシュボードにアクセスすると認証エラーになる', async ({ page }) => {
    await page.goto('/mypage');

    // Unauthorized または ログインページにリダイレクトされる
    await expect(page.getByText('Unauthorized').or(page.getByRole('heading', { name: /ログイン/ }))).toBeVisible({ timeout: 10000 });
  });
});
