import { useState, useEffect } from 'react'
import './App.css'

const sanitizeInput = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return hash.toString()
}

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(true)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('pwa_current_user') || null
  })
  const [isRegistering, setIsRegistering] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [taskError, setTaskError] = useState('')

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setIsInstallable(false)
      setDeferredPrompt(null)
    } else {
      alert('PWA is already installed or your browser does not support the installation prompt.')
    }
  }

  useEffect(() => {
    if (currentUser) {
      const savedTasks = localStorage.getItem(`pwa_tasks_${currentUser}`)
      setTasks(savedTasks ? JSON.parse(savedTasks) : [
        { id: 1, text: 'Test PWA on mobile device', completed: false },
        { id: 2, text: 'Add offline support', completed: true }
      ])
    } else {
      setTasks([])
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`pwa_tasks_${currentUser}`, JSON.stringify(tasks))
    }
  }, [tasks, currentUser])

  const handleAuthSubmit = (e) => {
    e.preventDefault()
    setAuthError('')

    const cleanUsername = sanitizeInput(usernameInput.trim().toLowerCase())
    const password = passwordInput.trim()

    if (!cleanUsername || !password) {
      setAuthError('Please fill in both username and password.')
      return
    }

    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      setAuthError('Username must be between 3 and 20 characters.')
      return
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.')
      return
    }

    const users = JSON.parse(localStorage.getItem('pwa_users') || '{}')

    if (isRegistering) {
      if (users[cleanUsername]) {
        setAuthError('User already exists! Please log in.')
        return
      }

      users[cleanUsername] = simpleHash(password)
      localStorage.setItem('pwa_users', JSON.stringify(users))
      localStorage.setItem('pwa_current_user', cleanUsername)
      setCurrentUser(cleanUsername)
    } else {
      if (!users[cleanUsername] || users[cleanUsername] !== simpleHash(password)) {
        setAuthError('Invalid username or password.')
        return
      }
      localStorage.setItem('pwa_current_user', cleanUsername)
      setCurrentUser(cleanUsername)
    }

    setUsernameInput('')
    setPasswordInput('')
  }

  const handleLogout = () => {
    localStorage.removeItem('pwa_current_user')
    setCurrentUser(null)
  }

  const addTask = (e) => {
    e.preventDefault()
    setTaskError('')

    const trimmedInput = input.trim()

    if (!trimmedInput) {
      setTaskError('Task cannot be empty.')
      return
    }

    if (trimmedInput.length > 80) {
      setTaskError('Task is too long (max 80 characters).')
      return
    }

    const isDuplicate = tasks.some(
      (t) => t.text.toLowerCase() === trimmedInput.toLowerCase()
    )
    if (isDuplicate) {
      setTaskError('This task is already in your list.')
      return
    }

    const cleanInput = sanitizeInput(trimmedInput)
    setTasks([...tasks, { id: Date.now(), text: cleanInput, completed: false }])
    setInput('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div className="app-container" style={{ maxWidth: '420px', margin: '40px auto', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 5px 0' }}>📱 PWA Task App</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Day 7 — Secure PWA & User Accounts</p>
        
        {isOffline && (
          <div style={{ background: '#f59e0b', color: '#fff', padding: '6px', borderRadius: '6px', fontSize: '0.8rem', marginTop: '10px', fontWeight: 'bold' }}>
            📡 Offline Mode (Data saved locally)
          </div>
        )}

        {isInstallable && (
          <button 
            onClick={handleInstallClick} 
            style={{ marginTop: '12px', width: '100%', padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            📥 Install PWA App
          </button>
        )}
      </header>

      {!currentUser ? (
        <div className="auth-box">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{isRegistering ? 'Register' : 'Log In'}</h2>
          
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Username (min. 3 characters)"
              value={usernameInput}
              onChange={(e) => {
                setUsernameInput(e.target.value)
                if (authError) setAuthError('')
              }}
              maxLength={20}
              style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value)
                if (authError) setAuthError('')
              }}
              maxLength={30}
              style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
            <button 
              type="submit" 
              style={{ padding: '10px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}
            >
              {isRegistering ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          {authError && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '10px', fontWeight: 'bold', textAlign: 'center' }}>
              ⚠️ {authError}
            </p>
          )}

          <button 
            type="button" 
            onClick={() => {
              setIsRegistering(!isRegistering)
              setAuthError('')
            }}
            style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', marginTop: '15px', fontSize: '0.85rem', width: '100%', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
            <span>User: <strong>{currentUser}</strong></span>
            <button 
              onClick={handleLogout} 
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Logout
            </button>
          </div>

          <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (taskError) setTaskError('')
              }}
              placeholder="Add a new task..."
              maxLength={80}
              style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
            <button type="submit" style={{ padding: '10px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Add
            </button>
          </form>

          {taskError && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 'bold' }}>
              ⚠️ {taskError}
            </p>
          )}

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tasks.map((task) => (
              <li key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
                <span 
                  onClick={() => toggleTask(task.id)} 
                  style={{ cursor: 'pointer', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#94a3b8' : '#0f172a' }}
                >
                  {task.text}
                </span>
                <button 
                  onClick={() => deleteTask(task.id)} 
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {tasks.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginTop: '15px' }}>No tasks found for this user.</p>}
        </>
      )}
    </div>
  )
}

export default App