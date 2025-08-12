import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

const GoogleAuthTest: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 現在のユーザーセッションを確認
    checkUser();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      console.log('Current origin:', window.location.origin);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account'  // 毎回アカウント選択を強制
          }
        }
      });

      if (error) {
        setError(error.message);
        console.error('Error signing in with Google:', error);
      }
    } catch (error) {
      setError('予期しないエラーが発生しました');
      console.error('Unexpected error:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Unexpected error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-8">
          Google認証テスト
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            エラー: {error}
          </div>
        )}

        {!user ? (
          <div className="space-y-6">
            <p className="text-gray-600 text-center">
              Googleアカウントでログインしてください
            </p>
            
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">
                Googleでログイン
              </span>
            </button>

            <div className="text-sm text-gray-500 text-center">
              <p>環境変数の確認:</p>
              <p>OAuth有効: {import.meta.env.VITE_ENABLE_OAUTH || 'false'}</p>
              <p>Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID ? '設定済み' : '未設定'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-green-800 font-medium mb-2">
                ログイン成功！
              </p>
              <div className="text-sm text-green-700 space-y-1">
                <p>メール: {user.email}</p>
                <p>ユーザーID: {user.id}</p>
                <p>プロバイダー: {user.app_metadata.provider}</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            デバッグ情報
          </h2>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '設定済み' : '未設定'}</p>
            <p>認証状態: {user ? 'ログイン中' : '未ログイン'}</p>
            <p>現在のURL: {window.location.origin}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthTest;