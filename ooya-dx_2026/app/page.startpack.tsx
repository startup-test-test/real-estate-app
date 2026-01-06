import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sample - サブスクリプション型SaaS',
  description: 'チームでの効率的なプロジェクト管理を実現するサブスクリプション型SaaSサービス'
}

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
        {/* Geometric background patterns */}
        <div className="absolute inset-0">
          <svg className="absolute w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style={{stopColor:'rgba(59, 130, 246, 0.3)', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'rgba(59, 130, 246, 0)', stopOpacity:0}} />
              </radialGradient>
              <radialGradient id="grad2" cx="50%" cy="50%" r="40%">
                <stop offset="0%" style={{stopColor:'rgba(147, 51, 234, 0.2)', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'rgba(147, 51, 234, 0)', stopOpacity:0}} />
              </radialGradient>
            </defs>
            <circle cx="200" cy="300" r="300" fill="url(#grad1)" className="animate-pulse" />
            <circle cx="800" cy="200" r="250" fill="url(#grad2)" className="animate-bounce-subtle" />
            <circle cx="600" cy="700" r="200" fill="url(#grad1)" className="animate-pulse" style={{animationDelay: '1s'}} />
          </svg>
        </div>
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                  Sample
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                サブキャッチコピーで製品の価値を説明します
                <br />
                <strong className="text-white">今すぐ始めましょう</strong>
              </p>
            </div>
            
            <div className="pt-8">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-2xl">
                  <Icons.rocket className="w-5 h-5 mr-2" />
                  無料で始める
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              主な機能
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              サービスの主要機能をご紹介します
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <Feature 
              icon={<Icons.chart className="w-8 h-8" />}
              title="データ分析"
              desc="詳細なデータ分析機能で、ビジネスの成長をサポートします"
            />
            <Feature 
              icon={<Icons.users className="w-8 h-8" />}
              title="チーム管理"
              desc="効率的なチーム管理機能で、プロジェクトを円滑に進められます"
            />
            <Feature 
              icon={<Icons.refresh className="w-8 h-8" />}
              title="自動同期"
              desc="リアルタイム同期機能で、常に最新の情報を共有できます"
            />
            <Feature 
              icon={<Icons.smartphone className="w-8 h-8" />}
              title="モバイル対応"
              desc="スマートフォンやタブレットからもアクセス可能です"
            />
            <Feature 
              icon={<Icons.shield className="w-8 h-8" />}
              title="セキュリティ"
              desc="企業レベルのセキュリティで、大切なデータを保護します"
            />
            <Feature 
              icon={<Icons.rocket className="w-8 h-8" />}
              title="高速処理"
              desc="高速な処理性能で、ストレスフリーな操作を実現します"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              料金プラン
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ニーズに合わせて選べる2つのプラン
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-8 hover:border-gray-300 transition-colors">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">無料プラン</h3>
                <p className="text-gray-600 mb-6">個人での利用や試用に最適</p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">¥0</span>
                  <span className="text-gray-500 ml-2">/月</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="text-gray-700">• プロジェクト3個まで</li>
                <li className="text-gray-700">• チームメンバー3名まで</li>
                <li className="text-gray-700">• 基本サポート</li>
                <li className="text-gray-700">• 基本分析機能</li>
                <li className="text-gray-400">• API連携は利用不可</li>
              </ul>
              
              <Link href="/auth/signup">
                <Button variant="outline" size="lg" className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white">
                  無料で始める
                </Button>
              </Link>
              
              <p className="text-sm text-gray-500 mt-4 text-center">
                クレジットカード不要
              </p>
            </div>

            {/* Premium Plan */}
            <div className="bg-gray-900 rounded-lg p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  おすすめ
                </span>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">プレミアム</h3>
                <p className="text-gray-300 mb-6">チームでの本格運用に</p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">¥980</span>
                  <span className="text-gray-400 ml-2">/月</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="text-gray-100">• 無制限のプロジェクト</li>
                <li className="text-gray-100">• チームメンバー20名まで</li>
                <li className="text-gray-100">• 24時間優先サポート</li>
                <li className="text-gray-100">• 高度な分析機能</li>
                <li className="text-gray-100">• API連携</li>
              </ul>
              
              <Link href="/billing">
                <Button size="lg" className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                  今すぐ始める
                </Button>
              </Link>
              
              <p className="text-sm text-gray-400 mt-4 text-center">
                いつでもキャンセル可能
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Geometric background patterns */}
        <div className="absolute inset-0">
          <svg className="absolute w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="ctaGrad1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style={{stopColor:'rgba(59, 130, 246, 0.3)', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'rgba(59, 130, 246, 0)', stopOpacity:0}} />
              </radialGradient>
              <radialGradient id="ctaGrad2" cx="50%" cy="50%" r="40%">
                <stop offset="0%" style={{stopColor:'rgba(147, 51, 234, 0.2)', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'rgba(147, 51, 234, 0)', stopOpacity:0}} />
              </radialGradient>
            </defs>
            <circle cx="300" cy="400" r="250" fill="url(#ctaGrad1)" className="animate-pulse" />
            <circle cx="700" cy="300" r="200" fill="url(#ctaGrad2)" className="animate-bounce-subtle" />
            <circle cx="500" cy="600" r="180" fill="url(#ctaGrad1)" className="animate-pulse" style={{animationDelay: '1.5s'}} />
          </svg>
        </div>
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/5 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
          <div className="absolute top-3/4 right-1/5 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              今すぐ始めませんか
            </h2>
            
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              アカウント作成は簡単で、すぐに全ての機能をお試しいただけます。<br />
              まずは無料プランから始めて、必要に応じてアップグレードしてください。
            </p>
            
            <div className="mb-8">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-4 font-semibold">
                  無料で始める
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              よくある質問
            </h2>
            <p className="text-xl text-gray-600">
              お客様からよく寄せられる質問にお答えします
            </p>
          </div>
          <div className="space-y-4">
            <FAQ 
              q="料金はいつ請求されますか？"
              a="月額プランの場合、毎月同じ日に自動的に請求されます。"
            />
            <FAQ 
              q="サポートはどのように受けられますか？"
              a="メールサポートを提供しております。"
            />
            <FAQ 
              q="プランの変更やキャンセルはできますか？"
              a="いつでもプランの変更やキャンセルが可能です。設定画面から簡単に操作していただけます。"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group bg-blue-900/30 backdrop-blur-sm rounded-xl p-8 border border-blue-800/30 hover:bg-blue-800/40 hover:border-blue-700/50 transition-all duration-300 hover:-translate-y-1">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:from-blue-400 group-hover:to-indigo-500 transition-colors shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-blue-100 leading-relaxed">{desc}</p>
    </div>
  )
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-blue-100 hover:shadow-medium hover:border-blue-200 transition-all duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Icons.chevronDown className="w-5 h-5 text-blue-600 mr-2" />
        {q}
      </h3>
      <p className="text-gray-700 leading-relaxed ml-7">{a}</p>
    </div>
  )
}