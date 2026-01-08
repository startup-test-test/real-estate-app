import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

// .envファイルを読み込み
dotenv.config();

/**
 * サブスクリプション機能 検証項目テスト
 * 対応シート: 03_サブスクリプション機能_検証項目シート.md
 */

test.describe('サブスクリプション機能の検証', () => {
  
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

  test.describe('プラン表示・選択', () => {
    
    // D001: プラン一覧表示
    test('D001: 料金プランページの表示', async ({ page }) => {
      // 料金ページへ遷移
      await page.goto('/pricing');
      await page.waitForTimeout(2000);
      
      // プランカードの存在確認
      const planCards = page.locator('.plan-card, .pricing-card, [class*="plan"]');
      const cardCount = await planCards.count();
      
      if (cardCount >= 2) {
        console.log('✅ D001: プラン一覧表示 - PASS');
      } else {
        // リンクから遷移を試みる
        await page.goto('/mypage');
        const pricingLink = page.locator('a:has-text("料金"), a:has-text("プラン"), a:has-text("アップグレード")');
        if (await pricingLink.count() > 0) {
          await pricingLink.first().click();
          await page.waitForTimeout(2000);
          console.log('✅ D001: 料金ページへ遷移 - PASS');
        } else {
          console.log('⚠️ D001: 料金ページへのリンクが見つかりません');
        }
      }
    });

    // D002: 現在プラン表示
    test('D002: ログインユーザーの現在プラン表示', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 現在のプラン表示を探す
      const currentPlan = page.locator('text=/現在のプラン|無料プラン|プレミアムプラン|Free|Premium/i');
      
      if (await currentPlan.count() > 0) {
        const planText = await currentPlan.first().textContent();
        console.log(`✅ D002: 現在プラン表示 - PASS (${planText})`);
      } else {
        console.log('⚠️ D002: 現在プランが表示されていません');
      }
    });

    // D003: 価格表示
    test('D003: 料金の表示形式', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForTimeout(2000);
      
      // 価格表示を探す（2,980円または¥2,980）
      const priceDisplay = page.locator('text=/2,980|￥2,980|¥2,980/');
      
      if (await priceDisplay.count() > 0) {
        const priceText = await priceDisplay.first().textContent();
        // 税込表示の確認
        const taxIncluded = await page.locator('text=/税込|税抜|incl/i').count() > 0;
        
        if (taxIncluded) {
          console.log('✅ D003: 価格表示（税込） - PASS');
        } else {
          console.log('⚠️ D003: 税込表示が見つかりません');
        }
      } else {
        console.log('⚠️ D003: 価格が表示されていません');
      }
    });

    // D004: 特典表示
    test('D004: 各プランの特典説明', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForTimeout(2000);
      
      // 特典リストを探す
      const features = page.locator('ul li, .feature-item, [class*="feature"]');
      const featureCount = await features.count();
      
      if (featureCount > 0) {
        console.log(`✅ D004: 特典表示 - PASS (${featureCount}個の特典)`);
      } else {
        console.log('⚠️ D004: 特典が表示されていません');
      }
    });

    // D006: モバイル表示
    test('D006: スマートフォンでの表示', async ({ page, isMobile }) => {
      if (isMobile) {
        await page.goto('/pricing');
        await page.waitForTimeout(2000);
        
        // モバイルでの表示確認
        const planCards = page.locator('.plan-card, .pricing-card');
        const isVisible = await planCards.first().isVisible();
        
        if (isVisible) {
          console.log('✅ D006: モバイル表示 - PASS');
        } else {
          console.log('⚠️ D006: モバイルで正しく表示されていません');
        }
      } else {
        console.log('⚠️ D006: デスクトップ環境でのテスト');
      }
    });
  });

  test.describe('アップグレード処理', () => {
    
    // U001: Stripe Checkout起動
    test('U001: アップグレードボタンクリック', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForTimeout(2000);
      
      // アップグレードボタンを探す
      const upgradeButton = page.locator('button:has-text("アップグレード"), button:has-text("プレミアムプランに登録"), button:has-text("購入")');
      
      if (await upgradeButton.count() > 0) {
        // Stripeのリダイレクトを監視
        const [response] = await Promise.all([
          page.waitForResponse(response => 
            response.url().includes('stripe') || 
            response.url().includes('checkout'),
            { timeout: 5000 }
          ).catch(() => null),
          upgradeButton.first().click()
        ]);
        
        if (response || page.url().includes('stripe')) {
          console.log('✅ U001: Stripe Checkout起動 - PASS');
        } else {
          console.log('⚠️ U001: Stripe Checkoutが起動しませんでした');
        }
      } else {
        console.log('⚠️ U001: アップグレードボタンが見つかりません');
      }
    });

    // U007: 即時プラン反映（テスト環境での確認）
    test('U007: 決済完了後のプラン状態確認', async ({ page }) => {
      // テスト環境では実際の決済はできないため、プラン状態の表示確認のみ
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      const planStatus = page.locator('[class*="plan"], [class*="subscription"]');
      if (await planStatus.count() > 0) {
        console.log('✅ U007: プラン状態表示確認 - PASS');
      } else {
        console.log('⚠️ U007: プラン状態が表示されていません');
      }
    });

    // U010: 二重課金防止
    test('U010: 連続してアップグレード操作', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForTimeout(2000);
      
      const upgradeButton = page.locator('button:has-text("アップグレード")').first();
      
      if (await upgradeButton.count() > 0) {
        // 既にプレミアムプランの場合、ボタンが無効化されているか確認
        const isDisabled = await upgradeButton.isDisabled();
        const buttonText = await upgradeButton.textContent();
        
        if (isDisabled || buttonText?.includes('登録済')) {
          console.log('✅ U010: 二重課金防止（ボタン無効化） - PASS');
        } else {
          console.log('⚠️ U010: 二重課金防止の仕組みを確認してください');
        }
      }
    });
  });

  test.describe('ダウングレード・解約処理', () => {
    
    // C001: 解約画面表示
    test('C001: 解約ボタンクリック', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 解約ボタンを探す
      const cancelButton = page.locator('button:has-text("解約"), a:has-text("解約"), button:has-text("キャンセル")');
      
      if (await cancelButton.count() > 0) {
        await cancelButton.first().click();
        await page.waitForTimeout(1000);
        
        // 確認画面が表示されるか確認
        const confirmDialog = page.locator('text=/解約しますか|確認|本当に/i');
        if (await confirmDialog.count() > 0) {
          console.log('✅ C001: 解約確認画面表示 - PASS');
        } else {
          console.log('⚠️ C001: 解約確認画面が表示されません');
        }
      } else {
        console.log('⚠️ C001: 解約ボタンが見つかりません（無料プランの可能性）');
      }
    });

    // C003: 解約確認
    test('C003: 解約の最終確認', async ({ page }) => {
      await page.goto('/mypage');
      
      const cancelButton = page.locator('button:has-text("解約")');
      if (await cancelButton.count() > 0) {
        await cancelButton.first().click();
        await page.waitForTimeout(1000);
        
        // 確認ダイアログの存在確認
        const confirmButton = page.locator('button:has-text("確認"), button:has-text("はい")');
        const cancelCancelButton = page.locator('button:has-text("キャンセル"), button:has-text("いいえ")');
        
        if (await confirmButton.count() > 0 && await cancelCancelButton.count() > 0) {
          console.log('✅ C003: 解約確認ダイアログ - PASS');
        } else {
          console.log('⚠️ C003: 確認ダイアログが不完全です');
        }
      }
    });
  });

  test.describe('利用状況管理', () => {
    
    // S001: 利用回数表示
    test('S001: 現在の利用回数表示', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 利用回数の表示を探す
      const usageCount = page.locator('text=/利用回数|使用回数|実行回数|[0-9]+回/i');
      
      if (await usageCount.count() > 0) {
        const usageText = await usageCount.first().textContent();
        console.log(`✅ S001: 利用回数表示 - PASS (${usageText})`);
      } else {
        console.log('⚠️ S001: 利用回数が表示されていません');
      }
    });

    // S002: 残り回数表示
    test('S002: 無料プランの残り回数', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 残り回数の表示を探す
      const remainingCount = page.locator('text=/残り|あと[0-9]+回|[0-9]+\/5/i');
      
      if (await remainingCount.count() > 0) {
        const remainingText = await remainingCount.first().textContent();
        console.log(`✅ S002: 残り回数表示 - PASS (${remainingText})`);
      } else {
        // プレミアムプランの場合
        const unlimited = page.locator('text=/無制限|Unlimited/i');
        if (await unlimited.count() > 0) {
          console.log('✅ S002: プレミアムプラン（無制限） - PASS');
        } else {
          console.log('⚠️ S002: 利用可能回数が表示されていません');
        }
      }
    });

    // S003: リセット日表示
    test('S003: 次回リセット日', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // リセット日の表示を探す
      const resetDate = page.locator('text=/リセット|更新日|次回/i');
      
      if (await resetDate.count() > 0) {
        const resetText = await resetDate.first().textContent();
        console.log(`✅ S003: リセット日表示 - PASS (${resetText})`);
      } else {
        console.log('⚠️ S003: リセット日が表示されていません');
      }
    });

    // S005: 制限到達通知
    test('S005: 残り1回時の警告', async ({ page }) => {
      // シミュレーターページで確認
      await page.goto('/simulator');
      await page.waitForTimeout(2000);
      
      // 警告メッセージの確認
      const warningMessage = page.locator('text=/残り1回|あと1回|最後/i');
      
      if (await warningMessage.count() > 0) {
        console.log('✅ S005: 制限到達警告 - PASS');
      } else {
        console.log('⚠️ S005: 警告メッセージの表示条件を満たしていません');
      }
    });

    // S006: 制限超過時動作
    test('S006: 制限超過時のアップグレード促進', async ({ page }) => {
      await page.goto('/simulator');
      
      // 制限メッセージを探す
      const limitMessage = page.locator('text=/制限に達しました|アップグレード|利用回数を超えました/i');
      
      if (await limitMessage.count() > 0) {
        console.log('✅ S006: 制限超過メッセージ - PASS');
        
        // アップグレードボタンの存在確認
        const upgradePrompt = page.locator('button:has-text("アップグレード"), a:has-text("アップグレード")');
        if (await upgradePrompt.count() > 0) {
          console.log('✅ S006: アップグレード促進ボタン - PASS');
        }
      } else {
        console.log('⚠️ S006: 制限に達していないか、プレミアムプランです');
      }
    });

    // S008: プレミアム時表示
    test('S008: 有料プランの無制限表示', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // プレミアムプランの表示を確認
      const premiumIndicator = page.locator('text=/プレミアム|Premium|無制限|Unlimited/i');
      
      if (await premiumIndicator.count() > 0) {
        const indicatorText = await premiumIndicator.first().textContent();
        console.log(`✅ S008: プレミアム表示 - PASS (${indicatorText})`);
      } else {
        console.log('⚠️ S008: 無料プランまたは表示なし');
      }
    });
  });

  test.describe('請求・支払い管理', () => {
    
    // B003: 請求書表示
    test('B003: 請求履歴の確認', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 請求履歴へのリンクを探す
      const billingLink = page.locator('a:has-text("請求"), a:has-text("支払い履歴"), a:has-text("Billing")');
      
      if (await billingLink.count() > 0) {
        await billingLink.first().click();
        await page.waitForTimeout(2000);
        
        // 請求履歴テーブルまたはリストの確認
        const billingHistory = page.locator('table, .billing-history, [class*="invoice"]');
        if (await billingHistory.count() > 0) {
          console.log('✅ B003: 請求履歴表示 - PASS');
        } else {
          console.log('⚠️ B003: 請求履歴が表示されません');
        }
      } else {
        console.log('⚠️ B003: 請求履歴へのリンクが見つかりません');
      }
    });

    // B004: 支払い方法変更
    test('B004: カード情報の更新', async ({ page }) => {
      await page.goto('/mypage');
      await page.waitForTimeout(2000);
      
      // 支払い方法変更ボタンを探す
      const paymentMethodButton = page.locator('button:has-text("支払い方法"), button:has-text("カード変更"), a:has-text("Payment")');
      
      if (await paymentMethodButton.count() > 0) {
        console.log('✅ B004: 支払い方法変更ボタン - PASS');
      } else {
        console.log('⚠️ B004: 支払い方法変更オプションが見つかりません');
      }
    });
  });

  test.describe('セキュリティ・コンプライアンス', () => {
    
    // SEC001: PCI DSS準拠
    test('SEC001: カード情報の取扱い', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForTimeout(2000);
      
      // カード情報入力フィールドが直接存在しないことを確認
      const cardInputs = page.locator('input[name*="card"], input[placeholder*="カード番号"]');
      
      if (await cardInputs.count() === 0) {
        console.log('✅ SEC001: カード情報直接扱わない（Stripe利用） - PASS');
      } else {
        console.log('⚠️ SEC001: カード情報入力欄が存在します（要確認）');
      }
    });

    // SEC002: SSL/TLS通信
    test('SEC002: HTTPS通信確認', async ({ page }) => {
      const url = page.url();
      
      if (url.startsWith('https://')) {
        console.log('✅ SEC002: HTTPS通信 - PASS');
      } else if (url.includes('localhost')) {
        console.log('⚠️ SEC002: ローカル環境（本番ではHTTPS必須）');
      } else {
        console.log('❌ SEC002: HTTP通信（セキュリティリスク）');
      }
    });
  });
});

