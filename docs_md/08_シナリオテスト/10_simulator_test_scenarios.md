# シミュレーター入力フォーム網羅的テストシナリオ

**作成日**: 2025-08-09  
**バージョン**: 1.0.0  
**対象画面**: 物件シミュレーター (`/simulator`)

## 1. テスト概要

### 1.1 テスト目的
- 入力フォームのバリデーション動作確認
- エッジケースでのエラーハンドリング確認
- 異常値入力時のシステム挙動確認
- ユーザビリティの検証

### 1.2 テスト対象フィールド
| カテゴリ | フィールド名 | 型 | 必須 | 備考 ||---------|------------|------|----------|-------|
| 物件情報 | 物件名 (propertyName) | 文字列 | ✓ | |
| | 所在地 (location) | 文字列 | ✓ | |
| | 建築年 (yearBuilt) | 数値 | ✓ | 西暦年 |
| | 建物構造 (propertyType) | 選択 | ✓ | RC/SRC/S/木造等 |
| 取得費用 | 物件価格 (purchasePrice) | 数値 | ✓ | 万円単位 |
| | 表面利回り (surfaceYield) | 数値 | ✓ | % |
| | 購入諸費用 (purchaseFees) | 数値 | | 万円単位 |
| 収入 | 月額賃料 (monthlyRent) | 数値 | ✓ | 円単位 |
| | 空室率 (vacancyRate) | 数値 | | % |
| 支出 | 管理手数料 (managementFee) | 数値 | | 円単位 |
| | 修繕積立金 (repairReserve) | 数値 | | 円単位 |
| | 固定資産税 (propertyTax) | 数値 | | 円単位/年 |
| | 都市計画税 (cityPlanningTax) | 数値 | | 円単位/年 |
| ローン | 借入金額 (loanAmount) | 数値 | | 万円単位 |
| | 金利 (interestRate) | 数値 | | % |
| | 借入期間 (loanPeriod) | 数値 | | 年 |
| その他 | 減価償却年数 (depreciationYears) | 数値 | | 年 |

---

## 2. 正常系テストケース

### 2.1 最小値入力パターン
```javascript
{
  テストID: "NORMAL_001",
  シナリオ: "全必須項目に最小値を入力",
  入力値: {
    propertyName: "テスト物件",
    location: "東京都",
    yearBuilt: 1950,
    propertyType: "木造",
    purchasePrice: 100,  // 100万円
    surfaceYield: 0.1,   // 0.1%
    monthlyRent: 10000   // 1万円
  },
  期待結果: "正常にシミュレーション実行",
  確認項目: [
    "計算結果が表示される",
    "収支がマイナスでも警告表示",
    "PDF出力が可能"
  ]
}
```

### 2.2 最大値入力パターン
```javascript
{
  テストID: "NORMAL_002",
  シナリオ: "現実的な最大値を入力",
  入力値: {
    propertyName: "高級タワーマンション",
    location: "東京都港区",
    yearBuilt: 2025,
    propertyType: "RC",
    purchasePrice: 100000,    // 10億円
    surfaceYield: 20,         // 20%
    monthlyRent: 10000000,    // 1000万円
    loanAmount: 80000,        // 8億円
    interestRate: 10,         // 10%
    loanPeriod: 50            // 50年
  },
  期待結果: "正常にシミュレーション実行",
  確認項目: [
    "大きな数値でも正しく計算",
    "表示がカンマ区切りで見やすい",
    "グラフが正しくスケール"
  ]
}
```

### 2.3 一般的な投資物件パターン
```javascript
{
  テストID: "NORMAL_003",
  シナリオ: "典型的な区分マンション投資",
  入力値: {
    propertyName: "新宿区ワンルーム",
    location: "東京都新宿区",
    yearBuilt: 2010,
    propertyType: "RC",
    purchasePrice: 2500,      // 2500万円
    surfaceYield: 5.5,        // 5.5%
    monthlyRent: 115000,      // 11.5万円
    managementFee: 5750,      // 5%
    repairReserve: 8000,
    propertyTax: 80000,       // 年8万円
    loanAmount: 2000,         // 2000万円
    interestRate: 2.5,        // 2.5%
    loanPeriod: 35            // 35年
  },
  期待結果: "正常なキャッシュフロー計算",
  確認項目: [
    "月次収支が正しく計算",
    "年次キャッシュフローが表示",
    "ROIが妥当な範囲"
  ]
}
```

---

## 3. 異常系テストケース

