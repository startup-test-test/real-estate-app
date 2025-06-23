# 大家DX - 不動産投資SaaS

AIを活用した次世代不動産投資分析プラットフォーム

## 🚀 セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
# .env.example をコピーして .env ファイルを作成
cp .env.example .env

# .env ファイルを編集して必要な値を設定
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

## 🔐 セキュリティについて

### 環境変数の管理

**⚠️ 重要な注意事項**

- `VITE_` で始まる環境変数は**全てブラウザに公開**されます
- **秘密キーは絶対に `VITE_` 変数に設定しないでください**
- 機密データは必ずバックエンドAPIで管理してください

### 安全な設定例

```bash
# ✅ 安全（公開用キー）
VITE_GOOGLE_MAPS_API_KEY=your-domain-restricted-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# ❌ 危険（秘密キー - 絶対に設定しない）
VITE_STRIPE_SECRET_KEY=sk_live_xxx  # これは危険！
VITE_DATABASE_PASSWORD=secret123    # これも危険！
```

### 推奨アーキテクチャ

```
フロントエンド → 自社API → 外部API
                ↑
            ここで秘密キーを管理
```

## 🛡️ セキュリティ対策

1. **ドメイン制限**: Google Maps API等でドメイン制限を設定
2. **リファラー制限**: 許可されたドメインからのみアクセス可能
3. **レート制限**: API呼び出し回数の制限
4. **HTTPS必須**: 本番環境では必ずHTTPS使用
5. **JWT認証**: セキュアなトークンベース認証

## 📁 ファイル構成

```
src/
├── components/     # 共通コンポーネント
├── pages/         # ページコンポーネント
├── config/        # 設定ファイル
├── utils/         # ユーティリティ関数
└── types/         # TypeScript型定義
```

## 🔧 開発時の注意

- 現在は `VITE_MOCK_API=true` でモックAPIを使用
- 本番環境では実際のバックエンドAPIに接続
- `.env` ファイルは絶対にGitにコミットしない

## 📞 サポート

- Email: support@ooya-dx.com
- 営業時間: 平日 9:00-18:00