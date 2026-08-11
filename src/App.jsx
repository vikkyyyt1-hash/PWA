import { useState, useEffect } from 'react'
import './App.css'

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
  const handleAuth = (e) => {
    e.preventDefault()
    setAuthError('')

    const cleanUser = username.trim().toLowerCase()
    const cleanPass = password.trim()

    if (!cleanUser || !cleanPass) return setAuthError('Enter username and password.')
    if (cleanUser.length < 3) return setAuthError('Username must be at least 3 chars.')
    if (cleanPass.length < 6) return setAuthError('Password must be at least 6 chars.')

    const db = JSON.parse(localStorage.getItem('pwa_db') || '{}')

    if (isRegister) {
      if (db[cleanUser]) return setAuthError('User already exists!')
      db[cleanUser] = cleanPass
      localStorage.setItem('pwa_db', JSON.stringify(db))
    } else {
      if (db[cleanUser] !== cleanPass) return setAuthError('Invalid credentials.')
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
    <div style={{ maxWidth: '400px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center' }}>
        <h2>📱 PWA Task App</h2>
        {isOffline && <p style={{ color: 'orange', fontWeight: 'bold' }}>📡 Offline Mode</p>}
        {deferredPrompt && (
          <button onClick={handleInstall} style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
            📥 Install App
          </button>
        )}
      </header>

      {!user ? (
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
          <button type="submit">{isRegister ? 'Sign Up' : 'Log In'}</button>
          {authError && <p style={{ color: 'red', fontSize: '0.85rem' }}>⚠️ {authError}</p>}
          <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
            {isRegister ? 'Switch to Log In' : 'Switch to Register'}
          </button>
        </form>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span>User: <strong>{user}</strong></span>
            <button onClick={handleLogout}>Logout</button>
          </div>

          <form onSubmit={addTask} style={{ display: 'flex', gap: '5px' }}>
            <input 
              style={{ flex: 1 }} 
              placeholder="New task..." 
              value={input} 
              onChange={e => setInput(e.target.value)} 
            />
            <button type="submit">Add</button>
          </form>
          {taskError && <p style={{ color: 'red', fontSize: '0.85rem' }}>⚠️ {taskError}</p>}

          <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
            {tasks.map(t => (
              <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #ddd' }}>
                <span 
                  onClick={() => toggleTask(t.id)} 
                  style={{ textDecoration: t.done ? 'line-through' : 'none', cursor: 'pointer' }}
                >
                  {t.text}
                </span>
                <button onClick={() => deleteTask(t.id)}>✕</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}