# 不動産投資シミュレーターAPI 検証手順

## 概要
このドキュメントでは、`backend/simulator-api`の計算ロジックを修正した際の検証手順を説明します。
StreamlitとFastAPIの両方で同じ計算ロジック（`shared/calculations.py`）を使用しているため、どちらでも検証可能です。

## 📁 ファイル構成

```
backend/simulator-api/
├── app.py              # FastAPI本番用
├── streamlit_dev.py    # Streamlit開発版（UI付き）
├── shared/
│   └── calculations.py # 共通計算ロジック ⭐️
├── requirements.txt    # 必要なパッケージ
└── docs_md/
    └── API検証手順.md  # このファイル
```

## 🔧 環境セットアップ（初回のみ）

### 1. 必要なパッケージをインストール
```bash
cd /workspaces/real-estate-app/backend/simulator-api
pip install -r requirements.txt
```

## 📊 検証方法

### 方法1: FastAPIを使用した検証（推奨）

#### 1. FastAPIサーバーを起動
```bash
cd /workspaces/real-estate-app/backend/simulator-api
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

または、バックグラウンドで起動：
```bash
nohup uvicorn app:app --host 0.0.0.0 --port 8000 > api.log 2>&1 &
```

#### 2. APIの動作確認
```bash
# ヘルスチェック
curl http://localhost:8000/
# レスポンス: {"message":"大家DX API","version":"1.0.0","status":"running"}
```

#### 3. Swagger UIでテスト

GitHub Codespacesの場合：
1. ポート転送されたURLを確認（例：`https://xxxxx-8000.app.github.dev/`）
2. URLの末尾に `/docs` を追加してアクセス
3. Swagger UIが開く

#### 4. テストデータで検証

Swagger UIで「POST /api/simulate」を展開し、以下のテストデータを使用：

```json
{
    "property_name": "テスト物件",
    "purchase_price": 5000,
    "monthly_rent": 180000,
    "loan_amount": 4500,
    "interest_rate": 0.7,
    "loan_years": 35,
    "land_area": 100,
    "building_area": 120,
    "building_price": 2000,
    "road_price": 200000,
    "other_costs": 250,
    "renovation_cost": 150,
    "management_fee": 9000,
    "fixed_cost": 0,
    "property_tax": 80000,
    "vacancy_rate": 5,
    "rent_decline": 1,
    "holding_years": 10,
    "exit_cap_rate": 4,
    "effective_tax_rate": 20,
    "depreciation_years": 27,
    "market_value": 6000,
    "loan_type": "元利均等",
    "major_repair_cycle": 10,
    "major_repair_cost": 200
}
```

#### 5. コマンドラインでのテスト

```bash
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "property_name": "テスト物件",
    "purchase_price": 5000,
    "monthly_rent": 180000,
    "loan_amount": 4500,
    "interest_rate": 0.7,
    "loan_years": 35,
    "land_area": 100,
    "building_area": 120,
    "building_price": 2000,
    "road_price": 200000,
    "other_costs": 250,
    "renovation_cost": 150,
    "management_fee": 9000,
    "fixed_cost": 0,
    "property_tax": 80000,
    "vacancy_rate": 5,
    "rent_decline": 1,
    "holding_years": 10,
    "exit_cap_rate": 4,
    "effective_tax_rate": 20,
    "depreciation_years": 27,
    "market_value": 6000,
    "loan_type": "元利均等",
    "major_repair_cycle": 10,
    "major_repair_cost": 200
  }' | python -m json.tool
```

### 方法2: Streamlitを使用した検証（UI付き）

#### 1. Streamlitを起動
```bash
cd /workspaces/real-estate-app/backend/simulator-api
streamlit run streamlit_dev.py
```

#### 2. ブラウザでアクセス
- 通常は自動的にブラウザが開く
- 開かない場合は http://localhost:8501 にアクセス

#### 3. UIでテスト
1. 「基本シミュレーション」タブを選択
2. 各入力フィールドに値を入力
3. 「シミュレーション実行」ボタンをクリック
4. 結果とグラフを確認

## 🔍 確認すべき計算結果

### 主要な指標
- **表面利回り**: 年間家賃収入 ÷ 購入価格 × 100
- **CCR（自己資本収益率）**: 年間CF ÷ 自己資金 × 100
- **IRR（内部収益率）**: 投資全体の収益率
- **DSCR（返済余裕率）**: NOI ÷ 年間ローン返済額
- **LTV**: 借入額 ÷ 物件評価額 × 100

### 現在の既知の問題（2025年7月28日時点）
以下の項目はまだ計算ロジックが未実装：
- 元金返済額（各年）
- 借入残高（各年）
- 自己資金回収率（各年）
- 売却時手取り（各年）

## 📝 計算ロジックの修正方法

### 1. 共通計算ロジックを修正
```bash
# shared/calculations.py を編集
```

### 2. 自動的に反映される
- FastAPIとStreamlitの両方が同じ計算ロジックを使用
- 修正後、サーバーを再起動すると自動的に反映

### 3. テストで確認
- 上記の検証手順で動作確認

## 🚨 トラブルシューティング

### ポートが使用中の場合
```bash
# プロセスを確認
ps aux | grep uvicorn
ps aux | grep streamlit

# 必要に応じて終了
killall uvicorn
killall streamlit
```

### GitHub Codespacesでポートが開けない場合
1. VSCodeの「ポート」タブを確認
2. ポート8000を追加
3. 可視性を「Public」に設定

### 計算結果が更新されない場合
```bash
# FastAPIを再起動
# Ctrl+C で停止してから再度起動
uvicorn app:app --reload
```

## 📌 重要なポイント

1. **DRY原則**: `shared/calculations.py`で計算ロジックを一元管理
2. **即座に検証**: 修正後すぐにAPIで動作確認可能
3. **本番環境と同じ**: FastAPIは本番環境（Render）と同じコード

---
作成日: 2025年7月28日
更新日: 2025年7月28日