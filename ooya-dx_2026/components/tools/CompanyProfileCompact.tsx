import Link from 'next/link';

export function CompanyProfileCompact() {
  return (
    <section className="bg-gray-50 rounded-2xl p-6 sm:p-8">
      {/* 会社概要 */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">運営会社概要</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 text-sm">
            <span className="text-gray-500">会社名</span>
            <span>
              <a
                href="https://ooya.tech/company"
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                株式会社StartupMarketing
              </a>
            </span>
          </div>
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 text-sm">
            <span className="text-gray-500">所在地</span>
            <span className="text-gray-700">〒330-9501 埼玉県さいたま市大宮区桜木町2丁目3番地 大宮マルイ7階</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 text-sm">
            <span className="text-gray-500">設立</span>
            <span className="text-gray-700">2020年9月29日</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 text-sm">
            <span className="text-gray-500">資本金</span>
            <span className="text-gray-700">9,900,000円</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 text-sm">
            <span className="text-gray-500">事業内容</span>
            <span className="text-gray-700">不動産DXのWeb開発、不動産賃貸業、Webコンサルティング</span>
          </div>
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 text-sm">
            <span className="text-gray-500">主要取引金融機関</span>
            <span className="text-gray-700">
              埼玉縣信用金庫、日本政策金融公庫、飯能信用金庫、三井住友銀行、楽天銀行、SBI銀行
            </span>
          </div>
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 text-sm">
            <span className="text-gray-500">顧問弁護士</span>
            <span className="text-gray-700">
              <a
                href="https://it-lawyer.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                スタートビズ法律事務所
              </a>
              <span className="text-gray-500 text-xs ml-1">代表弁護士: 宮岡 遼（第一東京弁護士会）</span>
            </span>
          </div>
          <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 text-sm">
            <span className="text-gray-500">メディア掲載</span>
            <span className="text-gray-700">
              <a
                href="https://www.jutaku-s.com/newsp/id/0000064588"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                住宅新報社
              </a>
              、
              <a
                href="https://startup-marketing.co.jp/wp-content/uploads/2024/05/akiya.png"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                フジテレビ「イット！」
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* プロフィール */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">運営者プロフィール</h3>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <img
              src="/images/profile/profile.jpg"
              alt="東後 哲郎"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">東後 哲郎（とうご てつろう）</p>
            <p className="text-xs text-gray-500 mt-1">株式会社StartupMarketing 代表取締役　1987年 宮崎生まれ</p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              不動産購入実績（都内〜埼玉7軒 / 総購入額1.7億円 / 家賃収入500万円）
            </p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              賃貸経営者向けのツール「大家DX」の企画・開発者
            </p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              本業はWeb系の開発やマーケティングです（業界歴18年）
            </p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              保有資格：<a href="/docs/furuya-planner-certificate.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">古家再生投資プランナー[認定証]</a>
            </p>
            <Link
              href="/profile"
              className="inline-block text-sm text-blue-600 hover:text-blue-800 hover:underline mt-3"
            >
              ＞＞ 詳しく自己紹介と不動産投資実績を見る
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
