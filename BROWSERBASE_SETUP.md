# Browserbase Screenshot & PDF Generation

This integration adds screenshot and PDF generation capabilities to your Chase app using Browserbase and Playwright.

## Features

- **Screenshot Capture**: Take screenshots of any web page with customizable dimensions
- **PDF Generation**: Convert web pages to PDF documents
- **Batch Operations**: Capture both screenshot and PDF in a single request
- **Base64 Encoding**: Results are base64 encoded for easy transfer and storage
- **Error Handling**: Comprehensive error handling and logging

## Setup

### 1. Get Browserbase Credentials

1. Visit [Browserbase](https://www.browserbase.com)
2. Sign up and create a project
3. Generate an API key
4. Note your Project ID

### 2. Set Environment Variables

Add these to your `.env.local` file:

```bash
BROWSERBASE_API_KEY=bb_live_xxxxxxxxxxxxxxxxxxxxx
BROWSERBASE_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

For production (Vercel), add them in your **Settings > Vars** section.

### 3. Dependencies

Playwright is already added to your `package.json`. Run:

```bash
npm install
# or
pnpm install
```

## Usage

### In React Components

```tsx
'use client'

import { captureScreenshot, generatePDF } from '@/app/actions/browserbase'

export function MyComponent() {
  const handleCapture = async () => {
    const result = await captureScreenshot({
      url: 'https://example.com',
      format: 'png',
      fullPage: true,
    })
    
    if (result.success) {
      console.log('Screenshot captured:', result.data)
    }
  }

  return <button onClick={handleCapture}>Capture</button>
}
```

### API Reference

#### `captureScreenshot(options)`

Capture a screenshot of a web page.

**Options:**
- `url` (string, required): The URL to capture
- `format` ('png' | 'jpeg', default: 'png'): Image format
- `fullPage` (boolean, default: true): Capture full page or viewport only
- `width` (number, default: 1280): Viewport width
- `height` (number, default: 720): Viewport height

**Returns:**
```typescript
{
  success: boolean
  data?: string // base64 encoded image
  mimeType?: string
  size?: number // bytes
  error?: string
}
```

#### `generatePDF(options)`

Generate a PDF from a web page.

**Options:**
- `url` (string, required): The URL to convert
- `width` (number, default: 1280): Viewport width
- `height` (number, default: 720): Viewport height
- `scale` (number, default: 1): PDF scale factor

**Returns:**
```typescript
{
  success: boolean
  data?: string // base64 encoded PDF
  mimeType?: string
  size?: number // bytes
  error?: string
}
```

#### `capturePageContent(url)`

Capture both screenshot and PDF in one call.

**Returns:**
```typescript
{
  success: boolean
  screenshot?: { success: boolean; data?: string }
  pdf?: { success: boolean; data?: string }
  errors?: string[]
}
```

## Demo

Visit `/browserbase` to see a working example of all three functions.

## Troubleshooting

### "Missing Browserbase credentials"
Ensure both `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` are set in your environment variables.

### Connection timeout
- Check your internet connection
- Verify your API key is valid
- Ensure Browserbase service is running

### Page not loading
- Verify the URL is correct and publicly accessible
- Some sites may block automated access
- Try increasing the wait time in the code (currently 2 seconds)

## Advanced Usage

### Custom Viewport Sizes

```tsx
const result = await captureScreenshot({
  url: 'https://example.com',
  width: 1920,
  height: 1080,
  fullPage: true,
})
```

### JPEG Compression

```tsx
const result = await captureScreenshot({
  url: 'https://example.com',
  format: 'jpeg',
})
```

### Custom PDF Scale

```tsx
const result = await generatePDF({
  url: 'https://example.com',
  scale: 0.8,
})
```

## Files Modified

- `app/actions/browserbase.ts` - Server actions for screenshot/PDF generation
- `components/browserbase-demo.tsx` - Demo UI component
- `app/browserbase/page.tsx` - Demo page
- `package.json` - Added playwright dependency

## Support

For issues with Browserbase, visit: https://docs.browserbase.com
For Playwright docs, visit: https://playwright.dev
