# Python API 仕様書

**最終更新:** 2026-01-06

---

## 概要

大家DX のバックエンドAPI仕様書です。Vercel Python Functions として実装されています。

---

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/health` | ヘルスチェック |
| POST | `/api/simulate` | 収益シミュレーション |
| POST | `/api/market-analysis` | 市場分析 |

---

## 共通仕様

### リクエストヘッダー

```
Content-Type: application/json
```

### レスポンスヘッダー

```
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: *
```

### CORS

全エンドポイントでCORSが有効です。OPTIONSリクエストに対応しています。

---

## エンドポイント詳細

### 1. ヘルスチェック

**エンドポイント:** `GET /api/health`

**説明:** APIの稼働状況を確認

**リクエスト:** なし

**レスポンス:**

```json
{
  "message": "大家DX API",
  "version": "2.0.0",
  "status": "running",
  "platform": "vercel"
}
```

---

### 2. 収益シミュレーション

**エンドポイント:** `POST /api/simulate`

**説明:** 不動産投資の収益シミュレーションを実行

#### リクエストボディ

| フィールド | 型 | 必須 | 説明 | 範囲 |
|-----------|-----|------|------|------|
| `propertyName` | string | ✅ | 物件名 | 最大100文字 |
| `location` | string | ✅ | 所在地 | 最大200文字 |
| `purchasePrice` | number | ✅ | 購入価格（万円） | 1〜100,000 |
| `monthlyRent` | number | ✅ | 月間賃料収入（万円） | 0〜10,000 |
| `loanAmount` | number | ✅ | 借入金額（万円） | 0〜100,000 |
| `loanYears` | number | ✅ | 借入期間（年） | 1〜50 |
| `interestRate` | number | ✅ | 借入金利（%） | 0〜20 |
| `holdingYears` | number | ✅ | 保有期間（年） | 1〜50 |
| `buildingArea` | number | ✅ | 建物面積（㎡） | 1〜100,000 |
| `managementFee` | number | - | 管理費（円/月） | 0〜10,000,000 |
| `fixedCost` | number | - | 修繕積立金（円/月） | 0〜10,000,000 |
| `propertyTax` | number | - | 固定資産税（円/年） | 0〜50,000,000 |
| `otherCosts` | number | - | 諸経費（万円） | 0〜50,000 |
| `renovationCost` | number | - | 改装費（万円） | 0〜50,000 |
| `vacancyRate` | number | - | 空室率（%） | 0〜100 |
| `effectiveTaxRate` | number | - | 実効税率（%） | 0〜100 |
| `landArea` | number | - | 土地面積（㎡） | 0〜100,000 |
| `roadPrice` | number | - | 路線価（円/㎡） | 0〜100,000,000 |
| `yearBuilt` | number | - | 築年 | 1900〜現在+10 |
| `expectedSalePrice` | number | - | 想定売却価格（万円） | 0〜100,000 |
| `marketValue` | number | - | 市場価格（万円） | 0〜100,000 |
| `exitCapRate` | number | - | 出口還元利回り（%） | 0〜100 |
| `priceDeclineRate` | number | - | 価格下落率（%/年） | 0〜100 |
| `rentDecline` | number | - | 賃料下落率（%/年） | 0〜100 |
| `majorRepairCycle` | number | - | 大規模修繕周期（年） | 0〜50 |
| `majorRepairCost` | number | - | 大規模修繕費用（万円） | 0〜50,000 |
| `buildingPrice` | number | - | 建物価格（万円） | 0〜100,000 |
| `depreciationYears` | number | - | 減価償却年数 | 1〜50 |
| `loanType` | string | - | 借入形式 | "元利均等" / "元金均等" |
| `propertyType` | string | - | 建物構造 | "木造" / "軽量鉄骨造" / "重量鉄骨造" / "RC造" / "SRC造" |
| `ownershipType` | string | - | 所有形態 | "個人" / "法人" |
| `propertyUrl` | string | - | 物件URL | 最大500文字 |
| `propertyMemo` | string | - | 物件メモ | 最大1000文字 |

#### リクエスト例

```json
{
  "propertyName": "サンプル物件",
  "location": "東京都港区",
  "purchasePrice": 5000,
  "monthlyRent": 30,
  "loanAmount": 4500,
  "loanYears": 30,
  "interestRate": 1.5,
  "holdingYears": 10,
  "buildingArea": 100,
  "managementFee": 10000,
  "fixedCost": 5000,
  "propertyTax": 100000,
  "vacancyRate": 5,
  "buildingPrice": 2000,
  "depreciationYears": 27
}
```

#### レスポンス（成功時）

```json
{
  "results": {
    "年間家賃収入（円）": 3420000,
    "表面利回り（%）": 7.2,
    "実質利回り（%）": 5.8,
    "月間キャッシュフロー（円）": 285000,
    "年間キャッシュフロー（円）": 3420000,
    "CCR（%）": 12.5,
    "CCR（初年度）（%）": 12.5,
    "CCR（全期間）（%）": 10.2,
    "ROI（%）": 8.5,
    "ROI（初年度）（%）": 8.5,
    "ROI（全期間）（%）": 7.8,
    "IRR（%）": 15.2,
    "年間ローン返済額（円）": 1860000,
    "NOI（円）": 3000000,
    "収益還元評価額（万円）": 6000,
    "実勢価格（万円）": 5500,
    "想定売却価格（万円）": 5500,
    "土地積算評価（万円）": 3000,
    "建物積算評価（万円）": 1500,
    "積算評価合計（万円）": 4500,
    "売却コスト（万円）": 200,
    "残債（万円）": 3000,
    "売却益（万円）": 2300,
    "LTV（%）": 90,
    "DSCR（返済余裕率）": 1.61,
    "自己資金（万円）": 500
  },
  "cash_flow_table": [
    {
      "年次": "1年目",
      "満室想定収入": 3600000,
      "空室率（%）": 5,
      "実効収入": 3420000,
      "経費": 280000,
      "減価償却": 740740,
      "税金": 150000,
      "修繕費（参考）": 0,
      "ローン返済": 1860000,
      "元金返済": 1200000,
      "営業CF": 1130000,
      "累計CF": 1130000,
      "自己資金推移": -3870000,
      "借入残高": 4350,
      "自己資金回収率": 22.6,
      "DSCR": 1.61,
      "売却金額": 55000000,
      "売却時手取り": 10000000,
      "売却による純利益": 10000000,
      "売却時累計CF": 11130000,
      "schema_version": "v2.0.0"
    }
  ],
  "basic_metrics": {
    "annual_rent": 342,
    "annual_cf": 3420000,
    "monthly_cf": 285000,
    "self_funding": 500,
    "annual_loan": 1860000,
    "noi": 3000000,
    "gross_yield": 7.2,
    "net_yield": 5.8,
    "ccr": 12.5,
    "roi": 8.5,
    "dscr": 1.61
  },
  "valuation": {
    "cap_rate_eval": 6000,
    "land_eval": 3000,
    "building_eval": 1500,
    "assessed_total": 4500,
    "market_value": 5500
  },
  "sale_analysis": {
    "remaining_loan": 3000,
    "sale_cost": 200,
    "sale_profit": 2300
  },
  "expected_sale_price": 5500
}
```

#### レスポンス（バリデーションエラー時）

```json
{
  "error": "入力値にエラーがあります",
  "error_code": "E4001",
  "details": [
    "購入価格は必須項目です",
    "借入金利（%）は0以上で入力してください"
  ],
  "error_details": [
    {
      "field": "purchase_price",
      "message": "購入価格は必須項目です",
      "error_code": "E4001"
    }
  ],
  "status_code": 400
}
```

---

### 3. 市場分析

**エンドポイント:** `POST /api/market-analysis`

**説明:** 類似物件の市場分析を実行

#### リクエストボディ

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `location` | string | ✅ | 所在地 |
| `land_area` | number | ✅ | 土地面積（㎡） |
| `year_built` | number | ✅ | 築年 |
| `purchase_price` | number | ✅ | 購入価格（万円） |

#### リクエスト例

```json
{
  "location": "東京都港区",
  "land_area": 100,
  "year_built": 2010,
  "purchase_price": 5000
}
```

#### レスポンス（成功時）

```json
{
  "similar_properties": [
    {
      "取引時期": "2024年Q2",
      "所在地": "東京都港区***",
      "面積(㎡)": 95.5,
      "築年": 2012,
      "構造": "RC",
      "取引価格(万円)": 4800,
      "平米単価(万円/㎡)": 50.26,
      "最寄駅": "品川",
      "駅距離": "8分"
    }
  ],
  "statistics": {
    "median_price": 48.5,
    "mean_price": 49.2,
    "std_price": 5.8,
    "user_price": 50.0,
    "deviation": 3.1,
    "evaluation": "適正価格"
  }
}
```

---

## エラーコード一覧

### バリデーションエラー (4000番台)

| コード | 説明 | 対処法 |
|--------|------|--------|
| E4001 | 必須項目が入力されていません | 赤色で表示されている必須項目を入力 |
| E4002 | 入力値が有効範囲外です | 入力値を有効な範囲内に修正 |
| E4003 | 入力形式が正しくありません | 正しい形式で入力 |
| E4004 | HTMLタグが検出されました | HTMLタグを除去して再入力 |
| E4005 | URLの形式が正しくありません | https://で始まる正しいURL形式で入力 |
| E4006 | 画像サイズが大きすぎます | 10MB以下の画像を使用 |
| E4007 | 文字数が制限を超えています | 文字数を減らして再入力 |

### 計算エラー (5000番台)

| コード | 説明 | 対処法 |
|--------|------|--------|
| E5001 | ゼロ除算エラー | 入力値を確認し、0以外の値を入力 |
| E5002 | 計算パラメータが不正 | 入力値を確認し、正しい値を入力 |
| E5003 | 計算結果がオーバーフロー | より小さな値を入力 |
| E5004 | 負の値が許可されていない | 0以上の値を入力 |
| E5005 | ローン計算エラー | ローン条件を確認 |
| E5006 | IRR計算が収束しない | 投資条件を見直し |
| E5007 | 税金計算エラー | 税率設定を確認 |
| E5008 | 減価償却計算エラー | 建物価格と耐用年数を確認 |

### システムエラー (5500番台)

| コード | 説明 | 対処法 |
|--------|------|--------|
| E5500 | システムエラー | しばらく待ってから再試行 |
| E5501 | データベースエラー | 管理者に問い合わせ |
| E5502 | タイムアウト | 入力データを簡略化して再試行 |
| E5503 | メモリ不足 | 管理者に問い合わせ |
| E5504 | 依存サービスエラー | しばらく待ってから再試行 |

---

## 計算ロジック詳細

### 表面利回り

```
表面利回り（%） = (月間賃料 × 12) / 購入価格 × 100
```

### 実質利回り

```
NOI = 年間実効収入 - 経費 - 税金
実質利回り（%） = NOI / (購入価格 × 10000) × 100
```

### CCR（Cash on Cash Return）

```
CCR（%） = 年間キャッシュフロー / 自己資金 × 100
自己資金 = 購入価格 - 借入金額 + 諸経費 + 改装費
```

### DSCR（Debt Service Coverage Ratio）

```
DSCR = NOI / 年間ローン返済額
```

### IRR（Internal Rate of Return）

```
IRR = 年平均リターン率（近似計算）
```

### ローン残高計算（元利均等）

```
残高 = 元本 × (((1+r)^n - (1+r)^m) / ((1+r)^n - 1))
r = 年利率 / 12
n = 総返済回数
m = 経過返済回数
```

### 仲介手数料（宅建業法準拠）

```
200万円以下: 5%
200万円超〜400万円以下: 4% + 2万円
400万円超: 3% + 6万円
※消費税10%加算
```

### 減価償却（定額法）

```
年間減価償却費 = 建物価格 / 法定耐用年数
```

**法定耐用年数:**
| 構造 | 耐用年数 |
|------|---------|
| 木造 | 22年 |
| 軽量鉄骨造 | 27年 |
| 重量鉄骨造 | 34年 |
| RC造 | 47年 |
| SRC造 | 47年 |

### 譲渡所得税

**個人:**
- 短期譲渡（5年以内）: 40%
- 長期譲渡（6年以降）: 20%

**法人:**
- 実効税率を適用

---

## ファイル構成

```
api/
├── health.py             # ヘルスチェック
├── simulate.py           # シミュレーションAPI
├── market-analysis.py    # 市場分析API
├── requirements.txt      # Python依存関係
└── shared/
    ├── __init__.py
    ├── calculations.py   # 計算ロジック（900行以上）
    ├── validations.py    # 入力バリデーション
    └── error_codes.py    # エラーコード定義
```

---

## 環境設定

### vercel.json

```json
{
  "functions": {
    "api/*.py": {
      "runtime": "python3.9",
      "maxDuration": 30
    }
  }
}
```

### 制限事項（Vercel Pro）

| 項目 | 制限 |
|------|------|
| 実行時間 | 60秒 |
| メモリ | 3008MB |
| ペイロード | 4.5MB |

---

## フロントエンド連携

### API設定ファイル

`lib/config/api.ts` でAPI URLを管理。

```typescript
// Vercel環境では同一ドメインのAPIを使用
// ローカルではRender APIをフォールバック
const API_URLS = {
  [Environment.PRODUCTION]: '',  // 同一ドメイン
  [Environment.LOCAL]: 'https://real-estate-app-rwf1.onrender.com'
};
```

### エンドポイント呼び出し例

```typescript
const response = await fetch('/api/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(propertyData)
});
const result = await response.json();
```

---

## 参考リンク

- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
