import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Disclaimer: React.FC = () => {
  useEffect(() => {
    document.title = '免責事項 | 大家DX';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          トップページに戻る
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">免責事項</h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">最終更新日: 2025年10月17日</p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. サービスのご利用について</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  本サービスは、不動産賃貸経営の学習および参考情報の提供を目的としたシミュレーションツールです。本サービス上で提供する情報および分析・シミュレーション結果は、お客様の経営判断を補助するための参考情報であり、特定の取引を推奨するものではなく、また将来の事業の成功や収益性を保証するものではありません。
                </p>
                <p>
                  実際の経営判断、投資判断、その他一切の意思決定は、宅地建物取引士・税理士等の専門家にご相談の上、必ずご自身の責任と判断において行ってください。本サービスの利用に起因して、利用者または第三者に何らかの損害が生じた場合であっても、当社は一切の責任を負いかねます。
                </p>
                <p>
                  当社は金融商品取引業および宅地建物取引業の登録を受けておらず、金融商品取引法に定められる「投資助言・代理業」および宅地建物取引業法に定められる「取引仲介」を行うものではありません。したがって、個別の投資助言および取引仲介は一切行っておりません。
                </p>
                <p>
                  物件の契約や税務に関する実務的なご相談は、必ず宅地建物取引士、税理士、弁護士等の有資格専門家にご自身で行ってください。
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. データの出典および正確性について</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  本サービスにおける分析・シミュレーション結果は、国土交通省の「不動産情報ライブラリ」からAPI機能を通じて取得した「不動産取引価格情報」等のデータを基に、株式会社StartupMarketingが独自のアルゴリズムを用いて編集・加工・集計したものです。
                </p>
                <p>
                  本サービスは、国土交通省の不動産情報ライブラリのAPI機能を使用しておりますが、提供される情報の最新性、正確性、完全性、信頼性、有用性等について、いかなる保証も行うものではありません。
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                  <p className="font-semibold text-blue-900 mb-2">出典：<a href="https://www.reinfolib.mlit.go.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">国土交通省 不動産情報ライブラリ</a></p>
                  <p className="text-blue-900 text-sm">https://www.reinfolib.mlit.go.jp/</p>
                </div>
                <p>
                  本サービスは、株式会社StartupMarketingが開発・運営するものであり、国土交通省が運営するものではありません。
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600">以上</p>
              <p className="text-gray-600 mt-4">株式会社StartupMarketing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
