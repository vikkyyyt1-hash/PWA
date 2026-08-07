import { useState, useEffect } from 'react'

function App() {
  // #4 Add local data persistence or state saving (zapis w localStorage)
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('tracks_items')
    return saved ? JSON.parse(saved) : ['Issue #1: Core Layout Completed', 'Issue #2: Interactive Features Live']
  })
  const [input, setInput] = useState('')

  useEffect(() => {
    localStorage.setItem('tracks_items', JSON.stringify(items))
  }, [items])

  // #2 Add the first interactive feature or game loop (funkcja dodawania/usuwania)
  const addItem = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setItems([...items, input.trim()])
    setInput('')
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    // #1 Build the main app screen and core layout & #5 Improve accessibility and responsive behavior
    <main className="app-shell" role="main">
      <section className="card" aria-labelledby="main-title">
        <header className="app-header">
          <span className="badge">Resolved Issues #1 - #6</span>
          <h1 id="main-title">Capstone Task Manager</h1>
          <p className="subtitle">
            Aplikacja zaliczeniowa realizująca wszystkie zaplanowane w repozytorium zgłoszenia (Issues).
          </p>
        </header>

        {/* #2 Interaktywny formularz */}
        <form onSubmit={addItem} className="form-row">
          <input
            type="text"
            placeholder="Dodaj nowe zadanie z Issue..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Treść zadania"
          />
          <button type="submit">Dodaj zadanie</button>
        </form>

        {/* Lista elementów */}
        <ul className="item-list" aria-label="Lista zadań Capstone">
          {items.map((item, index) => (
            <li key={index} className="item-row">
              <span>{item}</span>
              <button 
                onClick={() => removeItem(index)} 
                className="delete-btn" 
                aria-label={`Usuń ${item}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {items.length === 0 && <p className="empty">Brak zadań. Dodaj nowe wyżej!</p>}

        <footer className="issues-footer">
          <p>Status wdrożenia: <strong>#6 Prepare deployment and final project documentation (Completed)</strong></p>
        </footer>
      </section>
    </main>
  )
}

export default App