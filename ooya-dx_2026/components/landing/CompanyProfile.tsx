import React from 'react';

const CompanyProfile: React.FC = () => {
  return (
    <section id="company" className="py-8 sm:py-12 lg:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            会社概要
          </h2>
        </div>
        
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-4">
            {/* 会社名 */}
            <div className="pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-4">
                <h3 className="text-sm font-semibold text-gray-600">会社名</h3>
                <p className="text-base text-gray-900">
                  <a href="https://startup-marketing.co.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                    株式会社StartupMarketing
                  </a>
                </p>
              </div>
            </div>
            
            {/* 所在地 */}
            <div className="pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-4">
                <h3 className="text-sm font-semibold text-gray-600">所在地</h3>
                <p className="text-base text-gray-900">
                  〒330-9501 埼玉県さいたま市大宮区桜木町2丁目3番地 大宮マルイ7階
                </p>
              </div>
            </div>
            
            {/* 設立 */}
            <div className="pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-4">
                <h3 className="text-sm font-semibold text-gray-600">設立</h3>
                <p className="text-base text-gray-900">2020年9月29日</p>
              </div>
            </div>
            
            {/* 資本金 */}
            <div className="pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-4">
                <h3 className="text-sm font-semibold text-gray-600">資本金</h3>
                <p className="text-base text-gray-900">9,900,000円</p>
              </div>
            </div>
            
            {/* 事業内容 */}
            <div className="pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-4">
                <h3 className="text-sm font-semibold text-gray-600">事業内容</h3>
                <p className="text-base text-gray-900">不動産DXのWeb開発、不動産賃貸業、Webコンサルティング</p>
              </div>
            </div>
            
            {/* 主要取引金融機関 */}
            <div className="pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-4">
                <h3 className="text-sm font-semibold text-gray-600">主要取引金融機関</h3>
                <ul className="text-base text-gray-900 space-y-1">
                  <li>・埼玉縣信用金庫（資金調達4回／2023–2025）</li>
                  <li>・日本政策金融公庫（資金調達2件／2023–2025）</li>
                  <li>・飯能信用金庫 / 三井住友銀行 / 楽天銀行 / SBI銀行</li>
                </ul>
              </div>
            </div>

            {/* 顧問税理士 */}
            <div className="pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-4">
                <h3 className="text-sm font-semibold text-gray-600">顧問税理士</h3>
                <p className="text-base text-gray-900">青山税理士法人</p>
              </div>
            </div>

            {/* 顧問弁護士 */}
            <div className="pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-4">
                <h3 className="text-sm font-semibold text-gray-600">顧問弁護士</h3>
                <p className="text-base text-gray-900">
                  <a href="https://it-lawyer.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                    スタートビズ法律事務所
                  </a>
                  <br />
                  <span className="text-sm text-gray-600">代表弁護士: 宮岡 遼（第一東京弁護士会）</span>
                </p>
              </div>
            </div>

            {/* 所属加盟団体 */}
            <div className="pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-4">
                <h3 className="text-sm font-semibold text-gray-600">所属加盟団体</h3>
                <ul className="text-base text-gray-900 space-y-1">
                  <li>・<a href="https://www.saitamadx.com/dx-partner/solution/348/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">埼玉県DXパートナー</a> / <a href="https://www.tokyo-cci.or.jp/shachonet/profile/2454.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">東京商工会議所</a> / <a href="https://www.amatias.com/asp/navi.asp?s_code=S0006864" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">さいたま商工会議所</a> / <a href="https://stib.jp/member/name-list/?s=StartupMarketing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">さいたま観光国際協会</a> / <a href="https://www.city.saitama.lg.jp/006/007/002/008/p062519.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">さいたま市CS・SDGsパートナーズ</a></li>
                  <li>・<a href="https://www.freelance-jp.org/talents/12828" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">一般社団法人プロフェッショナル&パラレルキャリア・フリーランス協会</a></li>
                </ul>
              </div>
            </div>
            
            {/* メディア掲載 */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-4">
                <h3 className="text-sm font-semibold text-gray-600">メディア掲載</h3>
                <ul className="text-base text-gray-900 space-y-2">
                  <li>
                    <span className="font-semibold">・2025年10月：</span>
                    【住宅新報社様】賃貸経営者向けに市場・収益を分析するAI搭載SaaS『大家DX』が掲載されました（
                    <a href="/img/住宅新聞.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      新聞掲載PDF
                    </a>
                    ・
                    <a href="https://www.jutaku-s.com/newsp/id/0000064588" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      Webメディア
                    </a>
                    ）
                  </li>
                  <li>
                    <span className="font-semibold">・2024年1月：</span>
                    <a href="https://startup-marketing.co.jp/wp-content/uploads/2024/05/akiya.png" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      【フジテレビ様】フジテレビ「イット！」にて、不動産賃貸業の空き家再生にてインタビューされました
                    </a>
                  </li>
                  <li>
                    <span className="font-semibold">・2020年5月：</span>
                    <a href="https://offers.jp/media/sidejob/workstyle/a_1862" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      【株式会社overflow様】フリーランスWebディレクターのキャリアと案件の進め方
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyProfile;