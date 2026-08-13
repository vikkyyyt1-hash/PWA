// Day 10 audit: run Lighthouse against the live site and save scores + report.
// Usage: npm run check-lighthouse  (optional: npm run check-lighthouse -- <url>)
import puppeteer from 'puppeteer-core'
import lighthouse from 'lighthouse'
import { writeFileSync } from 'node:fs'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const url = process.argv[2] || 'https://vikkyyyt1-hash.github.io/PWA/'
const outFile = 'docs/lighthouse.json'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-first-run', '--no-default-browser-check'],
})

const port = new URL(browser.wsEndpoint()).port
const report = await lighthouse(url, {
  port,
  output: 'json',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  logLevel: 'error',
})
await browser.close()

const scores = Object.fromEntries(
  Object.entries(report.lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)])
)
console.log('SCORES', JSON.stringify(scores))
writeFileSync(outFile, JSON.stringify(report.lhr, null, 2))
console.log('Report saved to', outFile)