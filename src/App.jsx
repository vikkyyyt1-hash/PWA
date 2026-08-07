import { useState, useEffect } from 'react'

function App() {
  // #4 Local Data Persistence (zapisywane w przeglądarce)
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('capstone_items')
    return saved ? JSON.parse(saved) : ['Pierwsze zadanie', 'Drugie zadanie']
  })
  const [input, setInput] = useState('')

  useEffect(() => {
    localStorage.setItem('capstone_items', JSON.stringify(items))
  }, [items])

  // #2 Interactive feature (dodawanie / usuwanie)
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
    // #1 Core Layout & #5 Responsive / Accessibility
    <main className="app-shell">
      <section className="card">
        <h1>Capstone App</h1>
        <p className="subtitle">Prosta aplikacja realizująca założenia projektu.</p>

        <form onSubmit={addItem} className="form-row">
          <input
            type="text"
            placeholder="Dodaj wpis..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Treść nowego wpisu"
          />
          <button type="submit">Dodaj</button>
        </form>

        <ul className="item-list">
          {items.map((item, index) => (
            <li key={index} className="item-row">
              <span>{item}</span>
              <button onClick={() => removeItem(index)} className="delete-btn" aria-label="Usuń wpis">
                ✕
              </button>
            </li>
          ))}
        </ul>

        {items.length === 0 && <p className="empty">Brak elementów na liście.</p>}
      </section>
    </main>
  )
}

export default App