'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Wallet, PiggyBank } from 'lucide-react'

interface Account {
  id: string
  name: string
  type: 'checking' | 'savings'
  number: string
  balance: number
  currency: string
}

interface LinHuangAccountsHighlightProps {
  accounts?: Account[]
}

export function LinHuangAccountsHighlight({ 
  accounts = [
    {
      id: 'acc-lin-checking-001',
      name: 'Checking Account',
      type: 'checking',
      number: 'CHK-****7890',
      balance: 0,
      currency: 'USD',
    },
    {
      id: 'acc-lin-savings-001',
      name: 'Savings Account',
      type: 'savings',
      number: 'SAV-****7891',
      balance: 0,
      currency: 'USD',
    },
  ]
}: LinHuangAccountsHighlightProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Your Accounts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account) => (
          <Card key={account.id} className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {account.type === 'checking' ? (
                    <Wallet className="w-5 h-5 text-blue-600" />
                  ) : (
                    <PiggyBank className="w-5 h-5 text-green-600" />
                  )}
                  <div>
                    <CardTitle className="text-base">{account.name}</CardTitle>
                    <CardDescription className="text-xs">{account.number}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Ready
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(account.balance)}
                </div>
                <p className="text-xs text-gray-500">Available for transfers</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
