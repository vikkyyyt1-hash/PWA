// Day 13: capture README screenshots (login, tasks, admin, offline).
// Run: npm run screenshots  (builds first, then takes screenshots)
import puppeteer from 'puppeteer-core'
import http from 'node:http'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = join(fileURLToPath(import.meta.url), '..')
const distDir = join(__dirname, '..', 'dist')
const shotsDir = join(__dirname, '..', 'docs', 'screenshots')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml',
}

const server = http.createServer((req, res) => {
  const file = join(distDir, req.url === '/' ? '/index.html' : req.url)
  if (!existsSync(file)) { res.writeHead(404); return res.end('Not found') }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
})

// Demo data injected into localStorage (already logged in, so no login needed).
const db = {
  admin: { salt: 'aa', hash: 'bb', role: 'admin' },
  anna: { salt: 'cc', hash: 'dd', role: 'user' },
}
const tasksAdmin = [
  { id: 1, text: 'Set up project', done: true },
  { id: 2, text: 'Write the README', done: false },
  { id: 3, text: 'Deploy to Pages', done: false },
]
const tasksAnna = [{ id: 1, text: 'Study OWASP Top 10', done: false }]
const auditLog = [
  { time: '2026-08-17T09:00:00.000Z', evt: 'register: admin (admin)' },
  { time: '2026-08-17T09:05:00.000Z', evt: 'login: admin' },
  { time: '2026-08-17T09:10:00.000Z', evt: 'register: anna (user)' },
]

// Each shot: name + localStorage seed (empty = logged out).
const shots = [
  { name: 'login.png', seed: {} },
  { name: 'tasks.png', seed: { pwa_user: 'anna', pwa_role: 'user', tasks_anna: tasksAnna, pwa_db: db } },
  {
    name: 'admin.png',
    seed: { pwa_user: 'admin', pwa_role: 'admin', tasks_admin: tasksAdmin, pwa_db: db, pwa_log: auditLog },
  },
]

async function main() {
  if (!existsSync(CHROME)) throw new Error('Chrome not found')
  if (!existsSync(distDir)) throw new Error('No dist — run npm run build first')
  mkdirSync(shotsDir, { recursive: true })

  await new Promise((resolve) => server.listen(0, resolve))
  const url = `http://localhost:${server.address().port}/`

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })

  for (const { name, seed } of shots) {
    const page = await browser.newPage()
    await page.setViewport({ width: 420, height: 800 })
    // Fill localStorage before the app code runs.
    await page.evaluateOnNewDocument((s) => {
      for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v))
    }, seed)
    await page.goto(url, { waitUntil: 'networkidle0' })
    if (name === 'admin.png') await page.setOfflineMode(true)
    await new Promise((r) => setTimeout(r, 600))
    await page.screenshot({ path: join(shotsDir, name), fullPage: true })
    console.log('saved', name)
    await page.close()
  }

  await browser.close()
  server.close()
}

main().catch((err) => { console.error('Failed:', err.message); process.exit(1) })