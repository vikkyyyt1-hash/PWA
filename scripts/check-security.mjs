// Day 9 hardening test: prove no input runs as code.
// 1. register a user, 2. add a task containing <script>, 3. assert no alert pops up
// and the text is rendered as plain text. Also checks the CSP header is present.
// Run with: npm run check-security
import puppeteer from 'puppeteer-core'
import http from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = join(fileURLToPath(import.meta.url), '..')
const distDir = join(__dirname, '..', 'dist')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
}

const server = http.createServer((req, res) => {
  const file = join(distDir, req.url === '/' ? '/index.html' : req.url)
  if (!existsSync(file)) {
    res.writeHead(404)
    return res.end('Not found')
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
})

const PAYLOAD = "<script>alert('xss')</script>"

async function main() {
  if (!existsSync(CHROME)) throw new Error('Chrome not found — fix CHROME path')
  if (!existsSync(distDir)) throw new Error('No dist — run npm run build first')

  await new Promise((resolve) => server.listen(0, resolve))
  const url = `http://localhost:${server.address().port}/`

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
  const page = await browser.newPage()
  let alertFired = false
  page.on('dialog', async (d) => { alertFired = true; await d.dismiss() })

  // Register a fresh user.
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.click('.switch-btn')
  await page.type('input[placeholder="Username"]', 'tester9')
  await page.type('input[placeholder="Password"]', 'secret123')
  await page.click('.auth-form .btn-primary')
  await page.waitForSelector('.task-form', { timeout: 5000 })

  // Add an XSS payload as a task.
  await page.type('.task-form input', PAYLOAD)
  await page.click('.task-form .btn-primary')
  await page.waitForSelector('.task-list li', { timeout: 5000 })
  await new Promise((r) => setTimeout(r, 500))

  const shown = await page.evaluate(() => document.querySelector('.task-list li span')?.innerText || '')
  const csp = await page.evaluate(() => !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'))

  console.log('XSS alert  :', alertFired ? 'FAIL — code executed!' : 'OK — no dialog popped')
  console.log('Shown as   :', JSON.stringify(shown))
  console.log('CSP header :', csp ? 'OK — present' : 'MISSING')
  console.log(
    'RESULT     :',
    !alertFired && shown === PAYLOAD && csp ? 'PASS — input stays text' : 'FAIL'
  )

  await browser.close()
  server.close()
  if (alertFired || shown !== PAYLOAD || !csp) process.exit(1)
}

main().catch((err) => {
  console.error('Test failed:', err.message)
  process.exit(1)
})