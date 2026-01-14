# シミュレーターテンプレート

新しいシミュレーターを作成する際のテンプレートと手順書です。

---

## 📁 ディレクトリ構成

```
app/tools/
├── _template/                    # ← このテンプレートフォルダ
│   ├── page.tsx                  # ページテンプレート（SEO・構造化データ）
│   ├── ToolNameCalculator.tsx    # コンポーネントテンプレート
│   └── README.md                 # この手順書
├── brokerage/                    # 仲介手数料シミュレーター（参考実装）
│   ├── page.tsx
│   └── BrokerageCalculator.tsx
└── [new-tool]/                   # ← 新規ツールはここに作成
    ├── page.tsx
    └── XxxCalculator.tsx

lib/calculators/
├── _template.ts                  # 計算ロジックテンプレート
├── brokerage.ts                  # 仲介手数料計算（参考実装）
└── [new-tool].ts                 # ← 新規計算ロジック

components/tools/                 # 共通コンポーネント（再利用可）
├── NumberInput.tsx               # 数値入力
├── ResultCard.tsx                # 結果表示カード
├── QuickReferenceTable.tsx       # 早見表
└── FAQSection.tsx                # FAQ（構造化データ対応）
```

---

## 🚀 新規シミュレーター作成手順

### Step 1: フォルダ作成
```bash
mkdir app/tools/[tool-slug]
```

### Step 2: テンプレートをコピー
```bash
cp app/tools/_template/page.tsx app/tools/[tool-slug]/
cp app/tools/_template/ToolNameCalculator.tsx app/tools/[tool-slug]/XxxCalculator.tsx
cp lib/calculators/_template.ts lib/calculators/[tool-slug].ts
```

### Step 3: ファイルを編集
各ファイルの `【変更箇所】` コメントを参考に編集してください。

---

## 🎯 SEO タイトル戦略

### タイトルフォーマット
```
[対象]の[ツール名]を[時間]で無料計算｜[付加価値]
```

### 実例
| ツール | タイトル |
|--------|----------|
| 仲介手数料 | 不動産売買の仲介手数料を10秒で無料計算｜早見表付き |
| 不動産取得税 | 不動産取得税を10秒で無料計算｜軽減措置対応 |
| 登録免許税 | 登録免許税を10秒で無料計算｜司法書士報酬の目安付き |
| 譲渡所得税 | 不動産売却の譲渡所得税を無料計算｜3000万円控除対応 |
| 固定資産税 | 固定資産税を無料で計算｜住宅用地の軽減措置対応 |
| 利回り | 不動産投資の利回りを10秒で計算｜表面・実質・CCR対応 |

### タイトルのポイント
1. **具体的な時間**：「10秒で」など即時性をアピール
2. **無料**：明示的に記載
3. **付加価値**：早見表、軽減措置対応、など差別化要素
4. **40〜60文字**：検索結果で切れない長さ

---

## 📝 ページ構成

### 必須セクション
1. **パンくずリスト** - ナビゲーション & 構造化データ
2. **タイトル・説明文** - H1 + リード文
3. **シミュレーター本体** - 入力 → 計算 → 結果表示
4. **早見表** - よく検索される価格帯の結果一覧
5. **目次** - ページ内リンク
6. **解説セクション** - 「〇〇とは」「計算方法」「計算例」等
7. **FAQ** - 構造化データ対応（検索結果に表示される可能性）
8. **免責事項** - 法的保護
9. **CTA** - 収益シミュレーターへの誘導

### オプションセクション
- **関連ツール** - ツールが増えたら表示
- **法改正情報** - 最新の法改正があれば追加

---

## 🔧 共通コンポーネント

### NumberInput
```tsx
<NumberInput
  label="売買価格を入力"
  value={price}
  onChange={setPrice}
  unit="円"
  placeholder="30,000,000"
/>
```

### ResultCard
```tsx
<ResultCard
  label="合計（税込）"
  value={result.total}
  unit="円"
  highlight={true}  // メイン結果を強調
  subText="= 105.6 万円"
/>
```

### QuickReferenceTable
```tsx
<QuickReferenceTable
  title="早見表"
  description="説明文"
  headers={['売買価格', '仲介手数料']}
  rows={[
    { label: '1,000万円', value: '39.6万円', subValue: '税抜36万円' },
  ]}
  note="※注意事項"
/>
```

### FAQSection
```tsx
<FAQSection
  title="よくある質問"
  faqs={[
    { question: '質問？', answer: '回答' },
  ]}
/>
// 構造化データも自動生成：generateFAQSchema(faqData)
```

---

## 📊 構造化データ

### 自動生成されるスキーマ
1. **WebApplication** - ツールとしての情報
2. **BreadcrumbList** - パンくずリスト
3. **FAQPage** - FAQ（`generateFAQSchema`で生成）

---

## ✅ チェックリスト

新規シミュレーター公開前の確認事項：

- [ ] SEOタイトルが戦略に沿っている
- [ ] メタデータ（description, keywords, OGP）を設定
- [ ] 構造化データが正しく出力される
- [ ] パンくずリストが正しい
- [ ] 早見表に主要な価格帯を網羅
- [ ] FAQを5つ程度用意
- [ ] 計算ロジックのテスト
- [ ] モバイル表示の確認
- [ ] 免責事項・最終更新日を記載
- [ ] シミュレーターステータス一覧.md を更新

---

## 📌 参考

- 仲介手数料シミュレーター: `app/tools/brokerage/`
- 競合ツール一覧: `docs/07_SEO/競合ツール一覧.md`
- シミュレーターステータス: `docs/07_SEO/シミュレーターステータス一覧.md`
