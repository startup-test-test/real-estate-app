import Link from 'next/link'
import Image from 'next/image'

export function CTACard({
  href,
  thumbnail,
  description,
  children,
}: {
  href: string
  thumbnail: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="not-prose my-6">
      <Link
        href={href}
        className="group flex overflow-hidden border-2 border-primary-950 bg-white hover:bg-primary-50 transition-all no-underline"
      >
        <div className="relative w-32 sm:w-48 shrink-0 aspect-[5/3] m-[5px]">
          <Image
            src={thumbnail}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 128px, 192px"
          />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 min-w-0">
          <div className="min-w-0">
            <span className="font-bold text-sm sm:text-base leading-relaxed text-primary-950">
              {children}
            </span>
            {description && (
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <span className="shrink-0 w-10 h-10 rounded-full bg-primary-950 flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <span className="text-white text-lg">→</span>
          </span>
        </div>
      </Link>
    </div>
  )
}
