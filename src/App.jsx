import { useState, useEffect } from 'react'
import './App.css'

// Zamienia hasło na hash, żeby w localStorage nigdy nie był zapisany zwykły tekst.
async function hashPassword(password) {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}

export default function App() {
  // 1. PWA & Offline Status
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // 2. Auth State
  const [user, setUser] = useState(() => localStorage.getItem('pwa_user') || null)
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // 3. Tasks State
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [taskError, setTaskError] = useState('')

  // Śledzenie stanu sieci (Online / Offline)
  useEffect(() => {
    const goOnline = () => setIsOffline(false)
    const goOffline = () => setIsOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Przechwytywanie zdarzenia instalacji PWA
  useEffect(() => {
    const handlePrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [])

  // Wczytywanie zadań użytkownika z localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`tasks_${user}`)
      setTasks(saved ? JSON.parse(saved) : [{ id: 1, text: 'First PWA Task', done: false }])
    } else {
      setTasks([])
    }
  }, [user])

  // Zapisywanie zadań do localStorage przy każdej zmianie
  useEffect(() => {
    if (user) localStorage.setItem(`tasks_${user}`, JSON.stringify(tasks))
  }, [tasks, user])

  // Obsługa instalacji PWA
  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
  }

  // Logika autoryzacji (Rejestracja / Logowanie)
  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')

    const cleanUser = username.trim().toLowerCase()
    const cleanPass = password.trim()

    if (!cleanUser || !cleanPass) return setAuthError('Enter username and password.')
    if (cleanUser.length < 3) return setAuthError('Username must be at least 3 chars.')
    if (cleanPass.length < 6) return setAuthError('Password must be at least 6 chars.')

    // Porównujemy tylko hashe, nigdy nie zapisujemy samego hasła.
    const hash = await hashPassword(cleanPass)
    const db = JSON.parse(localStorage.getItem('pwa_db') || '{}')

    if (isRegister) {
      if (db[cleanUser]) return setAuthError('User already exists!')
      db[cleanUser] = hash
      localStorage.setItem('pwa_db', JSON.stringify(db))
    } else {
      if (db[cleanUser] !== hash) return setAuthError('Invalid credentials.')
    }

    localStorage.setItem('pwa_user', cleanUser)
    setUser(cleanUser)
    setUsername('')
    setPassword('')
  }

  // Wylogowanie
  const handleLogout = () => {
    localStorage.removeItem('pwa_user')
    setUser(null)
  }

  // Dodawanie zadania z prostą walidacją
  const addTask = (e) => {
    e.preventDefault()
    setTaskError('')

    const text = input.trim()
    if (!text) return setTaskError('Task cannot be empty.')
    if (text.length > 60) return setTaskError('Task too long (max 60 chars).')
    if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) {
      return setTaskError('Task already exists.')
    }

    setTasks([...tasks, { id: Date.now(), text, done: false }])
    setInput('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div className="app-container">
      <header>
        <h1>📱 PWA Task App</h1>
        {isOffline && <span className="offline-badge">📡 Offline Mode</span>}
        {deferredPrompt && (
          <button className="install-btn" onClick={handleInstall}>
            📥 Install App
          </button>
        )}
      </header>

      {!user ? (
        <form className="auth-form" onSubmit={handleAuth}>
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
          {authError && <p className="error-msg">⚠️ {authError}</p>}
          <button className="switch-btn" type="button" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Switch to Log In' : 'Switch to Register'}
          </button>
        </form>
      ) : (
        <>
          <div className="user-bar">
            <span>User: <strong>{user}</strong></span>
            <button className="btn-secondary" onClick={handleLogout}>Logout</button>
          </div>

          <form className="task-form" onSubmit={addTask}>
            <input
              placeholder="New task..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button className="btn-primary" type="submit">Add</button>
          </form>
          {taskError && <p className="error-msg">⚠️ {taskError}</p>}

          {tasks.length === 0 ? (
            <p className="empty-state">No tasks yet. Add your first one!</p>
          ) : (
            <ul className="task-list">
              {tasks.map(t => (
                <li key={t.id} className={t.done ? 'completed' : ''}>
                  <span onClick={() => toggleTask(t.id)}>{t.text}</span>
                  <button className="delete-btn" onClick={() => deleteTask(t.id)}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}