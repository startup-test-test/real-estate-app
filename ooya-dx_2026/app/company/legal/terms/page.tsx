import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/Breadcrumb'
import { WebPageJsonLd } from '@/components/WebPageJsonLd'

export const metadata: Metadata = {
  title: '利用規約｜大家DX',
  description: '大家DXサービスの利用規約について',
  alternates: {
    canonical: '/company/legal/terms',
  },
}

export default function TermsPage() {
  return (
    <>
      <WebPageJsonLd
        name="利用規約"
        description="大家DXサービスの利用規約について"
        path="/company/legal/terms"
        datePublished="2025-08-11"
        dateModified="2026-02-05"
        breadcrumbs={[{ name: '利用規約', href: '/company/legal/terms' }]}
      />
    <article className="mx-auto max-w-4xl px-6">
      {/* パンくず */}
      <Breadcrumb items={[
        { label: '大家DX', href: '/' },
        { label: '利用規約' },
      ]} />

      <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
        <span>公開日：2025年8月11日</span>
        <span>更新日：2026年2月5日</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>

      <div className="prose prose-gray max-w-none space-y-6">

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第1条（本規約の適用）</h2>
          <p className="text-gray-700 leading-relaxed">
            本規約は、StartupMarketing Inc.（以下「当社」といいます）が提供する「大家DX」（以下「本サービス」といいます）の利用に関する条件を定めるものです。会員は、本規約に同意した上で、本サービスを利用するものとします。本規約とその他の規約外における本サービスの説明等の内容とが異なる場合は、本規約が優先して適用されます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第2条（定義）</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            本規約において使用する用語の定義は、以下のとおりとします。
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>「会員」とは、本規約に同意し、本サービスを利用する個人または法人をいいます。</li>
            <li>「有料会員」とは、有料プランを契約している会員をいいます。</li>
            <li>「無料会員」とは、有料プランを契約していない会員をいいます。</li>
            <li>「本サービス」とは、当社が提供する不動産賃貸経営収益シミュレーションサービス及びこれに関連するサービスをいいます。</li>
            <li>「登録情報」とは、会員が本サービスの利用にあたって登録する情報をいいます。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第3条（サービスの内容）</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            本サービスは、不動産賃貸経営の収益シミュレーション、収益指標の算出、キャッシュフロー予測等の機能を提供します。本サービスは参考目的のツールであり、投資推奨を行うものではありません。サービスの詳細は、当社ウェブサイトに掲載するものとします。
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
            <p className="font-semibold text-yellow-900 mb-2">【重要免責事項】</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-900 text-sm">
              <li>本サービスは不動産賃貸経営の参考目的のシミュレーションツールです。</li>
              <li>提供する情報・分析結果は参考情報であり、将来の経営や成果事業の成功を保証するものではありません。</li>
              <li>実際の経営判断・投資判断は、宅地建物取引士・税理士等の専門家にご相談の上、必ずご自身の責任において行ってください。</li>
              <li>当社は金融商品取引業および宅地建物取引業の登録を受けておらず、特定の金融商品を推奨するものではなく、取引代理・媒介・仲介は行っておりません。</li>
              <li>不動産賃貸経営には元本割れのリスクがあり、想定通りの収益が得られない可能性があります。</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第4条（第三者への委託）</h2>
          <p className="text-gray-700 leading-relaxed">
            当社は、本サービスに関する業務の全部又は一部を第三者に委託することができます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第5条（利用登録）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>本サービスの利用を希望する者は、本規約の内容に同意の上、当社の定める情報を当社に提供することにより、当社所定の方法により利用登録を申請するものとします。</li>
            <li>会員は、前項に基づき登録した情報に変更が発生した場合、直ちに、登録情報の変更手続を行う義務を負います。会員が変更手続を怠ったことにより生じた損害について、当社は一切の責任を負いません。</li>
            <li className="mt-2">当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録を拒否することがあります。
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>本規約に違反するおそれがあると当社が判断した場合</li>
                <li>当社に提供した登録情報に虚偽の事実が含まれる場合</li>
                <li>会員が第22条（反社会的勢力の排除）に規定する反社会的勢力若しくは同条第1項各号のいずれかに該当することが判明した場合</li>
                <li>当社との間の契約、規約などに違反したことがある又は違反していることが明らかになった場合</li>
                <li>その他、当社が利用登録を相当でないと判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第6条（ユーザーID及びパスワードの管理）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>会員は、自己の責任で、本サービスに関するユーザーID及びパスワードを第三者に不正利用されないよう、厳重に管理します。</li>
            <li>ユーザーID及びパスワードを利用して行われた本サービス上の一切の行為は会員の行為とみなします。</li>
            <li>当社は、ユーザーID及びパスワードの管理不十分等によって生じた損害に関する責任を負いません。</li>
            <li>会員は、本サービス上のアカウントを第三者に対して貸与、譲渡、売買、質入、又は利用させる等の行為をすることはできません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第7条（登録事項の変更）</h2>
          <p className="text-gray-700 leading-relaxed">
            会員は、登録事項に変更があった場合、当社の定める方法により当該変更事項を遅滞なく当社に通知するものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第8条（利用料金）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>本サービスの基本機能は無料でご利用いただけます。</li>
            <li>プレミアム機能の利用料金は、当社が別途定める料金表に従うものとします。</li>
            <li>有料会員は、有料プランの利用料金を当社が指定する方法により支払うものとします。</li>
            <li>当社は、会員の同意なく、当社の裁量において本サービスの利用料金を変更することがあります。当社は利用料金を変更する前に会員へ変更を通知します。</li>
            <li>一度支払われた利用料金は、法令に基づく場合を除き、返金しないものとします。</li>
            <li>有料プランは月額制のサブスクリプションサービスであり、毎月の更新日に自動的に課金されます。</li>
            <li>有料プランの解約を希望する場合は、マイページから解約手続きを行うか、当社指定のメールアドレス（ooya.tech2025@gmail.com）にご連絡ください。解約手続き完了後も、現在の請求期間終了日まではサービスをご利用いただけます。日割り計算による返金は行いません。</li>
            <li>有料会員が、本サービスの利用料金等を所定の支払期日が過ぎてもなお支払わない場合、有料会員は、所定の支払期日の翌日から支払い日の前日までの日数に、年14.6％の利率で計算した金額を遅延損害金として支払います。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第9条（本サービスの利用期間及び退会）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>会員の利用期間は、会員が選択した当社所定の期間とします。</li>
            <li>会員は、当社所定の退会手続きを完了することにより、利用期間満了をもって本サービスを解約することができます。当該完了時点において退会手続きを行っていない会員の利用期間は、自動的に前項に定める期間と同一の期間で更新されます。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第10条（登録抹消等）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li className="mb-2">当社は、会員が、以下の各号のいずれかの事由に該当する場合は、事前に通知又は催告することなく、投稿データを削除、若しくは非表示にし、会員について本サービスの利用を一時的に停止し、又は会員としての登録を抹消することができます。
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>本契約のいずれかの条項に反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>支払停止若しくは支払不能となり、又は破産手続開始、民事再生手続開始、会社更生手続開始、特別清算開始、若しくはこれら類する手続の開始の申立てがあった場合</li>
                <li>6ヶ月以上本サービスの利用がない場合</li>
                <li>当社からの問い合わせその他の回答を求める連絡に対して14日間以上応答がない場合</li>
                <li>第5条2項各号に該当する場合</li>
                <li>その他、当社が本サービスの利用または会員としての登録の継続を適当でないと合理的に判断した場合</li>
              </ul>
            </li>
            <li>前項各号のいずれかの事由に該当した場合、会員は、当社に対して負っている債務の一切について、当然に期限の利益を失い、直ちに当社に対して全ての債務の支払を行わなければなりません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第11条（解除）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li className="mb-2">当社は、会員が以下の各号のいずれかに該当した場合、何らの通知等を要することなく、本契約を解除することができます。
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>本規約に違反したとき</li>
                <li>監督官庁により事業停止処分、又は事業免許若しくは事業登録の取消処分を受けたとき</li>
                <li>手形又は小切手が不渡となったとき、その他支払停止又は支払不能状態に至ったとき</li>
                <li>破産手続、特別清算手続、会社更生手続、民事再生手続、その他法的倒産手続開始の申立てがあったとき、若しくは私的整理が開始されたとき、又はそれらのおそれがあるとき</li>
                <li>差押え、仮差押え、仮処分、競売の申立て、租税滞納処分、その他公権力の処分を受けたとき、又はそれらのおそれがあるとき（ただし、本契約等の履行に重大な影響を与えない軽微なものは除く）</li>
                <li>当社からの連絡に対して7日間応答がないとき</li>
                <li>その他当社が不適当と判断したとき</li>
              </ul>
            </li>
            <li>第1項又は第2項の措置により退会した会員は、退会時に期限の利益を喪失し、直ちに、当社に対し負担する全ての債務を履行します。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第12条（禁止事項）</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            会員は、本サービスの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当社、他の会員、その他第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
            <li>本サービスによって得られた情報を商業的に利用する行為（当社の事前の書面による承諾を得た場合を除く）</li>
            <li>当社のサービスの運営を妨害するおそれのある行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他の会員に関する個人情報等を収集または蓄積する行為</li>
            <li>他の会員に成りすます行為</li>
            <li>反社会的勢力等への利益供与行為</li>
            <li>当社のシステムへの不正アクセス、それに伴うプログラムコードの改ざん、位置情報を故意に虚偽、通信機器の仕様その他アプリケーションを利用してのチート行為、コンピューターウィルスの頒布その他本サービスの正常な運営を妨げる行為又はその恐れのある行為</li>
            <li>当社が提供するソフトや、その他のシステムに対するリバースエンジニアリング、その他の解析行為</li>
            <li>面識のない異性との出会いを目的とした行為</li>
            <li>当社が事前に許諾しない本サービス上での宣伝、広告、勧誘、または営業行為</li>
            <li>本規約に違反する行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ol>
          <p className="text-gray-700 leading-relaxed mt-4">
            2. 前項の禁止行為に該当するか否かの判断は、当社の裁量により行うものとし、当社は判断基準について説明する義務を負いません。
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            3. 当社は、会員の行為が、第１項各号のいずれかに該当すると判断した場合、事前に通知することなく、以下の各号のいずれか又は全ての措置を講じることができます。
          </p>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
            <li>本サービスの利用制限</li>
            <li>本契約の解除による退会処分</li>
            <li>その他当社が必要と判断する行為</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-2">
            4. 前項の措置により会員に生じた損害について、当社は一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第13条（本サービスの変更・停止等）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>当社は、会員に事前に通知することなく、本サービスの内容の全部又は一部を変更又は追加することができます。ただし、当該変更又は追加によって、変更又は追加前の本サービスのすべての機能・性能が維持されることを保証するものではありません。</li>
            <li className="mb-2">当社は、以下のいずれかに該当する場合には、本サービスの利用の全部又は一部を停止又は中断することができます。この場合において、当社は会員に対して、できる限り事前に通知するよう努めます。
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>本サービスに係るコンピューター・システムの点検、保守作業又は更新作業を定期的又は緊急に行う場合</li>
                <li>コンピューター、通信回線等が事故により停止した場合</li>
                <li>地震、火災、落雷、停電、疫病、天災地変等の不可抗力により本サービスの提供又は運営が困難となった場合</li>
                <li>その他、当社が本サービスの停止又は中断が必要と合理的に判断した場合</li>
              </ul>
            </li>
            <li>当社は、会員に事前に通知することなく、本サービスの全部又は一部を終了することができます。</li>
            <li>本条により会員に生じた不利益、損害について、当社は一切の責任を負いません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第14条（著作権）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>会員は、会員が本サービスの利用を通じて当社に提供する全ての著作物（著作権法第27条及び第28条に定める権利を含みます。）について、目的を問わず、無償かつ無制限に利用できる権利を当社に対して許諾することについて同意します。</li>
            <li>会員は、方法又は形態の如何を問わず、本サービスにおいて当社から提供される全ての情報及びコンテンツ（以下総称して「当社コンテンツ」といいます。）を著作権法に定める、私的使用の範囲を超えて複製、転載、公衆送信、改変その他の利用をすることはできません。</li>
            <li>当社コンテンツに関する著作権、特許権、実用新案権、商標権、意匠権その他一切の知的財産権及びこれらの権利の登録を受ける権利（以下総称して「知的財産権」といいます。）は、当社又は当社がライセンスを受けているライセンサーに帰属し、会員には帰属しません。</li>
            <li>会員が本条の規定に違反して問題が発生した場合、会員は、自己の費用と責任において当該問題を解決するとともに、当社に何らの不利益、負担又は損害を与えないよう適切な措置を講じなければなりません。</li>
            <li>会員は、著作物となりうる掲載内容の一部について、当社並びに当社より正当に権利を取得した第三者及び当該第三者から権利を承継した者に対し、著作者人格権（公表権、氏名表示権及び同一性保持権を含みます。）を行使しません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第15条（第三者提供データの利用）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>本サービスは、国土交通省が提供する不動産情報ライブラリ（不動産取引価格情報、地価公示データ等）をはじめとする、公的機関が公開するデータを利用しています。</li>
            <li>これらの第三者提供データの著作権は、それぞれのデータ提供者に帰属します。</li>
            <li>当社は、第三者提供データの正確性、完全性、最新性、有用性等について、いかなる保証も行いません。</li>
            <li>会員は、第三者提供データを本サービスの利用目的の範囲内でのみ利用するものとし、データ提供者が定める利用条件がある場合には、これに従うものとします。</li>
          </ol>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
            <p className="font-semibold text-blue-900 mb-2">【データ出典の詳細】</p>
            <ul className="list-disc list-inside space-y-1 text-blue-900 text-sm">
              <li>本サービスは、国土交通省の不動産情報ライブラリのAPI機能を使用していますが、提供情報の最新性、正確性、完全性等が保証されたものではありません。</li>
              <li>出典：国土交通省 不動産情報ライブラリ（https://www.reinfolib.mlit.go.jp/）</li>
              <li>「不動産取引価格情報」「地価公示」「都道府県地価調査」（国土交通省 不動産情報ライブラリ）をもとに株式会社StartupMarketingが編集・加工。</li>
              <li>本アプリケーションは株式会社StartupMarketingが開発・運営しており、国土交通省が運営するものではありません。</li>
              <li>本サービスは宅地建物取引業務の代替ではありません。実務は宅地建物取引士・税理士等にご相談ください。</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第16条（損害賠償責任）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>会員は、本規約の違反又は本サービスの利用に関連して当社に損害を与えた場合、当社に発生した損害（逸失利益及び弁護士費用を含みます。）を賠償します。</li>
            <li>当社は、当社の故意又は重過失により本規約に違反して会員に損害を与えた場合、現実かつ直接に発生した通常の損害（特別損害、逸失利益、間接損害及び弁護士費用を除く。）の範囲内で、当社が会員から受領した利用料金を上限として損害を賠償します。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第17条（免責事項）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>本サービスは参考目的のシミュレーションツールであり、投資の成功を保証するものではありません。実際の投資判断は会員自身の責任で行ってください。</li>
            <li>当社は、本サービスに関して、会員と他の会員または第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。</li>
            <li>当社は、本サービスの提供の中断、停止、終了、利用不能または変更、会員が本サービスに送信したメッセージまたは情報の削除または消失、会員の登録の抹消、本サービスの利用によるデータの消失または機器の故障もしくは損傷、その他本サービスに関して会員が被った損害につき、賠償する責任を一切負わないものとします。</li>
            <li className="mb-2">前３項のほか、当社は、会員に対して、以下の各号の事項について、一切の保証をしません。
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>本サービスの内容について、その完全性、正確性及び有効性等</li>
                <li>本サービスに中断、中止その他の障害が生じないこと</li>
              </ul>
            </li>
            <li className="mb-2">当社は、以下の各号の損害について、一切の責任を負いません。
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>会員が登録情報の変更を行わなかったことにより会員に生じた損害</li>
                <li>予期しない不正アクセス等の行為により会員に生じた損害</li>
                <li>本サービスの利用に関連して会員が日本又は外国の法令に触れたことにより会員に生じた損害</li>
                <li>天災、地変、火災、ストライキ、通商停止、戦争、内乱、疫病・感染症の流行その他の不可抗力により本契約の全部又は一部に不履行が発生した場合、会員に生じた損害</li>
                <li>本サービスの利用に関し、会員が第三者との間でトラブル（本サービス内外を問いません。）になった場合、会員に生じた損害</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第18条（秘密保持）</h2>
          <p className="text-gray-700 leading-relaxed">
            会員は、本サービスに関連して、当社が会員に対して、秘密に取り扱うことを求めて開示した非公知の情報について、当社の事前の書面による承諾がある場合を除き、秘密に取り扱うものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第19条（個人情報の取扱い）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>当社は、本サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとし、会員は、このプライバシーポリシーに従って、当社が会員の会員情報を取り扱うことについて同意するものとします。</li>
            <li>当社は、会員が当社に提供した情報、データ等を、個人を特定できない形での統計的な情報として、当社の裁量で、利用及び公開することができるものとし、会員はこれに異議を唱えないものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第20条（連絡、通知）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>本サービスに関する問い合わせその他会員から当社に対する連絡又は通知、及び本規約の変更に関する通知その他当社から会員に対する連絡又は通知は、電子メールその他当社の定める方法で行うものとします。通知は、当社からの発信によってその効力が生ずるものとします。</li>
            <li>当社は、本サービスに関する会員からのお問い合わせに対して回答するよう努めますが、法令又は本規約上、当社に義務が発生する場合を除き、回答する義務を負いません。</li>
            <li>当社は、会員からのお問い合わせに回答するか否かの基準を開示する義務を負いません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第21条（地位の譲渡）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>会員は、相手方の書面による事前の承諾なく、本契約上の地位又は本規約に基づく権利若しくは義務の全部又は一部につき、第三者に対し、譲渡、移転、担保設定、その他の処分をすることはできません。</li>
            <li>当社は本サービスにかかる事業を他社に譲渡した場合には、当該事業譲渡に伴い、利用契約上の地位、本規約に基づく権利及び義務並びに会員の登録事項その他の顧客情報を当該事業譲渡の譲受人に譲渡することができるものとし、会員は、かかる譲渡につき、本項においてあらかじめ同意したものとします。なお、本項に定める事業譲渡には、通常の事業譲渡のみならず、会社分割その他事業が移転するあらゆる場合を含むものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第22条（反社会的勢力の排除）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li className="mb-2">会員は、現在、暴力団、暴力団員、暴力団員でなくなった時から5年を経過しない者、暴力団準構成員、暴力団関係企業、総会屋等、社会運動等標ぼうゴロ又は特殊知能暴力集団等、その他これらに準ずる者（以下総称して「反社会的勢力」といいます。）に該当しないこと、及び次の各号のいずれにも該当しないことを表明し、かつ将来にわたっても該当しないことを確約します。
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>反社会的勢力が経営を支配していると認められる関係を有すること</li>
                <li>反社会的勢力が経営に実質的に関与していると認められる関係を有すること</li>
                <li>自己、自社若しくは第三者の不正の利益を図る目的又は第三者に損害を加える目的をもってする等、不当に反社会的勢力を利用していると認められる関係を有すること</li>
                <li>反社会的勢力に対して資金等を提供し、又は便宜を供与する等の関与をしていると認められる関係を有すること</li>
                <li>役員又は経営に実質的に関与している者が反社会的勢力と社会的に非難されるべき関係を有すること</li>
              </ul>
            </li>
            <li className="mb-2">会員は、自ら又は第三者を利用して次の各号のいずれにも該当する行為を行わないことを確約します。
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>暴力的な要求行為</li>
                <li>法的な責任を超えた不当な要求行為</li>
                <li>取引に関して、脅迫的な言動をし、又は暴力を用いる行為</li>
                <li>風説を流布し、偽計を用い又は威力を用いて相手方の信用を毀損し、又は相手方の業務を妨害する行為</li>
                <li>その他前各号に準ずる行為</li>
              </ul>
            </li>
            <li>当社は、会員が反社会的勢力若しくは第1項各号のいずれかに該当し、若しくは前項各号のいずれかに該当する行為をし、又は第1項の規定にもとづく表明・確約に関して虚偽の申告をしたことが判明した場合には、自己の責に帰すべき事由の有無を問わず、会員に対して何らの催告をすることなく本契約を解除することができます。</li>
            <li>会員は、前項により当社が本契約を解除した場合、会員に損害が生じたとしてもこれを一切賠償する責任はないことを確認し、これを了承します。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第23条（規約の変更）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>当社は、本規約の全部又は一部を変更できます。</li>
            <li>当社は、本規約の変更を行う場合は、会員へ通知、本サービス上への表示その他当社所定の方法により会員に周知します。</li>
            <li>前項の本規約の変更の周知後に会員が本サービスを利用した場合又は当社所定の期間（期間の通知がない場合は14日）内に会員が解約の手続をとらなかった場合、当該会員は本規約の変更に同意したものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第24条（分離可能性）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>本規約のいずれかの条項又はその一部が無効又は執行不能と判断された場合であっても、当該判断は他の部分に影響を及ぼさず、本規約の残りの部分は、引き続き有効かつ執行力を有します。当社及び会員は、当該無効若しくは執行不能とされた条項又は部分の趣旨に従い、これと同等の効果を確保できるように努めるとともに修正された本規約に拘束されることに同意します。</li>
            <li>本規約のいずれかの条項又はその一部が、ある会員との関係で無効又は執行不能と判断された場合であっても、他の会員との関係における有効性等には影響を及ぼさないものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第25条（準拠法・裁判管轄）</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">第26条（お問い合わせ）</h2>
          <p className="text-gray-700 leading-relaxed">
            本規約に関するお問い合わせは、下記の窓口までお願いいたします。
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            メール: ooya.tech2025@gmail.com
          </p>
        </section>

        <section className="mt-12 pt-8 border-t">
          <p className="text-gray-600">
            以上
          </p>
          <p className="text-gray-600 mt-4">
            2025年8月11日　制定
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
