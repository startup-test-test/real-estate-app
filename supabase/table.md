# Supabaseテーブル調査書

## 概要
このドキュメントは、大家DXプロジェクトで使用されているSupabaseデータベースの全テーブルについて、その構造と用途を詳細に説明するものです。

最終更新日: 2025年8月13日

---

## 1. ユーザー管理関連テーブル

### 1.1 users テーブル
**用途**: ユーザーの基本情報を管理

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | ユーザーID（auth.usersと連携） |
| email | TEXT | メールアドレス |
| full_name | TEXT | フルネーム |
| avatar_url | TEXT | プロフィール画像URL |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**特徴**:
- auth.usersテーブルと連携
- RLS（Row Level Security）有効
- ユーザーは自分のプロフィールのみ閲覧可能

---

## 2. 物件管理関連テーブル

### 2.1 properties テーブル
**用途**: 投資物件の基本情報を管理

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | 物件ID |
| user_id | UUID | 所有者のユーザーID |
| name/property_name | TEXT | 物件名 |
| location | TEXT | 物件所在地 |
| purchase_price | DECIMAL | 購入価格 |
| monthly_rent | DECIMAL | 月額家賃 |
| land_area | DECIMAL | 土地面積（㎡） |
| building_area | DECIMAL | 建物面積（㎡） |
| year_built | INTEGER | 築年数 |
| property_type | TEXT | 物件タイプ（区分マンション等） |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**特徴**:
- ユーザーごとに物件を管理
- RLS有効（ユーザーは自分の物件のみアクセス可能）
- シミュレーションの基礎データとして使用

---

## 3. シミュレーション関連テーブル

### 3.1 simulations テーブル
**用途**: 不動産投資シミュレーション結果を保存

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | シミュレーションID |
| user_id | UUID | 実行ユーザーID |
| property_id | UUID | 関連物件ID（NULL可） |
| simulation_data | JSONB | シミュレーション入力データ |
| results | JSONB | シミュレーション結果 |
| cash_flow_table | JSONB | キャッシュフロー表 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**特徴**:
- JSONB形式で柔軟なデータ保存
- 詳細な投資分析結果を保持
- 過去のシミュレーション履歴として活用

### 3.2 market_analyses テーブル
**用途**: 市場分析データを管理

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | 分析ID |
| user_id | UUID | 実行ユーザーID |
| property_id | UUID | 関連物件ID（NULL可） |
| location | TEXT | 分析対象地域 |
| analysis_data | JSONB | 分析入力データ |
| results | JSONB | 分析結果 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**特徴**:
- 地域別の市場動向分析
- AI分析結果の保存
- 投資判断の参考データ

---

## 4. 決済・サブスクリプション関連テーブル

### 4.1 subscriptions テーブル
**用途**: Stripeサブスクリプション情報を管理

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | サブスクリプションID |
| user_id | UUID | ユーザーID |
| stripe_customer_id | TEXT | Stripe顧客ID |
| stripe_subscription_id | TEXT | StripeサブスクリプションID |
| status | TEXT | ステータス（active/canceled/past_due） |
| current_period_end | TIMESTAMP | 現在の期間終了日 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

**特徴**:
- Stripe決済と連携
- プレミアムプランの管理
- 自動更新・解約処理

### 4.2 user_usage テーブル
**用途**: ユーザーの利用状況を追跡

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | 利用記録ID |
| user_id | UUID | ユーザーID |
| usage_count | INTEGER | 利用回数 |
| period_start_date | TIMESTAMP | 期間開始日 |
| period_end_date | TIMESTAMP | 期間終了日 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

**特徴**:
- 無料プラン：月5回の利用制限管理
- 月次リセット機能
- 利用制限の自動チェック

### 4.3 usage_history テーブル
**用途**: 機能利用履歴を詳細記録

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | 履歴ID |
| user_id | UUID | ユーザーID |
| feature_type | TEXT | 機能タイプ（simulator等） |
| feature_data | JSONB | 利用詳細データ |
| created_at | TIMESTAMP | 利用日時 |

**特徴**:
- 詳細な利用分析用
- 機能改善のためのデータ収集
- 利用傾向の把握

---

## 5. 共有・コラボレーション関連テーブル

