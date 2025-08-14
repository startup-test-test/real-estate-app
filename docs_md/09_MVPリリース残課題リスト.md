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

## 5. 📱 PDF保存機能のPC版対応

### 5.1 現状の問題点

- 現在のPDF保存機能がモバイル版のみ対応
- PC版での印刷・保存ができない
- ユーザビリティの低下

### 5.2 実装仕様

#### 5.2.1 PC版PDF生成の実装

**`/bolt_front/src/components/PDFGenerator.tsx` の修正**
```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const generatePDF = async (elementId: string, fileName: string = 'simulation_result.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // デバイス判定
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // モバイル版の処理（既存）
    await generateMobilePDF(element, fileName);
  } else {
    // PC版の処理（新規）
    await generateDesktopPDF(element, fileName);
  }
};

const generateDesktopPDF = async (element: HTMLElement, fileName: string) => {
  // A4サイズでPDF生成
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // ページサイズ設定
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - (margin * 2);

  // HTML要素をキャンバスに変換
  const canvas = await html2canvas(element, {
    scale: 2, // 高解像度
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  // キャンバスをPDFに追加
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let position = margin;
  let heightLeft = imgHeight;
  let pageNumber = 1;

  // 最初のページに追加
  pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
  heightLeft -= contentHeight;

  // 複数ページ対応
  while (heightLeft > 0) {
    position = heightLeft - imgHeight + margin;
    pdf.addPage();
    pageNumber++;
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= contentHeight;
  }

  // ヘッダー・フッター追加
  for (let i = 1; i <= pageNumber; i++) {
    pdf.setPage(i);
    
    // ヘッダー
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text('大家DX - 不動産投資シミュレーション結果', pageWidth / 2, 5, { align: 'center' });
    
    // フッター
    pdf.text(`${i} / ${pageNumber}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
    pdf.setFontSize(8);
    pdf.text(new Date().toLocaleDateString('ja-JP'), pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  // PDFをダウンロード
  pdf.save(fileName);
};
```

#### 5.2.2 印刷用スタイルシート

**`/bolt_front/src/styles/print.css`**
```css
@media print {
  /* 不要な要素を非表示 */
  .no-print,
  header,
  footer,
  nav,
  .sidebar,
  .action-buttons,
  .modal {
    display: none !important;
  }

  /* ページ設定 */
  @page {
    size: A4;
    margin: 15mm;
  }

  /* 印刷用スタイル */
  body {
    font-size: 12pt;
    line-height: 1.5;
    color: #000;
    background: #fff;
  }

  /* テーブルの改ページ制御 */
  table {
    page-break-inside: avoid;
  }

  /* グラフの印刷最適化 */
  .chart-container {
    page-break-inside: avoid;
    max-width: 100%;
    height: auto !important;
  }

  /* 見出しの改ページ制御 */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
  }

  /* リンクのURL表示 */
  a[href]:after {
    content: " (" attr(href) ")";
  }

  /* カラー最適化 */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

#### 5.2.3 ブラウザ印刷対応

```typescript
// 印刷ボタンの実装
const handlePrint = () => {
  // 印刷前の準備
  document.body.classList.add('printing');
  
  // 印刷ダイアログを開く
  window.print();
  
  // 印刷後のクリーンアップ
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
  }, { once: true });
};

// 印刷プレビューの最適化
const preparePrintView = () => {
  // グラフを静的画像に変換
  const charts = document.querySelectorAll('.recharts-wrapper');
  charts.forEach(async (chart) => {
    const canvas = await html2canvas(chart as HTMLElement);
    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    img.className = 'print-only';
    chart.parentNode?.insertBefore(img, chart);
  });
};
```

### 5.3 実装優先度

- **優先度**: 高
- **推定工数**: 1日
- **影響範囲**: シミュレーション結果表示画面

---

## 6. 📅 実装スケジュール

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

## 10. 📊 ユーザー行動ログ分析機能

### 10.1 要件定義

#### 目的
- ユーザーの行動パターンを理解し、サービス改善に活用
- コンバージョン率の向上
- 機能利用状況の把握
- ユーザーエクスペリエンスの最適化

#### 収集するデータ
1. **ページビュー**
   - URL
   - 滞在時間
   - リファラー
   - デバイス情報

2. **アクション**
   - ボタンクリック
   - フォーム送信
   - エラー発生
   - 機能利用（シミュレーション実行、PDF出力等）

3. **セッション情報**
   - セッション開始/終了
   - セッション時間
   - ページ遷移パス

### 10.2 実装仕様

#### 10.2.1 データベース設計

