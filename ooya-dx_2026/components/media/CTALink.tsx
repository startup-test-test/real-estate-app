import Link from 'next/link'

export function CTALink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className="not-prose my-6">
      <Link
        href={href}
        className="flex items-center justify-between gap-4 border-2 border-primary-950 text-primary-950 bg-white py-4 px-6 rounded-lg hover:bg-primary-50 transition-all no-underline"
      >
        <span className="font-bold text-sm sm:text-base leading-relaxed">{children}</span>
        <span className="text-lg shrink-0 opacity-60">→</span>
      </Link>
    </div>
  )
}
