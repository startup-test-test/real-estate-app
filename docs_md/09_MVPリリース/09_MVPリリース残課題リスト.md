# MVP リリース残課題リスト

作成日: 2025年8月11日  
作成者: Claude Code Assistant

## 📋 概要

MVP リリースに向けた残課題の詳細仕様書と実装方法をまとめます。

---

## 1. 🔐 OAuth ログイン実装

### 1.1 要件定義

#### 対象プロバイダー（優先順位順）
1. **Google** - 必須（利用率70-80%）
2. **Microsoft (Azure AD)** - 強く推奨（ビジネス層向け）
3. **Apple** - 推奨（高所得層向け）

#### 期待される効果
- ユーザー登録の離脱率を50-70%から10-20%に削減
- パスワード管理の負担軽減
- セキュリティ向上

### 1.2 実装仕様

#### 1.2.1 Supabase設定

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

#### 1.2.2 フロントエンド実装

**`/bolt_front/src/pages/Login.tsx` の修正**
```typescript
import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft, BsApple } from 'react-icons/bs';

const Login: React.FC = () => {
  const { signInWithOAuth, signInWithMagicLink } = useAuthContext();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'azure' | 'apple') => {
    setLoadingProvider(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          scopes: provider === 'azure' ? 'email' : undefined
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`${provider}ログインに失敗しました`);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('メールアドレスを入力してください');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      toast.success('ログインリンクをメールで送信しました');
    } catch (error) {
      console.error('Magic link error:', error);
      toast.error('メール送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* OAuth ログインセクション */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => handleOAuthLogin('google')}
          disabled={loadingProvider === 'google'}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 
                     bg-white border border-gray-300 rounded-lg hover:bg-gray-50
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="w-5 h-5" />
          {loadingProvider === 'google' ? 'ログイン中...' : 'Googleでログイン'}
        </button>

        <button
          onClick={() => handleOAuthLogin('azure')}
          disabled={loadingProvider === 'azure'}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 
                     bg-white border border-gray-300 rounded-lg hover:bg-gray-50
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BsMicrosoft className="w-5 h-5 text-[#0078D4]" />
          {loadingProvider === 'azure' ? 'ログイン中...' : 'Microsoftでログイン'}
        </button>

        <button
          onClick={() => handleOAuthLogin('apple')}
          disabled={loadingProvider === 'apple'}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 
                     bg-black text-white rounded-lg hover:bg-gray-900
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BsApple className="w-5 h-5" />
          {loadingProvider === 'apple' ? 'ログイン中...' : 'Appleでサインイン'}
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

      {/* マジックリンク */}
      <div className="space-y-4">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleMagicLink}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '送信中...' : 'メールでログイン（パスワード不要）'}
        </button>
      </div>
    </div>
  );
};
```

### 1.3 検証方法

#### 1.3.1 単体テスト
```typescript
// __tests__/auth.test.ts
describe('OAuth Authentication', () => {
  test('Google OAuth redirect', async () => {
    const { result } = renderHook(() => useAuthContext());
    await act(async () => {
      await result.current.signInWithOAuth('google');
    });
    expect(window.location.href).toContain('accounts.google.com');
  });

  test('Microsoft OAuth redirect', async () => {
    const { result } = renderHook(() => useAuthContext());
    await act(async () => {
      await result.current.signInWithOAuth('azure');
    });
    expect(window.location.href).toContain('login.microsoftonline.com');
  });
});
```

#### 1.3.2 E2Eテスト項目
1. 各OAuthプロバイダーでのログイン成功
2. キャンセル時の適切な処理
3. エラー時のメッセージ表示
4. リダイレクト後のセッション確立
5. ログアウト処理

#### 1.3.3 本番環境チェックリスト
- [ ] 各プロバイダーのClient ID/Secret設定
- [ ] リダイレクトURL設定（本番URL）
- [ ] HTTPS必須の確認
- [ ] CSP（Content Security Policy）設定
- [ ] Rate limiting設定

---

## 2. 💳 有料プラン実装

### 2.1 要件定義

#### ビジネスモデル
- **フリーミアムモデル**を採用
- 無料版: 月3回まで
- プロ版: 月額2,980円で無制限

#### 期待される効果
- 初月100人獲得で転換率10%の場合: MRR 29,800円
- 6ヶ月後500人で転換率15%の場合: MRR 223,500円

### 2.2 実装仕様

#### 2.2.1 データベース設計

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

#### 2.2.2 使用制限チェック実装

**`/bolt_front/src/hooks/useUsageLimit.ts`**
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';

interface UsageData {
  monthCount: number;
  isPremium: boolean;
  remainingCount: number;
  canSimulate: boolean;
}

