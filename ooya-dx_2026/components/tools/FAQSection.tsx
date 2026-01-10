'use client'

import React from 'react'

export interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  title?: string
  faqs: FAQItem[]
}

export function FAQSection({ title = 'よくある質問', faqs }: FAQSectionProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="px-4 py-3 bg-white">
              <p className="font-medium text-gray-900">
                Q. {faq.question}
              </p>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">
                A. {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * FAQ構造化データを生成（JSON-LD）
 */
export function generateFAQSchema(faqs: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}
