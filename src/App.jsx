const issues = [
  {
    id: 1,
    title: 'Build the main app screen and core layout',
    completed: true,
  },
  {
    id: 2,
    title: 'Add the first interactive feature or game loop',
    completed: true,
  },
  {
    id: 3,
    title: 'Create styling and visual polish for the experience',
    completed: true,
  },
  {
    id: 4,
    title: 'Add local data persistence or state saving',
    completed: true,
  },
  {
    id: 5,
    title: 'Improve accessibility and responsive behavior',
    completed: true,
  },
  {
    id: 6,
    title: 'Prepare deployment and final project documentation',
    completed: true,
  },
]

function App() {
  const completedCount = issues.filter((issue) => issue.completed).length
  const completionPercent = Math.round((completedCount / issues.length) * 100)

  return (
    <main className="app-shell">
      <section className="card" aria-labelledby="app-title">
        <header className="hero">
          <div>
            <p className="eyebrow">Capstone Project</p>
            <h1 id="app-title">Issues & Progress</h1>
            <p className="intro">
              This capstone project tracks implementation of core features. All issues below represent key milestones
              for building a polished web experience with clean architecture, responsive design, and proper documentation.
            </p>
          </div>
          <div className="stats" aria-label="Project statistics">
            <div>
              <span>Completed</span>
              <strong>{completedCount}/{issues.length}</strong>
            </div>
            <div>
              <span>Progress</span>
              <strong>{completionPercent}%</strong>
            </div>
          </div>
        </header>

        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
        </div>

        <div className="issues-list">
          <h2>Issues</h2>
          <ul>
            {issues.map((issue) => (
              <li key={issue.id} className={`issue-item${issue.completed ? ' completed' : ''}`}>
                <span className="issue-checkbox">{issue.completed ? '✓' : '○'}</span>
                <span className="issue-title">{issue.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="summary">
          <h2>Status</h2>
          <p>
            {completionPercent === 100
              ? 'All capstone requirements have been completed. The project is ready for presentation.'
              : `${completedCount} of ${issues.length} issues are complete.`}
          </p>
        </div>
      </section>
    </main>
  )
}

export default App
