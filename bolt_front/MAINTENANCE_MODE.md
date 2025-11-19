# メンテナンスモードの使い方

本番環境でメンテナンス画面を表示する方法を説明します。

## メンテナンスモードを有効にする手順

### 1. 設定ファイルを編集

`src/config/maintenance.ts` ファイルを開き、`isMaintenanceMode` を `true` に変更します。

```typescript
export const maintenanceConfig = {
  // メンテナンスモードのON/OFF
  isMaintenanceMode: true,  // ← false から true に変更

  // メンテナンス情報（必要に応じて編集）
  maintenanceInfo: {
    startDate: '2025年10月29日 00:00',
    endDate: '未定（完了次第お知らせいたします）',
    message: 'システムメンテナンスを実施しております。',
  },
};
```

### 2. メンテナンス画面の内容を編集（オプション）

メンテナンス画面の内容を変更したい場合は、`src/pages/Maintenance.tsx` を編集してください。

主に編集する箇所：
- メンテナンス開始日時（Line 34）
- メンテナンス内容の説明（Line 40-58）
- お問い合わせ情報（Line 61-78）

### 3. 変更をコミット＆プッシュ

```bash
# 変更をステージング
git add src/config/maintenance.ts
# 必要に応じてMaintenance.tsxも追加
git add src/pages/Maintenance.tsx

# コミット
git commit -m "feat: メンテナンスモードを有効化"

# プッシュ
git push origin main
```

## メンテナンスモードを無効にする手順

### 1. 設定ファイルを編集

`src/config/maintenance.ts` ファイルを開き、`isMaintenanceMode` を `false` に変更します。

```typescript
export const maintenanceConfig = {
  isMaintenanceMode: false,  // ← true から false に変更
  // ...
};
```

### 2. 変更をコミット＆プッシュ

```bash
git add src/config/maintenance.ts
git commit -m "feat: メンテナンスモードを解除"
git push origin main
```

## 仕組み

1. `src/config/maintenance.ts` がメンテナンスモードの設定を管理
2. `src/App.tsx` が起動時に `isMaintenanceMode()` をチェック
3. メンテナンスモードが `true` の場合、すべてのページで `src/pages/Maintenance.tsx` を表示
4. メンテナンスモードが `false` の場合、通常のサービスを表示

## 注意事項

- **本番環境でのみメンテナンスモードを有効にしてください**
- メンテナンスモード中は、すべてのページ（ログインページ含む）がメンテナンス画面にリダイレクトされます
- メンテナンス解除後は、必ず動作確認を行ってください

## 確認方法

### ローカル環境で確認

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで確認
# http://localhost:5173/
```

すべてのページでメンテナンス画面が表示されれば成功です。

### 本番環境で確認

プッシュ後、本番環境のURLにアクセスして、メンテナンス画面が表示されることを確認してください。

## トラブルシューティング

### メンテナンス画面が表示されない

1. `src/config/maintenance.ts` の `isMaintenanceMode` が `true` になっているか確認
2. 変更がコミット＆プッシュされているか確認
3. ブラウザのキャッシュをクリアしてリロード

### メンテナンス解除後も画面が表示される

1. `src/config/maintenance.ts` の `isMaintenanceMode` が `false` になっているか確認
2. 変更がコミット＆プッシュされているか確認
3. ブラウザのキャッシュをクリアしてリロード
