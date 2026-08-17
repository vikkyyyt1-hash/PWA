import { readJSON } from './security.js'

// Count tasks for a user (fall back to 0 on any bad data).
function countTasks(name) {
  const tasks = readJSON(`tasks_${name}`, [])
  return Array.isArray(tasks) ? tasks.length : 0
}

// Admin-only view: users with roles + task counts, and the local audit log.
export default function AdminPanel() {
  const db = readJSON('pwa_db', {})
  const log = readJSON('pwa_log', [])
  const users = Object.entries(db).map(([name, acc]) => ({
    name,
    role: acc.role || 'user',
    count: countTasks(name),
  }))

  return (
    <section className="admin-section">
      <h2>🛡️ Admin Panel</h2>

      <h3>Users</h3>
      {users.length === 0 ? (
        <p className="empty-state">No registered users.</p>
      ) : (
        <ul className="task-list">
          {users.map(u => (
            <li key={u.name}>
              <span>{u.name} <em className="admin-role">({u.role})</em></span>
              <span className="admin-count">{u.count} tasks</span>
            </li>
          ))}
        </ul>
      )}

      <h3>Security log (last {log.length})</h3>
      {log.length === 0 ? (
        <p className="empty-state">No events yet.</p>
      ) : (
        <ul className="task-list">
          {log.map((entry, i) => (
            <li key={i}>
              <span>{entry.time.slice(0, 19).replace('T', ' ')}</span>
              <code>{entry.evt}</code>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}