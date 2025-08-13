import React from 'react';

const Tokushoho: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">特定商取引法に基づく表記</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">販売業者</h2>
            <p>株式会社StartupMarketing</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">運営責任者</h2>
            <p>代表取締役　東後哲郎</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">所在地</h2>
            <p>〒330-9501 埼玉県さいたま市大宮区桜木町2丁目3番地 大宮マルイ7階</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">電話番号</h2>
            <p>050-3590-7936</p>
            <p className="text-sm text-gray-600 mt-1">※お問い合わせはメールにてお願いいたします</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">メールアドレス</h2>
            <p>ooya.tech2025@gmail.com</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">サービス名</h2>
            <p>大家DX</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">販売価格</h2>
            <div className="space-y-2">
              <div>
                <p className="font-medium">無料プラン</p>
                <p>月額 0円</p>
              </div>
              <div>
                <p className="font-medium">プレミアムプラン</p>
                <p>月額 2,980円（非課税）</p>
                <p className="text-sm text-gray-600 mt-1">※当社は免税事業者のため、消費税は発生いたしません</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">支払方法</h2>
            <p>クレジットカード決済（Stripe）</p>
            <p className="text-sm text-gray-600 mt-1">対応カード：Visa、Mastercard、American Express、JCB</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">支払時期</h2>
            <p>月額制：毎月の更新日に自動課金</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">サービスの提供時期</h2>
            <p>決済完了後、即時利用可能</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">解約方法</h2>
            <div className="space-y-2">
              <p>解約をご希望の場合は、メールにてご連絡ください。</p>
              <p className="font-medium">解約申請先メールアドレス：ooya.tech2025@gmail.com</p>
              <p className="text-sm">件名に「解約希望」と記載の上、ご登録のメールアドレスからお送りください。</p>
              <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                <li>解約手続き完了後、現在の請求期間終了まではサービスをご利用いただけます</li>
                <li>日割り計算による返金は行っておりません</li>
                <li>解約後も作成したデータは90日間保持されます</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">返品・返金について</h2>
            <p>デジタルコンテンツの性質上、サービス提供開始後の返品・返金はお受けできません。</p>
            <p className="text-sm text-gray-600 mt-1">※決済エラーや二重課金が発生した場合は、速やかにご連絡ください。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">その他</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>サービスに関する詳細は、利用規約をご確認ください</li>
              <li>個人情報の取り扱いについては、プライバシーポリシーをご確認ください</li>
              <li>当社は免税事業者です（インボイス制度未登録）</li>
            </ul>
          </section>

          <div className="mt-8 pt-6 border-t text-sm text-gray-600">
            <p>最終更新日：2025年8月13日</p>
          </div>
        </div>
      </div>
  );
};

export default Tokushoho;