```sql
-- ユーザー行動ログテーブル
CREATE TABLE user_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'click', 'form_submit', 'error', 'simulation'
  event_name TEXT NOT NULL, -- 具体的なイベント名
  page_url TEXT NOT NULL,
  page_title TEXT,
  referrer_url TEXT,
  user_agent TEXT,
  ip_address_hash TEXT, -- プライバシー保護のためハッシュ化
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,
  screen_resolution TEXT,
  viewport_size TEXT,
  metadata JSONB, -- イベント固有のデータ
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- インデックス
  INDEX idx_user_activity_user_id (user_id),
  INDEX idx_user_activity_session_id (session_id),
  INDEX idx_user_activity_event_type (event_type),
  INDEX idx_user_activity_created_at (created_at)
);

-- セッション管理テーブル
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP DEFAULT NOW(),
  session_end TIMESTAMP,
  duration_seconds INTEGER,
  page_views_count INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  entry_page TEXT,
  exit_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_sessions_user_id (user_id),
  INDEX idx_sessions_created_at (created_at)
);

-- RLS設定
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能（プライバシー保護）
CREATE POLICY "Only admins can view activity logs" ON user_activity_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can view sessions" ON user_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

#### 10.2.2 フロントエンド実装

**`/bolt_front/src/utils/analytics.ts`**
```typescript
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import UAParser from 'ua-parser-js';
import crypto from 'crypto-js';

class AnalyticsTracker {
  private sessionId: string;
  private userId: string | null = null;
  private sessionStartTime: number;
  private lastActivityTime: number;
  private pageViewStartTime: number;
  private currentPageUrl: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.pageViewStartTime = Date.now();
    this.currentPageUrl = window.location.href;
    this.initializeTracking();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private async initializeTracking() {
    // ユーザー情報取得
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;

    // セッション開始記録
    await this.startSession();

    // ページビューイベント監視
    this.trackPageViews();

    // クリックイベント監視
    this.trackClicks();

    // エラー監視
    this.trackErrors();

    // ページ離脱監視
    this.trackPageUnload();

    // 非アクティブ監視（30分でセッション終了）
    this.trackInactivity();
  }

  private async logEvent(
    eventType: string,
    eventName: string,
    metadata?: any
  ) {
    const parser = new UAParser();
    const uaResult = parser.getResult();
    
    // IPアドレスのハッシュ化（プライバシー保護）
    const ipHash = await this.getIpAddressHash();

    const eventData = {
      user_id: this.userId,
      session_id: this.sessionId,
      event_type: eventType,
      event_name: eventName,
      page_url: window.location.href,
      page_title: document.title,
      referrer_url: document.referrer,
      user_agent: navigator.userAgent,
      ip_address_hash: ipHash,
      device_type: this.getDeviceType(),
      browser_name: uaResult.browser.name,
      browser_version: uaResult.browser.version,
      os_name: uaResult.os.name,
      os_version: uaResult.os.version,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      metadata: metadata || {}
    };

    // Supabaseに送信
    try {
      await supabase.from('user_activity_logs').insert(eventData);
    } catch (error) {
      console.error('Analytics error:', error);
    }

    // 最終アクティビティ時間更新
    this.lastActivityTime = Date.now();
  }

