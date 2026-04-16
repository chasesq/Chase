'use client'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CodeExampleBlockProps {
  title?: string
  code: string
  language?: string
  description?: string
}

export function CodeExampleBlock({
  title,
  code,
  language = 'javascript',
  description,
}: CodeExampleBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="overflow-hidden">
      {(title || description) && (
        <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted">
          {title && <h3 className="font-semibold text-foreground">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <div className="relative">
        <div className="overflow-x-auto">
          <pre className="p-4 sm:p-6 text-sm font-mono text-foreground bg-background">
            <code>{code}</code>
          </pre>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="absolute top-2 right-2 sm:top-4 sm:right-4"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </Card>
  )
}
