import React from 'react';
import { ExternalLink } from 'lucide-react';

const DeveloperProfile: React.FC = () => {
  return (
    <section id="developer" className="pt-8 pb-1 sm:py-8 lg:py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            開発者プロフィールと「大家DX」開発への想い
          </h2>
        </div>

        {/* メインコンテンツ - 左に写真、右にテキスト */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* 右側: テキストコンテンツ */}
            <div className="flex-1 space-y-8 text-gray-700 leading-relaxed">
              <div>
                <p className="text-lg">
                  大家DX開発者の私自身、現役の不動産投資家です。2025年9月時点で7戸の不動産を購入しており、その過程での数多くの失敗と成功が、この「大家DX」を開発する原点となりました。<a href="https://ooya.tech/media/profile/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">詳しい自己紹介と不動産投資の実績はこちら。</a>
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  「キャッシュフローが全て」と信じて疑わなかった、私の失敗談
                </h3>
                <p className="mb-4">
                  現金で物件を2戸購入して、私も多くの投資家が陥る「よくある間違い」を経験しました。
                </p>
                <p>
                  当初、私もキャッシュフロー（手残りの現金）こそが最も重要だと信じ、現金を多めに使って物件を購入していました。しかし、そのやり方では手元の現金は減る一方。「本当にこのままで良いのだろうか？」「売却する時、一体いくらの利益が残るんだろう？」という大きな不安に直面したのです。
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  書籍との出会いと、本当の「利益」の発見
                </h3>
                <p className="mb-4">
                  そこから収支計算を猛勉強する中で、一冊の本に出会いました。
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="font-medium text-gray-800 mb-2">
                    不動産投資の利益とは？「キャッシュフローだけで収益を判断しないこと」
                  </p>
                  <p className="text-sm text-gray-600">
                    出典: <a href="https://www.amazon.co.jp/Excel%E3%81%A7%E3%81%A7%E3%81%8D%E3%82%8B-%E4%B8%8D%E5%8B%95%E7%94%A3%E6%8A%95%E8%B3%87%E3%80%8C%E5%8F%8E%E7%9B%8A%E8%A8%88%E7%AE%97%E3%80%8D%E3%81%AE%E3%81%99%E3%81%B9%E3%81%A6-%E7%8E%89%E5%B7%9D%E9%99%BD%E4%BB%8B-ebook/dp/B06XXFFL13/ref=sr_1_1?__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&crid=1ZM6QGLUPRMP4&dib=eyJ2IjoiMSJ9.hwbzXDnvzRRFJgXzDZmCFBT3aF-x8FJJodhG8IpcwFQL4sjndReMYvAB_oAVttDZ5uo8HHNJv0lywNglg9IFt9H7UPWEDlwiT80J-4TDolRD1gbK80PRPBoNCfmQe0TQxD0br8CIycwm8C2B9t8Rl-w6JVHkqU2GhZogCSa-rMi74UZjGrs0MvG5s4mwt-Rx8bqHA6MzOHTWsfF-vjsbuh74xq7DHbTw7h1wOclwM9goUDZZ7nt-o9SzMgA0lYWJWj7tPe-M7wIBMLawHo824-CbX91_bZ_3tTLryBDPxKg.tVbthiOr2U5OMfUGV__nRW1a1y-BPVGvRPaGfyS3B48&dib_tag=se&keywords=%E4%B8%8D%E5%8B%95%E7%94%A3%E5%8F%8E%E6%94%AF&qid=1757325149&sprefix=%E4%B8%8D%E5%8B%95%E7%94%A3%E5%8F%8E%E6%94%AF%2Caps%2C163&sr=8-1" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">書籍『Excelでできる 不動産投資「収益計算」のすべて』著者: 玉川 陽介</a>
                  </p>
                </div>
                <p>
                  この言葉で、目が覚める思いでした。それからは物件の本当の価値（実勢評価）を正しく計算し、金融機関に融資を打診したところ、「この物件なら担保力があるのでフルローンが可能です」という回答が。結果として、3戸の物件を立て続けに自己資金をほとんど使わずにフルローンで購入することに成功しました。現金を減らさずに物件を増やし、さらに売却時にも利益が残る。この仕組みを理解した瞬間でした。
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  物件購入前の「周辺相場調査」という壁
                </h3>
                <p className="mb-4">
                  精緻なシミュレーションの重要性を理解した後、次に直面したのが「物件の周辺相場をどう調べるか」という問題でした。
                </p>
                <p className="mb-4">
                  良い物件を見つけても、「この価格は適正なのか？」「周辺の類似物件はいくらで取引されているのか？」を調べるには、SUUMOやathomeなどの不動産ポータルサイトで1件1件検索し、エクセルに手作業でまとめる必要がありました。1物件の相場を把握するだけで半日かかることも珍しくなく、複数物件を比較検討するとなると、膨大な時間を費やしていました。
                </p>
                <p>
                  しかも、ポータルサイトに掲載されているのは「売出価格」であり、実際の「成約価格」ではありません。本当に知りたいのは、類似物件が実際にいくらで取引されたかという「取引事例」なのに、それを効率的に収集・分析できるツールは見つかりませんでした。
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  既存ツールでは解決できない「もどかしさ」
                </h3>
                <p className="mb-4">
                  市場分析とシミュレーション、両方の重要性を痛感し、様々なツールを探し始めました。しかし、既存のツールでは以下のような課題がありました。
                </p>

                <h4 className="text-lg font-semibold text-gray-900 mb-2">市場分析の課題</h4>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>類似物件の取引事例を効率的に収集・分析する機能がない。</li>
                  <li>物件の周辺相場を調べるのに膨大な時間がかかる。</li>
                  <li>実際の成約価格データにアクセスできない。</li>
                </ul>

                <h4 className="text-lg font-semibold text-gray-900 mb-2">シミュレーションの課題</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>既存のスプレッドシートで計算するのは大変で、クラウドツールも中々いいのに出会えなかった。</li>
                  <li>築古戸建や大規模リフォームが必要な、複雑な物件に対応していない。</li>
                  <li>オーナーチェンジ物件を安く購入し、将来実勢価格で売却した場合のシミュレーションができない。</li>
                  <li>家賃下落や市況変動といったシナリオ分析ができない、または操作が複雑すぎる。</li>
                  <li>積算評価、収益還元評価、IRR、CCRといった複数の重要指標を、一つのツールで一元管理できない。</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  「無いなら、自分で創る」- 大家DXの誕生
                </h3>
                <p className="mb-4">
                  市場分析とシミュレーション、両方を効率的にできるツールは、世の中にありませんでした。
                </p>
                <p className="text-lg font-bold text-gray-800 mb-4">
                  それなら、自分で創るしかない。
                </p>
                <p>
                  「大家DX」は、私自身が大家として「本当に欲しかった」機能を全て詰め込んだツールです。物件住所を入力するだけで、AIが類似物件の取引事例を自動収集・分析し、周辺相場を瞬時に把握。さらに、精緻な収益シミュレーションで35年間のキャッシュフローと投資指標を一括計算。市場分析から収益予測まで、不動産投資の意思決定に必要な全てを、このツール一つで完結できます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeveloperProfile;