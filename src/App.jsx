import { useState, useEffect } from 'react'
import './App.css'

// Proste haszowanie haseł na potrzeby local-first auth
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
  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)

  // Auth States (Day 7)
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('pwa_current_user') || null
  })
  const [isRegistering, setIsRegistering] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  // Tasks States
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [taskError, setTaskError] = useState('')

  // Obsługa instalacji PWA
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
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setIsInstallable(false)
    setDeferredPrompt(null)
  }

  // Wczytywanie zadań dla zalogowanego użytkownika
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

  // Zapisywanie zadań
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`pwa_tasks_${currentUser}`, JSON.stringify(tasks))
    }
  }, [tasks, currentUser])

  // Logika rejestracji / logowania
  const handleAuthSubmit = (e) => {
    e.preventDefault()
    setAuthError('')
    const username = usernameInput.trim().toLowerCase()
    const password = passwordInput.trim()

    if (!username || !password) {
      setAuthError('Please enter username and password.')
      return
    }

    const users = JSON.parse(localStorage.getItem('pwa_users') || '{}')

    if (isRegistering) {
      if (users[username]) {
        setAuthError('User already exists.')
        return
      }
      users[username] = simpleHash(password)
      localStorage.setItem('pwa_users', JSON.stringify(users))
      localStorage.setItem('pwa_current_user', username)
      setCurrentUser(username)
    } else {
      if (!users[username] || users[username] !== simpleHash(password)) {
        setAuthError('Invalid credentials.')
        return
      }
      localStorage.setItem('pwa_current_user', username)
      setCurrentUser(username)
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
    if (!input.trim()) {
      setTaskError('Task cannot be empty.')
      return
    }
    setTasks([...tasks, { id: Date.now(), text: input.trim(), completed: false }])
    setInput('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div className="app-container">
      <header>
        <h1>📱 PWA Task App</h1>
        <p>Day 7 — App Data & User Accounts</p>
        
        {isInstallable && (
          <button onClick={handleInstallClick} className="install-btn">
            📥 Install App
          </button>
        )}
      </header>

      {!currentUser ? (
        <div className="auth-box" style={{ marginTop: '1rem' }}>
          <h2>{isRegistering ? 'Register' : 'Log In'}</h2>
          <form onSubmit={handleAuthSubmit} className="task-form" style={{ flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <input
              type="text"
              placeholder="Username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button type="submit">{isRegistering ? 'Sign Up' : 'Log In'}</button>
          </form>
          {authError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px' }}>⚠️ {authError}</p>}
          <button 
            type="button" 
            onClick={() => {
              setIsRegistering(!isRegistering)
              setAuthError('')
            }}
            style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', marginTop: '12px', fontSize: '0.85rem' }}
          >
            {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
            <span>User: <strong>{currentUser}</strong></span>
            <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
          </div>

          <form onSubmit={addTask} className="task-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a new task..."
            />
            <button type="submit">Add</button>
          </form>
          {taskError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '6px' }}>⚠️ {taskError}</p>}

          <ul className="task-list" style={{ marginTop: '1rem' }}>
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? 'completed' : ''}>
                <span onClick={() => toggleTask(task.id)} style={{ cursor: 'pointer', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.text}</span>
                <button onClick={() => deleteTask(task.id)} className="delete-btn">✕</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default App