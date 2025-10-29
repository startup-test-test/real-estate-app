import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy: React.FC = () => {
  useEffect(() => {
    document.title = 'プライバシーポリシー | 大家DX';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          ログインページに戻る
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">最終更新日: 2025年8月11日</p>
            
            <section className="mb-8">
              <p className="text-gray-700 mb-4">
                StartupMarketing Inc.（以下「当社」といいます）は、当社が提供する「大家DX」（以下「本サービス」といいます）における、
                利用者の個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第1条（個人情報）</h2>
              <p className="text-gray-700 mb-4">
                「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、
                当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び
                容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報
                （個人識別情報）を指します。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第2条（個人情報の収集方法）</h2>
              <p className="text-gray-700 mb-4">
                当社は、利用者が利用登録をする際に氏名、メールアドレスなどの個人情報をお尋ねすることがあります。
                また、利用者と提携先などとの間でなされた利用者の個人情報を含む取引記録や決済に関する情報を、
                当社の提携先（情報提供元、広告主、広告配信先などを含みます。以下「提携先」といいます）などから収集することがあります。
              </p>
              <p className="text-gray-700 mb-4">
                当社は、有料プランの決済処理にStripe, Inc.（以下「Stripe」といいます）の決済サービスを利用しています。
                決済に必要な情報（クレジットカード情報等）は、Stripeのシステムを通じて直接処理され、当社のサーバーには保存されません。
                Stripeが取得する情報の取り扱いについては、Stripeのプライバシーポリシー（https://stripe.com/jp/privacy）をご確認ください。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第3条（個人情報を収集・利用する目的）</h2>
              <p className="text-gray-700 mb-4">当社が個人情報を収集・利用する目的は、以下のとおりです。</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>本サービスの提供・運営のため</li>
                <li>利用者からのお問い合わせに回答するため（本人確認を行うことを含む）</li>
                <li>利用者が利用中のサービスの新機能、更新情報、キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため</li>
                <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
                <li>利用規約に違反した利用者や、不正・不当な目的でサービスを利用しようとする利用者の特定をし、ご利用をお断りするため</li>
                <li>利用者にご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
                <li>有料サービスにおいて、利用者に利用料金を請求するため</li>
                <li>上記の利用目的に付随する目的</li>
              </ol>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
                <h3 className="font-bold text-amber-900 mb-2">【重要免責事項】</h3>
                <p className="text-sm text-amber-900">
                  本サービスは不動産賃貸経営の参考目的のシミュレーションツールです。
                  提供する情報・分析結果は参考情報であり、将来の経営や成果事業の成功を保証するものではありません。
                  実際の経営判断・投資判断は、宅地建物取引士・税理士等の専門家にご相談の上、必ずご自身の責任において行ってください。
                  当社は金融商品取引業および宅地建物取引業の登録を受けておらず、特定の金融商品を推奨するものではなく、取引代理・媒介・仲介は行っておりません。
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第3条の2（第三者提供データの利用）</h2>
              <p className="text-gray-700 mb-4">
                本サービスは、国土交通省が提供する不動産情報ライブラリのAPI機能を使用して、不動産取引価格情報、地価公示、都道府県地価調査等のデータを利用しています。
                これらのデータの取り扱いについては、以下の点にご注意ください。
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="font-bold text-blue-900 mb-2">【データ出典の詳細】</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-blue-900">
                  <li>本サービスは、国土交通省の不動産情報ライブラリのAPI機能を使用していますが、提供情報の最新性、正確性、完全性等が保証されたものではありません。</li>
                  <li>出典：<a href="https://www.reinfolib.mlit.go.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">国土交通省 不動産情報ライブラリ</a></li>
                  <li>「不動産取引価格情報」「地価公示」「都道府県地価調査」（国土交通省 不動産情報ライブラリ）をもとに株式会社StartupMarketingが編集・加工。</li>
                  <li>本アプリケーションは株式会社StartupMarketingが開発・運営しており、国土交通省が運営するものではありません。</li>
                  <li>これらのデータは統計的な分析・参考情報の提供に利用され、個人を特定する目的では使用されません。</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第4条（利用目的の変更）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。</li>
                <li>利用目的の変更を行った場合には、変更後の目的について、当社所定の方法により、利用者に通知し、または本ウェブサイト上に公表するものとします。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第5条（個人情報の第三者提供）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>当社は、次に掲げる場合を除いて、あらかじめ利用者の同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                    <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                    <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
                    <li>予め次の事項を告知あるいは公表し、かつ当社が個人情報保護委員会に届出をしたとき
                      <ul className="list-square list-inside mt-1 ml-4 space-y-1">
                        <li>利用目的に第三者への提供を含むこと</li>
                        <li>第三者に提供されるデータの項目</li>
                        <li>第三者への提供の手段または方法</li>
                        <li>本人の求めに応じて個人情報の第三者への提供を停止すること</li>
                        <li>本人の求めを受け付ける方法</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとします。
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>当社が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合</li>
                    <li>合併その他の事由による事業の承継に伴って個人情報が提供される場合</li>
                    <li>個人情報を特定の者との間で共同して利用する場合であって、その旨並びに共同して利用される個人情報の項目、共同して利用する者の範囲、利用する者の利用目的および当該個人情報の管理について責任を有する者の氏名または名称について、あらかじめ本人に通知し、または本人が容易に知り得る状態に置いた場合</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第6条（個人情報の開示）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
                    <li>当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
                    <li>その他法令に違反することとなる場合</li>
                  </ul>
                </li>
                <li>前項の定めにかかわらず、履歴情報および特性情報などの個人情報以外の情報については、原則として開示いたしません。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第7条（個人情報の訂正および削除）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>利用者は、当社の保有する自己の個人情報が誤った情報である場合には、当社が定める手続きにより、当社に対して個人情報の訂正、追加または削除（以下「訂正等」といいます）を請求することができます。</li>
                <li>当社は、利用者から前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。</li>
                <li>当社は、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは遅滞なく、これを利用者に通知します。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第8条（個人情報の利用停止等）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>当社は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下「利用停止等」といいます）を求められた場合には、遅滞なく必要な調査を行います。</li>
                <li>前項の調査結果に基づき、その請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行います。</li>
                <li>当社は、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、遅滞なく、これを利用者に通知します。</li>
                <li>前2項にかかわらず、利用停止等に多額の費用を有する場合その他利用停止等を行うことが困難な場合であって、利用者の権利利益を保護するために必要なこれに代わるべき措置をとれる場合は、この代替策を講じるものとします。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第9条（Cookie及び類似技術の使用）</h2>
              <p className="text-gray-700 mb-4">
                本サービスは、利用者の利便性向上のためCookieおよび類似の技術を使用しています。
                これにより、利用者のブラウザを識別し、サービスを効率的に提供することができます。
                利用者はブラウザの設定によりCookieの使用を拒否することができますが、その場合、本サービスの一部機能が利用できなくなる可能性があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第10条（個人情報の保存期間）</h2>
              <p className="text-gray-700 mb-4">
                当社は、個人情報を、利用目的の達成に必要な期間に限り保存します。
                具体的には、以下のとおりとします。
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>アカウント情報：退会後90日間保持した後、削除いたします。</li>
                <li>利用履歴・シミュレーションデータ：退会後90日間保持した後、削除いたします。</li>
                <li>決済情報：Stripeにより管理され、当社のサーバーには保存されません。</li>
                <li>法令により保存が義務付けられている情報については、当該法令に定める期間保存します。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第11条（プライバシーポリシーの変更）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、利用者に通知することなく、変更することができるものとします。</li>
                <li>当社が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第12条（お問い合わせ窓口）</h2>
              <p className="text-gray-700 mb-4">本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。</p>
              <div className="bg-gray-50 p-4 rounded-lg ml-4">
                <p className="text-gray-700">社名：StartupMarketing Inc.</p>
                <p className="text-gray-700">担当部署：個人情報保護管理責任者</p>
                <p className="text-gray-700">Eメールアドレス：ooya.tech2025@gmail.com</p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600">以上</p>
              <p className="text-gray-600 mt-4">StartupMarketing Inc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;