### 3.1 ゼロ値入力パターン
```javascript
{
  テストID: "ERROR_001",
  シナリオ: "必須項目に0を入力",
  入力値: {
    propertyName: "ゼロテスト",
    location: "テスト",
    yearBuilt: 0,           // ❌ 異常値
    propertyType: "RC",
    purchasePrice: 0,        // ❌ 異常値
    surfaceYield: 0,         // ❌ 異常値
    monthlyRent: 0           // ❌ 異常値
  },
  期待結果: "バリデーションエラー",
  確認項目: [
    "各フィールドにエラー表示",
    "エラーメッセージが分かりやすい",
    "送信ボタンが無効化",
    "フィールドが赤くハイライト"
  ]
}
```

### 3.2 マイナス値入力パターン
```javascript
{
  テストID: "ERROR_002",
  シナリオ: "数値項目にマイナス値を入力",
  入力値: {
    propertyName: "マイナステスト",
    location: "テスト",
    yearBuilt: -2020,        // ❌ マイナス年
    propertyType: "RC",
    purchasePrice: -5000,    // ❌ マイナス価格
    surfaceYield: -10,       // ❌ マイナス利回り
    monthlyRent: -100000     // ❌ マイナス賃料
  },
  期待結果: "バリデーションエラー",
  確認項目: [
    "マイナス値が入力できない",
    "または入力時にエラー表示",
    "計算実行不可"
  ]
}
```

### 3.3 極端な値入力パターン
```javascript
{
  テストID: "ERROR_003",
  シナリオ: "非現実的な極端値を入力",
  入力値: {
    propertyName: "極端テスト",
    location: "テスト",
    yearBuilt: 999999999,     // ❌ 未来すぎる年
    propertyType: "RC",
    purchasePrice: 999999999, // ❌ 9999億円
    surfaceYield: 999,        // ❌ 999%
    monthlyRent: 999999999999 // ❌ 桁あふれ
  },
  期待結果: "バリデーションエラーまたは計算エラー",
  確認項目: [
    "上限値チェックが機能",
    "オーバーフローしない",
    "エラーメッセージ表示"
  ]
}
```

### 3.4 空文字・NULL入力パターン
```javascript
{
  テストID: "ERROR_004",
  シナリオ: "必須項目を空にして送信",
  入力値: {
    propertyName: "",         // ❌ 空文字
    location: null,           // ❌ NULL
    yearBuilt: undefined,     // ❌ undefined
    propertyType: "",         // ❌ 未選択
    purchasePrice: "",        // ❌ 空文字
    surfaceYield: null,       // ❌ NULL
    monthlyRent: ""           // ❌ 空文字
  },
  期待結果: "バリデーションエラー",
  確認項目: [
    "必須項目エラー表示",
    "送信ボタン無効化",
    "エラー箇所が明確"
  ]
}
```

### 3.5 文字列入力パターン（数値フィールド）
```javascript
{
  テストID: "ERROR_005",
  シナリオ: "数値フィールドに文字列を入力",
  入力値: {
    propertyName: "文字列テスト",
    location: "東京都",
    yearBuilt: "二千二十年",    // ❌ 文字列
    propertyType: "RC",
    purchasePrice: "一千万円",   // ❌ 文字列
    surfaceYield: "五パーセント", // ❌ 文字列
    monthlyRent: "十万円"        // ❌ 文字列
  },
  期待結果: "入力制限または変換エラー",
  確認項目: [
    "文字が入力できない",
    "または自動で数値変換",
    "エラーメッセージ表示"
  ]
}
```

---

## 4. 境界値テストケース

### 4.1 年数の境界値
```javascript
{
  テストID: "BOUNDARY_001",
  シナリオ: "建築年の境界値テスト",
  テストケース: [
    { yearBuilt: 1900, 期待: "正常処理（古い物件）" },
    { yearBuilt: 1899, 期待: "警告またはエラー" },
    { yearBuilt: 2025, 期待: "正常処理（新築）" },
    { yearBuilt: 2026, 期待: "エラー（未来の年）" },
    { yearBuilt: 2024, 期待: "正常処理（築1年）" }
  ]
}
```

### 4.2 利回りの境界値
```javascript
{
  テストID: "BOUNDARY_002",
  シナリオ: "表面利回りの境界値テスト",
  テストケース: [
    { surfaceYield: 0.01,  期待: "正常（低利回り警告）" },
    { surfaceYield: 0,     期待: "エラー" },
    { surfaceYield: 30,    期待: "正常（高利回り警告）" },
    { surfaceYield: 100,   期待: "エラーまたは警告" },
    { surfaceYield: -0.1,  期待: "エラー" }
  ]
}
```