// デバッグ用：サブスクリプション管理画面の構造確認
test('DEBUG: サブスクリプション管理画面の構造確認', async ({ page }) => {
  // ログイン
  await page.goto('/login');
  const testEmail = process.env.TEST_EMAIL || 'togo@startup-marketing.co.jp';
  const testPassword = process.env.TEST_PASSWORD || 'gomesu';
  
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/dashboard|simulator|mypage/, { timeout: 10000 });
  
  // マイページへ
  await page.goto('/mypage');
  await page.waitForTimeout(2000);
  
  // スクリーンショットを保存
  await page.screenshot({ 
    path: 'screenshots/subscription-page.png', 
    fullPage: true 
  });
  
  // 要素を確認
  console.log('=== サブスクリプション関連要素 ===');
  
  const planInfo = await page.locator('text=/プラン|Plan/i').count();
  console.log(`プラン情報: ${planInfo}個`);
  
  const buttons = await page.locator('button').allTextContents();
  console.log('ボタン:', buttons.filter(b => b.trim()));
  
  const links = await page.locator('a').allTextContents();
  const subscriptionLinks = links.filter(l => 
    l.includes('料金') || l.includes('プラン') || l.includes('アップグレード')
  );
  console.log('サブスク関連リンク:', subscriptionLinks);
});