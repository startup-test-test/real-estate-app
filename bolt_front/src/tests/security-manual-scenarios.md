# セキュリティ機能の手動シナリオテスト

## テスト環境
- URL: http://localhost:5173 (開発環境)
- ブラウザ: Chrome/Firefox/Safari最新版
- 開発者ツール: コンソールタブを開いて監視

## S-001: XSS対策のシナリオテスト

### シナリオ1: 物件名へのスクリプト注入
1. シミュレーターページを開く
2. 物件名に以下を入力:
   ```
   <script>alert('XSS')</script>テスト物件
   ```
3. 他の必須項目を適当に入力
4. 「シミュレーション開始」をクリック

**期待結果:**
- ❌ エラーメッセージ「物件名にHTMLタグは使用できません」が表示される
- ❌ alertが実行されない
- ❌ コンソールにXSS関連のエラーが出ない

### シナリオ2: 物件URLへの危険なプロトコル
1. シミュレーターページを開く
2. 物件URLに以下を順番に入力してテスト:
   - `javascript:alert('XSS')`
   - `data:text/html,<script>alert('XSS')</script>`
   - `vbscript:msgbox('XSS')`

**期待結果:**
- ❌ エラーメッセージ「許可されていないプロトコルです」が表示される
- ❌ URLがクリックできない、または#に置換される

### シナリオ3: 画像アップロードでのXSS
1. 物件画像アップロード欄で悪意のあるSVGファイルをアップロード
2. SVGファイル例:
   ```svg
   <svg xmlns="http://www.w3.org/2000/svg">
     <script>alert('XSS')</script>
   </svg>
   ```

**期待結果:**
- ❌ SVGファイルが拒否される
- ❌ 「許可されていない画像形式です」エラーが表示される

## S-002/S-003: 入力値検証のシナリオテスト

### シナリオ4: 境界値テスト
1. シミュレーターページで以下の値を入力:
   - 物件価格: `999999`（上限100000万円を超える）
   - ローン期間: `100`（上限50年を超える）
   - 物件名: 101文字以上の文字列

**期待結果:**
- ❌ 各フィールドでエラーメッセージが表示される
- ❌ シミュレーションが実行されない

### シナリオ5: 必須項目の空チェック
1. 何も入力せずに「シミュレーション開始」をクリック

**期待結果:**
- ❌ 以下のエラーメッセージが表示される:
  - 物件名を入力してください
  - 所在地を入力してください
  - 物件価格を入力してください
  - 月額賃料を入力してください

### シナリオ6: 特殊文字の入力
1. 各テキストフィールドに以下を入力:
   - `'; DROP TABLE simulations; --`
   - `<img src=x onerror=alert(1)>`
   - `${alert('XSS')}`
   - `{{7*7}}`

**期待結果:**
- ❌ HTMLタグエラーが表示される（該当する場合）
- ❌ SQLインジェクションが実行されない
- ❌ テンプレートインジェクションが実行されない

## S-004: エラーハンドリングのシナリオテスト

### シナリオ7: ネットワークエラー
1. 開発者ツールのネットワークタブでオフラインモードに設定
2. 正常な値を入力してシミュレーション実行

**期待結果:**
- ❌ 「ネットワーク接続に問題があります」メッセージ
- ❌ 技術的なエラー詳細が表示されない
- ❌ 「再試行」ボタンが表示される

### シナリオ8: APIタイムアウト
1. ネットワークタブで3G Slowモードに設定
2. 大量のデータでシミュレーション実行

**期待結果:**
- ❌ タイムアウトエラーメッセージが表示される
- ❌ Renderの無料プランに関する説明が含まれる

### シナリオ9: 認証エラー
1. ログアウト状態でシミュレーションを保存しようとする

**期待結果:**
- ❌ 「認証エラーが発生しました」メッセージ
- ❌ ログインページへのリダイレクト提案

## 統合シナリオテスト

### シナリオ10: 悪意のある総合攻撃
1. 以下の入力を同時に行う:
   - 物件名: `<script>alert(1)</script>`
   - 所在地: `' OR 1=1 --`
   - URL: `javascript:void(0)`
   - メモ: `{{constructor.constructor('alert(1)')()}}`
   - 画像: 悪意のあるSVGファイル

**期待結果:**
- ❌ 複数のバリデーションエラーが表示される
- ❌ いずれの攻撃も成功しない
- ❌ システムが正常に動作を継続する

## チェックリスト

### 実行前の準備
- [ ] 開発者ツールのコンソールを開く
- [ ] ネットワークタブを確認できる状態にする
- [ ] テストデータを準備

### テスト実行記録
- [ ] シナリオ1: XSS - 物件名 ✅/❌
- [ ] シナリオ2: XSS - URL ✅/❌
- [ ] シナリオ3: XSS - 画像 ✅/❌
- [ ] シナリオ4: 境界値 ✅/❌
- [ ] シナリオ5: 必須項目 ✅/❌
- [ ] シナリオ6: 特殊文字 ✅/❌
- [ ] シナリオ7: ネットワークエラー ✅/❌
- [ ] シナリオ8: タイムアウト ✅/❌
- [ ] シナリオ9: 認証エラー ✅/❌
- [ ] シナリオ10: 総合攻撃 ✅/❌

## 自動化可能なシナリオ用のコード

```javascript
// ブラウザのコンソールで実行可能なテストスクリプト

// XSSペイロードのテスト
async function testXSSPayloads() {
  const payloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert("XSS")',
    '<svg onload=alert(1)>',
    '{{7*7}}',
    '${alert(1)}'
  ];

  for (const payload of payloads) {
    console.log(`Testing payload: ${payload}`);
    
    // 物件名フィールドにペイロードを入力
    const input = document.querySelector('input[placeholder*="カーサ"]');
    if (input) {
      input.value = payload;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // 少し待つ
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // エラーメッセージを確認
    const errors = document.querySelectorAll('[class*="red"]');
    console.log(`Errors found: ${errors.length}`);
  }
}

// 境界値テスト
function testBoundaryValues() {
  const tests = [
    { selector: 'input[id*="purchasePrice"]', value: '999999', expected: '100000万円以下' },
    { selector: 'input[id*="loanYears"]', value: '100', expected: '50年以下' },
    { selector: 'input[id*="interestRate"]', value: '30', expected: '20%以下' }
  ];

  tests.forEach(test => {
    const input = document.querySelector(test.selector);
    if (input) {
      input.value = test.value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`Set ${test.selector} to ${test.value}`);
    }
  });
  
  // シミュレーションボタンをクリック
  const button = document.querySelector('button[class*="bg-indigo"]');
  if (button) button.click();
}

// 実行
console.log('=== XSSテスト開始 ===');
testXSSPayloads();

console.log('=== 境界値テスト開始 ===');
testBoundaryValues();
```

## テスト結果の記録方法

1. **スクリーンショット**: 各エラーメッセージをキャプチャ
2. **コンソールログ**: エラーや警告をコピー
3. **ネットワークログ**: APIレスポンスを確認
4. **ビデオ録画**: 複雑なシナリオは録画推奨

## 報告フォーマット

```
テスト日時: YYYY-MM-DD HH:mm
テスター: [名前]
環境: [ブラウザ/OS]

シナリオX: [シナリオ名]
結果: ✅ PASS / ❌ FAIL
詳細: [観察された動作]
証跡: [スクリーンショット番号]
```