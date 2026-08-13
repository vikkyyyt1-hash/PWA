import { useState } from 'react'
import { randomSalt, hashPassword } from './security.js'

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

    const db = JSON.parse(localStorage.getItem('pwa_db') || '{}')

    if (isRegister) {
      if (db[name]) return setError('User already exists.')
      // Store only salt + hash, never the plaintext password.
      const salt = randomSalt()
      db[name] = { salt, hash: await hashPassword(pass, salt) }
      localStorage.setItem('pwa_db', JSON.stringify(db))
    } else {
      const acc = db[name]
      if (!acc || (await hashPassword(pass, acc.salt)) !== acc.hash) {
        return setError('Wrong username or password.')
      }
    }

    onLogin(name)
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