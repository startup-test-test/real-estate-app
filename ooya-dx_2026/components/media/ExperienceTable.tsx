import Link from 'next/link';

type ExperienceType = 'sale' | 'rental' | 'both';

interface ExperienceTableProps {
  type: ExperienceType;
}

const purchaseData = [
  { year: '2019年', property: '都内 新築マンション', price: '5,500万円台', fee: '0円', formula: '', point: '売主直（建設会社）のため仲介なし' },
  { year: '2023年', property: '埼玉県東部 築古戸建', price: '400万円', fee: '19.8万円', formula: '(400万×3%+6万)×1.1', point: '法改正前の400万円以下特例が適用' },
  { year: '2023年', property: '埼玉県東部 築古戸建', price: '300万円', fee: '0円', formula: '', point: '売主から直接購入' },
  { year: '2024年', property: '埼玉県 区分マンション', price: '700万円台', fee: '33万円', formula: '上限30万×1.1', point: '2024年法改正の800万円以下特例が適用' },
  { year: '2024年', property: '埼玉県 区分マンション', price: '1,000万円', fee: '39.6万円', formula: '(1,000万×3%+6万)×1.1', point: 'フルローンで購入' },
  { year: '2024年', property: 'さいたま市内 戸建', price: '1,300万円台', fee: '確認中', formula: '', point: 'フルローンで購入' },
  { year: '2025年', property: 'さいたま市内 戸建', price: '6,900万円台', fee: '約237万円', formula: '(6,900万×3%+6万)×1.1', point: 'オーバーローンに仲介手数料を含めた' },
];

const sellData = [
  { year: '2023年', property: '都内 マンション', price: '8,100万円台', fee: '約104万円', formula: '8,100万×1.5%×1.1−30万', point: '3社相見積もりで全社1.5%。さらに30万円値引き' },
];

const rentalData = [
  { property: '埼玉県東部 戸建', rent: '7.5万円', fee: '8.25万円（1ヶ月分）', point: '大家として初めての客付け' },
  { property: '埼玉県東部 戸建', rent: '6.5万円', fee: '7.15万円（1ヶ月分）', point: '' },
  { property: 'さいたま市内 戸建', rent: '確認中', fee: '確認中', point: '' },
];

export function ExperienceTable({ type }: ExperienceTableProps) {
  const showSale = type === 'sale' || type === 'both';
  const showRental = type === 'rental' || type === 'both';
  const guideUrl = '/media/brokerage/guide/';

  return (
    <div className="bg-amber-50 border border-gray-200 rounded-lg px-6 py-5 my-6">
      <p className="!text-lg !font-bold text-amber-900 !mb-4 flex items-center gap-2">
        <span>📊</span>
        {type === 'both' && '著者の実体験｜売買8回・賃貸3回で支払った仲介手数料'}
        {type === 'sale' && '著者の実体験｜売買8回で支払った仲介手数料'}
        {type === 'rental' && '著者の実体験｜賃貸3回の入居者募集で支払った仲介手数料'}
      </p>

      <Link href="/profile/" className="flex items-center gap-3 border-2 border-dashed border-blue-300 rounded-lg px-4 py-3 !mb-3 no-underline group hover:bg-white/50 transition-colors">
        <img src="/images/profile/profile.jpg" alt="東後 哲郎" className="w-20 h-20 rounded-full object-cover shrink-0" />
        <div className="min-w-0 !space-y-0">
          <p className="!text-base !font-bold text-gray-900 !mb-1 !mt-0 !leading-tight">この記事の筆者</p>
          <p className="!text-sm !font-bold text-gray-800 !mb-0 !mt-0 !leading-tight">東後 哲郎（とうご てつろう）</p>
          <p className="!text-xs text-gray-500 !mb-0 !mt-0 !leading-snug">株式会社StartupMarketing 代表取締役</p>
          <p className="!text-xs text-gray-600 !mb-0 !mt-0 !leading-snug">不動産購入実績（都内〜埼玉7軒 / 総購入額1.7億円 / 家賃収入500万円）</p>
          <p className="!text-xs text-gray-600 !mb-0 !mt-0 !leading-snug">賃貸経営者向けのツール「大家DX」の企画・開発者</p>
          <p className="!text-xs text-primary-700 !mb-0 !mt-1 !leading-snug group-hover:underline">＞＞ 詳しく自己紹介と不動産投資実績を見る</p>
        </div>
      </Link>

      <p className="text-sm text-gray-700 !mb-4">
        {type === 'both' && '2019年から7軒の不動産を購入し、1軒を売却してきました。売買は7件中5件が上限の3%で、交渉で安くなったのは8,100万円台の売却時のみ。賃貸の客付けはすべて1ヶ月分でした。'}
        {type === 'sale' && '2019年から7軒の不動産を購入し、1軒を売却してきました。売買は7件中5件が上限の3%で、交渉で安くなったのは8,100万円台の売却時のみでした。'}
        {type === 'rental' && '私は大家として複数の物件で入居者を募集してきました。賃貸の仲介手数料はすべて家賃1ヶ月分でした。'}
      </p>

      {showSale && (
        <>
          <p className="!text-base !font-bold text-gray-800 !mb-0">① 不動産を購入した時の仲介手数料</p>
          <div className="overflow-x-auto mb-4 -mt-5">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">時期</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">物件</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">購入価格</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">仲介手数料（税込）</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">著者の実体験</th>
                </tr>
              </thead>
              <tbody>
                {purchaseData.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 px-3 py-2 text-sm whitespace-nowrap">{row.year}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">{row.property}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm whitespace-nowrap">{row.price}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-bold whitespace-nowrap">{row.fee}{row.formula && <><br /><span className="font-normal text-gray-500">{row.formula}</span></>}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">{row.point}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="!text-base !font-bold text-gray-800 !mb-0 !mt-1">② 不動産を売却した時の仲介手数料</p>
          <div className="overflow-x-auto mb-4 -mt-5">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">時期</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">物件</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">売却価格</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">仲介手数料（税込）</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">著者の実体験</th>
                </tr>
              </thead>
              <tbody>
                {sellData.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 px-3 py-2 text-sm whitespace-nowrap">{row.year}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">{row.property}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm whitespace-nowrap">{row.price}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-bold whitespace-nowrap">{row.fee}{row.formula && <><br /><span className="font-normal text-gray-500">{row.formula}</span></>}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">{row.point}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showRental && (
        <>
          {type === 'both' && (
            <p className="!text-base !font-bold text-gray-800 !mb-0 !mt-1">③ 賃貸の仲介手数料（入居者募集時）</p>
          )}
          <div className="overflow-x-auto -mb-4 -mt-5">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">物件</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">家賃</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">仲介手数料（税込）</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-sm">著者の実体験</th>
                </tr>
              </thead>
              <tbody>
                {rentalData.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 px-3 py-2 text-sm">{row.property}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm whitespace-nowrap">{row.rent}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm font-bold whitespace-nowrap">{row.fee}</td>
                    <td className="border border-gray-200 px-3 py-2 text-sm">{row.point}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {type !== 'both' && (
        <p className="text-xs text-gray-500 mt-1">
          <Link href={guideUrl} className="text-primary-700 hover:underline">
            {type === 'sale' ? '賃貸の客付け実績も含めた全データはこちら →' : '売買の実績も含めた全データはこちら →'}
          </Link>
        </p>
      )}
    </div>
  );
}
