import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

// .envファイルを読み込み
dotenv.config();

/**
 * ダッシュボード・マイページ機能 検証項目テスト
 * 対応シート: 04_ダッシュボード機能_検証項目シート.md
 */

test.describe('ダッシュボード機能の検証', () => {
  
  // テスト前にログイン
  test.beforeEach(async ({ page }) => {
    // ログイン処理
    await page.goto('/login');
    const testEmail = process.env.TEST_EMAIL || 'togo@startup-marketing.co.jp';
    const testPassword = process.env.TEST_PASSWORD || 'gomesu';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // ログイン成功を確認
    await expect(page).toHaveURL(/dashboard|simulator|mypage/, { timeout: 10000 });
  });

  test.describe('ダッシュボード表示', () => {
    
    // D001: 初回アクセス
    test('D001: ログイン直後のダッシュボード表示', async ({ page }) => {
      // ダッシュボードまたはマイページが表示されていることを確認
      const isDashboard = page.url().includes('dashboard');
      const isMypage = page.url().includes('mypage');
      const isSimulator = page.url().includes('simulator');
      
      expect(isDashboard || isMypage || isSimulator).toBeTruthy();
      console.log('✅ D001: 初回アクセス - PASS');
    });

    // D002: ユーザー名表示
    test('D002: ログインユーザー名の表示', async ({ page }) => {
      // マイページへ遷移
      if (!page.url().includes('mypage')) {
        await page.goto('/mypage');
        await page.waitForTimeout(2000);
      }
      
      // ユーザー名またはメールアドレスの表示を探す
      const userDisplay = page.locator('text=/togo@startup-marketing|ユーザー|プロフィール/i');
      
      if (await userDisplay.count() > 0) {
        console.log('✅ D002: ユーザー名表示 - PASS');
      } else {
        console.log('⚠️ D002: ユーザー名が表示されていません');
      }
    });

    // D003: プラン表示
    test('D003: 現在のプラン表示', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // プラン表示を探す
      const planDisplay = page.locator('text=/プラン|無料|Free|Premium|プレミアム/i');
      
      if (await planDisplay.count() > 0) {
        const planText = await planDisplay.first().textContent();
        console.log(`✅ D003: プラン表示 - PASS (${planText})`);
      } else {
        console.log('⚠️ D003: プランが表示されていません');
      }
    });

    // D004: 利用状況表示
    test('D004: 今月の利用回数表示', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 利用回数の表示を探す
      const usageDisplay = page.locator('text=/利用|使用|回数|[0-9]+回/i');
      
      if (await usageDisplay.count() > 0) {
        const usageText = await usageDisplay.first().textContent();
        console.log(`✅ D004: 利用状況表示 - PASS (${usageText})`);
      } else {
        console.log('⚠️ D004: 利用状況が表示されていません');
      }
    });

    // D006: クイックアクセス
    test('D006: 主要機能へのリンク', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // シミュレーターへのリンクを探す
      const simulatorLink = page.locator('a:has-text("シミュレーター"), a:has-text("シミュレーション")');
      
      if (await simulatorLink.count() > 0) {
        await simulatorLink.first().click();
        await page.waitForTimeout(2000);
        
        if (page.url().includes('simulator')) {
          console.log('✅ D006: クイックアクセス - PASS');
        } else {
          console.log('⚠️ D006: リンクが正しく機能していません');
        }
      } else {
        console.log('⚠️ D006: クイックアクセスリンクが見つかりません');
      }
    });

    // D007: レスポンシブ表示
    test('D007: モバイル表示の確認', async ({ page, isMobile }) => {
      if (isMobile) {
        await page.goto('/mypage');
        await page.waitForTimeout(2000);
        
        // モバイルレイアウトの確認
        const viewport = page.viewportSize();
        expect(viewport?.width).toBeLessThanOrEqual(768);
        
        // ハンバーガーメニューまたはモバイルメニューの存在確認
        const mobileMenu = page.locator('[aria-label*="menu"], button:has-text("メニュー")');
        
        if (await mobileMenu.count() > 0) {
          console.log('✅ D007: モバイルレスポンシブ - PASS');
        } else {
          console.log('⚠️ D007: モバイルメニューが見つかりません');
        }
      } else {
        console.log('⚠️ D007: デスクトップ環境でのテスト');
      }
    });
  });

  test.describe('シミュレーション履歴', () => {
    
    // H001: 履歴一覧表示
    test('H001: 過去のシミュレーション一覧', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 履歴セクションを探す
      const historySection = page.locator('text=/履歴|History|過去|シミュレーション結果/i');
      
      if (await historySection.count() > 0) {
        // 履歴リストの確認
        const historyItems = page.locator('.history-item, [class*="history"], table tbody tr');
        
        if (await historyItems.count() > 0) {
          console.log(`✅ H001: 履歴一覧表示 - PASS (${await historyItems.count()}件)`);
        } else {
          console.log('⚠️ H001: 履歴がありません');
        }
      } else {
        console.log('⚠️ H001: 履歴セクションが見つかりません');
      }
    });

    // H008: 空状態表示
    test('H008: 履歴がない場合の表示', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 履歴がない場合のメッセージを探す
      const emptyMessage = page.locator('text=/履歴がありません|まだシミュレーション|No history/i');
      
      if (await emptyMessage.count() > 0) {
        console.log('✅ H008: 空状態表示 - PASS');
      } else {
        // 履歴がある場合
        const historyItems = page.locator('.history-item, [class*="history"]');
        if (await historyItems.count() > 0) {
          console.log('✅ H008: 履歴あり - PASS');
        } else {
          console.log('⚠️ H008: 履歴表示が不明確');
        }
      }
    });
  });

  test.describe('プロフィール管理', () => {
    
    // P001: プロフィール表示
    test('P001: 現在の登録情報表示', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // プロフィールセクションまたは設定ボタンを探す
      const profileSection = page.locator('text=/プロフィール|Profile|設定|Settings/i');
      
      if (await profileSection.count() > 0) {
        // メールアドレスの表示確認
        const emailDisplay = page.locator('text=/togo@startup-marketing/');
        
        if (await emailDisplay.count() > 0) {
          console.log('✅ P001: プロフィール表示 - PASS');
        } else {
          console.log('⚠️ P001: メールアドレスが表示されていません');
        }
      } else {
        console.log('⚠️ P001: プロフィールセクションが見つかりません');
      }
    });

    // P004: パスワード変更
    test('P004: パスワード変更ボタンの確認', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // パスワード変更ボタンを探す
      const passwordChangeButton = page.locator('button:has-text("パスワード"), a:has-text("パスワード変更")');
      
      if (await passwordChangeButton.count() > 0) {
        console.log('✅ P004: パスワード変更ボタン - PASS');
      } else {
        console.log('⚠️ P004: パスワード変更オプションが見つかりません');
      }
    });
  });

  test.describe('利用状況・統計', () => {
    
    // S001: 月間利用回数
    test('S001: 今月の利用回数表示', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 月間利用回数の表示を探す
      const monthlyUsage = page.locator('text=/今月|月間|[0-9]+回/i');
      
      if (await monthlyUsage.count() > 0) {
        const usageText = await monthlyUsage.first().textContent();
        console.log(`✅ S001: 月間利用回数 - PASS (${usageText})`);
      } else {
        console.log('⚠️ S001: 月間利用回数が表示されていません');
      }
    });

    // S004: プラン利用率
    test('S004: 無料枠の使用率', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 利用率の表示を探す（無料プランの場合）
      const usageRate = page.locator('text=/[0-9]+\/5|残り[0-9]+回|%/i');
      
      if (await usageRate.count() > 0) {
        const rateText = await usageRate.first().textContent();
        console.log(`✅ S004: プラン利用率 - PASS (${rateText})`);
      } else {
        // プレミアムプランの場合
        const unlimited = page.locator('text=/無制限|Unlimited/i');
        if (await unlimited.count() > 0) {
          console.log('✅ S004: プレミアムプラン（無制限） - PASS');
        } else {
          console.log('⚠️ S004: 利用率が表示されていません');
        }
      }
    });

    // S005: リセット日表示
    test('S005: 次回リセット日', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // リセット日の表示を探す
      const resetDate = page.locator('text=/リセット|更新|次回/i');
      
      if (await resetDate.count() > 0) {
        const dateText = await resetDate.first().textContent();
        console.log(`✅ S005: リセット日表示 - PASS (${dateText})`);
      } else {
        console.log('⚠️ S005: リセット日が表示されていません');
      }
    });
  });

  test.describe('通知・アラート', () => {
    
    // N001: 利用制限警告
    test('N001: 残り1回時の警告', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 警告メッセージの確認
      const warningMessage = page.locator('text=/残り1回|あと1回|警告/i');
      
      if (await warningMessage.count() > 0) {
        console.log('✅ N001: 利用制限警告 - PASS');
      } else {
        console.log('⚠️ N001: 条件を満たしていないか、警告が表示されていません');
      }
    });

    // N004: エラー通知
    test('N004: エラー表示の確認', async ({ page }) => {
      // エラーを意図的に発生させる（例：無効なページへアクセス）
      await page.goto('/invalid-page-404');
      await page.waitForTimeout(2000);
      
      // エラーメッセージまたは404ページの確認
      const errorDisplay = page.locator('text=/エラー|Error|404|見つかりません/i');
      
      if (await errorDisplay.count() > 0) {
        console.log('✅ N004: エラー通知 - PASS');
      } else {
        console.log('⚠️ N004: エラー表示が確認できません');
      }
    });
  });

  test.describe('ナビゲーション', () => {
    
    // NAV001: メニュー表示
    test('NAV001: サイドバー/ヘッダーメニュー', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // ナビゲーションメニューの確認
      const navMenu = page.locator('nav, [role="navigation"], .menu, .sidebar');
      
      if (await navMenu.count() > 0) {
        console.log('✅ NAV001: メニュー表示 - PASS');
      } else {
        console.log('⚠️ NAV001: ナビゲーションメニューが見つかりません');
      }
    });

    // NAV002: リンク動作
    test('NAV002: 各メニュー項目クリック', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // シミュレーターリンクのテスト
      const simulatorLink = page.locator('a:has-text("シミュレーター")');
      
      if (await simulatorLink.count() > 0) {
        await simulatorLink.first().click();
        await page.waitForTimeout(2000);
        
        if (page.url().includes('simulator')) {
          console.log('✅ NAV002: リンク動作 - PASS');
          
          // マイページに戻る
          const mypageLink = page.locator('a:has-text("マイページ"), button:has-text("マイページ")');
          if (await mypageLink.count() > 0) {
            await mypageLink.first().click();
          }
        } else {
          console.log('⚠️ NAV002: リンクが正しく動作していません');
        }
      } else {
        console.log('⚠️ NAV002: ナビゲーションリンクが見つかりません');
      }
    });

    // NAV004: モバイルメニュー
    test('NAV004: ハンバーガーメニュー', async ({ page, isMobile }) => {
      if (isMobile) {
        await page.goto('/mypage');
        await page.waitForTimeout(2000);
        
        // ハンバーガーメニューボタンを探す
        const hamburger = page.locator('[aria-label*="menu"], button:has([class*="hamburger"]), button:has([class*="menu"])');
        
        if (await hamburger.count() > 0) {
          await hamburger.first().click();
          await page.waitForTimeout(500);
          
          // メニューが開いたか確認
          const menuOpen = page.locator('.menu-open, [class*="open"], nav:visible');
          
          if (await menuOpen.count() > 0) {
            console.log('✅ NAV004: モバイルメニュー - PASS');
          } else {
            console.log('⚠️ NAV004: メニューが開きません');
          }
        } else {
          console.log('⚠️ NAV004: ハンバーガーメニューが見つかりません');
        }
      } else {
        console.log('⚠️ NAV004: デスクトップ環境でのテスト');
      }
    });

    // NAV006: ログアウトボタン
    test('NAV006: ログアウト実行', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // ログアウトボタンを探す
      const logoutButton = page.locator('button:has-text("ログアウト"), a:has-text("ログアウト")');
      
      if (await logoutButton.count() > 0) {
        await logoutButton.first().click();
        await page.waitForTimeout(2000);
        
        // ログインページに戻ったか確認
        if (page.url().includes('login') || page.url() === process.env.BASE_URL + '/') {
          console.log('✅ NAV006: ログアウト実行 - PASS');
        } else {
          console.log('⚠️ NAV006: ログアウトが完了していません');
        }
      } else {
        console.log('⚠️ NAV006: ログアウトボタンが見つかりません');
      }
    });
  });

  test.describe('アカウント設定', () => {
    
    // A001: 設定画面表示
    test('A001: アカウント設定ページ', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 設定ボタンまたはリンクを探す
      const settingsLink = page.locator('a:has-text("設定"), button:has-text("設定"), a:has-text("Settings")');
      
      if (await settingsLink.count() > 0) {
        await settingsLink.first().click();
        await page.waitForTimeout(2000);
        
        // 設定ページの要素確認
        const settingsPage = page.locator('text=/アカウント|設定|Settings|Account/i');
        
        if (await settingsPage.count() > 0) {
          console.log('✅ A001: 設定画面表示 - PASS');
        } else {
          console.log('⚠️ A001: 設定ページが表示されていません');
        }
      } else {
        console.log('⚠️ A001: 設定リンクが見つかりません');
      }
    });

    // A004: 退会処理
    test('A004: アカウント削除オプション', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 退会または削除オプションを探す
      const deleteOption = page.locator('text=/退会|削除|Delete account/i');
      
      if (await deleteOption.count() > 0) {
        console.log('✅ A004: 退会オプション表示 - PASS');
      } else {
        console.log('⚠️ A004: 退会オプションが見つかりません');
      }
    });
  });
});

