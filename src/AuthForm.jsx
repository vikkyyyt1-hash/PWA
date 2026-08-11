import { useState } from 'react'

// Zamienia hasło na hash, żeby w localStorage nigdy nie był zapisany sam tekst.
async function hashPassword(password) {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}

export default function AuthForm({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Oczyszczamy dane użytkownika przed zapisaniem.
    const name = username.trim().toLowerCase()
    const pass = password.trim()

    // Walidacja formularza: pole nie może być puste, a hasło musi być wystarczająco długie.
    if (!name || !pass) return setError('Enter username and password.')
    if (name.length < 3) return setError('Username must be at least 3 chars.')
    if (pass.length < 6) return setError('Password must be at least 6 chars.')

    // Zapisujemy tylko hash, więc w localStorage nigdy nie ma prawdziwego hasła.
    const hash = await hashPassword(pass)
    const db = JSON.parse(localStorage.getItem('pwa_db') || '{}')

    // Rejestracja: dodaj nowego użytkownika. Logowanie: porównaj hashe.
    if (isRegister) {
      if (db[name]) return setError('User already exists!')
      db[name] = hash
      localStorage.setItem('pwa_db', JSON.stringify(db))
    } else if (db[name] !== hash) {
      return setError('Invalid credentials.')
    }

    onLogin(name)
    setUsername('')
    setPassword('')
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h3>{isRegister ? 'Register' : 'Log In'}</h3>
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