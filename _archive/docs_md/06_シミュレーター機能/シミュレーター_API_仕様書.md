# 大家DX シミュレーターAPI 仕様書

## 概要

不動産投資シミュレーション機能を提供するFastAPI製のRESTful API

- **API名**: 大家DX シミュレーターAPI
- **バージョン**: 1.0.0
- **デプロイURL**: https://real-estate-app-1-iii4.onrender.com
- **開発環境**: Python 3.11+, FastAPI

## プロジェクト構成

```
real-estate-app/
├── backend/
│   ├── shared/
│   │   └── config/
│   │       └── settings.py          # 共通設定
│   ├── simulator-api/
│   │   ├── app.py                   # メインアプリケーション
│   │   └── requirements.txt         # 依存関係
│   └── property-api/
│       ├── streamlit_app.py         # 不動産データ検索ツール
│       └── real_estate_client.py    # 不動産APIクライアント
├── bolt_front/                      # メインフロントエンドアプリ
│   ├── src/
│   │   ├── components/              # Reactコンポーネント
│   │   ├── pages/                   # ページコンポーネント
│   │   ├── hooks/                   # カスタムフック
│   │   ├── types/                   # TypeScript型定義
│   │   └── lib/                     # ユーティリティ
│   ├── package.json
│   └── vite.config.ts              # ビルド設定
├── docs/
│   ├── simulator-api-spec.md        # 本仕様書
│   ├── real-estate-api-spec.md      # 不動産API仕様
│   └── リファクタリング課題管理シート.md
└── README.md
```

## API エンドポイント

### 1. ヘルスチェック

```
GET /
```

**レスポンス例:**
```json
{
  "message": "大家DX API",
  "version": "1.0.0",
  "status": "running"
}
```

### 2. 投資シミュレーション

```
POST /api/simulate
```

**リクエストボディ:**
```json
{
  "property_name": "東京都品川区投資物件",
  "location": "東京都品川区東品川4-5-8",
  "year_built": 1987,
  "property_type": "区分マンション",
  "land_area": 135.0,
  "building_area": 150.0,
  "road_price": 250000,
  "purchase_price": 6980.0,
  "building_price": 1000.0,
  "other_costs": 300.0,
  "renovation_cost": 200.0,
  "monthly_rent": 250000,
  "management_fee": 5000,
  "fixed_cost": 0,
  "property_tax": 100000,
  "vacancy_rate": 5.0,
  "rent_decline": 1.0,
  "loan_type": "元利均等",
  "loan_amount": 6500.0,
  "interest_rate": 0.7,
  "loan_years": 35,
  "holding_years": 10,
  "exit_cap_rate": 6.0,
  "market_value": 8000.0
}
```

**レスポンス例:**
```json
{
  "results": {
    "年間家賃収入（円）": 2850000,
    "表面利回り（%）": 4.08,
    "月間キャッシュフロー（円）": 245000,
    "年間キャッシュフロー（円）": 2940000,
    "CCR（%）": 8.52,
    "ROI（%）": 17.33,
    "IRR（%）": 12.45,
    "年間ローン返済額（円）": 2045678,
    "NOI（円）": 2690000,
    "収益還元評価額（万円）": 4483.33,
    "実勢価格（万円）": 8000,
    "土地積算評価（万円）": 337.5,
    "建物積算評価（万円）": 300,
    "積算評価合計（万円）": 637.5,
    "売却コスト（万円）": 400,
    "残債（万円）": 4521.2,
    "売却益（万円）": 3078.8,
    "LTV（%）": 1019.61,
    "DSCR（返済余裕率）": 1.31,
    "自己資金（万円）": 980
  },
  "cash_flow_table": [
    {
      "年次": "1年目",
      "満室想定収入": 3000000,
      "空室率（%）": 5.0,
      "実効収入": 2850000,
      "経費": 160000,
      "大規模修繕": 0,
      "ローン返済": 2045678,
      "営業CF": 644322,
      "累計CF": 644322
    }
  ]
}
```

## データ型定義

### リクエストパラメータ

