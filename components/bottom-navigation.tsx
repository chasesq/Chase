"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Wallet, ArrowLeftRight, PieChart, Tag, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavigationProps {
  activeView: string
  onViewChange: (view: string) => void
}

const navItems = [
  { id: "accounts", label: "Accounts", icon: Wallet },
  { id: "pay-transfer", label: "Pay & transfer", icon: ArrowLeftRight },
  { id: "plan-track", label: "Plan & track", icon: PieChart },
  { id: "offers", label: "Offers", icon: Tag },
  { id: "more", label: "More", icon: Menu },
] as const

export function BottomNavigation({ activeView, onViewChange }: BottomNavigationProps) {
  const navRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const [isReady, setIsReady] = useState(false)

  const updateIndicator = useCallback(() => {
    const activeButton = buttonsRef.current.get(activeView)
    if (activeButton && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect()
      const btnRect = activeButton.getBoundingClientRect()
      setIndicatorStyle({
        left: btnRect.left - navRect.left + btnRect.width * 0.15,
        width: btnRect.width * 0.7,
      })
      if (!isReady) setIsReady(true)
    }
  }, [activeView, isReady])

  useEffect(() => {
    updateIndicator()
    window.addEventListener("resize", updateIndicator)
    return () => window.removeEventListener("resize", updateIndicator)
  }, [updateIndicator])

  const setButtonRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) {
      buttonsRef.current.set(id, el)
    }
  }, [])

  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 z-50 pb-[env(safe-area-inset-bottom)] transform-gpu backface-hidden"
    >
      <div ref={navRef} className="relative flex items-center justify-around px-1 py-1 touch-none" role="tablist">
        {/* Sliding active indicator */}
        <div
          className={cn(
            "absolute top-0 h-[2.5px] bg-[#0a4fa6] rounded-b-full nav-indicator",
            !isReady && "opacity-0"
          )}
          style={{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: `${indicatorStyle.width}px`,
          }}
        />

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <button
              key={item.id}
              ref={(el) => setButtonRef(item.id, el)}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              className={cn(
                "flex flex-col items-center gap-0.5 py-3 px-3 min-w-[64px] min-h-[48px] rounded-xl transition-all duration-200 bg-transparent border-0 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2",
                "active:scale-95 active:bg-[#0a4fa6]/10",
                isActive
                  ? "text-[#0a4fa6]"
                  : "text-muted-foreground hover:text-[#0a4fa6]/70",
              )}
              onClick={() => onViewChange(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault()
                  const currentIndex = navItems.findIndex(i => i.id === item.id)
                  const nextIndex = e.key === 'ArrowRight' 
                    ? (currentIndex + 1) % navItems.length 
                    : (currentIndex - 1 + navItems.length) % navItems.length
                  const nextItem = navItems[nextIndex]
                  onViewChange(nextItem.id)
                  buttonsRef.current.get(nextItem.id)?.focus()
                }
              }}
              aria-label={item.label}
              aria-selected={isActive}
              aria-controls={`${item.id}-panel`}
            >
              <div className={cn(
                "transition-transform duration-200",
                isActive && "scale-110"
              )}>
                <Icon className={cn("h-5 w-5 transition-all duration-200", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn(
                "text-[10px] transition-all duration-200 leading-tight",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
