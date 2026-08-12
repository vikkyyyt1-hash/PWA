import { useState, useEffect } from 'react'
import './App.css'
import AuthForm from './AuthForm'
import TaskSection from './TaskSection'
import SecurityNotes from './SecurityNotes'

export default function App() {
  // App state: who is logged in, network, PWA install prompt.
  const [user, setUser] = useState(() => localStorage.getItem('pwa_user'))
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installMsg, setInstallMsg] = useState('')
  const [showSecurity, setShowSecurity] = useState(false)

  // Track online/offline → show badge.
  useEffect(() => {
    const setStatus = () => setIsOffline(!navigator.onLine)
    window.addEventListener('online', setStatus)
    window.addEventListener('offline', setStatus)
    return () => {
      window.removeEventListener('online', setStatus)
      window.removeEventListener('offline', setStatus)
    }
  }, [])

  // Save the PWA install event (fires automatically in supporting browsers).
  useEffect(() => {
    const handlePrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [])

  // Install the app on the phone/desktop.
  const handleInstall = async () => {
    if (!deferredPrompt) {
      setInstallMsg('No install prompt — use browser menu → install app.')
      return
    }
    setInstallMsg('')
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
  }

  const handleLogin = (name) => {
    localStorage.setItem('pwa_user', name)
    setUser(name)
  }

  const handleLogout = () => {
    localStorage.removeItem('pwa_user')
    setUser(null)
  }

  // Logged-in → tasks, otherwise → login form.
  return (
    <div className="app-container">
      <header>
        <h1>📱 PWA Task App</h1>
        {isOffline && <span className="offline-badge">📡 Offline Mode</span>}
        <button className="install-btn" onClick={handleInstall}>📥 Download App</button>
        {installMsg && <p className="error-msg">{installMsg}</p>}
        <button className="security-toggle" onClick={() => setShowSecurity(!showSecurity)}>
          🔒 Security Notes
        </button>
      </header>

      {user
        ? <TaskSection user={user} onLogout={handleLogout} />
        : <AuthForm onLogin={handleLogin} />
      }

      {showSecurity && <SecurityNotes />}
    </div>
  )
}