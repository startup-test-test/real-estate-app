import Link from 'next/link';

type ExperienceType = 'sale' | 'rental' | 'both';

interface ExperienceTableProps {
  type: ExperienceType;
}

const saleData = [
  { year: '2019年', property: '都内 新築マンション（購入）', price: '5,500万円台', fee: '0円', point: '売主直（建設会社）のため仲介なし' },
  { year: '2019年', property: '都内 マンション（売却）', price: '8,100万円台', fee: '約104万円', point: '3社相見積もりで全社1.5%。さらに30万円値引き' },
  { year: '2023年', property: '埼玉県東部 築古戸建', price: '400万円', fee: '198,000円', point: '法改正前の400万円以下特例が適用' },
  { year: '2023年', property: '埼玉県東部 築古戸建', price: '300万円', fee: '0円', point: '売主から直接購入' },
  { year: '2024年', property: '埼玉県 区分マンション', price: '700万円台', fee: '330,000円', point: '2024年法改正の800万円以下特例が適用' },
  { year: '2024年', property: '埼玉県 区分マンション', price: '1,000万円', fee: '396,000円', point: 'フルローンで購入' },
  { year: '2024年', property: 'さいたま市内 戸建', price: '1,300万円台', fee: '確認中', point: 'フルローンで購入' },
  { year: '2025年', property: 'さいたま市内 戸建', price: '6,900万円台', fee: '約237万円', point: 'オーバーローンに仲介手数料を含めた' },
];

const rentalData = [
  { property: '埼玉県東部 戸建', rent: '75,000円', fee: '82,500円（1ヶ月分）', point: '大家として初めての客付け' },
  { property: '埼玉県東部 戸建', rent: '65,000円', fee: '71,500円（1ヶ月分）', point: '' },
  { property: 'さいたま市内 戸建', rent: '確認中', fee: '確認中', point: '' },
];

export function ExperienceTable({ type }: ExperienceTableProps) {
  const showSale = type === 'sale' || type === 'both';
  const showRental = type === 'rental' || type === 'both';
  const guideUrl = '/media/brokerage/guide/';

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-6 py-5 my-6">
      <p className="!text-lg !font-bold text-amber-900 !mb-4 flex items-center gap-2">
        <span>📊</span>
        {type === 'both' && '【実録】私が実際に支払った仲介手数料'}
        {type === 'sale' && '【実録】私が売買で支払った仲介手数料'}
        {type === 'rental' && '【実録】大家として支払った賃貸の仲介手数料'}
      </p>

      <p className="text-sm text-gray-700 mb-4">
        {type === 'both' && '2019年から7軒の不動産を購入し、1軒を売却してきました。すべて実際の取引に基づいた金額です。'}
        {type === 'sale' && '2019年から7軒の不動産を購入し、1軒を売却してきました。すべて実際の取引に基づいた金額です。'}
        {type === 'rental' && '私は大家として複数の物件で入居者を募集してきました。実際に支払った仲介手数料を公開します。'}
      </p>

      {showSale && (
        <>
          {type === 'both' && (
            <p className="!text-sm !font-bold text-gray-800 !mb-2">売買の仲介手数料</p>
          )}
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-100">
                  <th className="border border-amber-300 px-3 py-2 text-left font-semibold text-sm">時期</th>
                  <th className="border border-amber-300 px-3 py-2 text-left font-semibold text-sm">物件</th>
                  <th className="border border-amber-300 px-3 py-2 text-left font-semibold text-sm">売買価格</th>
                  <th className="border border-amber-300 px-3 py-2 text-left font-semibold text-sm">仲介手数料（税込）</th>
                  <th className="border border-amber-300 px-3 py-2 text-left font-semibold text-sm">ポイント</th>
                </tr>
              </thead>
              <tbody>
                {saleData.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-amber-50/50'}>
                    <td className="border border-amber-200 px-3 py-2 text-xs whitespace-nowrap">{row.year}</td>
                    <td className="border border-amber-200 px-3 py-2 text-xs">{row.property}</td>
                    <td className="border border-amber-200 px-3 py-2 text-xs whitespace-nowrap">{row.price}</td>
                    <td className="border border-amber-200 px-3 py-2 text-xs font-bold whitespace-nowrap">{row.fee}</td>
                    <td className="border border-amber-200 px-3 py-2 text-xs">{row.point}</td>
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
            <p className="!text-sm !font-bold text-gray-800 !mb-2 !mt-4">賃貸の仲介手数料（入居者募集時）</p>
          )}
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-100">
                  <th className="border border-amber-300 px-3 py-2 text-left font-semibold text-sm">物件</th>
                  <th className="border border-amber-300 px-3 py-2 text-left font-semibold text-sm">家賃</th>
                  <th className="border border-amber-300 px-3 py-2 text-left font-semibold text-sm">仲介手数料（税込）</th>
                  <th className="border border-amber-300 px-3 py-2 text-left font-semibold text-sm">ポイント</th>
                </tr>
              </thead>
              <tbody>
                {rentalData.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-amber-50/50'}>
                    <td className="border border-amber-200 px-3 py-2 text-xs">{row.property}</td>
                    <td className="border border-amber-200 px-3 py-2 text-xs whitespace-nowrap">{row.rent}</td>
                    <td className="border border-amber-200 px-3 py-2 text-xs font-bold whitespace-nowrap">{row.fee}</td>
                    <td className="border border-amber-200 px-3 py-2 text-xs">{row.point}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="text-sm text-gray-700 mt-3 mb-1">
        {showSale && '私の取引では、売買は7件中5件が上限の3%でした。交渉で安くなったのは8,100万円台の売却時のみ。高額物件ほど交渉の余地があると実感しています。'}
        {type === 'rental' && '私の経験では、賃貸の仲介手数料はすべて家賃1ヶ月分でした。0.5ヶ月分の会社は、私の周りではまだ見かけたことがありません。'}
      </p>

      {type === 'both' && showRental && (
        <p className="text-sm text-gray-700 mb-1">
          賃貸の客付けはすべて1ヶ月分でした。
        </p>
      )}

      <p className="text-xs text-gray-500 mt-3">
        <Link href="/profile/" className="text-primary-700 hover:underline">
          著者の不動産購入実績・プロフィールはこちら →
        </Link>
      </p>

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
