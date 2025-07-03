# ソースコード構成

このディレクトリにはアプリケーションのソースコードが含まれています。

## ディレクトリ構成

### components/
再利用可能なReactコンポーネント
- **基本UIコンポーネント**: Alert, Badge, Button, Input, LoadingSpinner など
- **レイアウトコンポーネント**: Layout, BackButton, Breadcrumb など
- **機能コンポーネント**: ImageUpload, InviteModal, ShareButton など
- **チャート・メトリクス**: CashFlowChart, MetricCard
- **comments/**: コメント機能関連コンポーネント（統合版と既存版）

### pages/
ページレベルのコンポーネント（ルート別）
- **認証**: Login, AuthCallback
- **シミュレーション**: Simulator, SimulationResult
- **コラボレーション**: CollaborationView, ShareView
- **その他**: Dashboard, FAQ, MarketAnalysis など

### hooks/
カスタムフック
- **認証**: useSupabaseAuth
- **データ**: useSupabaseData, useApiCall
- **フォーム・状態**: useFormState, useSimulationState
- **機能別**: useImageUpload, usePropertyShare, useComments

### utils/
ユーティリティ関数
- **バリデーション**: validation.ts
- **データ変換**: dataTransform.ts
- **ファイル処理**: imageUtils.ts, pdfGenerator.ts
- **共有機能**: shareUtils.ts

### types/
TypeScript型定義
- **simulation.ts**: シミュレーション関連型
- **forms.ts**: フォーム関連型
- **results.ts**: 結果・分析関連型
- **index.ts**: 統合エクスポート

### constants/
定数・設定データ
- **masterData.ts**: マスターデータ
- **sampleData.ts**: サンプル物件データ
- **thresholds.ts**: メトリクス判定しきい値
- **tooltips.ts**: ヘルプテキスト

### lib/
外部ライブラリの設定
- **supabase.ts**: Supabaseクライアント設定

## インポート規則

各ディレクトリには `index.ts` ファイルがあり、バレルエクスポートを活用してください：

```typescript
// Good
import { Button, Alert } from '@/components';
import { useFormState } from '@/hooks';
import { sampleProperties } from '@/constants';

// Avoid
import Button from '@/components/Button';
import Alert from '@/components/Alert';
```