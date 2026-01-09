import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: '🎯 ようこそ！賃貸経営シミュレーターへ',
    content: (
      <div className="space-y-4">
        <p>このツールでは、不動産賃貸経営の収益性を詳しく分析できます。</p>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="font-medium text-blue-900 mb-2">できること：</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• IRR、CCR、DSCR など重要指標の自動計算</li>
            <li>• 最大35年間のキャッシュフロー予測</li>
            <li>• グラフでの視覚的な収益推移確認</li>
            <li>• 詳細なPDFレポート出力</li>
          </ul>
        </div>
        <p className="text-sm text-gray-600">
          ※ このツールは参考目的のシミュレーションです。実際の購入判断は専門家にご相談ください。
        </p>
      </div>
    )
  },
  {
    title: '📝 Step 1: 物件情報を入力',
    content: (
      <div className="space-y-4">
        <p>検討中の物件情報を入力していきましょう。各セクションごとに必要な情報を入力します。</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">🏠 物件基本情報</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• 物件名・住所</li>
              <li>• 建物構造・築年数</li>
              <li>• 土地面積・建物面積</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💰 取得・初期費用</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 取得価格（土地・建物）</li>
              <li>• 諸経費・改装費</li>
              <li>• その他初期費用</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">📈 収益情報</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• 月額賃料・管理費</li>
              <li>• 空室率・家賃下落率</li>
              <li>• その他運営費用</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">🏦 借入条件</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• 借入金額・金利</li>
              <li>• 返済期間・方式</li>
              <li>• 頭金・自己資金</li>
            </ul>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">🎯 出口戦略</h4>
            <ul className="text-sm text-indigo-800 space-y-1">
              <li>• 保有年数</li>
              <li>• 売却CapRate</li>
              <li>• 想定売却価格</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">📊 税務・会計設定</h4>
            <ul className="text-sm text-gray-800 space-y-1">
              <li>• 所有形態（個人/法人）</li>
              <li>• 実効税率</li>
              <li>• 減価償却設定</li>
            </ul>
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">💡 ヒント：</span>
            各項目の右側にある「?」マークにマウスを合わせると、詳しい説明が表示されます。
          </p>
        </div>
      </div>
    )
  },
  {
    title: '🚀 Step 2: シミュレーション実行',
    content: (
      <div className="space-y-4">
        <p>「シミュレーションを実行する」ボタンをクリックして分析を開始しましょう。</p>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-center">
            <Play className="h-5 w-5 mr-2" />
            <span className="font-medium">シミュレーションを実行する</span>
          </div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">⚡ 処理時間：</span>
            通常1-3秒で完了します。詳細な計算を行っているため、少々お待ちください。
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">📌 入力値の保存：</span>
            前回入力した値は自動的に保存され、次回アクセス時に復元されます。
          </p>
        </div>
      </div>
    )
  },
  {
    title: '📊 Step 3: 結果の見方',
    content: (
      <div className="space-y-4">
        <p>シミュレーション結果では重要な収益指標とグラフが表示されます。</p>
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-3">
          <h4 className="font-medium text-amber-900 mb-2">📊 主要収益指標</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-amber-800">
            <div>
              <p className="font-medium">収益性指標：</p>
              <ul className="space-y-1 ml-2">
                <li>• 表面利回り・実質利回り</li>
                <li>• NOI利回り</li>
                <li>• FCR（総収益率）</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">収益効率指標：</p>
              <ul className="space-y-1 ml-2">
                <li>• IRR（内部収益率）</li>
                <li>• CCR（自己資金収益率）</li>
                <li>• DSCR（返済安全率）</li>
                <li>• LTV（借入比率）</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💰 キャッシュフロー</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 月間・年間手取り収益</li>
              <li>• 税引前・税引後CF</li>
              <li>• 35年間の推移グラフ</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-900 mb-2">📈 詳細分析</h4>
            <ul className="text-xs text-purple-800 space-y-1">
              <li>• 年次キャッシュフロー表</li>
              <li>• 売却時の総収益</li>
              <li>• 累積収益の推移</li>
            </ul>
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">🏆 評価基準：</span>
            各指標は色分けされ、緑（優秀）、黄（良好）、橙（注意）、赤（要改善）で評価されます。
          </p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-800">
            <span className="font-medium">💾 PDFレポート機能：</span>
            結果をPDF形式でダウンロードして、社内検討資料や記録として活用できます。
          </p>
        </div>
      </div>
    )
  }
];

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div>
            <h2 className="text-xl font-bold">{currentTutorial.title}</h2>
            <p className="text-sm text-blue-100">
              Step {currentStep + 1} of {tutorialSteps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* プログレスバー */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentTutorial.content}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft size={16} />
            <span>前へ</span>
          </button>

          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-500'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep === tutorialSteps.length - 1 ? (
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>始める</span>
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>次へ</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tutorial;