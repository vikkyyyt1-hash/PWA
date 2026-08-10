import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('pwa_tasks')
    return savedTasks ? JSON.parse(savedTasks) : [
      { id: 1, text: 'Przetestować PWA na telefonie', completed: false },
      { id: 2, text: 'Dodać tryb offline', completed: true }
    ]
  })
  const [input, setInput] = useState('')

  useEffect(() => {
    localStorage.setItem('pwa_tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setTasks([...tasks, { id: Date.now(), text: input, completed: false }])
    setInput('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  return (
    <div className="app-container">
      <header>
        <h1>📱 PWA Task App</h1>
        <p>Day 6 — Installable Web App</p>
      </header>

      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Wpisz nowe zadanie..."
        />
        <button type="submit">Dodaj</button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <span onClick={() => toggleTask(task.id)}>{task.text}</span>
            <button onClick={() => deleteTask(task.id)} className="delete-btn">✕</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App