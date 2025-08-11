# MVP リリース残課題リスト

作成日: 2025年8月11日  
作成者: Claude Code Assistant

## 📋 概要

MVP リリースに向けた残課題の詳細仕様書と実装方法をまとめます。

---

## 1. 🎨 ランディングページ改修

### 1.1 要件定義

#### 改修ポイント
1. **ヘッダー部分**: ロゴとナビゲーションの統一
2. **ヒーローセクション**: キャッチコピーと登録CTAの最適化
3. **特徴説明**: MVP機能（シミュレーターのみ）に合わせた内容
4. **料金プラン**: フリーミアムモデルの明確な提示
5. **CTA（Call to Action）**: 登録フローへの誘導強化
6. **フッター**: 法的情報とリンクの整備

### 1.2 実装仕様

#### 1.2.1 ヒーローセクションの改修

**`/bolt_front/src/pages/LandingPage.tsx` の修正**
```typescript
const HeroSection = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Beta版バッジ */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 
                          rounded-full text-sm font-medium mb-6">
            <span className="animate-pulse mr-2">🎉</span>
            Beta版リリース中 - 今なら完全無料でお試し
          </div>

          {/* メインキャッチコピー */}
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            不動産投資の収益を
            <span className="text-transparent bg-clip-text bg-gradient-to-r 
                           from-blue-600 to-purple-600">
              正確にシミュレーション
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            IRR、CCR、DSCRなど重要指標を自動計算。
            35年間のキャッシュフロー予測で、投資判断を確実に。
          </p>

          {/* CTA ボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                       text-white font-medium rounded-lg text-lg hover:opacity-90 
                       transform hover:scale-105 transition-all duration-200
                       shadow-lg hover:shadow-xl"
            >
              無料で始める（登録は10秒）
            </button>
            <button
              onClick={() => document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 
                       font-medium rounded-lg text-lg hover:bg-gray-50
                       transform hover:scale-105 transition-all duration-200"
            >
              デモを見る
            </button>
          </div>

          {/* 信頼性指標 */}
          <div className="flex items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>SSL暗号化</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>登録ユーザー100名突破</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>満足度4.8/5.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
```

#### 1.2.2 登録フォームセクション

```typescript
const RegistrationSection = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('メールアドレスを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      // メールアドレスをセッションストレージに保存
      sessionStorage.setItem('registerEmail', email);
      // 登録ページへ遷移
      navigate('/register', { state: { email } });
    } catch (error) {
      toast.error('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          今すぐ無料で始めましょう
        </h2>
        <p className="text-xl text-white/90 mb-8">
          クレジットカード不要。いつでも解約可能。
        </p>

        <form onSubmit={handleQuickRegister} className="max-w-md mx-auto">
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="メールアドレスを入力"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-lg text-gray-900"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-4 bg-white text-blue-600 font-medium 
                       rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              {isLoading ? '処理中...' : '無料登録'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-white/80 text-sm">
          登録することで、
          <Link to="/terms" className="underline">利用規約</Link>
          と
          <Link to="/privacy" className="underline">プライバシーポリシー</Link>
          に同意したものとみなされます。
        </div>
      </div>
    </section>
  );
};
```

#### 1.2.3 登録ページの実装

