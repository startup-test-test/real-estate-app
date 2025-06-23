import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  BookOpen,
  Zap,
  Shield,
  CreditCard
} from 'lucide-react';

const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: '基本的な使い方',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600',
      items: [
        {
          question: '大家DXとは何ですか？',
          answer: '大家DXは、AIを活用した不動産投資分析プラットフォームです。2億件超の不動産データを基に、物件の収益性分析、市場価格の妥当性評価、将来の収益予測などを行い、投資判断をサポートします。'
        },
        {
          question: 'どのような物件を分析できますか？',
          answer: '一棟アパート・マンション、区分マンション、戸建て、商業用不動産など、様々な種類の投資用不動産を分析できます。新築・中古を問わず、全国の物件に対応しています。'
        },
        {
          question: 'シミュレーション結果はどの程度正確ですか？',
          answer: '過去の実績データとの照合により、価格予測精度85%以上、賃料予測精度90%以上を実現しています。ただし、市場環境の急激な変化により実際の結果と異なる場合があります。'
        },
        {
          question: '初心者でも使えますか？',
          answer: 'はい。直感的なインターフェースと詳細なガイドにより、不動産投資初心者の方でも簡単にご利用いただけます。また、用語解説や投資指標の説明も充実しています。'
        }
      ]
    },
    {
      title: 'AI分析について',
      icon: Zap,
      color: 'bg-purple-50 text-purple-600',
      items: [
        {
          question: 'AI査定価格はどのように算出されますか？',
          answer: '2億件超の不動産取引データを機械学習で分析し、立地、築年数、構造、周辺環境などの要素を総合的に評価して算出しています。収益還元法とAI予測モデルを組み合わせた独自の手法を採用しています。'
        },
        {
          question: 'どのようなデータを使用していますか？',
          answer: '国土交通省の不動産取引価格情報、賃貸住宅市場レポート、人口統計データ、建築着工統計など、公的機関および民間の信頼できるデータソースを使用しています。'
        },
        {
          question: 'データはどのくらいの頻度で更新されますか？',
          answer: '市場データは月次で更新され、AI分析モデルは四半期ごとに最新のデータで再学習を行っています。これにより、常に最新の市場動向を反映した分析結果を提供しています。'
        },
        {
          question: 'AI分析の限界はありますか？',
          answer: 'AIは過去のデータに基づいて予測を行うため、前例のない市場変動や災害などの突発的な事象は予測が困難です。また、物件の個別事情（管理状況、近隣トラブルなど）は反映されません。'
        }
      ]
    },
    {
      title: 'アカウント・セキュリティ',
      icon: Shield,
      color: 'bg-green-50 text-green-600',
      items: [
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
        },
        {
          question: 'アカウントを削除したい場合は？',
          answer: 'アカウント設定画面から削除申請を行うか、サポートまでご連絡ください。削除後は、保存されたデータは完全に削除され、復旧はできませんのでご注意ください。'
        }
      ]
    },
    {
      title: '料金・プラン',
      icon: CreditCard,
      color: 'bg-orange-50 text-orange-600',
      items: [
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
        },
        {
          question: '返金はできますか？',
          answer: '月額プランは返金対象外ですが、年額プランについては30日間の返金保証を提供しています。詳細は利用規約をご確認ください。'
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">よくある質問</h1>
          </div>
          <p className="text-lg text-gray-600">
            大家DXに関するよくある質問と回答をまとめました。お探しの情報が見つからない場合は、お気軽にサポートまでお問い合わせください。
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="質問を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredFAQs.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <div key={categoryIndex} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${category.color} mr-3`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {category.items.map((item, itemIndex) => {
                    const globalIndex = categoryIndex * 100 + itemIndex;
                    const isOpen = openItems.includes(globalIndex);
                    
                    return (
                      <div key={itemIndex}>
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 pr-4">{item.question}</h3>
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                        
                        {isOpen && (
                          <div className="px-6 pb-4">
                            <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
          <div className="text-center mb-6">
            <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">お探しの情報が見つかりませんか？</h2>
            <p className="text-gray-600">
              サポートチームが迅速にお答えします。お気軽にお問い合わせください。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg">
              <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">メールサポート</h3>
              <p className="text-sm text-gray-600 mb-3">support@ooya-dx.com</p>
              <p className="text-xs text-gray-500">24時間以内に返信</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <Phone className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">電話サポート</h3>
              <p className="text-sm text-gray-600 mb-3">03-1234-5678</p>
              <p className="text-xs text-gray-500">平日 9:00-18:00</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">チャットサポート</h3>
              <p className="text-sm text-gray-600 mb-3">リアルタイム対応</p>
              <p className="text-xs text-gray-500">平日 9:00-18:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;