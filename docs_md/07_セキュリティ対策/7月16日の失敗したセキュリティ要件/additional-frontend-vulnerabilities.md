# 追加のフロントエンドセキュリティ脆弱性調査結果

## 調査実施日
2025-07-17

## 概要
既存のセキュリティ対策課題管理表に記載されていない、フロントエンドコードの追加セキュリティ脆弱性を調査しました。

## 🚨 新たに発見された脆弱性

### 1. React Security Anti-patterns

#### SEC-057: 危険なwindow.location操作 (🔴 重大リスク)
**脆弱性の詳細:**
- `/src/pages/Login.tsx` で `window.location.href = decodedUrl` を使用してリダイレクト
- URLパラメータから取得した値を検証なしに直接使用
- オープンリダイレクト攻撃の可能性

**影響:**
- フィッシングサイトへの誘導
- 悪意のあるサイトへのリダイレクト
- ユーザー認証情報の窃取

**対策:**
```typescript
// ホワイトリストベースのリダイレクト検証
const allowedDomains = ['ooya-dx.com', 'localhost'];
const isValidRedirectUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return allowedDomains.some(domain => 
      parsedUrl.hostname === domain || 
      parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};
```

#### SEC-058: 安全でないDOM操作 (🟡 高リスク)
**脆弱性の詳細:**
- `/src/components/PDFPreviewModal.tsx` で `printContent.innerHTML` を使用
- `/src/utils/enhancedPdfGenerator.ts` で `tempContainer.innerHTML = componentHTML` を使用
- XSS攻撃の可能性

**影響:**
- スクリプトインジェクション
- セッションハイジャック
- 機密情報の窃取

**対策:**
```typescript
// DOMPurifyを使用したサニタイズ
import DOMPurify from 'dompurify';
const sanitizedHTML = DOMPurify.sanitize(componentHTML);
tempContainer.innerHTML = sanitizedHTML;
```

#### SEC-059: document.write使用 (🟡 高リスク)
**脆弱性の詳細:**
- `/src/components/PDFPreviewModal.tsx` で `printWindow.document.write()` を使用
- 新しいウィンドウでの動的コンテンツ生成

**影響:**
- XSS攻撃の可能性
- 悪意のあるスクリプトの実行

**対策:**
```typescript
// document.writeの代わりにDOMメソッドを使用
const printDocument = printWindow.document;
const html = printDocument.createElement('html');
// ... DOM構築
printDocument.appendChild(html);
```

### 2. State Management Security

#### SEC-060: 機密情報のlocalStorage保存 (🔴 重大リスク)
**脆弱性の詳細:**
- `/src/hooks/useSupabaseAuth.ts` で認証情報をlocalStorageに保存
- `localStorage.setItem('mock_user', JSON.stringify(user))`
- `localStorage.setItem('mock_session', JSON.stringify(session))`
- 認証トークンやユーザー情報が平文で保存

**影響:**
- XSS攻撃による認証情報の窃取
- localStorage経由でのセッションハイジャック
- 永続的な認証情報の露出

**対策:**
```typescript
// セッション情報は暗号化して保存
import CryptoJS from 'crypto-js';
const encryptedSession = CryptoJS.AES.encrypt(
  JSON.stringify(session), 
  process.env.VITE_ENCRYPTION_KEY
).toString();
sessionStorage.setItem('encrypted_session', encryptedSession);
```

#### SEC-061: 招待トークンのlocalStorage保存 (🟡 高リスク)
**脆弱性の詳細:**
- `/src/pages/SimpleCollaboration.tsx` で `localStorage.setItem('pendingCollaborationToken', token)`
- `/src/hooks/useCollaborationAuth.ts` で招待トークンを平文保存

**影響:**
- 招待トークンの不正利用
- 権限昇格攻撃

### 3. API Communication Security

#### SEC-062: 環境変数の直接露出 (🟡 高リスク)
**脆弱性の詳細:**
- `/src/lib/supabase.ts` で `import.meta.env.VITE_SUPABASE_URL` を直接使用
- APIキーがビルド時にバンドルに含まれる

**影響:**
- APIキーの露出
- 不正なAPI利用

**対策:**
```typescript
// APIキーをプロキシ経由で取得
const getSupabaseConfig = async () => {
  const response = await fetch('/api/config');
  return response.json();
};
```

