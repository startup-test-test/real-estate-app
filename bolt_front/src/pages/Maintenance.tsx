import React, { useEffect } from 'react';
import { AlertCircle, Mail } from 'lucide-react';

const Maintenance: React.FC = () => {
  useEffect(() => {
    document.title = 'メンテナンス中 | 大家DX';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <img
            src="/img/logo_250709_2.png"
            alt="大家DX ロゴ"
            className="h-12 sm:h-16 w-auto mx-auto mb-6"
          />
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <AlertCircle className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              メンテナンス中
            </h1>
            <p className="text-lg text-gray-600">
              現在、サービスのメンテナンスを実施しております
            </p>
            <p className="text-sm text-gray-500 mt-2">
              2025年10月29日
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              メンテナンスのお知らせ
            </h2>
            <div className="text-blue-800 space-y-3">
              <p>
                いつも大家DXをご利用いただき、誠にありがとうございます。
              </p>
              <p>
                現在、サービスの品質向上のため、システムメンテナンスを実施しております。
              </p>
              <p>
                お客様により良いサービスを提供できるよう改善作業を進めておりますので、今しばらくお待ちください。
              </p>
              <p>
                ご利用のお客様にはご不便をおかけいたしますが、何卒ご理解賜りますようお願い申し上げます。
              </p>
              <p className="text-sm mt-4 pt-4 border-t border-blue-200">
                ※ サービス再開時期につきましては、決定次第、本ページにてお知らせいたします。
              </p>
            </div>
          </div>

          {/* お問い合わせ */}
          <div className="text-center">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              お問い合わせ
            </h3>
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Mail className="h-5 w-5" />
              <a
                href="mailto:ooya.tech2025@gmail.com"
                className="hover:text-blue-700 underline transition-colors"
              >
                ooya.tech2025@gmail.com
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ご不明な点がございましたら、お気軽にお問い合わせください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
