import Link from 'next/link'
import { Icons } from '@/components/ui/icons'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* ブランド */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Icons.zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Sample</span>
          </div>
          
          {/* リンク */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/legal/terms" className="text-gray-400 hover:text-white transition-colors">
              利用規約
            </Link>
            <Link href="/legal/privacy" className="text-gray-400 hover:text-white transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/legal/tokushoho" className="text-gray-400 hover:text-white transition-colors">
              特定商取引法
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
              お問い合わせ
            </Link>
          </div>
          
          {/* コピーライト */}
          <div className="text-sm text-gray-400">
            © {currentYear} 株式会社サンプル
          </div>
        </div>
      </div>
    </footer>
  )
}