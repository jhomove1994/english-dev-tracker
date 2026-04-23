import React from 'react'

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border border-zinc-800 bg-zinc-900 p-6 ${className}`} {...props}>{children}</div>
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 ${className}`} {...props}>{children}</div>
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold text-white ${className}`} {...props}>{children}</h3>
}

export function CardContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props}>{children}</div>
}