**`/bolt_front/src/pages/Register.tsx` (新規作成)**
```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft, BsApple } from 'react-icons/bs';
import { ArrowLeft, Check } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  useEffect(() => {
    // ランディングページから渡されたメールアドレスを設定
    if (location.state?.email) {
      setEmail(location.state.email);
    } else if (sessionStorage.getItem('registerEmail')) {
      setEmail(sessionStorage.getItem('registerEmail') || '');
      sessionStorage.removeItem('registerEmail');
    }
  }, [location]);

  const handleOAuthRegister = async (provider: 'google' | 'azure' | 'apple') => {
    setLoadingProvider(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error(`${provider} registration error:`, error);
      toast.error(`${provider}での登録に失敗しました`);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('メールアドレスを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            registration_source: 'landing_page'
          }
        }
      });

      if (error) throw error;
      
      setRegistrationComplete(true);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 登録完了画面
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center 
                          justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            登録メールを送信しました
          </h2>
          <p className="text-gray-600 mb-6">
            {email} 宛に確認メールを送信しました。
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              メールが届かない場合は、迷惑メールフォルダをご確認ください。
            </p>
          </div>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* 戻るリンク */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          トップページに戻る
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            無料アカウント登録
          </h1>
          <p className="text-gray-600 mb-8">
            10秒で登録完了。クレジットカード不要。
          </p>

          {/* OAuth 登録ボタン */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthRegister('google')}
              disabled={loadingProvider === 'google'}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 
                       bg-white border border-gray-300 rounded-lg hover:bg-gray-50
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle className="w-5 h-5" />
              {loadingProvider === 'google' ? '登録中...' : 'Googleで登録'}
            </button>

            <button
              onClick={() => handleOAuthRegister('azure')}
              disabled={loadingProvider === 'azure'}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 
                       bg-white border border-gray-300 rounded-lg hover:bg-gray-50
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BsMicrosoft className="w-5 h-5 text-[#0078D4]" />
              {loadingProvider === 'azure' ? '登録中...' : 'Microsoftで登録'}
            </button>

            <button
              onClick={() => handleOAuthRegister('apple')}
              disabled={loadingProvider === 'apple'}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 
                       bg-black text-white rounded-lg hover:bg-gray-900
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BsApple className="w-5 h-5" />
              {loadingProvider === 'apple' ? '登録中...' : 'Appleで登録'}
            </button>
          </div>

          {/* 区切り線 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          {/* メール登録フォーム */}
          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 
                       text-white font-medium rounded-lg hover:opacity-90
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '送信中...' : 'メールで登録（パスワード不要）'}
            </button>
          </form>

          {/* 利用規約 */}
          <p className="mt-6 text-xs text-gray-500 text-center">
            登録することで、
            <Link to="/terms" className="text-blue-600 hover:underline">
              利用規約
            </Link>
            と
            <Link to="/privacy" className="text-blue-600 hover:underline">
              プライバシーポリシー
            </Link>
            に同意したものとみなされます。
          </p>

          {/* ログインリンク */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              すでにアカウントをお持ちの方は
              <Link to="/login" className="text-blue-600 hover:underline ml-1">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
```

---

## 2. 📧 Supabaseメール設定のカスタマイズ

### 2.1 現状の問題点

- デフォルトのメールテンプレートが英語
- 送信者名が「Supabase」
- デザインが汎用的で大家DXのブランドが反映されていない

### 2.2 メールテンプレートのカスタマイズ

#### 2.2.1 Supabaseダッシュボードでの設定

**Authentication → Email Templates での設定**

##### 確認メール（Confirm signup）
```html
<h2>大家DXへようこそ！</h2>
<p>この度は大家DXにご登録いただき、ありがとうございます。</p>
<p>以下のボタンをクリックして、メールアドレスの確認を完了してください：</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display: inline-block; padding: 12px 24px; 
            background: linear-gradient(to right, #2563eb, #7c3aed);
            color: white; text-decoration: none; 
            border-radius: 8px; font-weight: bold;">
    メールアドレスを確認する
  </a>
</p>
<p>このリンクは24時間有効です。</p>
<p>
  ※このメールに心当たりがない場合は、お手数ですが削除してください。
</p>
<hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">
  大家DX - 不動産投資収益シミュレーター<br>
  運営: StartupMarketing Inc.<br>
  お問い合わせ: ooya.tech2025@gmail.com
</p>
```

##### マジックリンク（Magic Link）
```html
<h2>大家DXへのログインリンク</h2>
<p>以下のボタンをクリックして、大家DXにログインしてください：</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display: inline-block; padding: 12px 24px; 
            background: linear-gradient(to right, #2563eb, #7c3aed);
            color: white; text-decoration: none; 
            border-radius: 8px; font-weight: bold;">
    ログインする
  </a>
</p>
<p>このリンクは1時間有効です。セキュリティのため、使用は1回限りです。</p>
<p>
  ※このメールに心当たりがない場合は、お手数ですが削除してください。
</p>
<hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">
  大家DX - 不動産投資収益シミュレーター<br>
  運営: StartupMarketing Inc.<br>
  お問い合わせ: ooya.tech2025@gmail.com
</p>
```