export const useUsageLimit = () => {
  const { user } = useAuthContext();
  const [usage, setUsage] = useState<UsageData>({
    monthCount: 0,
    isPremium: false,
    remainingCount: 3,
    canSimulate: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      // ユーザー使用状況を取得または作成
      let { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // レコードが存在しない場合は作成
        const { data: newData, error: insertError } = await supabase
          .from('user_usage')
          .insert([{ user_id: user.id }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        data = newData;
      }

      if (data) {
        const remaining = data.is_premium ? Infinity : Math.max(0, 3 - data.month_count);
        setUsage({
          monthCount: data.month_count,
          isPremium: data.is_premium,
          remainingCount: remaining,
          canSimulate: data.is_premium || data.month_count < 3
        });
      }
    } catch (error) {
      console.error('Usage fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async () => {
    if (!user || usage.isPremium) return true;

    try {
      const { error } = await supabase
        .from('user_usage')
        .update({ 
          month_count: usage.monthCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setUsage(prev => ({
        ...prev,
        monthCount: prev.monthCount + 1,
        remainingCount: Math.max(0, prev.remainingCount - 1),
        canSimulate: prev.isPremium || prev.monthCount + 1 < 3
      }));

      return true;
    } catch (error) {
      console.error('Usage increment error:', error);
      return false;
    }
  };

  return { usage, loading, incrementUsage, refetchUsage: fetchUsage };
};
```

#### 2.2.3 シミュレーター画面での制限表示

**`/bolt_front/src/pages/Simulator.tsx` の修正**
```typescript
import { useUsageLimit } from '../hooks/useUsageLimit';

const Simulator: React.FC = () => {
  const { usage, loading: usageLoading, incrementUsage } = useUsageLimit();
  
  // 使用制限表示コンポーネント
  const UsageLimitBanner = () => {
    if (usage.isPremium) {
      return (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              <span className="font-medium">プロプラン</span>
            </div>
            <span className="text-sm">無制限でご利用いただけます</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`p-4 rounded-lg mb-4 ${
        usage.remainingCount > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              今月の残り回数: {usage.remainingCount}/3回
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {usage.remainingCount === 0 
                ? 'プロプランで無制限にご利用いただけます' 
                : 'フリープランでは月3回までご利用可能です'}
            </p>
          </div>
          {usage.remainingCount === 0 && (
            <Link
              to="/premium-plan"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 
                         text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              プロプランを見る
            </Link>
          )}
        </div>
      </div>
    );
  };

  const handleSimulation = async () => {
    // 使用制限チェック
    if (!usage.canSimulate) {
      toast.error('今月の無料利用回数を超えました。プロプランへのアップグレードをご検討ください。');
      navigate('/premium-plan');
      return;
    }

    // 使用回数をインクリメント
    const success = await incrementUsage();
    if (!success) {
      toast.error('エラーが発生しました');
      return;
    }

    // シミュレーション実行
    await runSimulation();
  };

  return (
    <div className="p-6">
      <UsageLimitBanner />
      {/* 既存のシミュレーター UI */}
    </div>
  );
};
```

### 2.3 Stripe決済統合（Phase 2）

#### 2.3.1 Stripe設定
```bash
# 環境変数設定
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
```

#### 2.3.2 Supabase Edge Function
```typescript
// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  try {
    const { user_id, email } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: Deno.env.get('STRIPE_PRICE_ID'),
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/premium-plan`,
      metadata: {
        user_id,
      },
      customer_email: email,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### 2.4 検証方法

#### 2.4.1 使用制限テスト
```typescript
// __tests__/usage-limit.test.ts
describe('Usage Limit', () => {
  test('Free user can simulate 3 times', async () => {
    const { usage, incrementUsage } = renderHook(() => useUsageLimit());
    
    expect(usage.remainingCount).toBe(3);
    
    await act(async () => {
      await incrementUsage();
      await incrementUsage();
      await incrementUsage();
    });
    
    expect(usage.remainingCount).toBe(0);
    expect(usage.canSimulate).toBe(false);
  });

  test('Premium user has unlimited access', async () => {
    // Premium user mock
    const { usage } = renderHook(() => useUsageLimit());
    
    expect(usage.isPremium).toBe(true);
    expect(usage.canSimulate).toBe(true);
    expect(usage.remainingCount).toBe(Infinity);
  });
});
```

#### 2.4.2 月次リセットテスト
```sql
-- 月次リセット動作確認
SELECT reset_monthly_usage();
SELECT * FROM user_usage WHERE is_premium = FALSE;
-- month_count が 0 にリセットされていることを確認
```

#### 2.4.3 決済フローテスト（Stripe）
1. テストカード: 4242 4242 4242 4242
2. 成功ケース・失敗ケースの確認
3. Webhook受信確認
4. サブスクリプション状態更新確認

---

## 3. 📅 実装スケジュール

### Phase 1: OAuth実装（2日）
- Day 1: Google OAuth実装・テスト
- Day 2: Microsoft/Apple OAuth実装・テスト

### Phase 2: 使用制限実装（2日）
- Day 3: データベース設計・使用制限ロジック
- Day 4: UI実装・テスト

### Phase 3: 決済統合（3日）※必要に応じて
- Day 5: Stripe設定・Edge Function
- Day 6: 決済フロー実装
- Day 7: テスト・本番環境設定

---

## 4. 🚀 リリース前チェックリスト

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

## 5. 📊 KPI目標

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

## 6. 🔧 トラブルシューティング

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

### 決済関連
- **問題: Webhook受信できない**
  - 解決: Stripe CLIでローカルテスト、本番URLの設定確認

---

## 7. 📚 参考資料

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Stripe Subscription Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [OAuth 2.0 Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [SaaS Metrics Guide](https://www.klipfolio.com/resources/articles/what-is-a-saas-metric)

---

以上