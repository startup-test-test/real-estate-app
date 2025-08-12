# Google OAuth実装コード

## 1. パッケージインストール

```bash
cd /workspaces/real-estate-app/bolt_front
npm install react-icons@^5.3.0
```

## 2. useSupabaseAuth.ts の更新

`/workspaces/real-estate-app/bolt_front/src/hooks/useSupabaseAuth.ts` に以下の関数を追加：

```typescript
// 既存のsignInWithGoogleの下に追加
const signInWithOAuth = async (provider: 'google') => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('OAuth sign in error:', error)
    return { data: null, error }
  }
}

// returnの中に追加
return {
  // ... 既存のreturn内容
  signInWithOAuth,
}
```

## 3. AuthProvider.tsx の更新

`/workspaces/real-estate-app/bolt_front/src/components/AuthProvider.tsx` の AuthContext に追加：

```typescript
// AuthContextの型定義に追加
signInWithOAuth?: (provider: 'google') => Promise<{ data: any; error: any }>

// valueオブジェクトに追加
const value = {
  // ... 既存のvalue内容
  signInWithOAuth: auth.signInWithOAuth,
}
```

## 4. Login.tsx にGoogleボタン追加

`/workspaces/real-estate-app/bolt_front/src/pages/Login.tsx` に以下を追加：

### インポート追加（ファイルの先頭）
```typescript
import { FcGoogle } from 'react-icons/fc'
```

### Googleログインボタンコンポーネント（コンポーネント内に追加）
```typescript
// LoginFormコンポーネント内、handleSubmitの後に追加
const handleGoogleLogin = async () => {
  setIsLoading(true)
  setError('')
  
  const { error } = await signInWithOAuth?.('google')
  
  if (error) {
    setError('Googleログインに失敗しました')
    setIsLoading(false)
  }
  // 成功時は自動的にリダイレクトされる
}
```

### UI追加（フォームの送信ボタンの後）
```tsx
{/* 「ログイン」ボタンの後に追加 */}
<div className="mt-4">
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-gray-500">または</span>
    </div>
  </div>

  <div className="mt-4">
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 
                 bg-white border border-gray-300 rounded-lg 
                 hover:bg-gray-50 focus:outline-none focus:ring-2 
                 focus:ring-offset-2 focus:ring-blue-500 
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-200"
    >
      <FcGoogle className="h-5 w-5" />
      <span className="text-gray-700 font-medium">Googleでログイン</span>
    </button>
  </div>
</div>
```

## 5. AuthCallback.tsx の作成

新規ファイル `/workspaces/real-estate-app/bolt_front/src/pages/AuthCallback.tsx`：

```tsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const error = params.get('error')
      
      if (error) {
        console.error('OAuth callback error:', error)
        navigate(`/login?error=${error}`)
        return
      }
      
      // 認証成功、ダッシュボードへリダイレクト
      navigate('/')
    }
    
    handleCallback()
  }, [navigate])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">ログイン処理中...</p>
      </div>
    </div>
  )
}

export default AuthCallback
```

## 6. App.tsx にルート追加

`/workspaces/real-estate-app/bolt_front/src/App.tsx` に追加：

```tsx
// インポート追加
import AuthCallback from './pages/AuthCallback'

// Routes内に追加（Login ルートの近く）
<Route path="/auth/callback" element={<AuthCallback />} />
```

## 7. Feature Flag実装（オプション）

`/workspaces/real-estate-app/bolt_front/src/config/features.ts`（新規作成）：

```typescript
export const FEATURES = {
  OAUTH_GOOGLE: import.meta.env.VITE_ENABLE_OAUTH === 'true',
}
```

Login.tsxでの使用：
```tsx
import { FEATURES } from '../config/features'

// Googleボタンを条件付きで表示
{FEATURES.OAUTH_GOOGLE && (
  <div className="mt-4">
    {/* Googleボタンのコード */}
  </div>
)}
```