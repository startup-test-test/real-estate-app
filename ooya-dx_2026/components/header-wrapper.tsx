import { Suspense } from 'react'
import { Header } from './header'

function HeaderFallback() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="font-bold text-xl">
          </div>
          <nav className="flex items-center gap-4">
            <div className="w-20 h-9" />
            <div className="w-20 h-9" />
          </nav>
        </div>
      </div>
    </header>
  )
}

export function HeaderWrapper() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <Header />
    </Suspense>
  )
}