import { useState, useEffect } from 'react'
import './App.css'
import AuthForm from './AuthForm'
import TaskSection from './TaskSection'

export default function App() {
  // Zalogowany użytkownik (zapisany w localStorage), stan sieci i zdarzenie instalacji PWA.
  const [user, setUser] = useState(() => localStorage.getItem('pwa_user'))
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  // Nasłuchujemy zdarzeń internetu: online/offline zmieniają komunikat.
  useEffect(() => {
    const setStatus = () => setIsOffline(!navigator.onLine)
    window.addEventListener('online', setStatus)
    window.addEventListener('offline', setStatus)
    return () => {
      window.removeEventListener('online', setStatus)
      window.removeEventListener('offline', setStatus)
    }
  }, [])

  // Zapisanie zdarzenia instalacji PWA, żeby przycisk "Install" pojawił się tylko, gdy przeglądarka je wyśle.
  useEffect(() => {
    const handlePrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [])

  // Pokaż przeglądarce okno instalacji aplikacji.
  const handleInstall = async () => {
    if (!deferredPrompt) return
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

  // Główna zasada: zalogowany użytkownik widzi zadania, niezalogowany formularz logowania.
  return (
    <div className="app-container">
      <header>
        <h1>📱 PWA Task App</h1>
        {isOffline && <span className="offline-badge">📡 Offline Mode</span>}
        {deferredPrompt && (
          <button className="install-btn" onClick={handleInstall}>📥 Install App</button>
        )}
      </header>

      {user
        ? <TaskSection user={user} onLogout={handleLogout} />
        : <AuthForm onLogin={handleLogin} />}
    </div>
  )
}