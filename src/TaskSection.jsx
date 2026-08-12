import { useState, useEffect } from 'react'

export default function TaskSection({ user, onLogout }) {
  // Każdy użytkownik ma własne zadania w localStorage (klucz: tasks_<nazwa>).
  const storageKey = `tasks_${user}`
  // Na starcie wczytujemy zapisane zadania; jeśli nie ma żadnych, zaczynamy z pustą listą.
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem(storageKey) || '[]'))
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  // Zapisuje zadania przy każdej zmianie, więc przetrwają odświeżenie / offline.
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks))
  }, [tasks, storageKey])

  const addTask = (e) => {
    e.preventDefault()
    setError('')

    // Walidacja zadania: nie może być puste, zbyt długie ani być duplikatem.
    const text = input.trim()
    if (!text) return setError('Task cannot be empty.')
    if (text.length > 60) return setError('Task too long (max 60 chars).')
    if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) {
      return setError('Task already exists.')
    }

    // Dodajemy zadanie na koniec listy i czyścimy pole wpisywania.
    setTasks([...tasks, { id: Date.now(), text, done: false }])
    setInput('')
  }

  // Odznaczanie/oznaczanie zadania jako zrobionego.
  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  // Usuwanie zadania z listy.
  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <>
      <div className="user-bar">
        <span>User: <strong>{user}</strong></span>
        <button className="btn-secondary" onClick={onLogout}>Logout</button>
      </div>

      <form className="task-form" onSubmit={addTask}>
        <input
          placeholder="New task..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button className="btn-primary" type="submit">Add</button>
      </form>
      {error && <p className="error-msg">⚠️ {error}</p>}

      {tasks.length === 0 ? (
        <p className="empty-state">No tasks yet. Add your first one!</p>
      ) : (
        <ul className="task-list">
          {tasks.map(t => (
            <li key={t.id} className={t.done ? 'completed' : ''}>
              <span onClick={() => toggleTask(t.id)}>{t.text}</span>
              <button className="delete-btn" onClick={() => deleteTask(t.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}