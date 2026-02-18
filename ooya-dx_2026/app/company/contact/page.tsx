'use client'

import { useState } from 'react'
import { CompanyNav } from '@/components/company-nav';
import { WebPageJsonLd } from '@/components/WebPageJsonLd';
import { Breadcrumb } from '@/components/Breadcrumb';
import Link from 'next/link';
import { getCompanyPageInfo, formatToolDate } from '@/lib/navigation';

export default function CorporateContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    url: '',
    message: ''
  })
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      alert('個人情報保護方針に同意してください。')
      return
    }
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'corporate'
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', url: '', message: '' })
        setAgreed(false)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <>
      <WebPageJsonLd
        name="法人のお問合せ・受託開発・取材など"
        description="お仕事のご相談やご依頼、弊社サービスに関するお問い合わせはメール、もしくはお電話にてお気軽にお問い合わせください。"
        path="/company/contact"
        datePublished="2026-01-15"
        dateModified="2026-01-15"
        breadcrumbs={[{ name: '会社概要', href: '/company' }, { name: 'お問合わせ', href: '/company/contact' }]}
      />

        <article className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* パンくず */}
          <Breadcrumb items={[
            { label: '大家DX', href: '/' },
            { label: '会社概要', href: '/company' },
            { label: '法人のお問合せ・受託開発・取材など' },
          ]} />

          {/* 日付 */}
          {(() => {
            const pageInfo = getCompanyPageInfo('/company/contact');
            return pageInfo ? (
              <div className="flex items-center gap-3 text-xs text-gray-900 mb-2 sm:mb-4">
                {pageInfo.publishDate && <span>公開日：{formatToolDate(pageInfo.publishDate)}</span>}
                {pageInfo.lastUpdated && <span>更新日：{formatToolDate(pageInfo.lastUpdated)}</span>}
              </div>
            ) : null;
          })()}

          {/* H1タイトル */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
            法人のお問合せ・受託開発・取材など
          </h1>

          {/* ページナビゲーション */}
          <CompanyNav />

          {/* 概要 */}
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed">
              お仕事のご相談やご依頼、弊社サービスに関するお問い合わせはメール、もしくはお電話にてお気軽にお問い合わせください。
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              2～3営業日以内に、担当よりメールにて返信させていただきます。
            </p>
          </section>

          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    placeholder="山田 太郎"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-900 mb-2">
                    御社または関連サイトのURL
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                    お問合わせ内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white resize-none"
                    placeholder="お問い合わせ内容をご記入ください"
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm font-medium">お問い合わせを受け付けました</p>
                    <p className="text-blue-700 text-xs mt-1">2～3営業日以内にご返信いたします。</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm font-medium">送信中にエラーが発生しました</p>
                    <p className="text-red-700 text-xs mt-1">しばらく経ってから再度お試しください。</p>
                  </div>
                )}

                {/* 個人情報保護方針同意 */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="agree" className="text-sm text-gray-700">
                    <Link href="/company/legal/privacy" className="text-blue-600 hover:underline">個人情報保護方針</Link>に同意して送信する
                  </label>
                </div>

                <p className="text-sm text-gray-500">
                  ※営業・セールスを目的としたお問い合わせはご遠慮ください。
                </p>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !agreed}
                    className="w-full bg-blue-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '送信中...' : '送信する'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </article>
    </>
  );
}
