'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

interface ScenarioCardProps {
  title: string
  description: string
  href: string
  icon?: React.ReactNode
  features?: string[]
}

export function ScenarioCard({
  title,
  description,
  href,
  icon,
  features,
}: ScenarioCardProps) {
  return (
    <Link href={href}>
      <Card className="h-full p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer">
        {icon && <div className="mb-4 text-primary text-3xl">{icon}</div>}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        {features && features.length > 0 && (
          <div className="mb-4 space-y-1">
            {features.map((feature, index) => (
              <div key={index} className="text-xs text-muted-foreground">
                • {feature}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center text-primary text-sm font-medium">
          Learn more <ArrowRight className="w-4 h-4 ml-2" />
        </div>
      </Card>
    </Link>
  )
}
