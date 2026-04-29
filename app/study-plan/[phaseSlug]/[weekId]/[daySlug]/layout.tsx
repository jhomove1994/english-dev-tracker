'use client'

import { SupportModeProvider } from '@/lib/contexts/SupportModeContext'

export default function DayClassLayout({ children }: { children: React.ReactNode }) {
  return <SupportModeProvider>{children}</SupportModeProvider>
}
