# シミュレーションAPI仕様書

## 概要

不動産投資シミュレーションの計算を行うAPI。収益シミュレーターとCFシミュレーターはそれぞれ専用のエンドポイントを使用。

---

## エンドポイント一覧

| シミュレーター | エンドポイント | 用途 |
|--------------|---------------|------|
| 収益シミュレーター | `/api/simulate` | 詳細なシミュレーション（全項目出力） |
| CFシミュレーター | `/api/cf-simulate` | 簡易CFシミュレーション（CF特化出力） |

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    フロントエンド                            │
├─────────────────────────┬───────────────────────────────────┤
│  収益シミュレーター       │  CFシミュレーター                  │
│  /mypage/revenue-simulator │  /mypage/cf-simulator            │
└─────────────────────────┴───────────────────────────────────┘
          │                              │
          ▼ POST /api/simulate           ▼ POST /api/cf-simulate
┌─────────────────────────┐   ┌───────────────────────────────┐
│  /api/simulate.py       │   │  /api/cf-simulate.py           │
│  - 全項目レスポンス       │   │  - CF特化レスポンス             │
│  - 詳細分析用            │   │  - cash_flow_tableから正確値    │
└─────────────────────────┘   └───────────────────────────────┘
          │                              │
          └──────────────┬───────────────┘
                         ▼ import（共有）
