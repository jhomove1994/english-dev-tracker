export function Progress({ value = 0, className = '' }: { value?: number; className?: string }) {
  return (
    <div className={`h-2 w-full rounded-full bg-zinc-800 ${className}`}>
      <div
        className="h-2 rounded-full bg-green-500 transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
