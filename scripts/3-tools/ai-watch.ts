#!/usr/bin/env bun
/**
 * AI Watch Mode
 * 
 * Watches for file changes and auto-regenerates previews
 */

import { watch } from 'fs'
import { chromium } from 'playwright'
import { writeFile } from 'fs/promises'

const URL = 'http://localhost:3000'
const WATCH_DIR = 'apps/web'
const OUTPUT_DIR = 'apps/web/.preview'
const DEBOUNCE_MS = 1000

let browser: any = null
let page: any = null
let timeout: NodeJS.Timeout | null = null

async function generatePreview() {
  try {
    // Launch browser if not already running
    if (!browser) {
      console.log('🚀 Launching browser...')
      browser = await chromium.launch({ headless: true })
      page = await browser.newPage()
    }
    
    // Navigate
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 5000 })
    
    // Screenshot
    await page.screenshot({
      path: `${OUTPUT_DIR}/latest.png`,
      fullPage: true
    })
    
    // HTML
    const html = await page.content()
    await writeFile(`${OUTPUT_DIR}/latest.html`, html)
    
    // Accessibility
    const a11y = await page.accessibility.snapshot()
    await writeFile(`${OUTPUT_DIR}/a11y.json`, JSON.stringify(a11y, null, 2))
    
    // Timestamp
    const now = new Date().toISOString()
    await writeFile(`${OUTPUT_DIR}/updated-at.txt`, now)
    
    console.log(`✅ Preview updated: ${now}`)
    
  } catch (error) {
    console.error('❌ Preview failed:', error instanceof Error ? error.message : String(error))
  }
}

function scheduleUpdate(filename: string) {
  // Debounce updates
  if (timeout) clearTimeout(timeout)
  
  console.log(`📝 ${filename} changed, scheduling update...`)
  
  timeout = setTimeout(() => {
    generatePreview()
  }, DEBOUNCE_MS)
}

// Initial preview
console.log('🤖 AI Watch Mode started')
console.log(`👀 Watching: ${WATCH_DIR}`)
console.log(`📸 Output: ${OUTPUT_DIR}`)
console.log(`🌐 URL: ${URL}\n`)

generatePreview()

// Watch for changes
watch(WATCH_DIR, { recursive: true }, (event, filename) => {
  if (!filename) return
  
  // Only watch relevant files
  const ext = filename.split('.').pop()
  if (['html', 'css', 'js'].includes(ext || '')) {
    scheduleUpdate(filename)
  }
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...')
  if (browser) await browser.close()
  process.exit(0)
})