┌─────────────────────────────────────────────────────────────┐
│  /api/shared/calculations.py（計算ロジック）                 │
│  - run_full_simulation()        メイン関数                   │
│  - calculate_basic_metrics()    基本指標計算                 │
│  - calculate_cash_flow_table()  キャッシュフロー表生成        │
│  - calculate_property_valuation() 物件評価                   │
│  - calculate_sale_analysis()    売却分析                     │
└─────────────────────────────────────────────────────────────┘
```

**設計ポイント**:
- 計算ロジック（calculations.py）は共有し、同じ計算結果を保証
- エンドポイントを分離することで、互いに影響を与えずに独立して開発・修正可能
- CFシミュレーターは`cash_flow_table`から正確なキャッシュフロー値を取得

---

## 入力パラメータ（リクエストボディ）

### 必須パラメータ

| パラメータ名 | 型 | 単位 | 説明 |
|-------------|-----|------|------|
| `purchasePrice` | number | 万円 | 物件価格 |
| `monthlyRent` | number | 万円 | 月額家賃収入 |
| `loanAmount` | number | 万円 | 借入金額 |
| `interestRate` | number | % | 金利 |
| `loanYears` | number | 年 | 借入期間 |
| `holdingYears` | number | 年 | 保有期間（シミュレーション年数） |

### オプションパラメータ

| パラメータ名 | 型 | 単位 | デフォルト | 説明 |
|-------------|-----|------|-----------|------|
| `vacancyRate` | number | % | 0 | 空室率 |
| `managementFee` | number | 円 | 0 | 月額管理費 |
| `fixedCost` | number | 円 | 0 | 月額固定費 |
| `propertyTax` | number | 円 | 0 | 年間固定資産税 |
| `otherCosts` | number | 万円 | 0 | 諸経費 |
| `renovationCost` | number | 万円 | 0 | 改装費 |
| `buildingPrice` | number | 万円 | 2000 | 建物価格（減価償却用） |
| `depreciationYears` | number | 年 | 27 | 減価償却年数 |
| `effectiveTaxRate` | number | % | 20 | 実効税率 |
| `rentDecline` | number | % | 0 | 年間家賃下落率 |
| `majorRepairCycle` | number | 年 | 0 | 大規模修繕周期（0=なし） |
| `majorRepairCost` | number | 万円 | 0 | 大規模修繕費用 |
| `expectedSalePrice` | number | 万円 | 0 | 想定売却価格 |
| `exitCapRate` | number | % | 5.0 | 出口キャップレート |
| `priceDeclineRate` | number | % | 0 | 年間価格下落率 |
| `loanType` | string | - | "元利均等" | ローンタイプ（"元利均等" / "元金均等"） |
| `ownershipType` | string | - | "個人" | 所有形態（"個人" / "法人"） |
| `propertyType` | string | - | "木造" | 建物構造（木造/軽量鉄骨造/重量鉄骨造/RC造/SRC造） |
| `yearBuilt` | number | 年 | 2000 | 築年 |
| `landArea` | number | ㎡ | 0 | 土地面積 |
| `buildingArea` | number | ㎡ | 0 | 建物面積 |
| `roadPrice` | number | 円/㎡ | 0 | 路線価 |
| `marketValue` | number | 万円 | 0 | 市場価格 |

### リクエスト例

```json
{
  "purchasePrice": 5000,
  "monthlyRent": 30,
  "loanAmount": 4500,
  "interestRate": 1.5,
  "loanYears": 35,
  "holdingYears": 10,
  "vacancyRate": 5,
  "managementFee": 10000,
  "fixedCost": 5000,
  "propertyTax": 50000,
  "buildingPrice": 2000,
  "depreciationYears": 22,
  "effectiveTaxRate": 20
}
```

---

## 出力（レスポンス）

### レスポンス構造

```json
{
  "results": { ... },           // サマリー指標
  "cash_flow_table": [ ... ],   // 年次キャッシュフロー表
  "basic_metrics": { ... },     // 基本指標（内部計算用）
  "valuation": { ... },         // 物件評価
  "sale_analysis": { ... },     // 売却分析
  "expected_sale_price": number // 想定売却価格
}
```

### `results`（サマリー指標）

| フィールド名 | 型 | 単位 | 説明 |
|-------------|-----|------|------|
| `年間家賃収入（円）` | int | 円 | 年間家賃収入（空室率反映後） |
| `表面利回り（%）` | float | % | 満室想定/物件価格 |
| `実質利回り（%）` | float | % | (NOI-税金)/物件価格 |
| `月間キャッシュフロー（円）` | int | 円 | 簡易計算値※ |
| `年間キャッシュフロー（円）` | int | 円 | 簡易計算値※ |
| `CCR（%）` | float | % | 初年度CF/自己資金 |
| `CCR（初年度）（%）` | float | % | 初年度CF/自己資金 |
| `CCR（全期間）（%）` | float | % | 平均CF/自己資金 |
| `ROI（%）` | float | % | 初年度CF/総投資額 |
| `ROI（初年度）（%）` | float | % | 初年度CF/総投資額 |
| `ROI（全期間）（%）` | float | % | 平均CF/総投資額 |
| `IRR（%）` | float/null | % | 内部収益率（近似） |
| `年間ローン返済額（円）` | int | 円 | 年間ローン返済額 |
| `NOI（円）` | int | 円 | 営業純利益 |
| `DSCR（返済余裕率）` | float | 倍 | NOI/年間ローン返済 |
| `LTV（%）` | float | % | 借入/物件価格 |
| `自己資金（万円）` | float | 万円 | 物件価格-借入+諸経費+改装費 |
| `収益還元評価額（万円）` | float | 万円 | NOI/キャップレート |
| `土地積算評価（万円）` | float | 万円 | 土地評価額 |
| `建物積算評価（万円）` | float | 万円 | 建物評価額 |
| `積算評価合計（万円）` | float | 万円 | 土地+建物評価 |
| `売却コスト（万円）` | float | 万円 | 仲介手数料+その他 |
| `残債（万円）` | float | 万円 | 売却時ローン残高 |
| `売却益（万円）` | float | 万円 | 売却価格-残債-コスト |

> ※ 簡易計算値：`月間家賃 - 管理費 - 固定費`（税金・空室率・ローン返済は未反映）

### `cash_flow_table`（年次キャッシュフロー表）

各年のデータを配列で返却（`holdingYears`分）：

| フィールド名 | 型 | 単位 | 説明 |
|-------------|-----|------|------|
| `年次` | string | - | "1年目", "2年目"... |
| `満室想定収入` | int | 円 | 満室時の年間収入 |
| `空室率（%）` | float | % | 空室率 |
| `実効収入` | int | 円 | 空室率反映後の収入 |
| `経費` | int | 円 | 年間経費（管理費+固定費+固定資産税） |
| `減価償却` | int | 円 | 年間減価償却費 |
| `税金` | int | 円 | 所得税（繰越欠損金考慮） |
| `修繕費（参考）` | int | 円 | 大規模修繕費（該当年のみ） |
| `ローン返済` | int | 円 | 年間ローン返済額 |
| `元金返済` | int | 円 | 元金返済部分 |
| `営業CF` | int | 円 | **年間キャッシュフロー（税引後）** |
| `累計CF` | int | 円 | 累計キャッシュフロー |
| `自己資金推移` | int | 円 | 自己資金残高推移 |
| `借入残高` | int | 万円 | ローン残高 |
| `自己資金回収率` | float | % | 累計CF/自己資金 |
| `DSCR` | float | 倍 | 返済余裕率 |
| `売却金額` | int | 円 | その年に売却した場合の価格 |
| `売却時手取り` | int | 円 | 売却手取り額 |
| `売却による純利益` | int | 円 | 売却純利益 |
| `売却時累計CF` | int | 円 | 累計CF+売却手取り |
| `繰越欠損金` | int | 円 | 繰越欠損金残高 |

---

## 計算ロジック

### 1. 基本指標計算（`calculate_basic_metrics`）

```
年間家賃収入 = 月間家賃 × 12 × (1 - 空室率/100)
NOI = 年間家賃収入 - (管理費×12 + 固定費×12 + 固定資産税)
表面利回り = (月間家賃 × 12) / 物件価格 × 100
実質利回り = (NOI - 税金) / 物件価格 × 100
自己資金 = 物件価格 - 借入金額 + 諸経費 + 改装費
```

### 2. キャッシュフロー計算（`calculate_cash_flow_table`）

```
実効収入 = 月間家賃 × 12 × (1 - 空室率/100) × (1 - 家賃下落率×(年数-1)/100)
経費 = 管理費×12 + 固定費×12 + 固定資産税
減価償却 = 建物価格 / 減価償却年数（+ 改装費の償却 + 資本的修繕の償却）
不動産所得 = 実効収入 - 経費 - 支払利息 - 減価償却
税金 = 不動産所得 × 実効税率（繰越欠損金があれば控除）
営業CF = 実効収入 - 経費 - ローン返済 - 修繕費 - 改装費(1年目) - 税金
```

### 3. 税金計算の詳細

- **繰越欠損金**: 個人3年、法人10年
- **FIFO方式**で古い欠損金から使用
- 不動産所得がマイナスの場合は欠損金として翌年以降に繰越

### 4. 売却分析（`calculate_sale_analysis`）

```
仲介手数料 = (売却価格×3% + 6万円) × 1.1（消費税込み）
売却コスト = 仲介手数料 + 売却価格×1%（その他費用）
売却益 = 売却価格 - ローン残高 - 売却コスト
譲渡税 =
  - 個人・5年以下: キャピタルゲイン × 40%
  - 個人・5年超: キャピタルゲイン × 20%
  - 法人: キャピタルゲイン × 実効税率
