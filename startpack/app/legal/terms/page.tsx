import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 - Sample',
  description: 'Sampleサービスの利用規約について'
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
      
      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <p className="text-gray-600">
            最終更新日: 2024年1月1日
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第1条（適用）</h2>
          <p className="text-gray-700 leading-relaxed">
            本規約は、株式会社サンプル（以下「当社」）が提供するサービス（以下「本サービス」）の利用条件を定めるものです。
            ユーザーは、本規約に同意した上で、本サービスを利用するものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第2条（利用登録）</h2>
          <p className="text-gray-700 leading-relaxed">
            登録希望者が当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
            <li>登録事項に虚偽の事実がある場合</li>
            <li>本規約に違反したことがある者からの申請である場合</li>
            <li>その他、当社が利用登録を相当でないと判断した場合</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第3条（ユーザーIDおよびパスワードの管理）</h2>
          <p className="text-gray-700 leading-relaxed">
            ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
            ユーザーIDおよびパスワードが第三者によって使用されたことによって生じた損害は、当社は一切の責任を負わないものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第4条（利用料金および支払方法）</h2>
          <p className="text-gray-700 leading-relaxed">
            ユーザーは、本サービスの利用にあたり、当社が定める利用料金を、当社が指定する方法により支払うものとします。
            ユーザーが利用料金の支払を遅滞した場合、年14.6％の割合による遅延損害金を支払うものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第5条（禁止事項）</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当社、他のユーザー、その他第三者の知的財産権を侵害する行為</li>
            <li>当社のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>本サービスの運営を妨害するおそれのある行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>反社会的勢力に対して直接または間接に利益を供与する行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第6条（本サービスの提供の停止等）</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
            <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
            <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>その他、当社が本サービスの提供が困難と判断した場合</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第7条（著作権）</h2>
          <p className="text-gray-700 leading-relaxed">
            ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た文章、画像や映像等の情報のみ、本サービスを利用して投稿または編集することができるものとします。
            ユーザーが本サービスを利用して投稿した文章、画像、映像等の著作権については、当該ユーザーその他既存の権利者に留保されるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第8条（免責事項）</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
            当社は、本サービスに関してユーザーが被った損害について、過去12ヶ月間にユーザーが当社に支払った利用料金を超えて賠償する責任を負わないものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第9条（サービス内容の変更等）</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、ユーザーへの事前の通知なく、本サービスの内容を変更、追加または廃止することがあり、ユーザーはこれを承諾するものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第10条（利用規約の変更）</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、ユーザーに通知することなく、いつでも本規約を変更することができるものとします。
            変更後の本規約は、当社ウェブサイトに掲示された時点から効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第11条（退会）</h2>
          <p className="text-gray-700 leading-relaxed">
            ユーザーは、当社の定める手続きにより、本サービスから退会できるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第12条（利用制限および登録抹消）</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、ユーザーが本規約のいずれかの条項に違反した場合、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第13条（準拠法・裁判管轄）</h2>
          <p className="text-gray-700 leading-relaxed">
            本規約の解釈にあたっては、日本法を準拠法とします。
            本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
          </p>
        </section>

        <section className="mt-12 pt-8 border-t">
          <p className="text-gray-600">
            以上
          </p>
          <p className="text-gray-600 mt-4">
            株式会社サンプル<br />
            support@example.com
          </p>
        </section>
      </div>
    </main>
  )
}