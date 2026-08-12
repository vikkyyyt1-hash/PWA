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