import React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'success' | 'warning' | 'info'

const variants: Record<Variant, string> = {
  default: 'bg-zinc-800 text-zinc-300',
  success: 'bg-green-900/50 text-green-400 border border-green-800',
  warning: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
  info: 'bg-blue-900/50 text-blue-400 border border-blue-800',
}

export function Badge({
  variant = 'default',
  className,
  children,
}: {
  variant?: Variant
  className?: string
  children: React.ReactNode
}) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
