# 環境構築ガイド（テスト・本番）

**最終更新:** 2026-01-06

---

## 概要

本番環境とテスト環境の構築手順、およびブランチ戦略についてまとめます。

---

## ブランチ戦略

### 最終的な構成

```
┌─────────────────────────────────────────────────────────┐
│  ブランチ        環境          ドメイン                   │
├─────────────────────────────────────────────────────────┤
│  main         → 本番環境    → ooya.tech                  │
│  develop      → テスト環境  → プレビューURL（Basic認証）   │
│  feature/*    → 開発用     → 自動プレビューURL            │
└─────────────────────────────────────────────────────────┘
```

### 開発フロー

```
feature/xxx → develop → main
     ↓          ↓        ↓
   作業中     テスト確認  本番リリース
```

---

## 構築順序

### Phase 1: 移行完了（現在）

| ステップ | 内容 | 状態 |
|---------|------|------|
| 1-1 | Next.js プロジェクト作成 | ✅ 完了 |
| 1-2 | コード移植 | ✅ 完了 |
| 1-3 | SSR対応修正 | ✅ 完了 |
| 1-4 | Basic認証実装 | ✅ 完了 |
| 1-5 | Vercel接続（プレビュー） | ✅ 完了 |
| 1-6 | Python API移行 | ⏳ 作業中 |
| 1-7 | Neon Auth実装 | ⏳ 未着手 |
| 1-8 | Vercel Blob実装 | ⏳ 未着手 |

### Phase 2: 本番環境構築

| ステップ | 内容 | 状態 |
|---------|------|------|
| 2-1 | main ブランチで全機能動作確認 | ⏳ |
| 2-2 | 本番用環境変数をVercelに設定 | ⏳ |
| 2-3 | ooya.tech ドメインを新プロジェクトに接続 | ⏳ |
| 2-4 | 旧プロジェクトからドメイン削除 | ⏳ |
| 2-5 | 本番動作確認 | ⏳ |

### Phase 3: テスト環境構築

| ステップ | 内容 | 状態 |
|---------|------|------|
| 3-1 | develop ブランチを main から作成 | ⏳ |
| 3-2 | Vercel で develop ブランチのプレビュー設定 | ⏳ |
| 3-3 | （任意）develop 用サブドメイン設定 | ⏳ |
| 3-4 | Basic認証の維持確認 | ⏳ |

---

## Vercel 環境設定

### プロジェクト設定

```
Project Settings → Git
├── Production Branch: main
├── Automatically expose System Environment Variables: ON
└── Directory Settings: ooya-dx_2026
```

### 環境変数

| 変数 | Production | Preview | Development |
|------|------------|---------|-------------|
| `DATABASE_URL` | 本番Neon | 本番Neon | ローカル or 本番 |
| `NEXT_PUBLIC_NEON_AUTH_URL` | 本番 | 本番 | 本番 |
| `BASIC_AUTH_USER` | 不要 | 設定 | 不要 |
| `BASIC_AUTH_PASSWORD` | 不要 | 設定 | 不要 |

> **注意:** Basic認証は `ooya.tech` と `localhost` では自動スキップされます

### ドメイン設定

```
Domains
├── ooya.tech          → main ブランチ（本番）
├── www.ooya.tech      → ooya.tech にリダイレクト
└── (自動生成URL)       → プレビュー環境
```

---

## 本番ドメイン切り替え手順

### 1. 新プロジェクトにドメイン追加

```
Vercel Dashboard
→ 新プロジェクト (ooya-dx_2026)
→ Settings → Domains
→ Add → ooya.tech
```

### 2. DNS設定確認

Vercelが提供する設定:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

または A レコード:
```
Type: A
Name: @
Value: 76.76.21.21
```

### 3. 旧プロジェクトからドメイン削除

```
Vercel Dashboard
→ 旧プロジェクト (bolt_front)
→ Settings → Domains
→ ooya.tech を削除
```

### 4. SSL証明書確認

Vercelが自動発行（Let's Encrypt）

---

## テスト環境詳細

### アクセス方法

| 項目 | 値 |
|------|-----|
| URL | `https://[project]-[branch]-[team].vercel.app` |
| Basic認証 | `preview` / `preview` |

### テスト環境の特徴

- `develop` ブランチへのプッシュで自動デプロイ
- Basic認証で保護（外部アクセス防止）
- 本番と同じ環境変数（DB含む）
- PRごとにプレビューURLが生成される

### （オプション）専用サブドメイン

develop ブランチに専用URLを割り当てる場合:

```
Vercel Dashboard → Domains → Add
→ test.ooya.tech
→ Git Branch: develop
```

---

## 環境別 URL 一覧

| 環境 | URL | 認証 |
|------|-----|------|
| 本番 | https://ooya.tech | なし |
| テスト | https://[自動生成].vercel.app | Basic認証 |
| ローカル | http://localhost:3000 | なし |

---

## ロールバック手順

### 本番で問題が発生した場合

**方法1: Vercel Rollback**
```
Vercel Dashboard → Deployments
→ 正常なデプロイを選択
→ "..." → Promote to Production
```

**方法2: ドメイン切り戻し**
```
新プロジェクトから ooya.tech を削除
旧プロジェクトに ooya.tech を再追加
```

**方法3: Git Revert**
```bash
git revert HEAD
git push origin main
```

---

## チェックリスト

### 本番公開前

- [ ] 全ページの動作確認
- [ ] シミュレーター動作確認
- [ ] ログイン/サインアップ動作確認
- [ ] 画像アップロード動作確認
- [ ] エラーハンドリング確認
- [ ] モバイル表示確認
- [ ] SEO設定確認（OGP等）

### 本番公開後

- [ ] ooya.tech でアクセス確認
- [ ] SSL証明書確認（https）
- [ ] 主要機能の動作確認
- [ ] エラー監視設定（Vercel Analytics等）
- [ ] 旧環境の停止/削除

---

## 参考リンク

- [Vercel Git Configuration](https://vercel.com/docs/projects/overview#git)
- [Vercel Domains](https://vercel.com/docs/projects/domains)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Deployments](https://vercel.com/docs/deployments/overview)

---

## 次のアクション

1. **Python API移行を完了** → main ブランチ
2. **Neon Auth を実装** → main ブランチ
3. **全機能テスト** → プレビューURL
4. **本番ドメイン接続** → ooya.tech
5. **develop ブランチ作成** → テスト環境確立
