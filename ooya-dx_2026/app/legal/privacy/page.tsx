import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー - Sample',
  description: 'Sampleサービスのプライバシーポリシーについて'
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
      
      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <p className="text-gray-700 leading-relaxed">
            株式会社サンプル（以下、「当社」といいます。）は、本ウェブサイト上で提供するサービス（以下「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第1条（個人情報）</h2>
          <p className="text-gray-700 leading-relaxed">
            本ポリシーにおいて、「個人情報」とは、個人に関する情報であり、当該情報に含まれる氏名、生年月日、その他の記述等により特定の個人を識別できる情報を指します。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第2条（個人情報の収集方法）</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、ユーザーが利用登録をする際に氏名、メールアドレス等の個人情報をお尋ねすることがあります。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第3条（個人情報を収集・利用する目的）</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            当社が個人情報を収集・利用する目的は、以下のとおりです。
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>当社サービスの提供・運営のため</li>
            <li>ユーザーからのお問い合わせに対応するため</li>
            <li>ユーザーにメールマガジン等を送付するため</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第4条（利用目的の変更）</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、利用目的を変更する場合には、変更後の目的について、変更前の目的との関連性を考慮し、その関連性に従い、新たな利用目的を公表するものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第5条（個人情報の第三者提供）</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、ユーザーから個人情報を受領した場合、第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第6条（個人情報の開示）</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、ユーザーから個人情報の開示を求められた場合、本人確認を行った上で、速やかに開示します。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第7条（個人情報の訂正および削除）</h2>
          <p className="text-gray-700 leading-relaxed">
            ユーザーは、当社の保有する自己の個人情報が誤った情報である場合には、当社が定める手続きにより、当社に対して個人情報の訂正または削除を請求することができます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第8条（個人情報の保護）</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、個人情報の保護について、個人情報保護法その他の関連法令を遵守し、個人情報を保護します。
          </p>
        </section>

        <section className="mt-12 pt-8 border-t">
          <p className="text-gray-600">
            以上
          </p>
        </section>
      </div>
    </main>
  )
}