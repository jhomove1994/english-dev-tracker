import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { OnboardingModal } from '@/components/ui/OnboardingModal'

export const metadata: Metadata = {
  title: 'English Dev Tracker',
  description: 'Track your English learning journey as a developer',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DevEnglish" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <div className="flex h-screen bg-zinc-950">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
        <OnboardingModal />
      </body>
    </html>
  )
}
