こ# マイページURL構造変更

## 概要

マイページのURL構造を整理し、ダッシュボードを新設する。

## URL変更一覧

| 機能 | 現状URL | 改善後URL | 備考 |
|------|---------|-----------|------|
| **ダッシュボード** | なし | `/mypage` | 新規作成 |
| **収益シミュレーション** ||||
| 一覧 | `/mypage` | `/mypage/revenue-simulator` | 移動 |
| 詳細 | `/mypage/simulator?view=xxx` | `/mypage/revenue-simulator?view=xxx` | 移動 |
| 新規作成 | なし | なし | - |
| **CFシミュレーション** ||||
| 一覧 | `/mypage/cf-simulator` | `/mypage/cf-simulator` | 変更なし |
| 新規作成 | `/mypage/cf-simulator/new` | `/mypage/cf-simulator/new` | 変更なし |
| 詳細 | `/mypage/cf-simulator/[id]` | `/mypage/cf-simulator/[id]` | 変更なし |
| **その他** ||||
| 課金・プラン | `/mypage/billing` | `/mypage/billing` | 変更なし |
| ガイド・FAQ | `/mypage/guide` | `/mypage/guide` | 変更なし |
| 購入オファー | `/mypage/purchase-offer` | `/mypage/purchase-offer` | 変更なし |

---

## 影響範囲調査

### 1. ページファイル（移動・作成が必要）

| ファイル | 作業内容 |
|---------|----------|
| `app/mypage/page.tsx` | 新しいダッシュボードページに書き換え |
| `app/mypage/MyPageClient.tsx` | → `app/mypage/revenue-simulator/` に移動 |
| `app/mypage/simulator/` | → `app/mypage/revenue-simulator/` に統合 |

### 2. 内部リンク修正（収益シミュレーション関連）

#### `app/mypage/MyPageClient.tsx`（移動後も修正必要）

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 86 | `/mypage/simulator?view=sample-property-001` | `/mypage/revenue-simulator?view=sample-property-001` |
| 355 | `/mypage/simulator?edit=${result.id}` | `/mypage/revenue-simulator?edit=${result.id}` |
| 740 | `path: "/mypage/simulator"` | `path: "/mypage/revenue-simulator"` |
| 883 | `router.push("/mypage/simulator")` | `router.push("/mypage/revenue-simulator")` |
| 933 | `router.push("/mypage/simulator")` | `router.push("/mypage/revenue-simulator")` |
| 1011-1012 | `/mypage/simulator?view=${sim.id}` | `/mypage/revenue-simulator?view=${sim.id}` |
| 1064-1065 | `/mypage/simulator?view=${sim.id}` | `/mypage/revenue-simulator?view=${sim.id}` |
| 1078 | `/mypage/simulator?edit=${sim.id}` | `/mypage/revenue-simulator?edit=${sim.id}` |
| 1153-1154 | `/mypage/simulator?view=${sim.id}` | `/mypage/revenue-simulator?view=${sim.id}` |
| 1163 | `/mypage/simulator?edit=${sim.id}` | `/mypage/revenue-simulator?edit=${sim.id}` |
| 1204 | `href="/mypage/simulator"` | `href="/mypage/revenue-simulator"` |

#### `app/mypage/simulator/SimulatorClient.tsx`（移動後も修正必要）

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 1774 | `href="/mypage/simulator"` | `href="/mypage/revenue-simulator"` |

### 3. 左メニュー・ナビゲーション

#### `components/dashboard/DashboardLayout.tsx`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 83 | `{ name: '収益シミュレーション', href: '/mypage', icon: Calculator }` | `{ name: '収益シミュレーション', href: '/mypage/revenue-simulator', icon: Calculator }` |
| 93-95 | `if (href === '/mypage')` のアクティブ判定ロジック | `/mypage/revenue-simulator` 用に修正 |
| 108 | `<Link href="/mypage">` (ロゴリンク) | `/mypage` のまま（ダッシュボードでOK） |
| 147 | `<Link href="/mypage">` (モバイルロゴ) | `/mypage` のまま（ダッシュボードでOK） |

#### `components/shared-header.tsx`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 20 | `{ href: '/mypage', label: '収益シミュレーション' }` | `{ href: '/mypage/revenue-simulator', label: '収益シミュレーション' }` |
| 25 | `DASHBOARD_ROUTES` 配列 | `/mypage/revenue-simulator` を追加 |
| 142 | `router.push('/mypage')` | `/mypage` のまま（ダッシュボードでOK） |
| 208 | `href="/mypage"` | `/mypage` のまま（ダッシュボードでOK） |

### 4. 認証・リダイレクト

#### `app/auth/signin/page.tsx`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 21 | `router.replace('/mypage')` | `/mypage` のまま（ダッシュボードでOK） |
| 32 | `router.push('/mypage')` | `/mypage` のまま（ダッシュボードでOK） |

#### `app/auth/signup/page.tsx`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 22 | `router.replace('/mypage')` | `/mypage` のまま（ダッシュボードでOK） |
| 53 | `router.replace('/mypage')` | `/mypage` のまま（ダッシュボードでOK） |

#### `lib/auth/impl-neon/client.ts`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 96 | `callbackURL: "/mypage"` | `/mypage` のまま（ダッシュボードでOK） |

#### `lib/auth/impl-neon/Provider.tsx`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 49 | `redirectTo="/mypage"` | `/mypage` のまま（ダッシュボードでOK） |

### 5. その他のリダイレクト

#### `app/dashboard/page.tsx`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 5 | `redirect('/mypage')` | `/mypage` のまま（ダッシュボードでOK） |

#### `app/billing/page.tsx`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 5 | `redirect('/mypage/billing')` | 変更なし |

#### `app/mypage/billing/page.tsx`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 8 | `redirect('/mypage')` | `/mypage` のまま（ダッシュボードでOK） |

### 6. 外部ページからのリンク

#### `app/pricing/page.tsx`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 28 | `<Link href="/mypage">` | `/mypage` のまま（ダッシュボードでOK） |

#### `app/simulator/SimulatorLPClient.tsx`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 167 | `router.push('/mypage')` | `/mypage` のまま（ダッシュボードでOK） |

#### `components/HelpButton.tsx`

| 行番号 | 現状 | 変更後 |
|--------|------|--------|
| 78 | `href="/mypage/guide"` | 変更なし |

---

## 影響なし

| カテゴリ | 理由 |
|---------|------|
| API (`/api/simulations/`) | URLパスは別管理 |
| データベース (Prisma) | シミュレーションデータにURLは含まれない |
| CFシミュレーション | URL変更対象外 |

---

## 作業手順

1. **ファイル移動**
   - `app/mypage/MyPageClient.tsx` → `app/mypage/revenue-simulator/RevenueSimulatorListClient.tsx`
   - `app/mypage/simulator/` → `app/mypage/revenue-simulator/` に統合

2. **新規作成**
   - `app/mypage/page.tsx` - 新しいダッシュボードページ

3. **リンク修正**
   - 上記の影響範囲に記載された箇所を修正

4. **テスト**
   - 各ページへのアクセス確認
   - ログイン後のリダイレクト確認
   - 左メニューのアクティブ状態確認
   - シミュレーション一覧・詳細の遷移確認

---

## 作成日

2026年1月29日