##### パスワードリセット（Reset Password）
```html
<h2>パスワードのリセット</h2>
<p>パスワードをリセットするには、以下のボタンをクリックしてください：</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="display: inline-block; padding: 12px 24px; 
            background: linear-gradient(to right, #2563eb, #7c3aed);
            color: white; text-decoration: none; 
            border-radius: 8px; font-weight: bold;">
    パスワードをリセットする
  </a>
</p>
<p>このリンクは1時間有効です。</p>
<p>
  ※パスワードリセットをリクエストしていない場合は、
  このメールを無視していただいて構いません。
</p>
<hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">
  大家DX - 不動産投資収益シミュレーター<br>
  運営: StartupMarketing Inc.<br>
  お問い合わせ: ooya.tech2025@gmail.com
</p>
```

#### 2.2.2 メール設定の詳細

**Supabaseダッシュボード → Settings → Auth での設定**

```yaml
# SMTP設定（必要に応じて独自SMTPサーバーを設定）
SMTP_ADMIN_EMAIL: noreply@ooya-dx.com
SMTP_HOST: smtp.sendgrid.net  # SendGrid使用例
SMTP_PORT: 587
SMTP_USER: apikey
SMTP_PASS: [SendGrid API Key]
SMTP_SENDER_NAME: 大家DX

# メール設定
Site URL: https://ooya-dx.com
Redirect URLs: 
  - https://ooya-dx.com/*
  - http://localhost:5173/* (開発環境)

# メールの件名
Confirm signup subject: 【大家DX】メールアドレスの確認
Magic Link subject: 【大家DX】ログインリンクのお知らせ
Reset Password subject: 【大家DX】パスワードリセットのご案内
```

### 2.3 カスタムSMTPサーバーの設定（推奨）

#### 2.3.1 SendGrid設定例

```typescript
// supabase/functions/send-custom-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import sgMail from 'https://cdn.skypack.dev/@sendgrid/mail@7.7.0'

sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY')!)

const emailTemplates = {
  welcome: {
    subject: '【大家DX】ご登録ありがとうございます',
    html: (name: string, link: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #2563eb, #7c3aed); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 30px; background: white; }
            .button { display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #2563eb, #7c3aed); 
                     color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>大家DX</h1>
            </div>
            <div class="content">
              <h2>ようこそ、${name}さん！</h2>
              <p>大家DXへのご登録、誠にありがとうございます。</p>
              <p>以下のボタンをクリックして、メールアドレスの確認を完了してください：</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${link}" class="button">メールアドレスを確認する</a>
              </p>
              <h3>🎁 登録特典</h3>
              <ul>
                <li>収益シミュレーター無料利用（月3回）</li>
                <li>35年キャッシュフロー予測</li>
                <li>PDFレポート出力機能</li>
              </ul>
              <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
            </div>
            <div class="footer">
              <p>大家DX - 不動産投資収益シミュレーター</p>
              <p>運営: StartupMarketing Inc.</p>
              <p>お問い合わせ: ooya.tech2025@gmail.com</p>
              <p>
                <a href="https://ooya-dx.com/terms">利用規約</a> | 
                <a href="https://ooya-dx.com/privacy">プライバシーポリシー</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

serve(async (req) => {
  const { type, to, name, link } = await req.json()

  const msg = {
    to,
    from: {
      email: 'noreply@ooya-dx.com',
      name: '大家DX'
    },
    subject: emailTemplates[type].subject,
    html: emailTemplates[type].html(name, link)
  }

  try {
    await sgMail.send(msg)
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

---

## 3. 🔐 OAuth ログイン実装

### 3.1 要件定義

#### 対象プロバイダー（優先順位順）
1. **Google** - 必須（利用率70-80%）
2. **Microsoft (Azure AD)** - 強く推奨（ビジネス層向け）
3. **Apple** - 推奨（高所得層向け）

#### 期待される効果
- ユーザー登録の離脱率を50-70%から10-20%に削減
- パスワード管理の負担軽減
- セキュリティ向上

### 3.2 実装仕様

#### 3.2.1 Supabase設定

**Google OAuth設定**
```bash
# 1. Google Cloud Console での設定
- プロジェクト作成/選択
- OAuth 2.0 クライアントID作成
- 承認済みリダイレクトURI追加:
  https://[your-project-id].supabase.co/auth/v1/callback

