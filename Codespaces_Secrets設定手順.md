# Codespaces Secrets 設定手順

## 追加すべきSecret

### 1. VITE_DEV_RENDER_SIMULATOR_API（新規追加）
- **値**: `https://real-estate-app-1-iii4.onrender.com`
- **用途**: 開発環境のシミュレーター用Render API
- **理由**: ハードコーディングを削除したため必須
- **命名**: VITE_[環境]_[サービス]_[用途]_API

## 設定手順

### Step 1: GitHub設定画面へ
1. リポジトリページを開く
2. **Settings**タブをクリック
3. 左メニューから **Secrets and variables** → **Codespaces**

### Step 2: Secretを追加
1. **New repository secret**ボタンをクリック
2. 以下を入力：
   - **Name**: `VITE_DEV_RENDER_SIMULATOR_API`
   - **Value**: `https://real-estate-app-1-iii4.onrender.com`
3. **Add secret**をクリック

### Step 3: Codespacesを再起動
```bash
# 現在のCodespacesを再起動して環境変数を反映
# GitHub Codespacesページから「Restart」を選択
```

### Step 4: 動作確認
```bash
# 環境変数が設定されているか確認
echo $VITE_API_URL

# 開発サーバーを起動
cd bolt_front
npm run dev

# シミュレーター機能をテスト
```

## 現在のSecrets構成（更新後）

| Secret名 | 値 | 状態 |
|---------|---|------|
| VITE_SUPABASE_URL | https://gtnzhnsbdmkadfawuzmc.supabase.co | ✅既存 |
| VITE_SUPABASE_ANON_KEY | eyJhbGc... | ✅既存 |
| VITE_API_URL | https://real-estate-app-1-iii4.onrender.com | 🆕新規追加 |

## 将来の拡張（本番環境用）

本番環境用のRender APIができたら：
```
VITE_API_URL_PROD = https://real-estate-app-prod.onrender.com
```

## 注意事項

### Viteの制約
- 必ず`VITE_`プレフィックスが必要
- `DEV_VITE_`のような形式は使えない（Viteが認識しない）

### セキュリティ
- API URLは公開されても問題ない
- SECRET_KEYなどの秘密情報は絶対に入れない

## トラブルシューティング

### 環境変数が反映されない場合
1. Codespacesを完全に停止
2. 再度起動
3. `echo $VITE_API_URL`で確認

### API接続エラーが出る場合
1. Render APIが起動しているか確認
2. URLが正しいか確認
3. CORSエラーの場合はバックエンド側で対応必要