import { useState } from 'react'
import { randomSalt, hashPassword, readJSON, writeJSON, logEvent } from './security.js'

export default function AuthForm({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Never trust the browser: validate + normalise first.
    const name = username.trim().toLowerCase()
    const pass = password.trim()
    if (!name || !pass) return setError('Fill in all fields.')
    if (!/^[a-z0-9_]{3,20}$/.test(name)) return setError('Username: 3-20 chars (a-z, 0-9, _).')
    if (pass.length < 6 || pass.length > 64) return setError('Password must be 6-64 chars.')

    const db = readJSON('pwa_db', {})

    if (isRegister) {
      if (db[name]) return setError('User already exists.')
      // Role comes from the account record, never from user input.
      // The first account becomes admin; later accounts are regular users.
      const role = Object.keys(db).length === 0 ? 'admin' : 'user'
      const salt = randomSalt()
      db[name] = { salt, hash: await hashPassword(pass, salt), role }
      writeJSON('pwa_db', db)
      logEvent(`register: ${name} (${role})`)
      onLogin({ name, role })
    } else {
      // Malformed or old-format accounts must not crash or grant access.
      const acc = db[name]
      if (!acc || typeof acc.hash !== 'string' || (await hashPassword(pass, acc.salt || '')) !== acc.hash) {
        return setError('Wrong username or password.')
      }
      logEvent(`login: ${name}`)
      onLogin({ name, role: acc.role || 'user' })
    }

    setUsername('')
    setPassword('')
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>{isRegister ? 'Register' : 'Log In'}</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="btn-primary" type="submit">{isRegister ? 'Sign Up' : 'Log In'}</button>
      {error && <p className="error-msg">⚠️ {error}</p>}
      <button className="switch-btn" type="button" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Switch to Log In' : 'Switch to Register'}
      </button>
    </form>
  )
}