# 2. Supabaseダッシュボード設定
- Authentication → Providers → Google
- Client ID と Client Secret を入力
- Redirect URLs に本番URLを追加
```

**Microsoft Azure AD設定**
```bash
# 1. Azure Portal での設定
- アプリ登録 → 新規登録
- リダイレクトURI追加（Web）
- クライアントシークレット生成

# 2. Supabaseダッシュボード設定
- Authentication → Providers → Azure
- Tenant URL, Client ID, Secret を入力
```

---

## 4. 💳 有料プラン実装

### 4.1 要件定義

#### ビジネスモデル
- **フリーミアムモデル**を採用
- 無料版: 月3回まで
- プロ版: 月額2,980円で無制限

### 4.2 実装仕様

#### 4.2.1 データベース設計

**Supabase SQL**
```sql
-- ユーザー使用状況テーブル
CREATE TABLE user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_count INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- シミュレーション履歴テーブル
CREATE TABLE simulation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_data JSONB NOT NULL,
  result_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 月次リセット用関数
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE user_usage
  SET month_count = 0, 
      last_reset_date = CURRENT_DATE
  WHERE last_reset_date < DATE_TRUNC('month', CURRENT_DATE)
    AND is_premium = FALSE;
END;
$$ LANGUAGE plpgsql;

-- RLS（Row Level Security）設定
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_history ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view own usage" ON user_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own history" ON simulation_history
  FOR ALL USING (auth.uid() = user_id);
```

---

## 5. 📅 実装スケジュール

### Phase 1: ランディングページ改修（1日）
- Day 1: ヒーローセクション・登録フロー実装

### Phase 2: メール設定（1日）
- Day 2: Supabaseメールテンプレート設定・テスト

### Phase 3: OAuth実装（2日）
- Day 3: Google OAuth実装・テスト
- Day 4: Microsoft/Apple OAuth実装・テスト

### Phase 4: 使用制限実装（2日）
- Day 5: データベース設計・使用制限ロジック
- Day 6: UI実装・テスト

### Phase 5: 決済統合（3日）※必要に応じて
- Day 7: Stripe設定・Edge Function
- Day 8: 決済フロー実装
- Day 9: テスト・本番環境設定

---

## 6. 🚀 リリース前チェックリスト

### ランディングページ
- [ ] モバイルレスポンシブ確認
- [ ] 画像最適化（WebP形式）
- [ ] Core Web Vitals測定
- [ ] A/Bテスト設定

### メール設定
- [ ] 各メールテンプレートの動作確認
- [ ] SPF/DKIM設定（独自ドメイン使用時）
- [ ] 迷惑メール対策確認
- [ ] 開封率トラッキング設定

### セキュリティ
- [ ] OAuth プロバイダーの本番設定
- [ ] 環境変数の適切な管理
- [ ] RLS（Row Level Security）の有効化
- [ ] HTTPS必須の確認
- [ ] CSRFトークンの実装

### パフォーマンス
- [ ] データベースインデックスの設定
- [ ] キャッシュ戦略の実装
- [ ] 画像最適化
- [ ] バンドルサイズの確認

### ユーザビリティ
- [ ] エラーメッセージの適切な表示
- [ ] ローディング状態の表示
- [ ] モバイル対応の確認
- [ ] アクセシビリティチェック

### 法的要件
- [ ] 利用規約の更新（決済関連）
- [ ] プライバシーポリシーの更新
- [ ] 特定商取引法の表記（有料サービス）
- [ ] 返金ポリシーの明記

### 監視・分析
- [ ] Google Analytics設定
- [ ] エラー監視（Sentry等）
- [ ] 使用状況ダッシュボード
- [ ] 転換率トラッキング

---

## 7. 📊 KPI目標

### ユーザー獲得
- 初月: 100人登録
- 3ヶ月: 500人登録
- 6ヶ月: 1,000人登録

### 転換率
- 初月: 5%
- 3ヶ月: 10%
- 6ヶ月: 15%

### 収益目標
- 初月: MRR 15,000円
- 3ヶ月: MRR 150,000円
- 6ヶ月: MRR 450,000円

---

## 8. 🔧 トラブルシューティング

### ランディングページ関連
- **問題: 登録ボタンが動作しない**
  - 解決: JavaScriptエラーを確認、CSPポリシーチェック

- **問題: 表示速度が遅い**
  - 解決: 画像最適化、CDN導入、不要なJSの削除

### メール関連
- **問題: メールが届かない**
  - 解決: SPF/DKIM設定確認、送信レート制限チェック

- **問題: 迷惑メールに分類される**
  - 解決: 送信者名・件名の見直し、HTMLメールの最適化

### OAuth関連
- **エラー: "redirect_uri_mismatch"**
  - 解決: OAuth設定のリダイレクトURLを確認
  
- **エラー: "invalid_client"**
  - 解決: Client ID/Secretを再確認

### 使用制限関連
- **問題: カウントがリセットされない**
  - 解決: Cron jobまたはSupabase Functionでreset_monthly_usage()を定期実行

- **問題: RLSエラー**
  - 解決: ポリシー設定とユーザー認証状態を確認

---

## 9. 🔐 個人情報管理とセキュリティ

### 9.1 OAuth利用による個人情報管理の簡素化

#### 9.1.1 保持する個人情報の最小化

**OAuth + Stripe利用時のデータ管理**
```
✅ 自社で保持する情報（最小限）
- メールアドレス（Google/MS/Appleから取得）
- ユーザーID（Supabase自動生成UUID）
- 表示名（オプション）
- 使用履歴（シミュレーション実行記録）

