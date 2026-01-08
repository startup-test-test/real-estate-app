import React, { useEffect } from 'react';
import { AlertCircle, Clock, Wrench } from 'lucide-react';

/**
 * メンテナンス画面
 * 本番環境でサービス停止中に表示する専用ページ
 */
const MaintenancePage: React.FC = () => {
  useEffect(() => {
    document.title = 'メンテナンス中 | 大家DX';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 border border-gray-200">
          {/* アイコン */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Wrench className="h-10 w-10 text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-900" />
              </div>
            </div>
          </div>

          {/* タイトル */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
            メンテナンス中
          </h1>

          <p className="text-lg text-gray-600 text-center mb-8">
            現在、サービスのメンテナンスを実施しております
          </p>

          {/* メンテナンス情報 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5 mr-3" />
              <div>
                <h2 className="text-lg font-bold text-blue-900 mb-3">
                  2025年10月29日 メンテナンスのお知らせ
                </h2>
                <div className="text-blue-800 space-y-2">
                  <p className="leading-relaxed">
                    いつも大家DXをご利用いただき、誠にありがとうございます。
                  </p>
                  <p className="leading-relaxed">
                    現在、サービスの品質向上のため、システムメンテナンスを実施しております。
                    お客様により良いサービスを提供できるよう改善作業を進めておりますので、
                    今しばらくお待ちください。
                  </p>
                  <p className="leading-relaxed">
                    ご利用のお客様にはご不便をおかけいたしますが、
                    何卒ご理解賜りますようお願い申し上げます。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* メンテナンス予定 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              メンテナンス予定
            </h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-start">
                <span className="font-semibold min-w-[100px]">開始時刻：</span>
                <span>2025年10月29日 00:00</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold min-w-[100px]">終了予定：</span>
                <span>未定（完了次第お知らせいたします）</span>
              </div>
            </div>
          </div>

          {/* サービス再開について */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-green-600" />
              サービス再開時期につきまして
            </h3>
            <p className="text-green-800 text-sm leading-relaxed">
              サービスの再開時期が決まりましたら、こちらのページにてお知らせいたします。
              お手数ですが、しばらく経ってから再度アクセスしていただきますようお願いいたします。
            </p>
          </div>

          {/* お問い合わせ */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">お問い合わせ</p>
            <a
              href="mailto:ooya.tech2025@gmail.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ooya.tech2025@gmail.com
            </a>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2025 StartupMarketing Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