```

---

## エラーレスポンス

### エラー構造

```json
{
  "error": true,
  "code": "ERROR_CODE",
  "message": "エラーメッセージ",
  "detail": "詳細情報（開発環境のみ）"
}
```

### エラーコード

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| `VALIDATION_INVALID_FORMAT` | 400 | JSONフォーマット不正 |
| `VALIDATION_ERROR` | 400 | 入力値バリデーションエラー |
| `CALC_DIVISION_BY_ZERO` | 500 | ゼロ除算エラー |
| `CALC_OVERFLOW` | 500 | 数値オーバーフロー |
| `CALC_INVALID_PARAMETER` | 500 | 不正なパラメータ |
| `SYSTEM_GENERAL` | 500 | システムエラー |

---

## 注意事項

### 単位の混在について

- **万円単位**: `purchasePrice`, `monthlyRent`, `loanAmount`, `otherCosts`, `renovationCost`, `buildingPrice`
- **円単位**: `managementFee`, `fixedCost`, `propertyTax`
- **レスポンスの多くは円単位**

### `results`と`cash_flow_table`の値の違い

| 項目 | `results` | `cash_flow_table` |
|------|-----------|-------------------|
| 年間CF計算 | 簡易（税金・空室率未反映） | 詳細（全要素反映） |
| 用途 | サマリー表示用 | 詳細分析用 |

**正確な年間キャッシュフローが必要な場合は `cash_flow_table[0]['営業CF']` を参照してください。**

---

## ファイル構成

```
/api/
├── simulate.py                 # エンドポイント（収益シミュレーター用）
├── cf-simulate.py              # エンドポイント（CFシミュレーター専用）
└── shared/
    ├── calculations.py         # 計算ロジック（共有）
    ├── validations.py          # バリデーション
    └── error_codes.py          # エラーコード定義
```

### エンドポイントの違い

| 機能 | simulate.py | cf-simulate.py |
|------|-------------|----------------|
| 使用元 | 収益シミュレーター | CFシミュレーター |
| 計算ロジック | calculations.py（共有） | calculations.py（共有） |
| レスポンス | 全項目（results, valuation, sale_analysis等） | CF特化（results, cash_flow_table） |
| 年間CF値 | 簡易計算（results内） | 正確値（cash_flow_tableから取得） |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-30 | CFシミュレーター専用エンドポイント（/api/cf-simulate）を追加 |
| 2026-01-29 | 初版作成 |
