// Realny test offline: otwiera wdrożoną wersję w Chrome,
// przełącza przeglądarkę w tryb bez internetu i sprawdza, czy strona nadal działa.
// Uruchomienie: npm run check-offline
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

// Mały lokalny serwer, który serwuje zawartość folderu dist.
const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url
  const file = join(distDir, urlPath)
  if (!existsSync(file)) {
    res.writeHead(404)
    return res.end('Not found')
  }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
})

async function main() {
  if (!existsSync(CHROME)) throw new Error('Chrome not found — install it or change CHROME path')
  if (!existsSync(distDir)) throw new Error('No dist folder — run npm run build first')

  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()
  const url = `http://localhost:${port}/`

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
  const page = await browser.newPage()

  // 1. Pierwsze wejście online: strona ładuje się i service worker zapisuje pliki w cache.
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  await new Promise((r) => setTimeout(r, 500))

  // 2. Wyłączamy internet i odświeżamy — to jest test offline.
  await page.setOfflineMode(true)
  await page.reload({ waitUntil: 'domcontentloaded' })

  // 3. Sprawdzamy, czy aplikacja naprawdę się uruchomiła bez sieci.
  const title = await page.title()
  const hasApp = await page.evaluate(() => document.body.innerText.includes('PWA Task App'))
  const errors = await page.evaluate(() => {
    const swStatus = navigator.serviceWorker
      ? (navigator.serviceWorker.controller ? 'active' : 'missing')
      : 'unsupported'
    return { swStatus }
  })

  console.log('TITLE   :', title)
  console.log('APP     :', hasApp ? 'OK — app rendered' : 'FAIL — app not rendered')
  console.log('SW      :', errors.swStatus)
  console.log('OFFLINE :', hasApp && errors.swStatus === 'active' ? 'PASS — works offline' : 'FAIL')

  await browser.close()
  server.close()
  if (!hasApp || errors.swStatus !== 'active') process.exit(1)
}

main().catch((err) => {
  console.error('Test failed:', err.message)
  process.exit(1)
})