### 4.3 ローン条件の境界値
```javascript
{
  テストID: "BOUNDARY_003",
  シナリオ: "ローン条件の境界値テスト",
  テストケース: [
    { loanPeriod: 1,   期待: "正常（短期ローン）" },
    { loanPeriod: 0,   期待: "エラーまたは現金購入" },
    { loanPeriod: 50,  期待: "正常または警告" },
    { loanPeriod: 100, 期待: "エラー" },
    { interestRate: 0,  期待: "正常（無利息）" },
    { interestRate: 20, 期待: "警告（高金利）" },
    { interestRate: 50, 期待: "エラー" }
  ]
}
```

---

## 5. 特殊ケーステスト

### 5.1 デフォルト値確認テスト
```javascript
{
  テストID: "SPECIAL_DEFAULT_001",
  シナリオ: "新規登録画面のデフォルト値確認",
  確認項目: [
    {
      フィールド: "管理手数料",
      デフォルト値: "3%",
      備考: "新規作成時のデフォルト"
    },
    {
      フィールド: "固定資産税",
      デフォルト値: "210,000円",
      備考: "新規作成時のデフォルト"
    },
    {
      フィールド: "修繕積立金",
      デフォルト値: "0円または空",
      備考: "初期値なし"
    },
    {
      フィールド: "空室率",
      デフォルト値: "10%",
      備考: "標準的な空室率"
    },
    {
      フィールド: "減価償却年数",
      デフォルト値: "自動計算",
      備考: "建物構造と築年数から自動"
    }
  ],
  期待結果: "全てのデフォルト値が正しく設定されている"
}
```

### 5.2 個人投資家（税率0%）パターン
```javascript
{
  テストID: "SPECIAL_TAX_001",
  シナリオ: "個人投資家の税率0%設定",
  入力値: {
    propertyName: "個人投資物件",
    location: "東京都",
    yearBuilt: 2020,
    propertyType: "RC",
    purchasePrice: 3000,
    surfaceYield: 5.5,
    monthlyRent: 137500,
    taxRate: 0,  // 個人の場合、税率0%
    managementFee: "3%",  // パーセント表示
    propertyTax: 210000  // デフォルト値
  },
  確認項目: [
    "税率0%で計算される",
    "税引き後キャッシュフローが税引き前と同じ",
    "管理手数料が月額賃料の3%として計算",
    "固定資産税が年間210,000円として計算"
  ],
  期待結果: "個人投資家向けの正しい計算"
}
```

### 5.3 管理手数料パーセント入力テスト
```javascript
{
  テストID: "SPECIAL_PERCENT_001",
  シナリオ: "管理手数料をパーセントで入力",
  テストケース: [
    {
      月額賃料: 100000,
      管理手数料入力: "5%",
      期待値: 5000,  // 100,000円の5%
      備考: "パーセント入力を円に変換"
    },
    {
      月額賃料: 150000,
      管理手数料入力: "3%",
      期待値: 4500,  // 150,000円の3%
      備考: "デフォルトの3%"
    },
    {
      月額賃料: 200000,
      管理手数料入力: "5000",
      期待値: 5000,  // 固定額入力
      備考: "円での直接入力も可能"
    }
  ],
  期待結果: "パーセント入力と円入力の両方が正しく処理"
}
```

### 5.4 自動計算連動テスト
```javascript
{
  テストID: "SPECIAL_001",
  シナリオ: "物件価格変更時の自動計算",
  手順: [
    "1. 物件価格に5000万円を入力",
    "2. 固定資産税が自動で35万円（0.7%）に設定されることを確認",
    "3. 物件価格を3000万円に変更",
    "4. 固定資産税が変更されないことを確認（手動変更済みとして）"
  ],
  期待結果: "初回のみ自動計算、以降は手動値を保持"
}
```

### 5.2 Depreciation Years Auto-calculation Test
```javascript
{
  TestID: "SPECIAL_002",
  Scenario: "Auto-calculation of depreciation years based on structure and age",
  TestCases: [
    {
      BuildingStructure: "RC",
      YearBuilt: 2000,
      ExpectedDepreciationYears: 27 // (47-25) + 25*0.2
    },
    {
      BuildingStructure: "Wood",
      YearBuilt: 2000,
      ExpectedDepreciationYears: 4  // Exceeded legal years, minimum 4 years
    },
    {
      BuildingStructure: "RC",
      YearBuilt: 2024,
      ExpectedDepreciationYears: 47 // New construction
    }
  ]
}
```

