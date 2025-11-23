#!/usr/bin/env bun
/**
 * AI Preview Generator
 * 
 * Generates screenshots and snapshots for AI consumption
 */

import { chromium } from 'playwright'
import { writeFile } from 'fs/promises'

const URL = process.env.PREVIEW_URL || 'http://localhost:3000'
const OUTPUT_DIR = 'apps/web/.preview'

console.log('📸 Generating AI preview...')

try {
  // Launch browser
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  // Navigate
  console.log(`🌐 Opening ${URL}...`)
  await page.goto(URL, { waitUntil: 'networkidle' })
  
  // Screenshot (full page)
  console.log('📸 Taking screenshot...')
  await page.screenshot({
    path: `${OUTPUT_DIR}/latest.png`,
    fullPage: true
  })
  
  // HTML Snapshot
  console.log('📄 Extracting HTML...')
  const html = await page.content()
  await writeFile(`${OUTPUT_DIR}/latest.html`, html)
  
  // Accessibility Tree
  console.log('♿ Extracting accessibility tree...')
  const a11y = await page.accessibility.snapshot()
  await writeFile(`${OUTPUT_DIR}/a11y.json`, JSON.stringify(a11y, null, 2))
  
  // Timestamp
  const now = new Date().toISOString()
  await writeFile(`${OUTPUT_DIR}/updated-at.txt`, now)
  
  await browser.close()
  
  console.log('✅ Preview generated successfully!')
  console.log(`   📸 ${OUTPUT_DIR}/latest.png`)
  console.log(`   📄 ${OUTPUT_DIR}/latest.html`)
  console.log(`   ♿ ${OUTPUT_DIR}/a11y.json`)
  console.log(`   🕐 ${now}`)
  
} catch (error) {
  console.error('❌ Preview generation failed:', error instanceof Error ? error.message : String(error))
  console.log('\n⚠️  Make sure:')
  console.log('   1. Dev server is running: bun run dev-server')
  console.log('   2. Playwright is installed: bunx playwright install chromium')
  process.exit(1)
}
