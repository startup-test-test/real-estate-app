'use client'

export function CFSimulatorLayoutClient({ children }: { children: React.ReactNode }) {
  // DashboardLayoutは親のMypageLayoutClientで既に適用されているため、
  // ここでは子要素をそのまま返す
  return <>{children}</>
}
