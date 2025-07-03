# 🔄 リファクタリング・ロールバック手順書

## 🚨 緊急ロールバック（1分以内）

### 🔥 Critical Issue発生時
```bash
# 即座に前のブランチに戻る
git checkout main
git reset --hard [前回の安全なコミット]

# 開発サーバー再起動
npm run dev
```

### 🆘 Phase/Step単位ロールバック
```bash
# 現在の作業を一時保存
git add -A
git stash save "emergency-backup-$(date +%Y%m%d-%H%M%S)"

# 前の安全なブランチに戻る
git checkout main

# 必要に応じて開発サーバー再起動
npm run dev
```

## 📋 段階別ロールバック手順

### Phase 0 ロールバック
```bash
# Phase 0で問題が発生した場合
git checkout main
rm -rf test-data/  # テストデータディレクトリ削除
npm run build      # ビルド確認
npm run dev        # 開発サーバー確認
```

### Step 1-1 ロールバック（ユーティリティ関数抽出）
```bash
# Step 1-1の変更を取り消し
git checkout main
rm -rf src/utils/validation.ts
rm -rf src/utils/pdfGenerator.ts  
rm -rf src/utils/dataTransform.ts

# Simulator.tsxを元に戻す
git checkout HEAD~1 -- src/pages/Simulator.tsx

# 確認
npm run build
npm run dev
```

### Step 1-2 ロールバック（定数・設定データ抽出）
```bash
# Step 1-2の変更を取り消し
git checkout main
rm -rf src/constants/sampleData.ts
rm -rf src/constants/tooltips.ts
rm -rf src/constants/thresholds.ts

# Simulator.tsxを元に戻す
git checkout HEAD~1 -- src/pages/Simulator.tsx

# 確認
npm run build
npm run dev
```

### Step 1-3 ロールバック（型定義の分離）
```bash
# Step 1-3の変更を取り消し
git checkout main
rm -rf src/types/simulation.ts
rm -rf src/types/forms.ts
rm -rf src/types/results.ts

# 元のtypes/index.tsに戻す
git checkout HEAD~1 -- src/types/index.ts
git checkout HEAD~1 -- src/pages/Simulator.tsx

# 確認
npm run build
npm run dev
```

### Step 1-4 ロールバック（カスタムフック抽出）
```bash
# Step 1-4の変更を取り消し
git checkout main
rm -rf src/hooks/useSimulationState.ts
rm -rf src/hooks/useApiCall.ts
rm -rf src/hooks/useFormState.ts

# Simulator.tsxを元に戻す
git checkout HEAD~1 -- src/pages/Simulator.tsx

# 確認
npm run build
npm run dev
```

### Step 1-5 ロールバック（最小コンポーネント抽出）
```bash
# Step 1-5の変更を取り消し
git checkout main
rm -rf src/components/MetricCard.tsx
rm -rf src/components/CashFlowChart.tsx

# Simulator.tsxを元に戻す
git checkout HEAD~1 -- src/pages/Simulator.tsx

# 確認
npm run build
npm run dev
```

## 🔍 ロールバック後の確認項目

### ✅ 必須確認
- [ ] `npm run build` が成功する
- [ ] `npm run dev` で開発サーバーが起動する
- [ ] シミュレーターページにアクセスできる
- [ ] シミュレーション実行が正常動作する
- [ ] UI表示が元と同じ

### 🧪 動作確認
- [ ] サンプル物件選択が動作する
- [ ] 基本テストケースでシミュレーション実行
- [ ] 結果表示が正常
- [ ] ブラウザコンソールエラーなし

## 📞 エスカレーション手順

### 🆘 問題解決できない場合
1. **即座に作業停止**
2. **main ブランチに切り替え**
3. **問題の詳細記録**
4. **チームメンバーに報告**

### 📝 問題報告テンプレート
```
## 🚨 リファクタリング緊急事態報告

**発生日時**: YYYY/MM/DD HH:MM
**実行中のステップ**: [Phase-0 / Step-1-1 / etc.]
**問題内容**: [具体的な問題]

### 発生した症状
- [ ] ビルドエラー
- [ ] TypeScriptエラー  
- [ ] 実行時エラー
- [ ] UI表示異常
- [ ] 機能停止
- [ ] その他: [詳細]

### エラーメッセージ
```
[エラーメッセージをここに貼り付け]
```

### 試行した対処
- [実施した対処を記載]

### 現在の状況
- [ ] main ブランチに避難済み
- [ ] 基本動作確認済み
- [ ] 作業継続可能
- [ ] 要サポート
```

## 🛡️ 予防策

### 定期バックアップ
```bash
# 30分ごとに自動バックアップ（推奨）
git add -A
git stash save "auto-backup-$(date +%Y%m%d-%H%M%S)"
```

### ブランチ管理
```bash
# 各ステップ開始前
git checkout main
git pull origin main
git checkout -b [step-branch-name]

# 各ステップ完了後
git add -A
git commit -m "[step]: [変更内容]"
git checkout main
git merge [step-branch-name]
```

### 動作確認
```bash
# 各ステップ後に必須実行
npm run build && npm run dev
```

## 📊 ロールバック記録

### 記録テンプレート
```
## ロールバック実施記録

**実施日時**: YYYY/MM/DD HH:MM
**対象ステップ**: [Phase-0 / Step-1-1 / etc.]
**ロールバック理由**: [問題内容]
**ロールバック手順**: [実施した手順]
**所要時間**: [復旧までの時間]
**再開可能性**: [ 可能 / 要調査 / 困難 ]

### 学んだ教訓
- [次回避けるべきポイント]
- [改善すべき手順]
```

---

**🎯 目標**: ロールバック時間を最小化し、安全な状態に素早く復旧する