# 共有・招待機能 UI/UX設計書

## 1. 概要
不動産投資シミュレーション結果を家族や専門家（税理士、不動産コンサルタント）と共有し、協議できる機能の設計書。

## 2. ペルソナ定義

### 主要ユーザー（物件オーナー）
- 不動産投資を検討している個人投資家
- 家族で賃貸業を営んでいる方
- 複数の意見を参考にして投資判断をしたい方

### 招待されるユーザー
1. **家族メンバー**
   - 配偶者、親、子供など
   - 投資判断に関わる家族
   
2. **専門家**
   - 税理士
   - 不動産コンサルタント
   - ファイナンシャルプランナー

## 3. 主要機能

### 3.1 招待機能
```
[共有・招待] ボタン
├── 招待方法選択
│   ├── メールで招待
│   ├── リンクをコピー
│   └── QRコード表示
├── 権限設定
│   ├── 閲覧のみ
│   ├── コメント可能（デフォルト）
│   └── 編集可能
└── 有効期限設定（オプション）
```

### 3.2 コメント機能
```
コメントセクション
├── コメント投稿エリア
│   ├── テキスト入力
│   ├── タグ付け（#要検討 #リスク #承認済み）
│   └── ファイル添付
├── コメント表示エリア
│   ├── ユーザー情報（名前・役割）
│   ├── タイムスタンプ
│   ├── コメント本文
│   └── リアクション（👍 👎 ❓）
└── スレッド表示（返信機能）
```

### 3.3 通知機能
- 新しいコメントの通知
- 招待承認の通知
- @メンション通知

## 4. UI コンポーネント設計

### 4.1 招待モーダル
```tsx
<InviteModal>
  <h2>シミュレーション結果を共有</h2>
  
  <TabGroup>
    <Tab>メールで招待</Tab>
    <Tab>リンク共有</Tab>
    <Tab>既存メンバー</Tab>
  </TabGroup>
  
  <EmailInviteForm>
    <Input placeholder="メールアドレス" />
    <Select label="役割">
      <Option>家族</Option>
      <Option>税理士</Option>
      <Option>不動産専門家</Option>
      <Option>その他</Option>
    </Select>
    <Select label="権限">
      <Option>閲覧のみ</Option>
      <Option>コメント可能</Option>
      <Option>編集可能</Option>
    </Select>
    <TextArea placeholder="メッセージ（任意）" />
  </EmailInviteForm>
  
  <Button>招待を送信</Button>
</InviteModal>
```

### 4.2 コメントセクション
```tsx
<CommentSection>
  <CommentHeader>
    <h3>ディスカッション</h3>
    <Badge>{commentCount} 件のコメント</Badge>
  </CommentHeader>
  
  <CommentInput>
    <UserAvatar />
    <TextArea placeholder="シミュレーション結果についてコメント..." />
    <TagSelector tags={['要検討', 'リスク', '承認', '質問']} />
    <Button>投稿</Button>
  </CommentInput>
  
  <CommentList>
    {comments.map(comment => (
      <CommentCard>
        <CommentHeader>
          <UserInfo>
            <Avatar />
            <Name>{comment.userName}</Name>
            <Role>{comment.userRole}</Role>
          </UserInfo>
          <Timestamp>{comment.createdAt}</Timestamp>
        </CommentHeader>
        
        <CommentBody>
          {comment.content}
          {comment.tags.map(tag => <Tag>{tag}</Tag>)}
        </CommentBody>
        
        <CommentActions>
          <ReactionButton>👍</ReactionButton>
          <ReplyButton>返信</ReplyButton>
        </CommentActions>
      </CommentCard>
    ))}
  </CommentList>
</CommentSection>
```

## 5. セキュリティ考慮事項

### 5.1 アクセス制御
- 招待リンクは一意のトークンを含む
- 権限に応じた表示制御
- 有効期限の設定

### 5.2 プライバシー保護
- 個人情報のマスキング機能
- コメント削除機能
- アクセスログの記録

## 6. 実装優先順位

1. **Phase 1: 基本的な共有機能**
   - リンク共有
   - 閲覧権限の設定
   - 基本的なコメント機能

2. **Phase 2: 高度な協業機能**
   - メール招待
   - 役割ベースの権限管理
   - スレッド形式のディスカッション
   - リアクション機能

3. **Phase 3: 専門家向け機能**
   - 専門家認証バッジ
   - PDFレポート生成
   - 詳細な監査ログ

## 7. 成功指標（KPI）

- 共有機能の利用率
- 平均コメント数/シミュレーション
- 招待承認率
- アクティブな協業セッション数

## 8. 参考UI例

### freeeの税理士招待フロー
1. ダッシュボードから「アドバイザー招待」
2. メールアドレスと権限を設定
3. カスタムメッセージを追加
4. 招待送信

### 本システムでの応用
- よりカジュアルな家族間共有に対応
- 不動産投資特有のコンテキストを考慮
- モバイルファーストなUI設計