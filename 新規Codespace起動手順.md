# 新規Codespace起動後の手順

## 1️⃣ 環境変数の確認（最初に実行）
```bash
# APIキーが設定されているか確認
echo "APIキー確認: $(echo $CHATGPT_REAL_ESTATE_250922 | head -c 7)..."

# 設定されていない場合は以下を確認：
# GitHub → Settings → Secrets and variables → Codespaces
# CHATGPT_REAL_ESTATE_250922 が設定されているか
```

## 2️⃣ バックエンドサーバー起動
```bash
# ディレクトリ移動
cd /workspaces/real-estate-app/backend/property-api

# 必要なパッケージインストール（初回のみ）
pip install -r requirements.txt

# サーバー起動
python app.py

# http://localhost:8000 で起動確認
```

## 3️⃣ フロントエンドサーバー起動（新しいターミナルで）
```bash
# 新しいターミナルを開く: Ctrl+Shift+` (Mac: Cmd+Shift+`)

# ディレクトリ移動
cd /workspaces/real-estate-app/bolt_front

# パッケージインストール（初回のみ）
npm install

# 開発サーバー起動
npm run dev

# http://localhost:5173 で起動確認
```

## 4️⃣ AI機能のテスト
```bash
# 3つ目のターミナルを開く

# テストスクリプト実行
cd /workspaces/real-estate-app/backend/property-api
python test_ai_analysis.py

# 成功すると以下が表示される：
# ✅ APIキー設定済み
# ✅ 分析成功！
# 【サマリー】市場分析レポート...
```

## 5️⃣ ブラウザでアクセス

### Codespacesのポートフォワーディング機能
- フロントエンド: https://GITHUB_USERNAME-real-estate-app-5173.preview.app.github.dev/
- バックエンド: https://GITHUB_USERNAME-real-estate-app-8000.preview.app.github.dev/

### ローカルアクセス
- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:8000

## ⚠️ トラブルシューティング

### APIキーが認識されない場合
```bash
# 手動で設定（一時的）
export CHATGPT_REAL_ESTATE_250922="sk-xxxxxxxx..."

# または、app.pyを編集して別の環境変数名も追加
```

### ポートが使用中の場合
```bash
# プロセス確認
lsof -i :8000
lsof -i :5173

# プロセス終了
kill -9 [PID]
```

## 📝 実装済み機能

- ✅ AI市場分析サマリー（GPT-4o-mini）
- ✅ テンプレート型安全システム
- ✅ 法的コンプライアンス対策
- ✅ JSONモードで数値のみ生成
- ✅ 固定テンプレートで文章生成

## 🎯 次のステップ

1. フロントエンドにAI分析結果表示UI追加
2. 分析結果のキャッシング実装
3. エラーハンドリング強化

---

作成日: 2025/09/22
最終更新: 2025/09/22