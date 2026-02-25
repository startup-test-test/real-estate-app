import Link from 'next/link';

type ExperienceType = 'sale' | 'purchase' | 'rental' | 'both';

interface ExperienceTableProps {
  type: ExperienceType;
}

const purchaseData = [
  { year: '2019年', property: '都内 新築マンション', price: '5,500万円台', fee: '0円', formula: '', point: '売主直（建設会社）のため仲介なし' },
  { year: '2023年', property: '埼玉県東部 築古戸建', price: '400万円', fee: '19.8万円', formula: '(400万×3%+6万)×1.1', point: '法改正前の400万円以下特例が適用' },
  { year: '2023年', property: '埼玉県東部 築古戸建', price: '300万円', fee: '0円', formula: '', point: '売主から直接購入' },
  { year: '2024年', property: '埼玉県 区分マンション', price: '700万円台', fee: '33万円', formula: '上限30万×1.1', point: '2024年法改正の800万円以下特例が適用' },
  { year: '2024年', property: '埼玉県 区分マンション', price: '1,000万円', fee: '39.6万円', formula: '(1,000万×3%+6万)×1.1', point: 'フルローンで購入' },
  { year: '2024年', property: 'さいたま市内 戸建', price: '1,300万円台', fee: '約49.5万円', formula: '(1,300万×3%+6万)×1.1', point: 'フルローンで購入' },
  { year: '2025年', property: 'さいたま市内 戸建', price: '6,900万円台', fee: '約237万円', formula: '(6,900万×3%+6万)×1.1', point: 'オーバーローンに仲介手数料を含めた' },
];

const sellData = [
  { year: '2023年', property: '都内 マンション', price: '8,100万円台', fee: '91万円', formula: '', point: '3社相見積もりで全社1.5%。さらに30万円値引き' },
];

const rentalData = [
  { property: '埼玉県東部 戸建', rent: '7.5万円', fee: '8.25万円（1ヶ月分）', point: '大家として初めての客付け' },
  { property: '埼玉県東部 戸建', rent: '6.5万円', fee: '7.15万円（1ヶ月分）', point: '' },
  { property: 'さいたま市内 戸建', rent: '15万円', fee: '16.5万円（1ヶ月分）', point: '' },
];

export function ExperienceTable({ type }: ExperienceTableProps) {
  const showPurchase = type === 'purchase' || type === 'sale' || type === 'both';
  const showSell = type === 'sale' || type === 'both';
  const showRental = type === 'rental' || type === 'both';
  const guideUrl = '/media/brokerage/guide/';

  return (
    <div className="my-6">

      {showPurchase && (
        <>
          {type !== 'purchase' && <p className="!text-base !font-bold text-gray-800 !mb-0 break-words">① 不動産を購入した時の仲介手数料</p>}
          <div className="overflow-x-auto mb-4 -mt-5">
            <table className="w-full min-w-[640px] border-collapse text-sm">
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
        </>
      )}

      {showSell && (
        <>
          <p className="!text-base !font-bold text-gray-800 !mb-0 !mt-1 break-words">② 不動産を売却した時の仲介手数料</p>
          <div className="overflow-x-auto mb-4 -mt-5">
            <table className="w-full min-w-[640px] border-collapse text-sm">
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
            <p className="!text-base !font-bold text-gray-800 !mb-0 !mt-1 break-words">③ 賃貸の仲介手数料（入居者募集時）</p>
          )}
          <div className="overflow-x-auto -mb-4 -mt-5">
            <table className="w-full min-w-[640px] border-collapse text-sm">
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
            {type === 'purchase' && '売却・賃貸の実績も含めた全データはこちら →'}
            {type === 'sale' && '賃貸の客付け実績も含めた全データはこちら →'}
            {type === 'rental' && '売買の実績も含めた全データはこちら →'}
          </Link>
        </p>
      )}
    </div>
  );
}
