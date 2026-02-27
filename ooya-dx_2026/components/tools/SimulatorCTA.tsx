import Link from 'next/link';

export function SimulatorCTA() {
  return (
    <section className="bg-[#eef0f2] rounded-3xl overflow-hidden">
      <div className="flex flex-col h-full">
        {/* テキストエリア */}
        <div className="pt-10 sm:pt-12 px-6 sm:px-8 pb-3 sm:pb-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#32373c] mb-3">
            不動産投資シミュレーション
            <span className="ml-2 inline-block px-2 py-0.5 bg-gray-900 text-white text-xs sm:text-sm font-bold rounded-full align-middle">
              無料
            </span>
          </h3>
          <p className="text-sm sm:text-base text-[#32373c] leading-relaxed">
            IRR・CCR・DSCR、35年キャッシュフローをワンクリックで算出。
            <br />
            物件購入の意思決定をデータで支援します。
          </p>
        </div>

        {/* 画像エリア */}
        <div className="px-6 sm:px-8 flex justify-center">
          <img
            src="/img/kakushin_img01.png"
            alt="不動産投資シミュレーション"
            className="w-4/5 h-auto rounded-lg"
          />
        </div>

        {/* ボタン */}
        <div className="p-6 sm:p-8 text-center">
          <Link
            href="/tools/simulator"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-lg sm:text-xl"
          >
            無料でシミュレーションをする
          </Link>
        </div>
      </div>
    </section>
  );
}