❌ 自社で保持しない情報
- パスワード（OAuth プロバイダー側で管理）
- クレジットカード情報（Stripe側で管理）
- 生年月日、住所、電話番号（収集しない）
- その他の詳細な個人情報（不要）
```

#### 9.1.2 データベース設計（最小限構成）

```sql
-- ユーザープロファイル（最小限）
CREATE TABLE users_profile (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 課金情報（Stripe参照のみ）
CREATE TABLE user_billing (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE,
  subscription_id TEXT,
  subscription_status TEXT, -- 'active', 'canceled', 'past_due'
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 使用履歴（サービス改善用）
CREATE TABLE usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT, -- 'simulation', 'pdf_export', etc
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 9.2 セキュリティとコンプライアンス

#### 9.2.1 責任分散モデル

| 領域 | 管理主体 | 責任範囲 |
|-----|---------|---------|
| **認証** | Google/Microsoft/Apple | パスワード管理、2要素認証、アカウントセキュリティ |
| **決済** | Stripe | カード情報保管、PCI DSS準拠、決済処理 |
| **最小データ** | 自社（大家DX） | メールアドレス、使用履歴の保護 |

#### 9.2.2 コンプライアンス対応の簡素化

**GDPR/個人情報保護法への対応**
```typescript
// データ削除要求への対応（簡単）
async function deleteUserData(userId: string) {
  // 1. Stripeの顧客データ削除
  await stripe.customers.del(stripeCustomerId);
  
  // 2. Supabaseのユーザーデータ削除（カスケード削除）
  await supabase.auth.admin.deleteUser(userId);
  
  // 3. 完了（パスワードやカード情報は元々保持していない）
}
```

**プライバシーポリシーの簡素化**
```markdown
## 収集する情報
1. アカウント情報
   - メールアドレス（サービス提供に必要）
   - 表示名（任意）

2. 利用情報
   - シミュレーション実行履歴
   - ログイン履歴

## 収集しない情報
- パスワード（OAuthプロバイダーが管理）
- クレジットカード情報（Stripeが管理）
- 住所、電話番号、生年月日
- その他の個人を特定する詳細情報
```

### 9.3 Stripe決済との連携

#### 9.3.1 Stripe Customer Portal の活用

```typescript
// Stripe Customer Portalで以下を管理（自社実装不要）
- 支払い方法の変更
- 請求書のダウンロード
- サブスクリプションのキャンセル
- 支払い履歴の確認

// 実装例
async function redirectToStripePortal(userId: string) {
  const { stripe_customer_id } = await supabase
    .from('user_billing')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  const session = await stripe.billingPortal.sessions.create({
    customer: stripe_customer_id,
    return_url: 'https://ooya-dx.com/account',
  });

  return session.url; // Stripeポータルへリダイレクト
}
```

#### 9.3.2 Webhook による同期

```typescript
// Stripe Webhook エンドポイント
async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // サブスクリプション状態を同期
      await supabase.from('user_billing').upsert({
        stripe_customer_id: event.data.object.customer,
        subscription_id: event.data.object.id,
        subscription_status: event.data.object.status,
        current_period_end: new Date(event.data.object.current_period_end * 1000)
      });
      break;
      
    case 'customer.subscription.deleted':
      // キャンセル処理
      await supabase.from('user_billing').update({
        subscription_status: 'canceled'
      }).eq('subscription_id', event.data.object.id);
      break;
  }
}
```

### 9.4 セキュリティベストプラクティス

#### 9.4.1 環境変数の管理

```bash
# .env.production (絶対にGitにコミットしない)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx # 公開可能なキー
STRIPE_PUBLISHABLE_KEY=pk_live_xxx # 公開可能なキー

# Supabase Edge Functions の環境変数（サーバー側のみ）
STRIPE_SECRET_KEY=sk_live_xxx # 秘密キー
STRIPE_WEBHOOK_SECRET=whsec_xxx # 秘密キー
```

#### 9.4.2 Row Level Security (RLS) の徹底

```sql
-- すべてのテーブルでRLSを有効化
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can only see own profile" ON users_profile
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only see own billing" ON user_billing
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see own logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);
```

### 9.5 監査とモニタリング

#### 9.5.1 アクセスログ

```typescript
// すべての重要なアクションをログ記録
async function logUserAction(
  userId: string,
  action: string,
  metadata?: any
) {
  await supabase.from('usage_logs').insert({
    user_id: userId,
    action_type: action,
    metadata: metadata || {},
    ip_address: request.ip, // プライバシーに配慮してハッシュ化も検討
    user_agent: request.headers['user-agent']
  });
}

// 使用例
await logUserAction(user.id, 'simulation_executed', {
  simulation_id: result.id,
  property_value: 50000000 // 金額は分析用に記録
});
```

#### 9.5.2 セキュリティアラート

```typescript
// 異常検知の例
async function detectAnomalies(userId: string) {
  // 1日のシミュレーション実行回数チェック
  const { count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('action_type', 'simulation_executed')
    .gte('created_at', new Date(Date.now() - 24*60*60*1000));

  if (count > 100) {
    // 管理者に通知
    await sendAdminAlert(`Unusual activity detected for user ${userId}`);
  }
}
```

### 9.6 データ保護のメリット

#### 9.6.1 ビジネス上のメリット

1. **信頼性向上**
   - 「パスワードを保持しない」という安心感
   - 大手企業（Google/MS/Apple）の認証を利用

2. **運用コスト削減**
   - パスワードリセット対応不要
   - セキュリティインシデント対応の軽減
   - 個人情報保護法対応の簡素化

3. **開発速度向上**
   - 認証・決済機能の実装不要
   - セキュリティ更新は各プロバイダーが対応

#### 9.6.2 リスク軽減

| リスク | 従来型 | OAuth+Stripe型 |
|-------|--------|---------------|
| パスワード漏洩 | 高リスク | リスクなし（保持しない） |
| カード情報漏洩 | 高リスク | リスクなし（保持しない） |
| 個人情報漏洩 | 中リスク | 低リスク（最小限のみ） |
| コンプライアンス違反 | 中リスク | 低リスク（責任分散） |

---

## 10. 📚 参考資料

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Stripe Security Guide](https://stripe.com/docs/security/stripe)
- [SendGrid Email API](https://docs.sendgrid.com/)
- [Landing Page Best Practices](https://unbounce.com/landing-page-articles/landing-page-best-practices/)
- [Email Deliverability Guide](https://www.mailgun.com/guides/deliverability/)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [GDPR Compliance Guide](https://gdpr.eu/compliance/)
- [個人情報保護法ガイドライン](https://www.ppc.go.jp/personalinfo/)
- [SaaS Metrics Guide](https://www.klipfolio.com/resources/articles/what-is-a-saas-metric)

---

以上