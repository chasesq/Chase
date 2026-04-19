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
import { PWAProvider } from "@/components/pwa-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a4fa6" },
    { media: "(prefers-color-scheme: dark)", color: "#0a4fa6" },
  ],
}

export const metadata: Metadata = {
  title: "MyBank - Chase Banking",
  description:
    "Your personal banking app. Manage accounts, transfer funds, pay bills, and track finances on the go.",
  generator: "v0.app",
  applicationName: "MyBank",
  keywords: ["banking", "finance", "chase", "transfer", "bills", "savings"],
  authors: [{ name: "MyBank" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyBank",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "MyBank",
    title: "MyBank - Your Banking App",
    description: "Manage your finances anywhere, anytime.",
  },
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
      {
        url: "/icon-512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
    apple: [
      { url: "/apple-icon.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
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
                  <PWAProvider>
                    {children}
                  </PWAProvider>
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
