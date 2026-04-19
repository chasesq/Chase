"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSHelp, setShowIOSHelp] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("[v0] Service Worker registered:", registration.scope)
          })
          .catch((error) => {
            console.log("[v0] Service Worker registration failed:", error)
          })
      })
    }

    // Detect iOS devices (they don't support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isiOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
    setIsIOS(isiOSDevice)

    // Check if already installed (running in standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

    // Check if user previously dismissed the banner
    const wasDismissed = localStorage.getItem("pwa-install-dismissed")
    const dismissedAt = wasDismissed ? Number.parseInt(wasDismissed, 10) : 0
    const daysSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
    const canShowAgain = !wasDismissed || daysSinceDismiss > 7

    if (isStandalone || !canShowAgain) return

    // For iOS: show install help after a delay
    if (isiOSDevice) {
      const timer = setTimeout(() => setShowInstallBanner(true), 10000)
      return () => clearTimeout(timer)
    }

    // For Android/Chrome: listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setShowInstallBanner(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for successful install
    const handleAppInstalled = () => {
      setShowInstallBanner(false)
      setInstallPrompt(null)
      console.log("[v0] PWA installed successfully")
    }
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSHelp(true)
      return
    }

    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      if (choice.outcome === "accepted") {
        console.log("[v0] User accepted PWA install")
      }
      setInstallPrompt(null)
      setShowInstallBanner(false)
    } catch (error) {
      console.log("[v0] Install prompt error:", error)
    }
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
  }

  return (
    <>
      {children}

      {showInstallBanner && !showIOSHelp && (
        <div
          role="dialog"
          aria-label="Install MyBank app"
          className="fixed bottom-20 left-4 right-4 z-[9999] md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">Install MyBank</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Add to your home screen for quick access and a native app experience.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleInstall} className="h-8 text-xs">
                  {isIOS ? "Show me how" : "Install"}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 text-xs">
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showIOSHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Install MyBank on iOS"
          className="fixed inset-0 z-[9999] bg-black/60 flex items-end md:items-center justify-center p-4"
          onClick={() => setShowIOSHelp(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-lg">Install on iOS</h3>
              <button
                onClick={() => setShowIOSHelp(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                <span className="leading-relaxed">
                  Tap the <strong>Share</strong> button at the bottom of Safari
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                <span className="leading-relaxed">
                  Scroll down and tap <strong>Add to Home Screen</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  3
                </span>
                <span className="leading-relaxed">
                  Tap <strong>Add</strong> to install MyBank on your home screen
                </span>
              </li>
            </ol>
            <Button onClick={() => setShowIOSHelp(false)} className="w-full mt-6">
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
