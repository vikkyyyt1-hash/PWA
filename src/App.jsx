import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'habit-keeper-habits'

function App() {
  const [habits, setHabits] = useState([])
  const [title, setTitle] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setHabits(JSON.parse(stored))
      } catch (error) {
        console.warn('Failed to parse habits from localStorage', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const completedCount = useMemo(
    () => habits.filter((habit) => habit.done).length,
    [habits],
  )

  const addHabit = (event) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      return
    }

    setHabits((current) => [
      ...current,
      { id: crypto.randomUUID?.() || Date.now().toString(), title: trimmed, done: false },
    ])
    setTitle('')
  }

  const toggleHabit = (id) => {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === id ? { ...habit, done: !habit.done } : habit,
      ),
    )
  }

  const deleteHabit = (id) => {
    setHabits((current) => current.filter((habit) => habit.id !== id))
  }

  const clearCompleted = () => {
    setHabits((current) => current.filter((habit) => !habit.done))
  }

  const promptInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setInstalled(true)
    }
    setDeferredPrompt(null)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-600">Habit Keeper</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Daily habit tracker
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Install it on your phone, add habits, and check them off even when you are offline.
            </p>
          </div>

          {deferredPrompt && !installed ? (
            <button
              type="button"
              className="inline-flex w-fit items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
              onClick={promptInstall}
            >
              Install app
            </button>
          ) : null}
        </header>

        <section className="grid gap-6 rounded-[2rem] border border-violet-200/80 bg-violet-50/60 p-6 sm:p-8">
          <form className="grid gap-4" onSubmit={addHabit}>
            <label htmlFor="habit-input" className="text-sm font-semibold text-slate-700">
              New habit
            </label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                id="habit-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Read for 10 minutes"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
              />
              <button
                type="submit"
                className="rounded-2xl border border-violet-200 bg-white px-5 py-3 text-sm font-semibold text-violet-600 shadow-sm transition hover:bg-violet-50"
              >
                Add
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:justify-between">
            <div className="text-sm font-semibold text-slate-900">{habits.length} habit{habits.length === 1 ? '' : 's'}</div>
            <div className="text-sm text-slate-600">{completedCount} completed</div>
          </div>

          {habits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-violet-200 bg-white/80 p-8 text-center text-slate-600">
              Start by adding a habit to keep your routine on track.
            </div>
          ) : (
            <ul className="grid gap-3">
              {habits.map((habit) => (
                <li
                  key={habit.id}
                  className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition ${habit.done ? 'opacity-70' : ''}`}
                >
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-violet-600 transition hover:bg-violet-100"
                    aria-pressed={habit.done}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    {habit.done ? '✓' : ''}
                  </button>
                  <span className={`flex-1 text-left text-base ${habit.done ? 'line-through' : ''}`}>
                    {habit.title}
                  </span>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                    aria-label={`Delete ${habit.title}`}
                    onClick={() => deleteHabit(habit.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {completedCount > 0 ? (
            <button
              type="button"
              className="w-fit rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              onClick={clearCompleted}
            >
              Clear completed habits
            </button>
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default App
