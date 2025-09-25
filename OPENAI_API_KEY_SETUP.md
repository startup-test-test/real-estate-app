# OpenAI APIキーの設定方法

## 🔐 設定場所の選択

### 1. **GitHub Codespacesシークレット（推奨）** ✅
GitHub Codespacesで開発する場合は、この方法が最も安全です。

#### 設定手順：
1. GitHubリポジトリのページを開く
2. **Settings** → **Secrets and variables** → **Codespaces**
3. **New repository secret** をクリック
4. 以下を入力：
   - Name: `OPENAI_API_KEY`
   - Value: `sk-xxxxxxxxxxxxxxxxxxxxx`（取得したAPIキー）
5. **Add secret** をクリック

#### メリット：
- ✅ GitHubが暗号化して保管
- ✅ コードに含まれない
- ✅ Codespacesで自動的に環境変数として利用可能
- ✅ チーム開発でも安全

---

### 2. **ローカル開発用 .env ファイル**
ローカルで開発する場合の設定方法

#### backend/property-api/.env を作成：
```bash
# backend/property-api/.env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

#### ⚠️ 重要：
- `.gitignore`に`.env`が含まれていることを確認
- 絶対にGitにコミットしない

---

### 3. **本番環境（Render.com）**
デプロイ時の設定方法

#### Render.comダッシュボード：
1. サービスを選択
2. **Environment** タブ
3. **Add Environment Variable**
4. Key: `OPENAI_API_KEY`
5. Value: APIキーを入力

---

## 🚀 現在の開発環境（GitHub Codespaces）での設定

### ステップ1: GitHub Secretsに追加

```
1. このリポジトリのGitHubページを開く
2. Settings → Secrets and variables → Codespaces
3. New repository secret
4. Name: OPENAI_API_KEY
5. Value: sk-xxxxxxxxxxxxxxxxxxxxx
6. Add secret
```

### ステップ2: Codespacesを再起動

```bash
# Codespacesを一度停止して再起動
# または、ターミナルで環境変数を確認
echo $OPENAI_API_KEY
```

### ステップ3: バックエンドで確認

```python
# backend/property-api/app.py で自動的に読み込まれます
import os
openai_api_key = os.getenv("OPENAI_API_KEY")
```

---

## 🔍 設定確認方法

### 環境変数が設定されているか確認：

```bash
# Codespacesのターミナルで実行
python -c "import os; print('✅ OK' if os.getenv('OPENAI_API_KEY') else '❌ Not found')"
```

### バックエンドAPIの動作確認：

```bash
# backend/property-apiディレクトリで
cd backend/property-api
python -c "
import os
key = os.getenv('OPENAI_API_KEY')
if key:
    print(f'✅ APIキー設定済み: {key[:7]}...{key[-4:]}')
else:
    print('❌ APIキーが見つかりません')
"
```

---

## 📝 その他の環境変数

現在のシステムで使用している環境変数：

| 変数名 | 用途 | 設定場所 |
|--------|------|----------|
| `OPENAI_API_KEY` | ChatGPT API | GitHub Secrets |
| `VITE_REAL_ESTATE_API_KEY` | 不動産API | GitHub Secrets |
| `VITE_SUPABASE_URL` | Supabase URL | .env.local |
| `VITE_SUPABASE_ANON_KEY` | Supabase Key | .env.local |

---

## ⚠️ セキュリティ注意事項

1. **APIキーを直接コードに書かない**
   ```python
   # ❌ 絶対にダメ
   openai_api_key = "sk-xxxxxxxxxxxxx"

   # ✅ 正しい方法
   openai_api_key = os.getenv("OPENAI_API_KEY")
   ```

2. **GitHubにコミットしない**
   - `.env`ファイルは`.gitignore`に記載
   - 誤ってコミットした場合は即座にAPIキーを再発行

3. **クライアント側で使用しない**
   - フロントエンドからは直接使用しない
   - 必ずバックエンドAPI経由で使用

4. **使用量の監視**
   - OpenAIダッシュボードで使用量を定期的に確認
   - 使用量制限を設定することを推奨

---

## 🎯 推奨設定

**GitHub Codespacesで開発している場合：**
→ **GitHub Secrets（Codespaces）に設定** してください

これが最も安全で、チーム開発にも対応できる方法です。