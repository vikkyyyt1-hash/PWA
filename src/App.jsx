import { useState, useEffect } from 'react'
import './App.css'

// Sanitazcja kodu HTML (ochrona XSS)
const sanitizeInput = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Haszowanie haseł
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
  // Stany PWA & Offline
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(true) // Domyślnie widoczny dla testów
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // Stany Auth
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('pwa_current_user') || null
  })
  const [isRegistering, setIsRegistering] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  // Stany Zadań
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [taskError, setTaskError] = useState('')

  // Monitorowanie połączenia offline/online
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

  // Pr przechwytywanie promptu instalacyjnego PWA
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
      alert('Aplikacja PWA jest już zainstalowana lub przeglądarka nie obsługuje automatycznego promptu.')
    }
  }

  // Wczytywanie zadań zalogowanego użytkownika
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

  // Zapis zadań w localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`pwa_tasks_${currentUser}`, JSON.stringify(tasks))
    }
  }, [tasks, currentUser])

  // Walidacja i obsługa Logowania / Rejestracji
  const handleAuthSubmit = (e) => {
    e.preventDefault()
    setAuthError('')

    const cleanUsername = sanitizeInput(usernameInput.trim().toLowerCase())
    const password = passwordInput.trim()

    // 1. Sprawdzanie pustych pól
    if (!cleanUsername || !password) {
      setAuthError('Uzupełnij nazwę użytkownika i hasło.')
      return
    }

    // 2. Ograniczenie długości loginu (ochrona przed obciążeniem)
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      setAuthError('Nazwa użytkownika musi mieć od 3 do 20 znaków.')
      return
    }

    // 3. Wymagana długość hasła
    if (password.length < 6) {
      setAuthError('Hasło musi mieć co najmniej 6 znaków.')
      return
    }

    const users = JSON.parse(localStorage.getItem('pwa_users') || '{}')

    if (isRegistering) {
      // 4. Blokada tworzenia istniejącego użytkownika
      if (users[cleanUsername]) {
        setAuthError('Użytkownik o takiej nazwie już istnieje! Zaloguj się.')
        return
      }

      users[cleanUsername] = simpleHash(password)
      localStorage.setItem('pwa_users', JSON.stringify(users))
      localStorage.setItem('pwa_current_user', cleanUsername)
      setCurrentUser(cleanUsername)
    } else {
      // Logowanie
      if (!users[cleanUsername] || users[cleanUsername] !== simpleHash(password)) {
        setAuthError('Nieprawidłowa nazwa użytkownika lub hasło.')
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

  // Walidacja i dodawanie zadań
  const addTask = (e) => {
    e.preventDefault()
    setTaskError('')

    const trimmedInput = input.trim()

    if (!trimmedInput) {
      setTaskError('Treść zadania nie może być pusta.')
      return
    }

    if (trimmedInput.length > 80) {
      setTaskError('Zadanie jest za długie (maksymalnie 80 znaków).')
      return
    }

    // Blokada dodawania identycznych zadań
    const isDuplicate = tasks.some(
      (t) => t.text.toLowerCase() === trimmedInput.toLowerCase()
    )
    if (isDuplicate) {
      setTaskError('To zadanie znajduje się już na Twojej liście.')
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
            📡 Tryb Offline (Dane zapisywane lokalnie)
          </div>
        )}

        {isInstallable && (
          <button 
            onClick={handleInstallClick} 
            style={{ marginTop: '12px', width: '100%', padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            📥 Zainstaluj Aplikację PWA
          </button>
        )}
      </header>

      {!currentUser ? (
        <div className="auth-box">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{isRegistering ? 'Rejestracja' : 'Logowanie'}</h2>
          
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Nazwa użytkownika (min. 3 znaki)"
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
              placeholder="Hasło (min. 6 znaków)"
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
              {isRegistering ? 'Zarejestruj się' : 'Zaloguj się'}
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
            {isRegistering ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
            <span>Zalogowany: <strong>{currentUser}</strong></span>
            <button 
              onClick={handleLogout} 
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Wyloguj
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
              placeholder="Dodaj nowe zadanie..."
              maxLength={80}
              style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
            <button type="submit" style={{ padding: '10px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Dodaj
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

          {tasks.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginTop: '15px' }}>Brak zadań dla tego użytkownika.</p>}
        </>
      )}
    </div>
  )
}

export default App