// バリデーションエラー視覚的フィードバックのテストスクリプト
const puppeteer = require('puppeteer');

async function runValidationTests() {
  console.log('🧪 バリデーションエラー視覚的フィードバックのユニットテスト開始...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // テスト結果を記録
    const results = {
      passed: 0,
      failed: 0,
      details: []
    };
    
    // 1. ページアクセステスト
    console.log('📍 Test 1: シミュレーターページへのアクセス');
    await page.goto('http://localhost:5174/simulator', { waitUntil: 'networkidle0' });
    const title = await page.title();
    if (title) {
      results.passed++;
      results.details.push('✅ シミュレーターページに正常にアクセスできました');
    } else {
      results.failed++;
      results.details.push('❌ シミュレーターページへのアクセスに失敗しました');
    }
    
    // 2. 必須フィールドが空の状態でシミュレーション実行
    console.log('\n📍 Test 2: 空のフォームでシミュレーション実行');
    const simulateButton = await page.$('button:has-text("シミュレーション実行")');
    if (simulateButton) {
      await simulateButton.click();
      await page.waitForTimeout(500);
      
      // エラーメッセージの確認
      const errorBox = await page.$('.bg-red-50.border-red-400');
      if (errorBox) {
        results.passed++;
        results.details.push('✅ エラーボックスが表示されました');
      } else {
        results.failed++;
        results.details.push('❌ エラーボックスが表示されませんでした');
      }
    }
    
    // 3. 各必須フィールドのエラー表示確認
    console.log('\n📍 Test 3: 必須フィールドのエラー表示確認');
    const requiredFields = [
      { selector: '[data-field="propertyName"] input', name: '物件名' },
      { selector: '[data-field="location"] input', name: '所在地' },
      { selector: '[data-field="yearBuilt"] input', name: '建築年' },
      { selector: '[data-field="propertyType"] select', name: '建物構造' },
      { selector: '[data-field="purchasePrice"] input', name: '購入価格' },
      { selector: '[data-field="monthlyRent"] input', name: '月額賃料' },
      { selector: '[data-field="loanAmount"] input', name: '借入額' },
      { selector: '[data-field="interestRate"] input', name: '金利' },
      { selector: '[data-field="loanYears"] input', name: '返済期間' },
      { selector: '[data-field="loanType"] select', name: '借入形式' },
      { selector: '[data-field="holdingYears"] input', name: '保有年数' },
      { selector: '[data-field="exitCapRate"] input', name: '売却CapRate' }
    ];
    
    for (const field of requiredFields) {
      const element = await page.$(field.selector);
      if (element) {
        const className = await element.evaluate(el => el.className);
        if (className.includes('border-red-300') && className.includes('bg-red-50')) {
          results.passed++;
          results.details.push(`✅ ${field.name}フィールドにエラースタイルが適用されています`);
        } else {
          results.failed++;
          results.details.push(`❌ ${field.name}フィールドにエラースタイルが適用されていません`);
        }
        
        // エラーメッセージの確認
        const errorMsg = await page.$(`${field.selector.split(' ')[0]} .text-red-600`);
        if (errorMsg) {
          results.passed++;
          results.details.push(`✅ ${field.name}フィールドのエラーメッセージが表示されています`);
        } else {
          results.failed++;
          results.details.push(`❌ ${field.name}フィールドのエラーメッセージが表示されていません`);
        }
      }
    }
    
    // 4. 自動スクロールのテスト
    console.log('\n📍 Test 4: 自動スクロール機能の確認');
    const scrollPosition = await page.evaluate(() => window.scrollY);
    if (scrollPosition > 0) {
      results.passed++;
      results.details.push('✅ エラーフィールドへの自動スクロールが動作しました');
    } else {
      results.failed++;
      results.details.push('❌ 自動スクロールが動作しませんでした');
    }
    
    // 5. フィールド入力時のエラークリアテスト
    console.log('\n📍 Test 5: フィールド入力時のエラークリア確認');
    const propertyNameInput = await page.$('[data-field="propertyName"] input');
    if (propertyNameInput) {
      await propertyNameInput.type('テスト物件');
      await page.waitForTimeout(300);
      
      const className = await propertyNameInput.evaluate(el => el.className);
      if (!className.includes('border-red-300') && !className.includes('bg-red-50')) {
        results.passed++;
        results.details.push('✅ 入力時にエラースタイルがクリアされました');
      } else {
        results.failed++;
        results.details.push('❌ 入力時にエラースタイルがクリアされませんでした');
      }
      
      // エラーメッセージも消えているか確認
      const errorMsg = await page.$('[data-field="propertyName"] .text-red-600');
      if (!errorMsg) {
        results.passed++;
        results.details.push('✅ 入力時にエラーメッセージが消えました');
      } else {
        results.failed++;
        results.details.push('❌ 入力時にエラーメッセージが消えませんでした');
      }
    }
    
    // 6. 部分的に入力してシミュレーション実行
    console.log('\n📍 Test 6: 部分的な入力での動作確認');
    await page.reload({ waitUntil: 'networkidle0' });
    
    // いくつかのフィールドだけ入力
    await page.type('[data-field="propertyName"] input', 'テスト物件');
    await page.type('[data-field="location"] input', '東京都渋谷区');
    await page.type('[data-field="yearBuilt"] input', '2020');
    
    // シミュレーション実行
    const button = await page.$('button:has-text("シミュレーション実行")');
    await button.click();
    await page.waitForTimeout(500);
    
    // 入力済みフィールドにエラーがないことを確認
    const filledFields = ['propertyName', 'location', 'yearBuilt'];
    for (const fieldName of filledFields) {
      const input = await page.$(`[data-field="${fieldName}"] input`);
      const className = await input.evaluate(el => el.className);
      if (!className.includes('border-red-300')) {
        results.passed++;
        results.details.push(`✅ 入力済みフィールド（${fieldName}）にエラースタイルがありません`);
      } else {
        results.failed++;
        results.details.push(`❌ 入力済みフィールド（${fieldName}）にエラースタイルが残っています`);
      }
    }
    
    // テスト結果のサマリー
    console.log('\n📊 テスト結果サマリー:');
    console.log(`✅ 成功: ${results.passed}`);
    console.log(`❌ 失敗: ${results.failed}`);
    console.log(`📝 合計: ${results.passed + results.failed}`);
    
    console.log('\n📋 詳細結果:');
    results.details.forEach(detail => console.log(`   ${detail}`));
    
    // スクリーンショットを保存
    await page.screenshot({ path: 'validation-test-result.png', fullPage: true });
    console.log('\n📸 スクリーンショット保存: validation-test-result.png');
    
  } catch (error) {
    console.error('❌ テスト実行中にエラーが発生しました:', error);
  } finally {
    await browser.close();
  }
}

// テスト実行
runValidationTests().catch(console.error);