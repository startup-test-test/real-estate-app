# CSRF保護の実装ガイド

## SEC-004: CSRF対策の実装

### 概要
本アプリケーションでは、Cross-Site Request Forgery (CSRF) 攻撃を防ぐために、以下の対策を実装しています。

### 実装内容

#### 1. CSRFトークンの生成と管理（`utils/csrf.ts`）
- 暗号学的に安全なランダムトークンの生成
- セッションストレージを使用したトークン管理
- タブごとに独立したトークン

#### 2. Supabaseクライアントの設定
- `lib/supabase.ts`でCSRF保護設定を適用
- 全てのSupabase APIリクエストに自動的にCSRFトークンを付与

#### 3. セキュアなfetchラッパー
- `secureFetch`関数による保護されたHTTPリクエスト
- GET以外のリクエストに自動的にCSRFトークンを追加

### 使用方法

#### 基本的な使用
```typescript
import { secureFetch } from '@/utils/csrf';

// POST リクエストの例
const response = await secureFetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ data: 'value' })
});
```

#### フォームデータの場合
```typescript
import { addCSRFToFormData } from '@/utils/csrf';

const formData = new FormData();
formData.append('file', file);
const protectedFormData = addCSRFToFormData(formData);
```

### セキュリティ上の利点

1. **セッションベースの保護**: セッションストレージを使用することで、タブを閉じるとトークンが自動的に削除されます

2. **自動トークン管理**: トークンの生成、保存、送信が自動化されています

3. **Supabase統合**: Supabaseの全APIコールに自動的にCSRF保護が適用されます

4. **後方互換性**: 既存のコードを変更することなくCSRF保護を追加

### テスト

CSRF保護の動作は`utils/__tests__/csrf.test.ts`で包括的にテストされています：

- トークン生成の一意性
- ヘッダーへの正しい追加
- 各HTTPメソッドでの動作
- Supabase設定の統合

### 注意事項

- CSRFトークンはセッションストレージに保存されるため、同じオリジンの別タブでは異なるトークンが使用されます
- これは意図的な設計で、セキュリティを向上させています
- Supabaseの組み込みセキュリティ機能と併用することで、多層防御を実現しています