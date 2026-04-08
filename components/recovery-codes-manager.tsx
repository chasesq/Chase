'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Download, Copy, RotateCcw, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface RecoveryCodesManagerProps {
  email: string
  onCodesRegenerated?: () => void
}

export function RecoveryCodesManager({
  email,
  onCodesRegenerated,
}: RecoveryCodesManagerProps) {
  const [codes, setCodes] = useState<string[]>([])
  const [showCodes, setShowCodes] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [hasViewedCodes, setHasViewedCodes] = useState(false)
  const { toast } = useToast()

  const generateRecoveryCodes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/mfa/recovery/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recovery codes')
      }

      setCodes(data.codes || [])
      setShowCodes(true)
      setHasViewedCodes(true)

      toast({
        title: 'Success',
        description: 'Recovery codes generated successfully',
      })
    } catch (error) {
      console.error('[v0] Error generating recovery codes:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate recovery codes',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCodes = () => {
    const text = codes.join('\n')
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`)
    element.setAttribute('download', 'recovery-codes.txt')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: 'Downloaded',
      description: 'Recovery codes downloaded successfully',
    })
  }

  const printCodes = () => {
    const printWindow = window.open('', '', 'height=400,width=600')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Recovery Codes</title>
            <style>
              body { font-family: monospace; margin: 20px; }
              h1 { text-align: center; }
              .codes { 
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-top: 20px;
              }
              .code { 
                padding: 10px;
                border: 1px solid #ccc;
                background: #f5f5f5;
              }
              .warning {
                color: red;
                margin-top: 20px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <h1>Recovery Codes</h1>
            <p>Save these codes in a safe place. Each code can be used once as a backup authentication method.</p>
            <div class="codes">
              ${codes.map(code => `<div class="code">${code}</div>`).join('')}
            </div>
            <div class="warning">
              ⚠ Keep these codes safe and secure. Do not share with anyone.
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
    toast({
      title: 'Copied',
      description: 'Code copied to clipboard',
    })
  }

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <Card className="p-4 border-yellow-200 bg-yellow-50">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-900">Save Your Recovery Codes</p>
            <p className="text-sm text-yellow-800 mt-1">
              Recovery codes are the only way to regain access to your account if you lose your MFA device. Store them in a secure location.
            </p>
          </div>
        </div>
      </Card>

      {/* Generate Button */}
      {codes.length === 0 ? (
        <Button
          onClick={generateRecoveryCodes}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Generating...' : 'Generate Recovery Codes'}
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Codes Display */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Your Recovery Codes</h3>
              <button
                onClick={() => setShowCodes(!showCodes)}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                {showCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showCodes ? 'Hide' : 'Show'}
              </button>
            </div>

            {showCodes && (
              <Card className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {codes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:border-gray-300 transition"
                    >
                      <code className="font-mono text-sm text-gray-700">{code}</code>
                      <button
                        onClick={() => copyCode(code)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded transition text-gray-600"
                        title="Copy code"
                      >
                        <Copy
                          className={`w-4 h-4 ${copiedCode === code ? 'text-green-600' : ''}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={downloadCodes}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              onClick={printCodes}
              variant="outline"
              className="flex-1"
            >
              Print
            </Button>
            <Button
              onClick={generateRecoveryCodes}
              variant="outline"
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {isLoading ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>

          {/* Info Box */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Regenerating codes will invalidate all existing codes. Store the new codes safely before regenerating.
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
