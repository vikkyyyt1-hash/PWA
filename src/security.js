// Random salt string (hex).
export function randomSalt(len = 8) {
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

// Hash with a per-user salt, so identical passwords get different hashes.
export async function hashPassword(pass, salt) {
  const data = new TextEncoder().encode(salt + pass)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

// Read JSON from localStorage; corrupt data must never crash the app.
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// Write JSON to localStorage.
export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Append an event to the local audit log (keeps the last 50 entries).
export function logEvent(evt) {
  const log = readJSON('pwa_log', [])
  log.push({ time: new Date().toISOString(), evt })
  writeJSON('pwa_log', log.slice(-50))
}