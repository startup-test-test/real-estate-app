# Stripe決済フロー 実機テスト（CLI版）チェックシート

**テスト日**: 2025年10月11日
**テスト環境**: dev.ooya.tech
**テスト実施者**: 東後様
**使用ツール**: Stripe CLI

---

## 事前準備

### 1. Stripe CLIのインストール

#### GitHub Codespaces（Linux）の場合

```bash
# Stripe CLIをダウンロード
curl -LO https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz

# 解凍
tar -xvf stripe_1.19.5_linux_x86_64.tar.gz

# 実行権限を付与
chmod +x stripe

# PATHに移動
sudo mv stripe /usr/local/bin/

# インストール確認
stripe --version
```

#### macOSの場合

```bash
# Homebrewでインストール
brew install stripe/stripe-cli/stripe

# インストール確認
stripe --version
```

### 2. Stripe CLIのログイン

```bash
# ログイン（ブラウザが開く）
stripe login

# テストモードであることを確認
stripe config --list
```

**期待結果**:
- [ ] `stripe --version` でバージョンが表示される
- [ ] `stripe login` でログイン成功
- [ ] テストモードであることを確認

---

## Phase 1: 基本的な決済フロー（ブラウザ操作）

### 1-1. 新規登録→アップグレード
**手順**:
1. [ ] `dev.ooya.tech` にアクセス
2. [ ] ログイン: `togo@startup-marketing.co.jp` / `gomesu`
3. [ ] 「今すぐアップグレード」をクリック
4. [ ] テストカード `4242 4242 4242 4242` で決済
5. [ ] ベーシックプランに変更されたことを確認

**期待結果**:
- [ ] 決済成功
- [ ] ベーシックプラン表示
- [ ] UsageStatusBarに「ベーシックプラン」「収益シミュレーション無制限・AI分析月100回まで」表示

**実際の結果**:
```



```

---

## Phase 2: Stripe CLIを使った時間経過テスト

### 2-1. 顧客情報の確認

```bash
# 顧客一覧を取得
stripe customers list --limit 10

# 特定の顧客の詳細を確認（メールアドレスで検索）
stripe customers list --email togo@startup-marketing.co.jp
```

**メモ**: 顧客ID（`cus_xxxxxxxxxxxxx`）をメモしておく

**実際の顧客ID**:
```
cus_


```

---

### 2-2. サブスクリプション情報の確認

```bash
# サブスクリプション一覧を取得
stripe subscriptions list --limit 10

# 特定の顧客のサブスクリプションを確認
stripe subscriptions list --customer cus_xxxxxxxxxxxxx
```

**メモ**: サブスクリプションID（`sub_xxxxxxxxxxxxx`）をメモしておく

**実際のサブスクリプションID**:
```
sub_


```

---

### 2-3. 継続課金イベントのシミュレーション

**目的**: 1か月後の自動課金をシミュレート

```bash
# 請求成功イベントをトリガー
stripe trigger invoice.payment_succeeded

# または、特定の顧客に対してトリガー
stripe trigger invoice.payment_succeeded --add customer=cus_xxxxxxxxxxxxx
```

**手順**:
1. [ ] 上記コマンドを実行
2. [ ] コマンド出力で `Event sent successfully` を確認
3. [ ] Stripeダッシュボード → Webhooks → イベントログを確認
4. [ ] `invoice.payment_succeeded` イベントが記録されているか
5. [ ] ステータスが `200 OK` であることを確認
6. [ ] アプリでベーシックプランが継続されているか確認

**期待結果**:
- [ ] イベントが正常に送信される
- [ ] Webhookが200 OKで処理される
- [ ] アプリ側でプラン継続が確認できる

**実際の結果**:
```



```

---

### 2-4. サブスクリプション解約のシミュレーション

**目的**: 解約予定が期限到達した場合の動作確認

**Step 1: アプリで解約手続き**

1. [ ] dev.ooya.techにログイン
2. [ ] マイページ → 「プラン管理」または料金プランページへ
3. [ ] 「プランを解約」をクリック
4. [ ] 確認モーダルで「解約する」を選択
5. [ ] 「解約予定」状態になることを確認
6. [ ] UsageStatusBarに「解約予定」「利用期限: YYYY/MM/DD（あとN日）」表示を確認

**期待結果**:
- [ ] 解約予定状態に変更
- [ ] 期限まで全機能利用可能

**Step 2: CLI でサブスクリプション削除イベントをトリガー**

