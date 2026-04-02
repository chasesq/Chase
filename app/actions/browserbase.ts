'use server'

import playwright from 'playwright'

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID

if (!BROWSERBASE_API_KEY || !BROWSERBASE_PROJECT_ID) {
  throw new Error('Missing Browserbase credentials in environment variables')
}

interface ScreenshotOptions {
  url: string
  format?: 'png' | 'jpeg'
  fullPage?: boolean
  width?: number
  height?: number
}

interface PDFOptions {
  url: string
  width?: number
  height?: number
  scale?: number
}

/**
 * Capture a screenshot of a web page using Browserbase
 */
export async function captureScreenshot(options: ScreenshotOptions) {
  const {
    url,
    format = 'png',
    fullPage = true,
    width = 1280,
    height = 720,
  } = options

  let browser
  let context
  let page

  try {
    console.info('[Browserbase] Connecting to browser...')
    browser = await playwright.chromium.connectOverCDP(
      `wss://connect.browserbase.com?apiKey=${BROWSERBASE_API_KEY}`
    )

    context = await browser.newContext({
      viewport: { width, height },
    })
    page = await context.newPage()

    console.info(`[Browserbase] Navigating to ${url}...`)
    await page.goto(url, { waitUntil: 'networkidle' })

    // Wait a moment for any dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.info('[Browserbase] Capturing screenshot...')
    const screenshot = await page.screenshot({
      fullPage,
      type: format,
    })

    return {
      success: true,
      data: screenshot.toString('base64'),
      mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
      size: screenshot.length,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[Browserbase] Screenshot failed:', errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  } finally {
    if (page) await page.close()
    if (context) await context.close()
    if (browser) await browser.close()
  }
}

/**
 * Generate a PDF from a web page using Browserbase
 */
export async function generatePDF(options: PDFOptions) {
  const {
    url,
    width = 1280,
    height = 720,
    scale = 1,
  } = options

  let browser
  let context
  let page

  try {
    console.info('[Browserbase] Connecting to browser...')
    browser = await playwright.chromium.connectOverCDP(
      `wss://connect.browserbase.com?apiKey=${BROWSERBASE_API_KEY}`
    )

    context = await browser.newContext({
      viewport: { width, height },
    })
    page = await context.newPage()

    console.info(`[Browserbase] Navigating to ${url}...`)
    await page.goto(url, { waitUntil: 'networkidle' })

    // Wait a moment for any dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.info('[Browserbase] Generating PDF...')
    const pdf = await page.pdf({
      format: 'A4',
      scale,
      displayHeaderFooter: true,
      footerTemplate: '<small style="margin: 0 1cm;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></small>',
    })

    return {
      success: true,
      data: pdf.toString('base64'),
      mimeType: 'application/pdf',
      size: pdf.length,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[Browserbase] PDF generation failed:', errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  } finally {
    if (page) await page.close()
    if (context) await context.close()
    if (browser) await browser.close()
  }
}

/**
 * Capture multiple formats at once (screenshot + PDF)
 */
export async function capturePageContent(url: string) {
  try {
    console.info(`[Browserbase] Starting capture for ${url}...`)

    const screenshotResult = await captureScreenshot({
      url,
      format: 'png',
      fullPage: true,
    })

    const pdfResult = await generatePDF({ url })

    return {
      success: true,
      screenshot: screenshotResult.success ? screenshotResult : null,
      pdf: pdfResult.success ? pdfResult : null,
      errors: [
        !screenshotResult.success && screenshotResult.error,
        !pdfResult.success && pdfResult.error,
      ].filter(Boolean),
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[Browserbase] Capture failed:', errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}