#### SEC-063: CSRFトークン未実装 (🟡 高リスク)
**脆弱性の詳細:**
- APIリクエストにCSRFトークンが含まれていない
- 状態変更操作（削除、更新）で検証なし

**影響:**
- CSRF攻撃による不正操作
- ユーザーの意図しないデータ変更

### 4. Client-side Storage Security

#### SEC-064: 大量のconsole.log文 (🟡 高リスク)
**脆弱性の詳細:**
- 351箇所のconsole.log文を検出
- 認証情報、ユーザーデータ、トークンなどをログ出力
- 例: `console.log('loadSimulations: データ読み込み開始, ユーザー:', user.email)`

**影響:**
- ブラウザコンソール経由での情報漏洩
- デバッグ情報の本番環境への露出
- 攻撃者への内部動作の開示

**対策:**
```typescript
// 本番環境でのconsole.log無効化
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
}
```

### 5. Third-party Integration Risks

#### SEC-065: 外部スクリプトの整合性チェック不足 (🟢 低リスク)
**脆弱性の詳細:**
- index.htmlに外部スクリプトのintegrity属性がない
- CDN経由のライブラリ読み込みなし（現状は安全）

**影響:**
- 将来的な外部スクリプト追加時のリスク

### 6. その他の脆弱性

#### SEC-066: window.open使用時のopener制御不足 (🟡 高リスク)
**脆弱性の詳細:**
- `/src/components/PDFPreviewModal.tsx` で `window.open('', '_blank')` を使用
- rel="noopener"の設定なし

**影響:**
- opener経由での親ウィンドウ操作
- セキュリティコンテキストの漏洩

**対策:**
```typescript
const printWindow = window.open('', '_blank', 'noopener,noreferrer');
```

#### SEC-067: エラーメッセージの詳細露出 (🟢 低リスク)
**脆弱性の詳細:**
- エラー処理でスタックトレースを含む詳細情報を表示
- 内部構造の露出

## 📊 追加脆弱性の統計

- 🔴 **重大リスク**: 3件（SEC-057, SEC-060, SEC-064）
- 🟡 **高リスク**: 7件（SEC-058, SEC-059, SEC-061, SEC-062, SEC-063, SEC-066, SEC-067）
- 🟢 **低リスク**: 1件（SEC-065）
- **総計: 11件の追加脆弱性**

## 🛡️ 推奨される追加対策

### 1. Content Security Policy (CSP) の実装
```typescript
// Viteの設定でCSPヘッダーを追加
export default {
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    }
  }
}
```

### 2. セキュリティライブラリの導入
- DOMPurify: HTML/DOM XSS サニタイゼーション
- crypto-js: クライアントサイド暗号化
- helmet: セキュリティヘッダー設定

### 3. 開発プロセスの改善
- ESLintルールでconsole.log検出
- pre-commitフックでセキュリティチェック
- 定期的なセキュリティ監査

### 4. ランタイムセキュリティ
```typescript
// グローバルセキュリティ設定
if (process.env.NODE_ENV === 'production') {
  // Consoleメソッドの無効化
  ['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
    console[method] = () => {};
  });
  
  // グローバルエラーハンドラー
  window.addEventListener('error', (e) => {
    // エラーをサーバーに送信（詳細は含めない）
    logErrorToServer({
      message: 'Client error occurred',
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
    e.preventDefault();
  });
}
```

## 🚀 実装優先順位

1. **即座に対応すべき項目（1週間以内）**
   - SEC-057: URLリダイレクトの検証実装
   - SEC-060: localStorage認証情報の暗号化
   - SEC-064: console.logの本番環境無効化

2. **短期対応項目（2週間以内）**
   - SEC-058, SEC-059: DOM操作のサニタイズ
   - SEC-062: API設定の安全な取得方法
   - SEC-063: CSRF保護の実装

3. **中期対応項目（1ヶ月以内）**
   - CSPヘッダーの実装
   - セキュリティライブラリの統合
   - 包括的なエラーハンドリング

## まとめ
既存のセキュリティ課題管理表に加えて、11件の新たな脆弱性を発見しました。特に認証情報の平文保存、安全でないリダイレクト、console.logによる情報漏洩は早急な対応が必要です。これらの対策を実施することで、アプリケーションのセキュリティレベルを大幅に向上させることができます。