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
| Vercel設定（変更前） | - | `https://www.ooya.tech/...` |

### 技術的な詳細（変更前の状態）

Vercelの設定で `www.ooya.tech` がメインドメインとして設定されていたため、`ooya.tech` にアクセスすると307リダイレクトが発生していた。

```bash
# 変更前のリダイレクト確認
$ curl -I https://ooya.tech
HTTP/2 307
location: https://www.ooya.tech/

$ curl -I https://www.ooya.tech
HTTP/2 200
```

**サイトマップに `https://ooya.tech/...` が登録されているが、Googlebotがアクセスすると `https://www.ooya.tech/...` にリダイレクトされるため、リダイレクトエラーとして検出されていた。**

---

## 解決方法

### 採用した方法：Vercel設定を変更して `ooya.tech` をメインドメインに設定

コード側（サイトマップ・メタデータ）は既に `https://ooya.tech` で統一されていたため、Vercelの設定をコードに合わせる方針を採用。

wwwなしドメインの方がモダンで短いURLとなるメリットもある。

### Vercelダッシュボードでの設定変更

1. **ooya-dx2026.vercel.appのリダイレクト先を変更**
   - 変更前: `www.ooya.tech` にリダイレクト
   - 変更後: `ooya.tech` にリダイレクト

2. **ooya.techをProduction環境に接続**
   - 「Connect to environment」で Production を選択

3. **www.ooya.techのリダイレクト設定**
   - 301リダイレクト → `ooya.tech`

### 設定変更時の注意点

リダイレクトチェーンエラーが発生する場合がある：
```
You have redirected another domain (ooya-dx2026.vercel.app) to this domain.
In turn, you cannot redirect this one.
```

**解決方法**: 先に `ooya-dx2026.vercel.app` のリダイレクト先を変更してから、`www.ooya.tech` のリダイレクト設定を行う。

---

## 変更後の検証

### リダイレクト確認

```bash
# ooya.tech が直接200を返す
$ curl -I https://ooya.tech
HTTP/2 200

# www.ooya.tech は ooya.tech へ301リダイレクト
$ curl -I https://www.ooya.tech
HTTP/2 301
location: https://ooya.tech/
```

### サイトマップ確認

```bash
$ curl -s https://ooya.tech/sitemap.xml | grep -c "https://ooya.tech/"
84
# 全84URLが https://ooya.tech/ で統一されている

$ curl -s https://ooya.tech/sitemap.xml | grep -c "https://www.ooya.tech/"
0
# www付きURLは0件
```

### コード内URL確認

```bash
$ grep -r "https://www\.ooya\.tech" app/ components/ lib/
# 結果なし（www付きURLはコード内に存在しない）
```

---

## 今後の対応

1. Google Search Consoleで「インデックス登録をリクエスト」を再実行
2. 数日後にクロール状況を確認
3. リダイレクトエラーが解消されたことを確認

---

## 教訓

- **サイトマップのURLとVercelのメインドメイン設定は必ず一致させる**
- 新規プロジェクト開始時に、www有り/無しのどちらをメインにするか決定し、統一する
- コードとVercel設定のどちらを変更するかは、影響範囲を考慮して判断する
  - 今回はコード側が正しく設定されていたため、Vercel設定を変更
- Vercel CLIで設定確認が可能

```bash
# ドメイン設定確認コマンド
npx vercel domains inspect ooya.tech
npx vercel project ls
```

---

## 最終的な設定状態

| ドメイン | 設定 |
|---------|------|
| `ooya.tech` | メインドメイン（Production環境） |
| `www.ooya.tech` | 301リダイレクト → `ooya.tech` |
| `ooya-dx2026.vercel.app` | リダイレクト → `ooya.tech` |
