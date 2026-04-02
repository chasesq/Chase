'use client'

import { useState } from 'react'
import { captureScreenshot, generatePDF, capturePageContent } from '@/app/actions/browserbase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export function BrowserbaseDemo() {
  const [url, setUrl] = useState('https://news.ycombinator.com')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    screenshot?: { success: boolean; data?: string }
    pdf?: { success: boolean; data?: string }
    error?: string
  } | null>(null)

  const handleScreenshot = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await captureScreenshot({ url })
      setResult({ screenshot: res })
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const handlePDF = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await generatePDF({ url })
      setResult({ pdf: res })
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const handleCaptureBoth = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await capturePageContent(url)
      if (res.success) {
        setResult({
          screenshot: res.screenshot,
          pdf: res.pdf,
        })
      } else {
        setResult({ error: res.error })
      }
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const downloadScreenshot = () => {
    if (result?.screenshot?.data) {
      const link = document.createElement('a')
      link.href = `data:image/png;base64,${result.screenshot.data}`
      link.download = `screenshot-${Date.now()}.png`
      link.click()
    }
  }

  const downloadPDF = () => {
    if (result?.pdf?.data) {
      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${result.pdf.data}`
      link.download = `document-${Date.now()}.pdf`
      link.click()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h1 className="text-3xl font-bold mb-2">Browserbase Screenshot & PDF Tool</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Capture screenshots and generate PDFs from any web page using Browserbase and Playwright.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL to Capture</label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleScreenshot}
              disabled={loading}
              variant="default"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Capturing...
                </>
              ) : (
                'Capture Screenshot'
              )}
            </Button>
            <Button
              onClick={handlePDF}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate PDF'
              )}
            </Button>
            <Button
              onClick={handleCaptureBoth}
              disabled={loading}
              variant="secondary"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Capturing...
                </>
              ) : (
                'Capture Both'
              )}
            </Button>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-4">Results</h2>

          {result.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 p-4 rounded">
              Error: {result.error}
            </div>
          )}

          {result.screenshot?.success && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Screenshot Preview</p>
                <img
                  src={`data:image/png;base64,${result.screenshot.data}`}
                  alt="Screenshot"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded"
                />
              </div>
              <Button
                onClick={downloadScreenshot}
                variant="outline"
                size="sm"
              >
                Download Screenshot
              </Button>
            </div>
          )}

          {result.pdf?.success && (
            <div className="space-y-3 mt-4">
              <p className="text-sm font-medium">PDF Generated</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Size: {(result.pdf.size / 1024).toFixed(2)} KB
              </p>
              <Button
                onClick={downloadPDF}
                variant="outline"
                size="sm"
              >
                Download PDF
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
