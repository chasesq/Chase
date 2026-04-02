import { BrowserbaseDemo } from '@/components/browserbase-demo'

export const metadata = {
  title: 'Browserbase Screenshot & PDF Tool',
  description: 'Capture screenshots and generate PDFs from web pages',
}

export default function BrowserbasePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="py-12">
        <BrowserbaseDemo />
      </div>
    </div>
  )
}
