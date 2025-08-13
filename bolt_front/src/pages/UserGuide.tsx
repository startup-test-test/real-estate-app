import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Calculator,
  Building,
  TrendingUp,
  Shield,
  Zap,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MessageCircle,
  Mail
} from 'lucide-react';

const UserGuide: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // URLのハッシュを監視してFAQセクションへスクロール
  React.useEffect(() => {
    if (window.location.hash === '#faq') {
      setTimeout(() => {
        const element = document.getElementById('faq');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);
  const steps = [
    {
      id: 1,
      title: '物件情報の入力',
      description: '投資を検討している物件の基本情報を入力します',
      icon: Building,
      details: [
        '物件名・住所の入力',
        '取得価格・建物価格の設定',
        '収支条件（賃料・管理費等）の入力',
        '借入条件の設定'
      ]
    },
    {
      id: 2,
      title: 'シミュレーションの実行',
      description: '入力した条件を基に収益性を詳細に分析します',
      icon: Zap,
      details: [
        '収益還元法による投資価値の算出',
        '各種投資指標の自動計算',
        '空室率・賃料下落率を考慮した予測',
        'キャッシュフローの長期予測'
      ]
    },
    {
      id: 3,
      title: '結果の確認',
      description: '詳細な分析結果とシミュレーションを確認できます',
      icon: BarChart3,
      details: [
        'キャッシュフロー予測（最大35年）',
        '投資指標（IRR、CCR、DSCR等）',
        '市場価格との比較分析',
        '将来の売却シミュレーション'
      ]
    }
  ];

  const features = [
    {
      icon: Calculator,
      title: '収益シミュレーター',
      description: '物件の収益性と投資リスクを詳細に分析し、長期的な収支予測を行います。'
    },
    {
      icon: TrendingUp,
      title: '長期収益予測',
      description: '最大35年間のキャッシュフロー予測と、様々な売却タイミングでの収益シミュレーションが可能です。'
    },
    {
      icon: Target,
      title: '投資分析サポート（参考情報提供）',
      description: 'IRR、CCR、DSCRなどの投資指標を自動計算し、客観的な分析情報を提供します。'
    },
    {
      icon: Shield,
      title: 'リスク分析',
      description: '空室率や家賃下落率を考慮した、現実的な収益予測を提供します。'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">ご利用ガイド・よくある質問</h1>
          </div>
          <p className="text-lg text-gray-600">
            大家DXの使い方とよくある質問をまとめました。不動産投資の収益シミュレーションで、より良い投資判断をサポートします。
          </p>
        </div>


        {/* Main Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">主な機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step by Step Guide */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ご利用の流れ</h2>
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {step.id}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <Icon className="h-6 w-6 text-indigo-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8" id="faq">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">よくある質問</h2>
          
          {/* 基本的な使い方 */}
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">基本的な使い方</h3>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  {
                    question: '大家DXとは何ですか？',
                    answer: '大家DXは、不動産投資の収益シミュレーションツールです。物件情報を入力することで、キャッシュフローや投資指標を計算し、投資判断の参考情報を提供します。※本ツールは教育・参考目的であり、投資推奨ではありません。'
                  },
                  {
                    question: 'どのような物件を分析できますか？',
                    answer: '一棟アパート・マンション、区分マンション、戸建て、商業用不動産など、様々な種類の投資用不動産を分析できます。新築・中古を問わず、全国の物件に対応しています。'
                  },
                  {
                    question: '初心者でも使えますか？',
                    answer: 'はい。直感的なインターフェースと詳細なガイドにより、不動産投資初心者の方でも簡単にご利用いただけます。また、用語解説や投資指標の説明も充実しています。'
                  }
                ].map((item, index) => {
                  const globalIndex = 100 + index;
                  const isOpen = openItems.includes(globalIndex);
                  return (
                    <div key={index}>
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 pr-4">{item.question}</h4>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* シミュレーション機能について */}
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-purple-50">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">シミュレーション機能について</h3>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  {
                    question: 'シミュレーションではどのような計算を行いますか？',
                    answer: '入力された物件情報、収益情報、借入条件等を基に、IRR（内部収益率）、CCR（自己資金収益率）、キャッシュフロー等の投資指標を算出します。これらは一般的な不動産投資の計算式に基づく参考値です。'
                  },
                  {
                    question: 'シミュレーション結果の精度はどの程度ですか？',
                    answer: '過去の実績データとの照合により、高い精度を実現していますが、市場環境の変化により実際の結果と異なる場合があります。投資判断の参考としてご活用ください。'
                  },
                  {
                    question: 'シミュレーションの限界はありますか？',
                    answer: 'シミュレーションは入力値に基づく机上の計算であり、実際の市場動向、物件の個別事情、突発的な事象等は反映されません。あくまで参考情報としてご利用いただき、実際の投資判断は専門家にご相談ください。'
                  }
                ].map((item, index) => {
                  const globalIndex = 200 + index;
                  const isOpen = openItems.includes(globalIndex);
                  return (
                    <div key={index}>
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 pr-4">{item.question}</h4>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* アカウント・セキュリティ */}
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-green-50">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">アカウント・セキュリティ</h3>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  {
                    question: 'アカウントの作成は無料ですか？',
                    answer: 'はい、アカウントの作成は無料です。基本的な機能は無料プランでご利用いただけます。より高度な分析機能をご希望の場合は、有料プランをご検討ください。'
                  },
                  {
                    question: 'パスワードを忘れた場合はどうすればよいですか？',
                    answer: 'ログイン画面の「パスワードを忘れた方」リンクをクリックし、登録メールアドレスを入力してください。パスワードリセット用のメールをお送りします。'
                  },
                  {
                    question: 'データのセキュリティは大丈夫ですか？',
                    answer: 'お客様のデータは、業界標準のSSL暗号化技術により保護されています。また、定期的なセキュリティ監査を実施し、個人情報保護法に準拠した厳格な管理を行っています。'
                  }
                ].map((item, index) => {
                  const globalIndex = 300 + index;
                  const isOpen = openItems.includes(globalIndex);
                  return (
                    <div key={index}>
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 pr-4">{item.question}</h4>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 料金・プラン */}
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-orange-50">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">料金・プラン</h3>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  {
                    question: '無料プランと有料プランの違いは何ですか？',
                    answer: '無料プランでは月3件までのシミュレーション、基本的な分析機能をご利用いただけます。有料プランでは無制限のシミュレーション、詳細な市場分析、PDF出力、優先サポートなどの機能が追加されます。'
                  },
                  {
                    question: '支払い方法は何がありますか？',
                    answer: 'クレジットカード（Visa、MasterCard、JCB、American Express）、銀行振込に対応しています。法人のお客様は請求書払いも可能です。'
                  },
                  {
                    question: 'プランの変更はいつでもできますか？',
                    answer: 'はい、いつでもプランの変更が可能です。アップグレードは即座に反映され、ダウングレードは次回請求日から適用されます。'
                  }
                ].map((item, index) => {
                  const globalIndex = 400 + index;
                  const isOpen = openItems.includes(globalIndex);
                  return (
                    <div key={index}>
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 pr-4">{item.question}</h4>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
          <div className="text-center mb-6">
            <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">お探しの情報が見つかりませんか？</h2>
            <p className="text-gray-600">
              サポートチームが迅速にお答えします。お気軽にお問い合わせください。
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="text-center p-4 bg-white rounded-lg">
              <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">メールサポート</h3>
              <a 
                href="mailto:ooya.tech2025@gmail.com?subject=大家DXについてのお問い合わせ"
                className="text-blue-600 hover:text-blue-700 underline text-sm font-medium"
              >
                ooya.tech2025@gmail.com
              </a>
              <p className="text-xs text-gray-500 mt-2">ご意見やお問い合わせがある方はこちらにメールしてください</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;