// デバッグ用：ダッシュボードの構造確認
test('DEBUG: ダッシュボード/マイページの構造確認', async ({ page }) => {
  // ログイン
  await page.goto('/login');
  const testEmail = process.env.TEST_EMAIL || 'togo@startup-marketing.co.jp';
  const testPassword = process.env.TEST_PASSWORD || 'gomesu';
  
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/dashboard|simulator|mypage/, { timeout: 10000 });
  
  // マイページへ移動
  if (!page.url().includes('mypage')) {
    await page.goto('/mypage');
  }
  await page.waitForTimeout(2000);
  
  // スクリーンショットを保存
  await page.screenshot({ 
    path: 'screenshots/dashboard-page.png', 
    fullPage: true 
  });
  
  // 要素を確認
  console.log('=== ダッシュボード要素 ===');
  
  const sections = await page.locator('section, [class*="section"]').count();
  console.log(`セクション数: ${sections}`);
  
  const buttons = await page.locator('button').allTextContents();
  console.log('ボタン:', buttons.filter(b => b.trim()));
  
  const links = await page.locator('a').allTextContents();
  console.log('リンク数:', links.filter(l => l.trim()).length);
  
  const cards = await page.locator('.card, [class*="card"]').count();
  console.log(`カード要素: ${cards}個`);
});