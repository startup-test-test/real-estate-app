/**
 * アップグレードモーダルコンポーネント
 * 利用制限到達時に表示される課金促進モーダル
 */

import React, { useState } from 'react';
import { X, CreditCard, Check, Shield, AlertCircle, Loader2, Crown } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './AuthProvider';

// Stripe公開可能キー（環境変数から取得）
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!user) {
      setError('ログインが必要です');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Supabase Edge Functionを呼び出してCheckout Session作成
      // 現在はモックアップとしてアラート表示
      alert('決済機能は現在実装中です。\nStripe Checkout画面に遷移します。');
      
      // 実際の実装では以下のようなコードになります：
      /*
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
          userId: user.id 
        }
      });

      if (error) throw error;

      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ 
          sessionId: data.sessionId 
        });
      }
      */
      
      // デモ用：2秒後に閉じる
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Upgrade error:', err);
      setError('アップグレード処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              プレミアムプランにアップグレード
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* アラート */}
        <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                無料利用枠（月3回）を使い切りました
              </p>
              <p className="text-xs text-amber-600 mt-1">
                <span className="font-semibold">プレミアムプラン</span>で全機能を無制限にご利用いただけます
              </p>
            </div>
          </div>
        </div>

        {/* プラン詳細 */}
        <div className="p-6">
          <div className="border-2 border-purple-200 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50">
            {/* 価格 */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  <p className="text-sm text-gray-600">プレミアムプラン</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ¥2,980
                  </span>
                  <span className="text-gray-500">/月</span>
                </div>
              </div>
              <div className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                おすすめ
              </div>
            </div>

            {/* 特典リスト */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    全機能が無制限で利用可能
                  </p>
                  <p className="text-xs text-gray-500">
                    シミュレーター、分析機能など制限なし
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    新機能への早期アクセス
                  </p>
                  <p className="text-xs text-gray-500">
                    開発中の機能を先行利用
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    いつでも解約可能
                  </p>
                  <p className="text-xs text-gray-500">
                    違約金なし、日割り計算なし
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mx-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="p-6 border-t border-gray-200 space-y-3">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 
                     text-white font-medium rounded-lg hover:opacity-90 
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>処理中...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>今すぐアップグレード</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full px-6 py-2 text-gray-600 hover:text-gray-800 
                     disabled:opacity-50 transition-colors"
          >
            後で決める
          </button>
        </div>

        {/* セキュリティ表示 */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>SSL暗号化通信</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>Powered by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;