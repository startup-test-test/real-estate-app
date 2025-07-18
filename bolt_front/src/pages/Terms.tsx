import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          ログインページに戻る
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">最終更新日: 2024年7月14日</p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第1条（本規約の適用）</h2>
              <p className="text-gray-700 mb-4">
                本規約は、株式会社大家DX（以下「当社」といいます）が提供する「大家DX」（以下「本サービス」といいます）の利用に関する条件を定めるものです。
                利用者は、本規約に同意した上で、本サービスを利用するものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第2条（定義）</h2>
              <p className="text-gray-700 mb-4">本規約において使用する用語の定義は、以下のとおりとします。</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>「利用者」とは、本規約に同意し、本サービスを利用する個人または法人をいいます。</li>
                <li>「本サービス」とは、当社が提供する賃貸物件管理支援サービス及びこれに関連するサービスをいいます。</li>
                <li>「登録情報」とは、利用者が本サービスの利用にあたって登録する情報をいいます。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第3条（サービスの内容）</h2>
              <p className="text-gray-700 mb-4">
                本サービスは、AIを活用した賃貸物件管理の効率化、入居者とのコミュニケーション支援、
                物件情報の管理等の機能を提供します。サービスの詳細は、当社ウェブサイトに掲載するものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第4条（利用登録）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>本サービスの利用を希望する者は、当社所定の方法により利用登録を申請するものとします。</li>
                <li>当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録を拒否することがあります。
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>本規約に違反するおそれがあると当社が判断した場合</li>
                    <li>当社に提供した登録情報に虚偽の事実が含まれる場合</li>
                    <li>その他、当社が利用登録を相当でないと判断した場合</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第5条（利用料金）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>本サービスの利用料金は、当社が別途定める料金表に従うものとします。</li>
                <li>利用者は、利用料金を当社が指定する方法により支払うものとします。</li>
                <li>一度支払われた利用料金は、理由の如何を問わず返金しないものとします。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第6条（禁止事項）</h2>
              <p className="text-gray-700 mb-4">利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当社、他の利用者、その他第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
                <li>本サービスによって得られた情報を商業的に利用する行為</li>
                <li>当社のサービスの運営を妨害するおそれのある行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
                <li>他の利用者に成りすます行為</li>
                <li>反社会的勢力等への利益供与行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第7条（本サービスの停止等）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>当社は、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                    <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                    <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                    <li>その他、当社が本サービスの提供が困難と判断した場合</li>
                  </ul>
                </li>
                <li>当社は、本サービスの提供の停止または中断により、利用者または第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第8条（著作権）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>本サービスにおいて当社が提供するコンテンツの著作権は、当社または当社にライセンスを許諾している者に帰属します。</li>
                <li>利用者は、本サービスの利用により得られる一切の情報について、当社の事前の書面による承諾を得ることなく、複製、転載、その他の利用をしてはなりません。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第9条（免責事項）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>当社は、本サービスに関して、利用者と他の利用者または第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。</li>
                <li>当社は、本サービスの提供の中断、停止、終了、利用不能または変更、利用者が本サービスに送信したメッセージまたは情報の削除または消失、利用者の登録の抹消、本サービスの利用によるデータの消失または機器の故障もしくは損傷、その他本サービスに関して利用者が被った損害につき、賠償する責任を一切負わないものとします。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第10条（個人情報の取扱い）</h2>
              <p className="text-gray-700 mb-4">
                当社は、本サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第11条（規約の変更）</h2>
              <p className="text-gray-700 mb-4">
                当社は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。
                変更後の本規約は、当社ウェブサイトに掲示された時点から効力を生じるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第12条（準拠法・裁判管轄）</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
                <li>本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。</li>
              </ol>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600">以上</p>
              <p className="text-gray-600 mt-4">株式会社大家DX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;