### 5.3 Copy & Paste Test
```javascript
{
  TestID: "SPECIAL_003",
  Scenario: "Clipboard paste test",
  TestCases: [
    {
      PastedValue: "１２３４５",  // Full-width numbers
      ExpectedResult: "Auto-convert to half-width"
    },
    {
      PastedValue: "1,234,567",  // With commas
      ExpectedResult: "Remove commas and convert to number"
    },
    {
      PastedValue: "¥1,234,567", // With currency symbol
      ExpectedResult: "Remove symbol and convert to number"
    }
  ]
}
```

---

## 6. Usability Tests

### 6.1 Focus Behavior Test
```javascript
{
  TestID: "UX_001",
  Scenario: "Field focus behavior",
  CheckItems: [
    "Field with 0 becomes empty when clicked",
    "Field with value gets fully selected when clicked",
    "Tab key navigation works properly",
    "Error fields are visually distinct"
  ]
}
```

### 6.2 Error Recovery Test
```javascript
{
  TestID: "UX_002",
  Scenario: "Recovery from error state",
  Steps: [
    "1. Leave required fields empty to show errors",
    "2. Input correct values",
    "3. Confirm error display disappears",
    "4. Confirm submit button becomes enabled"
  ]
}
```

### 6.3 Responsive Test
```javascript
{
  TestID: "UX_003",
  Scenario: "Display and operation on each device",
  Devices: [
    { type: "Desktop", width: 1920, height: 1080 },
    { type: "Tablet", width: 768, height: 1024 },
    { type: "Mobile", width: 375, height: 667 }
  ],
  CheckItems: [
    "Layout doesn't break",
    "Buttons are easy to tap",
    "Input fields are appropriate size",
    "Numeric keypad displays (mobile)"
  ]
}
```

---

## 7. Security Tests

### 7.1 SQL Injection Prevention
```javascript
{
  TestID: "SECURITY_001",
  Scenario: "SQL string input test",
  InputValues: {
    propertyName: "'; DROP TABLE users; --",
    location: "' OR '1'='1",
  },
  ExpectedResult: "Escaped and safely stored"
}
```

### 7.2 XSS Prevention
```javascript
{
  TestID: "SECURITY_002",
  Scenario: "Script tag input test",
  InputValues: {
    propertyName: "<script>alert('XSS')</script>",
    location: "<img src=x onerror=alert('XSS')>",
  },
  ExpectedResult: "HTML escaped when displayed"
}
```

### 7.3 Large Data Submission Test
```javascript
{
  TestID: "SECURITY_003",
  Scenario: "Abnormally long string input",
  InputValues: {
    propertyName: "A".repeat(10000), // 10,000 characters
    location: "B".repeat(100000),    // 100,000 characters
  },
  ExpectedResult: "Character limit error or truncation"
}
```

---

## 8. API Integration Tests

### 8.1 Timeout Test
```javascript
{
  TestID: "API_001",
  Scenario: "Behavior when API response is delayed",
  Condition: "Delay API response by 30 seconds",
  ExpectedResults: [
    "Loading display",
    "Timeout error display",
    "Retry button display"
  ]
}
```

### 8.2 Error Response Test
```javascript
{
  TestID: "API_002",
  Scenario: "Handling various API error codes",
  TestCases: [
    { status: 400, Message: "Input value error" },
    { status: 401, Message: "Authentication error" },
    { status: 500, Message: "Server error" },
    { status: 503, Message: "Under maintenance" }
  ]
}
```

---

## 9. Implementation Record

| Date | Tester | Test Scope | Bugs Found | Notes |
|------|--------|------------|------------|-------|
| 2025-08-09 | - | Document creation | - | Initial version |

---

## 10. Bug Detection Implementation Strategy

### 10.1 Automated Bug Detection Mechanism
1. **Continuous Integration (CI)**
   - Auto-run tests on push with GitHub Actions
   - Auto-notify on test failures

2. **Coverage Measurement**
   - Target 80%+ code coverage
   - Visualize untested portions

3. **Regression Testing**
   - Re-run all test cases after fixes
   - Early detection of new bugs

### 10.2 Manual Testing Methods
1. **Test Sheet Management**
   - Create checklist from test cases in this document
   - Record execution date/time and results

2. **Bug Tracking**
   - Register found bugs in GitHub Issues
   - Specify priority and impact scope

3. **Regular Test Execution**
   - Execute all test cases before release
   - Execute critical test cases monthly

---

## 11. Improvement Proposals

### Issues Found
1. (To be filled after test execution)

### Improvement Ideas
1. (To be filled after test execution)

---

**Next Update**: Reflect results after test execution