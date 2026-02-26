export function Marker({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-bold" style={{ background: "linear-gradient(transparent 60%, #fff176 60%)" }}>
      {children}
    </span>
  )
}