### 5.1 property_shares テーブル
**用途**: 物件情報の共有リンク管理

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | 共有ID |
| property_id | UUID | 物件ID |
| owner_id | UUID | 所有者ID |
| share_token | VARCHAR | 共有トークン（ユニーク） |
| title | VARCHAR | 共有タイトル |
| description | TEXT | 説明文 |
| settings | JSONB | 共有設定 |
| expires_at | TIMESTAMPTZ | 有効期限 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**特徴**:
- セキュアな共有リンク生成
- 期限付き共有
- コメント・ダウンロード権限管理

### 5.2 share_comments テーブル
**用途**: 共有物件へのコメント管理

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | コメントID |
| share_id | UUID | 共有ID |
| user_id | UUID | コメント投稿者ID |
| content | TEXT | コメント内容 |
| tags | TEXT[] | タグ配列 |
| parent_id | UUID | 親コメントID（返信用） |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

**特徴**:
- スレッド形式のコメント
- タグ付け機能
- 専門家からのフィードバック収集

### 5.3 comment_reactions テーブル
**用途**: コメントへのリアクション管理

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | リアクションID |
| comment_id | UUID | コメントID |
| user_id | UUID | リアクションユーザーID |
| reaction | VARCHAR | リアクション種類（👍等） |
| created_at | TIMESTAMPTZ | 作成日時 |

**特徴**:
- ユニーク制約（同一ユーザー・コメント・リアクション）
- エンゲージメント向上
- フィードバックの可視化

### 5.4 share_access_logs テーブル
**用途**: 共有リンクのアクセスログ記録

| カラム名 | データ型 | 説明 |
|---------|---------|------|
| id | UUID | ログID |
| share_id | UUID | 共有ID |
| user_id | UUID | アクセスユーザーID（NULL可） |
| ip_address | TEXT | IPアドレス |
| user_agent | TEXT | ユーザーエージェント |
| created_at | TIMESTAMPTZ | アクセス日時 |

**特徴**:
- セキュリティ監査用
- アクセス統計
- **RLS有効化済み**（2025/8/13修正）

---

## 6. セキュリティ設定

### RLS（Row Level Security）状況

| テーブル名 | RLS状態 | 説明 |
|-----------|---------|------|
| users | ✅ 有効 | 自分のプロフィールのみ閲覧可能 |
| properties | ✅ 有効 | 自分の物件のみアクセス可能 |
| simulations | ✅ 有効 | 自分のシミュレーションのみ閲覧可能 |
| market_analyses | ✅ 有効 | 自分の分析結果のみ閲覧可能 |
| subscriptions | ✅ 有効 | 自分のサブスクリプションのみ閲覧可能 |
| user_usage | ✅ 有効 | 自分の利用状況のみ閲覧可能 |
| usage_history | ✅ 有効 | 自分の利用履歴のみ閲覧可能 |
| property_shares | ✅ 有効 | 所有者のみ管理可能 |
| share_comments | ✅ 有効 | 共有関係者のみアクセス可能 |
| comment_reactions | ✅ 有効 | 適切な権限制御 |
| share_access_logs | ✅ 有効 | 共有所有者のみログ閲覧可能 |

---

## 7. インデックス設定

主要なインデックス：
- user_id による検索最適化
- created_at による時系列ソート
- stripe_customer_id による決済連携
- share_token によるユニーク検索
- period_end_date による期限管理

---

## 8. トリガー・関数

### 自動更新トリガー
- updated_at カラムの自動更新
- 月次利用回数のリセット（user_usage）

### カスタム関数
- 共有トークン生成
- 期限切れデータのクリーンアップ
- 利用制限チェック

---

## 9. 今後の拡張予定

1. **AIアドバイザー機能**
   - AI分析結果テーブル
   - レコメンデーションテーブル

2. **ポートフォリオ管理**
   - portfoliosテーブル
   - portfolio_propertiesテーブル

3. **通知システム**
   - notificationsテーブル
   - notification_settingsテーブル

4. **レポート機能**
   - reportsテーブル
   - report_templatesテーブル

---

## 10. メンテナンス指針

### 定期メンテナンス
- 月次：期限切れデータのクリーンアップ
- 四半期：インデックスの最適化
- 年次：パーティショニング検討

### 監視項目
- クエリパフォーマンス
- ストレージ使用量
- RLS設定の確認
- セキュリティアドバイザーのチェック

---

*このドキュメントは定期的に更新されます。*
*最新のテーブル構造はSupabaseダッシュボードでご確認ください。*