import type { Metadata } from 'next'
import { WebPageJsonLd } from '@/components/WebPageJsonLd'

export const metadata: Metadata = {
  title: 'プライバシーポリシー｜大家DX',
  description: '大家DXサービスのプライバシーポリシーについて',
  alternates: {
    canonical: '/legal/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <>
      <WebPageJsonLd
        name="プライバシーポリシー"
        description="大家DXサービスのプライバシーポリシーについて"
        path="/legal/privacy"
        datePublished="2025-08-11"
        dateModified="2026-02-05"
        breadcrumbs={[{ name: 'プライバシーポリシー', href: '/legal/privacy' }]}
      />
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* パンくず */}
      <nav className="text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-primary-600">ホーム</a>
        <span className="mx-2">&gt;</span>
        <span>プライバシーポリシー</span>
      </nav>

      <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
        <span>公開日：2025年8月11日</span>
        <span>更新日：2026年2月5日</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <p className="text-gray-700 leading-relaxed">
            株式会社StartupMarketing（以下「当社」といいます。）は、当社の提供するサービス（以下「本サービス」といいます。）における、ユーザーについての個人情報を含む利用者情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. 収集する利用者情報及び収集方法</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            本ポリシーにおいて、「利用者情報」とは、ユーザーの識別に係る情報、通信サービス上の行動履歴、その他ユーザーまたはユーザーの端末に関連して生成または蓄積された情報であって、本ポリシーに基づき当社が収集するものを意味するものとします。本サービスにおいて当社が収集する利用者情報は、その収集方法に応じて、以下のようなものとなります。
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">(1) ユーザーからご提供いただく情報</h3>
          <p className="text-gray-700 leading-relaxed mb-2">
            本サービスを利用するために、または本サービスの利用を通じてユーザーからご提供いただく情報は以下のとおりです。
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>氏名、生年月日、性別、職業等プロフィールに関する情報</li>
            <li>メールアドレス、電話番号、住所等連絡先に関する情報</li>
            <li>クレジットカード情報、銀行口座情報、電子マネー情報等決済手段に関する情報</li>
            <li>本サービスへのアクセス状況、本サービス上での購買履歴</li>
            <li>入力フォームその他当社が定める方法を通じてユーザーが入力または送信する情報</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">(2) 他のサービスとの連携により提供いただく情報</h3>
          <p className="text-gray-700 leading-relaxed mb-2">
            ユーザーが、本サービスを利用するにあたり、ソーシャルネットワーキングサービス等の他のサービスとの連携を許可した場合には、その許可の際にご同意いただいた内容に基づき、以下の情報を当該外部サービスから収集します。
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>当該外部サービスでユーザーが利用するID</li>
            <li>その他当該外部サービスのプライバシー設定によりユーザーが連携先に開示を認めた情報</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">(3) 当社が収集する情報</h3>
          <p className="text-gray-700 leading-relaxed mb-2">
            当社は、本サービスへのアクセス状況やそのご利用方法に関する情報を収集することがあります。これには以下の情報が含まれます。
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>リファラ</li>
            <li>IPアドレス</li>
            <li>サーバーアクセスログに関する情報</li>
            <li>Cookie、ADID、IDFAその他の識別子（以下「Cookie等」といいます。）</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">(4) 個別同意に基づいて収集する情報</h3>
          <p className="text-gray-700 leading-relaxed">
            当社は、ユーザーが個別に同意した場合、位置情報を利用中の端末から収集します。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. 利用目的</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            本サービスのサービス提供にかかわる利用者情報の具体的な利用目的は以下のとおりです。
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>本サービスに関する登録の受付、本人確認、ユーザー認証、ユーザー設定の記録、利用料金の決済計算等本サービスの提供、維持、保護及び改善のため</li>
            <li>ユーザーのトラフィック測定及び行動測定のため</li>
            <li>本サービス内で表示される生成物を生成するため</li>
            <li>取得した閲覧履歴や購買履歴等の情報を分析して、趣味・嗜好に応じた新商品・サービスに関する広告の配信及び表示のため</li>
            <li>ユーザーに対する商品の品質やサービスの向上を目的としたアンケート調査に付随する諸対応のため</li>
            <li>商品購入者の確認、間違いの是正のため</li>
            <li>本サービスに関するご案内、お問い合わせ等への対応のため</li>
            <li>本サービスに関する当社の規約、ポリシー等（以下「規約等」といいます。）に違反する行為に対する対応のため</li>
            <li>本ポリシー記載の方法による、第三者に対する提供のため</li>
            <li>本サービスに関する規約等の変更などを通知するため</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. 提携先及び情報収集モジュール提供者への提供</h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">(1) 提携先によるCookie等の利用</h3>
          <p className="text-gray-700 leading-relaxed">
            本サービスでは、提携先がCookie等を利用して利用者情報を蓄積及び利用している場合があります。
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">(2) 情報収集モジュール</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            本サービスには以下の情報収集モジュールが組み込まれています。
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">ア. Google Analytics</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>情報収集モジュール提供者：Google Inc.</li>
              <li>提供される利用者情報の項目：本アプリケーション訪問回数、滞在時間、閲覧ページ数、画面遷移等</li>
              <li>提供の手段・方法：Google Inc.へ本情報収集モジュールが自動送信します</li>
              <li>利用目的：本アプリの機能評価、改善及びマーケティング分析のために当社で利用します</li>
              <li>第三者提供の有無：第三者には提供しておりません</li>
              <li>プライバシーポリシー：<a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/privacy?hl=ja</a></li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">イ. Stripe</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>情報収集モジュール提供者：Stripe, Inc.</li>
              <li>提供される利用者情報の項目：メールアドレス、ユーザーが登録に使用した会員名、フォーム入力していただくクレジットカード情報、当社がユーザーを管理するために利用しているID</li>
              <li>提供の手段・方法：Stripe,Inc.の提供するAPIを利用して送信します</li>
              <li>利用目的：当社のサービスの有料コンテンツ購入の決済処理実施、及び有料プラン利用時の毎月の定期決済処理実施</li>
              <li>第三者提供の有無：無（決済処理、法的要請、不正防止、サービス提供に必要な場合を除く）</li>
              <li>プライバシーポリシー：<a href="https://stripe.com/jp/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://stripe.com/jp/privacy</a></li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">ウ. HubSpot</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>情報収集モジュール提供者：HubSpot, Inc.</li>
              <li>提供される利用者情報の項目：メールアドレス、氏名、フォーム入力情報、本サービスへのアクセス状況、閲覧ページ、滞在時間等</li>
              <li>提供の手段・方法：HubSpot, Inc.の提供するトラッキングコード及びAPIを利用して送信します</li>
              <li>利用目的：顧客管理（CRM）、マーケティング分析、メール配信、お問い合わせ対応のために当社で利用します</li>
              <li>第三者提供の有無：無（法的要請、サービス提供に必要な場合を除く）</li>
              <li>プライバシーポリシー：<a href="https://legal.hubspot.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://legal.hubspot.com/privacy-policy</a></li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">エ. Neon</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>情報収集モジュール提供者：Neon, Inc.</li>
              <li>提供される利用者情報の項目：メールアドレス、パスワード（暗号化）、ユーザーID、シミュレーション入力データ、アカウント情報</li>
              <li>提供の手段・方法：Neon, Inc.の提供するデータベースサービス及び認証サービス（Neon Auth）を利用して送信・保存します</li>
              <li>利用目的：ユーザー認証、アカウント管理、シミュレーションデータの保存のために当社で利用します</li>
              <li>第三者提供の有無：無（法的要請、サービス提供に必要な場合を除く）</li>
              <li>データ保存先：シンガポール（AWS ap-southeast-1）</li>
              <li>プライバシーポリシー：<a href="https://neon.tech/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://neon.tech/privacy</a></li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">オ. Resend</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>情報収集モジュール提供者：Resend, Inc.</li>
              <li>提供される利用者情報の項目：メールアドレス、メール送信内容</li>
              <li>提供の手段・方法：Resend, Inc.の提供するAPIを利用して送信します</li>
              <li>利用目的：お問い合わせ受付確認メール、システム通知メールの送信のために当社で利用します</li>
              <li>第三者提供の有無：無（法的要請、サービス提供に必要な場合を除く）</li>
              <li>プライバシーポリシー：<a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://resend.com/legal/privacy-policy</a></li>
            </ul>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">(3) 提供先の所在国</h3>
          <p className="text-gray-700 leading-relaxed mb-2">
            提供先には、お客様のお住まいの国または地域以外の国または地域にある委託先、グループ会社などの第三者を含みます。提供先の事業者の所在国または地域は以下のとおりです。
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>米国、英国および欧州経済領域</li>
            <li>シンガポール（Neonデータベースサーバー所在地）</li>
            <li>欧州委員会が十分な保護水準を確保していると認定している国または地域</li>
            <li>APECによる越境個人情報保護に係る枠組み（CBPRシステム）の加盟国</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-2">
            これら提供先の第三者が所在する国または地域のパーソナルデータの保護に関する制度の情報は「<a href="https://www.ppc.go.jp/enforcement/infoprovision/laws/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">諸外国・地域の法制度</a>」をご覧ください。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. 第三者提供</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li className="mb-2">当社は、利用者情報のうち、個人情報については、あらかじめユーザーの同意を得ないで、第三者に提供しません。ただし、次に掲げる必要があり第三者に提供する場合はこの限りではありません。
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>当社が利用目的の達成に必要な範囲内において、個人情報の取扱いの全部又は一部を委託する場合</li>
                <li>合併、その他の事由による事業の承継に伴って個人情報が提供される場合</li>
                <li>第3項の定めに従って、提携先又は情報収集モジュール提供者へ個人情報が提供される場合</li>
                <li>その他、個人情報の保護に関する法律（以下、「個人情報保護法」といいます。）その他の法令認められる場合</li>
              </ul>
            </li>
            <li>当社は、個人情報を第三者に提供したときは、記録の作成及び保存を行います。</li>
            <li>当社は、第三者から個人情報の提供を受けるに際しては、必要な確認を行い、当該確認にかかる記録の作成及び保存を行うものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. 安全管理措置</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>当社は、利用者情報の漏えい、滅失または毀損の防止その他の利用者情報の安全管理のために、必要かつ適切な措置を講じています。</li>
            <li>当社は、利用者情報のうち個人情報の取扱いを第三者に委託する場合には、当社が定める委託先選定基準を満たす事業者を選定し、委託契約を締結した上で定期的に報告を受ける等の方法により、委託先事業者による個人情報の取扱いについて把握しています。</li>
            <li>当社が講じる安全管理措置の具体的な内容については、本プライバシーポリシーに記載の当社のお問合せ窓口にお問い合わせください。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. 個人情報の開示等の請求</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>当社は、ユーザーから、個人情報保護法の定めに基づき保有個人データの利用目的の通知、保有個人データまたは第三者提供の記録の開示、保有個人データの内容の訂正・追加・削除、保有個人データの利用の停止・消去・第三者提供の停止のご請求（あわせて以下「個人情報の開示等の請求」といいます。）があった場合は、ユーザーご本人からのご請求であることを確認した上で、当社所定の手続きに従い、遅滞なくこれらに対応いたします。</li>
            <li>利用目的の通知、保有個人データまたは第三者提供の記録の開示につきましては、手数料としてご請求１件に月１０００円（消費税別）をお支払いいただきます。</li>
            <li>個人情報の開示等の具体的な方法については、本プライバシーポリシー記載の当社のお問い合わせ窓口にお問い合わせ下さい。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. お問い合わせ窓口</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            本サービスに対するご意見、ご質問苦情のお申出その他利用者情報の取扱いに関するお問い合わせは、以下の窓口までお願いいたします。
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">住所：〒330-9501</p>
            <p className="text-gray-700">埼玉県さいたま市大宮区桜木町二丁目３番地大宮マルイ７階</p>
            <p className="text-gray-700">株式会社StartupMarketing</p>
            <p className="text-gray-700">代表者名：東後哲郎</p>
            <p className="text-gray-700">個人情報取扱責任者：個人情報問い合わせ係</p>
            <p className="text-gray-700">お問合せ窓口：ooya.tech2025@gmail.com</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. プライバシーポリシーの変更手続</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、必要に応じて、本ポリシーを変更します。但し、法令上ユーザーの同意が必要となるような本ポリシーの変更を行う場合、変更後の本ポリシーは、当社所定の方法で変更に同意したユーザーに対してのみ適用されるものとします。なお、当社は、本ポリシーを変更する場合には、変更後の本ポリシーの施行時期及び内容を当社のウェブサイト上での表示その他の適切な方法により周知し、またはユーザーに通知します。
          </p>
        </section>

        <section className="mt-12 pt-8 border-t">
          <p className="text-gray-600">
            以上
          </p>
          <p className="text-gray-600 mt-4">
            2025年8月11日　制定<br />
            2026年2月2日　改定（情報収集モジュールにNeon、Resendを追加）
          </p>
          <p className="text-gray-600 mt-4">
            株式会社StartupMarketing
          </p>
        </section>
      </div>
    </article>
    </>
  )
}