  private async getIpAddressHash(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return crypto.SHA256(data.ip).toString();
    } catch {
      return 'unknown';
    }
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private trackPageViews() {
    // 初回ページビュー記録
    this.logEvent('page_view', window.location.pathname, {
      time_on_page: 0
    });

    // SPAのルート変更監視
    let lastPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== lastPath) {
        // 前ページの滞在時間を記録
        const timeOnPage = Date.now() - this.pageViewStartTime;
        this.logEvent('page_leave', lastPath, {
          time_on_page: Math.round(timeOnPage / 1000)
        });

        // 新ページビュー記録
        lastPath = window.location.pathname;
        this.pageViewStartTime = Date.now();
        this.logEvent('page_view', lastPath);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private trackClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // 重要な要素のクリックのみ記録
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.classList.contains('clickable') ||
        target.closest('button') ||
        target.closest('a')
      ) {
        const element = target.closest('button') || target.closest('a') || target;
        const eventName = element.getAttribute('data-analytics') || 
                         element.textContent?.trim().substring(0, 50) || 
                         'unknown';
        
        this.logEvent('click', eventName, {
          element_type: element.tagName.toLowerCase(),
          element_id: element.id,
          element_classes: element.className,
          element_href: (element as HTMLAnchorElement).href
        });
      }
    });
  }

  private trackErrors() {
    window.addEventListener('error', (e) => {
      this.logEvent('error', 'javascript_error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        column: e.colno,
        stack: e.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.logEvent('error', 'unhandled_promise_rejection', {
        reason: e.reason
      });
    });
  }

  private trackPageUnload() {
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - this.pageViewStartTime;
      const sessionDuration = Date.now() - this.sessionStartTime;
      
      // ビーコンAPIで非同期送信（ページ離脱時でも送信される）
      navigator.sendBeacon('/api/analytics/page-leave', JSON.stringify({
        session_id: this.sessionId,
        time_on_page: Math.round(timeOnPage / 1000),
        session_duration: Math.round(sessionDuration / 1000)
      }));
    });
  }

  private trackInactivity() {
    let inactivityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        this.endSession();
      }, 30 * 60 * 1000); // 30分
    };

    // ユーザーアクティビティ監視
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();
  }

  private async startSession() {
    const utm = new URLSearchParams(window.location.search);
    
    await supabase.from('user_sessions').insert({
      id: this.sessionId,
      user_id: this.userId,
      entry_page: window.location.href,
      utm_source: utm.get('utm_source'),
      utm_medium: utm.get('utm_medium'),
      utm_campaign: utm.get('utm_campaign')
    });
  }

  private async endSession() {
    const sessionDuration = Math.round((Date.now() - this.sessionStartTime) / 1000);
    
    await supabase.from('user_sessions').update({
      session_end: new Date().toISOString(),
      duration_seconds: sessionDuration,
      exit_page: window.location.href
    }).eq('id', this.sessionId);
  }

  // パブリックメソッド
  public trackCustomEvent(eventName: string, metadata?: any) {
    this.logEvent('custom', eventName, metadata);
  }

  public trackSimulation(simulationData: any) {
    this.logEvent('simulation', 'simulation_executed', {
      property_price: simulationData.propertyPrice,
      loan_amount: simulationData.loanAmount,
      rental_income: simulationData.rentalIncome,
      irr: simulationData.results?.irr,
      ccr: simulationData.results?.ccr
    });
  }

  public trackPdfExport(simulationId: string) {
    this.logEvent('export', 'pdf_generated', {
      simulation_id: simulationId
    });
  }

  public trackFormSubmission(formName: string, formData?: any) {
    this.logEvent('form_submit', formName, {
      form_data: formData // 個人情報は除外
    });
  }
}

// シングルトンインスタンス
const analytics = new AnalyticsTracker();
export default analytics;
```

#### 10.2.3 使用例

```typescript
// pages/Simulator.tsx
import analytics from '../utils/analytics';

// シミュレーション実行時
const handleSimulation = async () => {
  const result = await runSimulation(formData);
  
  // 行動ログ記録
  analytics.trackSimulation({
    ...formData,
    results: result
  });
};

// PDF出力時
const handlePdfExport = () => {
  generatePdf(simulationData);
  
  // 行動ログ記録
  analytics.trackPdfExport(simulationId);
};

// カスタムイベント
analytics.trackCustomEvent('premium_plan_viewed', {
  plan_name: 'Pro',
  price: 2980
});
```

#### 10.2.4 管理画面での分析

```typescript
// Admin Dashboard用のクエリ例
const getAnalytics = async (dateRange: DateRange) => {
  // ページビュー数
  const { data: pageViews } = await supabase
    .from('user_activity_logs')
    .select('*', { count: 'exact' })
    .eq('event_type', 'page_view')
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  // ユニークユーザー数
  const { data: uniqueUsers } = await supabase
    .from('user_activity_logs')
    .select('user_id')
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  // 平均セッション時間
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('duration_seconds')
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  return {
    totalPageViews: pageViews?.length || 0,
    uniqueUsers: new Set(uniqueUsers?.map(u => u.user_id)).size,
    avgSessionDuration: sessions?.reduce((acc, s) => acc + s.duration_seconds, 0) / sessions?.length || 0
  };
};
```

### 10.3 プライバシー配慮

- IPアドレスはハッシュ化して保存
- 個人を特定できる情報は最小限に
- GDPRに準拠したデータ削除機能
- オプトアウト機能の提供

### 10.4 実装優先度

**Phase 1（必須）**
- 基本的なページビュー記録
- シミュレーション実行記録

**Phase 2（推奨）**
- クリックイベント記録
- エラー記録
- セッション管理

**Phase 3（オプション）**
- カスタムイベント
- A/Bテスト統合
- リアルタイムダッシュボード

---

## 11. 📚 参考資料

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