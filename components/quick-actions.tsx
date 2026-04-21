"use client"

import { useRef, useState, useEffect } from "react"
import { Plus, Send, FileText, CreditCard, ArrowRightLeft, Wallet, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuickActionsProps {
  onSendMoney: () => void
  onDepositChecks: () => void
  onPayBills: () => void
  onAddAccount: () => void
  onTransfer?: () => void
  onAddFunds?: () => void
  onStripeDashboard?: () => void
}

export function QuickActions({
  onSendMoney,
  onDepositChecks,
  onPayBills,
  onAddAccount,
  onTransfer,
  onAddFunds,
  onStripeDashboard,
}: QuickActionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(true)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      setShowLeftFade(scrollLeft > 10)
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10)
    }

    // Initial check
    handleScroll()

    container.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div 
      role="group" 
      aria-label="Quick actions"
      className="relative"
    >
      {/* Left fade indicator */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
          showLeftFade ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />
      
      {/* Right fade indicator */}
      <div 
        className={cn(
          "absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
          showRightFade ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />

      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide momentum-scroll scroll-smooth snap-x snap-mandatory"
      >
        <Button
          variant="outline"
          className="flex items-center justify-center bg-card border-0 chase-card-shadow hover:bg-muted/50 rounded-full h-12 w-12 min-h-[48px] min-w-[48px] p-0 flex-shrink-0 transition-all duration-150 active:scale-90 focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2 snap-start"
          onClick={onAddAccount}
          aria-label="Add new account"
        >
          <Plus className="h-5 w-5 text-[#0a4fa6]" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 whitespace-nowrap bg-card border-0 chase-card-shadow hover:bg-muted/50 rounded-full h-12 min-h-[48px] px-5 font-medium flex-shrink-0 transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2 snap-start"
          onClick={onSendMoney}
          aria-label="Send money or use Zelle"
        >
          <Send className="h-4 w-4 text-[#0a4fa6]" aria-hidden="true" />
          <span>Send | Zelle</span>
        </Button>
        {onTransfer && (
          <Button
            variant="outline"
            className="flex items-center gap-2 whitespace-nowrap bg-card border-0 chase-card-shadow hover:bg-muted/50 rounded-full h-12 min-h-[48px] px-5 font-medium flex-shrink-0 transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2 snap-start"
            onClick={onTransfer}
            aria-label="Transfer money between accounts"
          >
            <ArrowRightLeft className="h-4 w-4 text-[#0a4fa6]" aria-hidden="true" />
            <span>Transfer</span>
          </Button>
        )}
        <Button
          variant="outline"
          className="flex items-center gap-2 whitespace-nowrap bg-card border-0 chase-card-shadow hover:bg-muted/50 rounded-full h-12 min-h-[48px] px-5 font-medium flex-shrink-0 transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2 snap-start"
          onClick={onDepositChecks}
          aria-label="Deposit checks"
        >
          <FileText className="h-4 w-4 text-[#0a4fa6]" aria-hidden="true" />
          <span>Deposit</span>
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 whitespace-nowrap bg-card border-0 chase-card-shadow hover:bg-muted/50 rounded-full h-12 min-h-[48px] px-5 font-medium flex-shrink-0 transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2 snap-start"
          onClick={onPayBills}
          aria-label="Pay bills"
        >
          <CreditCard className="h-4 w-4 text-[#0a4fa6]" aria-hidden="true" />
          <span>Pay bills</span>
        </Button>
        {onAddFunds && (
          <Button
            variant="outline"
            className="flex items-center gap-2 whitespace-nowrap bg-[#0a4fa6] text-white border-0 chase-card-shadow hover:bg-[#083d85] rounded-full h-12 min-h-[48px] px-5 font-medium flex-shrink-0 transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2 snap-start"
            onClick={onAddFunds}
            aria-label="Add funds to account"
          >
            <Wallet className="h-4 w-4" aria-hidden="true" />
            <span>Add Funds</span>
          </Button>
        )}
        {onStripeDashboard && (
          <Button
            variant="outline"
            className="flex items-center gap-2 whitespace-nowrap bg-card border-0 chase-card-shadow hover:bg-muted/50 rounded-full h-12 min-h-[48px] px-5 font-medium flex-shrink-0 transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0a4fa6] focus-visible:ring-offset-2 snap-start"
            onClick={onStripeDashboard}
            aria-label="View payments dashboard"
          >
            <BarChart3 className="h-4 w-4 text-[#0a4fa6]" aria-hidden="true" />
            <span>Payments</span>
          </Button>
        )}
      </div>
    </div>
  )
}