```bash
# サブスクリプション削除イベントをトリガー
stripe trigger customer.subscription.deleted

# または、実際にサブスクリプションをキャンセル（テストモード）
stripe subscriptions cancel sub_xxxxxxxxxxxxx
```

**手順**:
1. [ ] 上記コマンドを実行
2. [ ] コマンド出力で成功を確認
3. [ ] Stripeダッシュボードでサブスクリプションが `canceled` になっているか確認
4. [ ] Webhooks → イベントログで `customer.subscription.deleted` を確認
5. [ ] アプリでログアウト → ログイン
6. [ ] UsageStatusBarが「今月の利用状況: 0/5回」に戻っているか確認
7. [ ] AI市場分析を6回実行し、6回目で制限がかかるか確認

**期待結果**:
- [ ] サブスクリプションがキャンセルされる
- [ ] Webhookが200 OKで処理される
- [ ] 無料プランに自動ダウングレード
- [ ] 使用回数制限が復活（月5回まで）

**実際の結果**:
```



```

---

## Phase 3: Webhook動作確認

### 3-1. Webhookイベントログの確認

**手順**:
1. [ ] Stripeダッシュボード → 開発者 → Webhooks
2. [ ] 使用中のWebhookエンドポイントをクリック
3. [ ] 以下のイベントが記録されているか確認:
   - [ ] `checkout.session.completed` - 決済完了時
   - [ ] `customer.subscription.created` - サブスクリプション作成時
   - [ ] `invoice.payment_succeeded` - 継続課金成功時
   - [ ] `customer.subscription.updated` - 解約・再開時
   - [ ] `customer.subscription.deleted` - サブスクリプション削除時
4. [ ] すべて `200 OK` で処理されているか確認
5. [ ] エラーログがないか確認

**期待結果**:
- [ ] 全イベントが200 OKで処理されている
- [ ] エラーログがない
- [ ] リトライがない（最初の試行で成功）

**実際の結果**:
```



```

---

### 3-2. Webhookのリアルタイム監視（オプション）

**目的**: Webhookイベントをリアルタイムで監視

```bash
# Webhookイベントをリアルタイムで監視
stripe listen

# または、特定のイベントのみ監視
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded
```

**手順**:
1. [ ] 上記コマンドを実行（別のターミナルで）
2. [ ] アプリでアップグレード操作を実行
3. [ ] ターミナルにイベントが表示されることを確認
4. [ ] イベントの内容を確認

**期待結果**:
- [ ] イベントがリアルタイムで表示される
- [ ] ペイロード内容が正しい

**実際の結果**:
```



```

---

## Phase 4: エラーケースのテスト

### 4-1. カード拒否のシミュレーション

```bash
# カード拒否イベントをトリガー
stripe trigger payment_intent.payment_failed
```

**期待結果**:
- [ ] エラーハンドリングが正常に動作
- [ ] わかりやすい日本語エラーメッセージ表示

**実際の結果**:
```



```

---

## テスト結果サマリー

### Phase 1: 基本決済フロー
- [ ] 1-1. 新規登録→アップグレード: ✅ / ❌

### Phase 2: 時間経過テスト（CLI）
- [ ] 2-3. 継続課金シミュレーション: ✅ / ❌
- [ ] 2-4. サブスクリプション解約シミュレーション: ✅ / ❌

### Phase 3: Webhook確認
- [ ] 3-1. Webhookイベントログ確認: ✅ / ❌
- [ ] 3-2. リアルタイム監視: ✅ / ❌

### Phase 4: エラーケース
- [ ] 4-1. カード拒否シミュレーション: ✅ / ❌

---

## 発見した問題・改善点

```




```

---

## 次のアクション

- [ ] テスト結果を検証シートに反映
- [ ] 問題があれば修正対応
- [ ] 本番環境デプロイ前の最終確認

---

## Stripe CLIの便利なコマンド集

```bash
# 顧客一覧
stripe customers list --limit 10

# サブスクリプション一覧
stripe subscriptions list --limit 10

# 請求書一覧
stripe invoices list --limit 10

# イベント一覧
stripe events list --limit 10

# Webhookのリアルタイム監視
stripe listen

# 特定のイベントをトリガー
stripe trigger <event_name>

# 利用可能なトリガー一覧
stripe trigger --help
```

---

## 備考

- Stripe CLIはテストモードでのみ使用
- `stripe trigger` は開発・テスト専用機能
- 本番環境では実際の時間経過を待つ必要あり
