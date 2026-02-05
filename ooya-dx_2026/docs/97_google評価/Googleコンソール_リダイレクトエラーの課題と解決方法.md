# Googleコンソール リダイレクトエラーの課題と解決方法

## 発生日
2026年2月5日

## 問題の概要

Google Search Consoleで以下のエラーが発生し、ページがインデックスに登録されていなかった。

```
URL が Google に登録されていません
ページはインデックスに登録されていません: リダイレクト エラー
ページの取得: 失敗しました: リダイレクト エラー
```

### 対象URL例
- https://ooya.tech/tools/brokerage

---

## 原因

### URLの不一致

| 項目 | 設定されていたURL | 実際のリダイレクト先 |
|------|------------------|---------------------|
| サイトマップ | `https://ooya.tech/...` | - |
| メタデータ | `https://ooya.tech/...` | - |
| Vercel設定 | - | `https://www.ooya.tech/...` |

### 技術的な詳細

Vercelの設定で `www.ooya.tech` がメインドメインとして設定されているため、`ooya.tech` にアクセスすると307リダイレクトが発生する。

```bash
# リダイレクトの確認
$ curl -I https://ooya.tech
HTTP/2 307
location: https://www.ooya.tech/

$ curl -I https://www.ooya.tech
HTTP/2 200
```

### Vercel CLI確認結果

```bash
$ npx vercel project ls
Project Name      Latest Production URL
ooya-dx_2026      https://www.ooya.tech
```

**サイトマップに `https://ooya.tech/...` が登録されているが、Googlebotがアクセスすると `https://www.ooya.tech/...` にリダイレクトされるため、リダイレクトエラーとして検出されていた。**

---

## 解決方法

### 採用した方法：コードを `www.ooya.tech` に統一

Vercelの設定（`www.ooya.tech` がメイン）に合わせて、サイト全体のURLを統一。

### 修正ファイル一覧（46ファイル）

#### 主要ファイル
- `app/sitemap.ts` - サイトマップのBASE_URL
- `app/robots.ts` - robots.txtのサイトマップURL
- `app/layout.tsx` - グローバルメタデータ

#### ツールページ（28ファイル）
- `app/tools/*/page.tsx` - 各ツールのメタデータ

#### その他
- `app/page.tsx` - トップページ
- `app/media/page.tsx` - メディアページ
- `app/glossary/page.tsx` - 用語集ページ
- `app/simulator/page.tsx` - シミュレーターページ
- その他コンポーネント

### 変更内容

```diff
- const BASE_URL = 'https://ooya.tech';
+ const BASE_URL = 'https://www.ooya.tech';
```

---

## 別の解決方法（不採用）

### Vercelの設定を変更する方法

Vercelダッシュボードでリダイレクト方向を逆にする（`www.ooya.tech` → `ooya.tech`）。

**不採用理由**：既にVercelで `www.ooya.tech` がメインとして運用されており、設定変更による影響範囲が大きいため。

---

## 今後の対応

1. Google Search Consoleで「インデックス登録をリクエスト」を再実行
2. 数日後にクロール状況を確認
3. リダイレクトエラーが解消されたことを確認

---

## 教訓

- **サイトマップのURLとVercelのメインドメイン設定は必ず一致させる**
- 新規プロジェクト開始時に、www有り/無しのどちらをメインにするか決定し、統一する
- Vercel CLIで設定確認が可能

```bash
# ドメイン設定確認コマンド
npx vercel domains inspect ooya.tech
npx vercel project ls
```
