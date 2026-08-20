import { useState, useEffect } from 'react'
import './App.css'
import AuthForm from './AuthForm'
import TaskSection from './TaskSection'
import SecurityNotes from './SecurityNotes'
import AdminPanel from './AdminPanel'
import { logEvent } from './security.js'

export default function App() {
  // App state: who is logged in, their role, network, PWA install prompt.
  const [user, setUser] = useState(() => localStorage.getItem('pwa_user'))
  const [role, setRole] = useState(() => localStorage.getItem('pwa_role'))
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallHelp, setShowInstallHelp] = useState(false)
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

  // Hide the button hint once the app is installed.
  useEffect(() => {
    const handleInstalled = () => setDeferredPrompt(null)
    window.addEventListener('appinstalled', handleInstalled)
    return () => window.removeEventListener('appinstalled', handleInstalled)
  }, [])

  // Install the app, or explain how if the browser offers no prompt.
  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowInstallHelp(true)
      return
    }
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
  }

  const handleLogin = ({ name, role: r }) => {
    localStorage.setItem('pwa_user', name)
    localStorage.setItem('pwa_role', r)
    setUser(name)
    setRole(r)
  }

  const handleLogout = () => {
    logEvent(`logout: ${user}`)
    localStorage.removeItem('pwa_user')
    localStorage.removeItem('pwa_role')
    setUser(null)
    setRole(null)
  }

  // Logged-in → tasks, otherwise → login form.
  return (
    <main className="app-container">
      <header>
        <h1>📱 PWA Task App</h1>
        {isOffline && <span className="offline-badge">📡 Offline Mode</span>}
        <button className="install-btn" onClick={handleInstall}>📥 Download App</button>
        <button className="security-toggle" onClick={() => setShowSecurity(!showSecurity)}>
          🔒 Security Notes
        </button>
      </header>

      {user
        ? <TaskSection user={user} onLogout={handleLogout} />
        : <AuthForm onLogin={handleLogin} />
      }

      {user && role === 'admin' && <AdminPanel />}
      {showSecurity && <SecurityNotes />}

      {showInstallHelp && (
        <div className="install-help-overlay" role="dialog" aria-modal="true" aria-label="Install the app">
          <div className="install-help">
            <h2>Install this app</h2>
            <p>Your browser can add this app to your home screen or desktop.</p>
            <ol>
              <li><strong>Phone (Android/iPhone):</strong> open the browser menu (⋯) → <em>Add to Home Screen</em> / <em>Install app</em>.</li>
              <li><strong>Desktop Chrome / Edge:</strong> click the install <span aria-hidden="true">⊕</span> icon in the address bar, or menu → <em>Install PWA Task App…</em>.</li>
              <li><strong>Desktop Firefox / Safari:</strong> menu → <em>Add to Home Screen</em> / <em>Pin to Dock</em>.</li>
            </ol>
            <button className="btn-primary" onClick={() => setShowInstallHelp(false)}>Got it</button>
          </div>
        </div>
      )}
    </main>
  )
}