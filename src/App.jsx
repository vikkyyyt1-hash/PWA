import { useState, useEffect } from 'react'

// Proste "haszowanie" haseł na potrzeby lokalnego uwierzytelniania
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
  // --- AUTH STATES (Day 7) ---
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('tracks_current_user') || null
  })
  const [isRegistering, setIsRegistering] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  // --- TASKS STATES (Day 6 Security) ---
  const [items, setItems] = useState([])
  const [input, setInput] = useState('')
  const [taskError, setTaskError] = useState('')

  // Pobieranie zadań przypisanych do zalogowanego konta
  useEffect(() => {
    if (currentUser) {
      const savedTasks = localStorage.getItem(`tracks_tasks_${currentUser}`)
      setItems(savedTasks ? JSON.parse(savedTasks) : ['Issue #1: Core Layout Completed', 'Issue #2: Security & Auth Live'])
    } else {
      setItems([])
    }
  }, [currentUser])

  // Zapis zadań w localStorage dla konkretnego użytkownika
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tracks_tasks_${currentUser}`, JSON.stringify(items))
    }
  }, [items, currentUser])

  // --- AUTH LOGIC ---
  const handleAuthSubmit = (e) => {
    e.preventDefault()
    setAuthError('')

    const username = usernameInput.trim().toLowerCase()
    const password = passwordInput.trim()

    if (!username || !password) {
      setAuthError('Please enter both username and password.')
      return
    }

    const users = JSON.parse(localStorage.getItem('tracks_users') || '{}')

    if (isRegistering) {
      if (users[username]) {
        setAuthError('User already exists. Please log in instead.')
        return
      }

      users[username] = simpleHash(password)
      localStorage.setItem('tracks_users', JSON.stringify(users))
      localStorage.setItem('tracks_current_user', username)
      setCurrentUser(username)
    } else {
      if (!users[username] || users[username] !== simpleHash(password)) {
        setAuthError('Invalid username or password.')
        return
      }

      localStorage.setItem('tracks_current_user', username)
      setCurrentUser(username)
    }

    setUsernameInput('')
    setPasswordInput('')
  }

  const handleLogout = () => {
    localStorage.removeItem('tracks_current_user')
    setCurrentUser(null)
  }

  // --- TASK & SECURITY LOGIC (XSS Prevention & Validation) ---
  const sanitizeInput = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  }

  const addItem = (e) => {
    e.preventDefault()
    setTaskError('')

    const trimmedInput = input.trim()

    if (!trimmedInput) {
      setTaskError('Task title cannot be empty.')
      return
    }

    if (trimmedInput.length > 100) {
      setTaskError('Task is too long (maximum 100 characters).')
      return
    }

    if (items.some((item) => item.toLowerCase() === trimmedInput.toLowerCase())) {
      setTaskError('This task already exists in your list.')
      return
    }

    const cleanInput = sanitizeInput(trimmedInput)
    setItems([...items, cleanInput])
    setInput('')
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <main className="app-shell" role="main">
      <section className="card" aria-labelledby="main-title">
        <header className="app-header">
          <span className="badge">Day 7 — App Data & User Accounts</span>
          <h1 id="main-title">Capstone Task Manager</h1>
          <p className="subtitle">
            Secure, installable web application with local user authentication.
          </p>
        </header>

        {/* WIDOK 1: FORMULARZ LOGOWANIA / REJESTRACJI */}
        {!currentUser ? (
          <div className="auth-container">
            <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{isRegistering ? 'Create Account' : 'Log In'}</h2>
            
            <form onSubmit={handleAuthSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                aria-label="Username"
              />
              <input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                aria-label="Password"
              />
              <button type="submit" style={{ padding: '10px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isRegistering ? 'Sign Up' : 'Log In'}
              </button>
            </form>

            {authError && (
              <p role="alert" style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 'bold' }}>
                ⚠️ {authError}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setAuthError('')
              }}
              style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem', width: '100%' }}
            >
              {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
            </button>
          </div>
        ) : (
          /* WIDOK 2: ZALOGOWANY UŻYTKOWNIK (MENEDŻER ZADAŃ) */
          <div className="app-content">
            <div className="user-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
              <span>User: <strong>{currentUser}</strong></span>
              <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                Logout
              </button>
            </div>

            <form onSubmit={addItem} className="form-row">
              <input
                type="text"
                placeholder="Add a new task..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  if (taskError) setTaskError('')
                }}
                maxLength={100}
                aria-label="Task content"
              />
              <button type="submit">Add Task</button>
            </form>

            {taskError && (
              <p className="error-message" role="alert" style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '-12px', marginBottom: '16px', fontWeight: 'bold' }}>
                ⚠️ {taskError}
              </p>
            )}

            <ul className="item-list" aria-label="Capstone Task List">
              {items.map((item, index) => (
                <li key={index} className="item-row">
                  <span>{item}</span>
                  <button 
                    onClick={() => removeItem(index)} 
                    className="delete-btn" 
                    aria-label={`Delete ${item}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            {items.length === 0 && <p className="empty">No tasks available for {currentUser}.</p>}
          </div>
        )}

        <footer className="issues-footer"></footer>
      </section>
    </main>
  )
}

export default App