| パラメータ名 | 型 | 必須 | 説明 |
|-------------|---|-----|------|
| property_name | string | ○ | 物件名 |
| location | string | ○ | 所在地 |
| year_built | integer | ○ | 建築年 |
| property_type | string | ○ | 物件種別 |
| land_area | float | ○ | 土地面積(㎡) |
| building_area | float | ○ | 建物面積(㎡) |
| road_price | integer | ○ | 路線価(円/㎡) |
| purchase_price | float | ○ | 購入価格(万円) |
| building_price | float | ○ | 建物価格(万円) |
| other_costs | float | ○ | 諸経費(万円) |
| renovation_cost | float | ○ | 改装費(万円) |
| monthly_rent | integer | ○ | 月額賃料(円) |
| management_fee | integer | ○ | 管理費(月額円) |
| fixed_cost | integer | ○ | その他固定費(月額円) |
| property_tax | integer | ○ | 固定資産税(円/年) |
| vacancy_rate | float | ○ | 空室率(%) |
| rent_decline | float | ○ | 家賃下落率(%/年) |
| loan_type | string | ○ | 借入形式("元利均等" or "元金均等") |
| loan_amount | float | ○ | 借入額(万円) |
| interest_rate | float | ○ | 金利(%) |
| loan_years | integer | ○ | 返済年数 |
| holding_years | integer | ○ | 保有年数(年) |
| exit_cap_rate | float | ○ | 売却CapRate(%) |
| market_value | float | ○ | 想定売却価格(万円) |

## 計算ロジック

### 1. キャッシュフロー計算
- **実効家賃収入** = 月額賃料 × 12 × (1 - 空室率/100)
- **年間経費** = (管理費 + 固定費) × 12 + 固定資産税
- **年間キャッシュフロー** = 実効家賃収入 - 年間経費

### 2. ローン計算
- **元利均等**: 月額返済額 = 借入額 × {r × (1+r)^n} / {(1+r)^n - 1}
- **元金均等**: 月額元金 = 借入額 / 返済月数

### 3. 投資指標
- **表面利回り** = 年間家賃収入 / 購入価格 × 100
- **CCR (Cash on Cash Return)** = (年間CF - 年間返済額) / 自己資金 × 100
- **IRR (Internal Rate of Return)** = 自己資金回収率（近似計算）
- **DSCR (Debt Service Coverage Ratio)** = NOI / 年間返済額

### 4. 評価額計算
- **収益還元法** = NOI / 還元利回り
- **積算評価法** = 土地評価額 + 建物評価額
- **土地評価額** = 土地面積 × 路線価
- **建物評価額** = 建物面積 × 20万円/㎡

## 技術仕様

### 依存関係 (requirements.txt)
```
fastapi==0.104.1
uvicorn==0.24.0
requests==2.31.0
python-dotenv==1.0.0
jinja2==3.1.2
```

### 環境変数
```bash
REAL_ESTATE_API_KEY=your_api_key_here
OPENAI_API_KEY=your_openai_key_here
```

### CORS設定
```python
allow_origins=["*"]  # 現在は全ドメイン許可
allow_methods=["*"]
allow_headers=["*"]
```

## デプロイ情報

### Render設定
- **サービス名**: real-estate-app-1
- **Root Directory**: backend/simulator-api
- **Build Command**: pip install -r requirements.txt
- **Start Command**: uvicorn app:app --host 0.0.0.0 --port $PORT
- **Python Version**: 3.11

### 制限事項
- Python 3.13互換性のため、pandas/numpy系ライブラリは不使用
- IRR計算は簡易近似式を使用
- 市場分析はサンプルデータ（実際のAPI実装予定）

## セキュリティ

### 実装可能な認証方式
1. **APIキー認証** - ヘッダーにAPIキーを要求
2. **CORS制限** - 特定ドメインからのみアクセス許可
3. **レート制限** - 1分間のリクエスト数制限

### 現在の状態
- 認証なし（開発・テスト段階）
- 全ドメインからアクセス可能
- レート制限なし

## エラーハンドリング

### HTTPステータスコード
- **200**: 正常処理
- **400**: リクエストパラメータエラー
- **401**: 認証エラー（実装時）
- **500**: サーバー内部エラー

### エラーレスポンス例
```json
{
  "detail": "エラーメッセージ"
}
```

## 開発・テスト

### ローカル起動
```bash
cd backend/simulator-api
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### API テスト
```bash
curl -X POST "http://localhost:8000/api/simulate" \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

## 今後の拡張予定

1. **認証システム** - Firebase Auth連携
2. **データベース** - PostgreSQL導入
3. **詳細分析機能** - より高度な投資指標計算
4. **レポート機能** - 投資分析レポート生成
5. **レポート出力** - PDF生成機能

## 更新履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1.0.0 | 2024-06-19 | 初回リリース |

---

**開発者**: Claude Code
**最終更新**: 2024-06-19