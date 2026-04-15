import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/toaster"
import { BankingProvider } from "@/lib/banking-context"
import { RealtimeProvider } from "@/lib/realtime-orchestrator"
import { ACULProvider } from "@/lib/auth0/acul-context"
import { AuthProvider } from "@/lib/auth-context"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a4fa6",
}

export const metadata: Metadata = {
  title: "Enterprise Financial System",
  description: "Integrated financial management with real-time updates",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased overflow-x-hidden overscroll-none touch-pan-y">
        <ErrorBoundary>
          <AuthProvider>
            <ACULProvider>
              <RealtimeProvider>
                <BankingProvider>
                  {children}
                  <Toaster />
                  <Analytics />
                  <SpeedInsights />
                </BankingProvider>
              </RealtimeProvider>
            </ACULProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
