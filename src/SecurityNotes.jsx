const risks = [
  {
    code: 'A01',
    name: 'Broken Access Control',
    summary: 'Users can access data or functions they are not allowed to, e.g. another user’s tasks.',
    status: '⚠️ Partial',
    note: 'Tasks are isolated per user in separate localStorage keys, but the auth is client-side only (a learning demo, not production accounts).',
  },
  {
    code: 'A02',
    name: 'Cryptographic Failures',
    summary: 'Sensitive data is exposed because it is stored or sent without encryption.',
    status: '✅ Protected',
    note: 'Passwords are SHA-256 hashed before being stored and the site is served over HTTPS.',
  },
  {
    code: 'A03',
    name: 'Injection (XSS)',
    summary: 'Untrusted input is executed as code, e.g. a script in a text field.',
    status: '✅ Protected',
    note: 'React escapes all rendered output. Test: typing <script>alert(1)</script> shows it as plain text, no pop-up appears.',
  },
  {
    code: 'A04',
    name: 'Insecure Design',
    summary: 'Security is missing by design, not because of a bug in the code.',
    status: '⚠️ Partial',
    note: 'The app stores no sensitive real-world data, so the impact is low by design.',
  },
  {
    code: 'A05',
    name: 'Security Misconfiguration',
    summary: 'Default or weak server settings expose an app (missing headers, debug mode).',
    status: '⚠️ Partial',
    note: 'Hosted on GitHub Pages (HTTPS), but only the defaults; no custom security headers.',
  },
  {
    code: 'A06',
    name: 'Vulnerable and Outdated Components',
    summary: 'Known vulnerabilities in the libraries the app depends on.',
    status: '✅ Protected',
    note: 'Dependencies are installed fresh and updated with npm; npm audit reports 0 vulnerabilities.',
  },
  {
    code: 'A07',
    name: 'Identification and Authentication Failures',
    summary: 'Weak login rules or broken session handling let attackers take over accounts.',
    status: '⚠️ Partial',
    note: 'Password rules are enforced and only hashes are stored, but logins are local-only — not for real accounts.',
  },
  {
    code: 'A08',
    name: 'Software and Data Integrity Failures',
    summary: 'Code or data is trusted without verifying where it came from.',
    status: '✅ Protected',
    note: 'No third-party data feeds, auto-updates or untrusted content are loaded.',
  },
  {
    code: 'A09',
    name: 'Security Logging and Monitoring Failures',
    summary: 'Attacks go unnoticed because the app does not log or alert.',
    status: '❌ Not covered',
    note: 'No logging is implemented — a known limitation of this demo.',
  },
  {
    code: 'A10',
    name: 'Server-Side Request Forgery (SSRF)',
    summary: 'A server is tricked into fetching internal resources using crafted URLs.',
    status: '✅ Not applicable',
    note: 'The app is fully client-side; there is no server code making requests.',
  },
]

export default function SecurityNotes() {
  return (
    <section className="security-section">
      <h2>🔒 Security Notes — OWASP Top 10</h2>
      <p className="security-intro">
        Day 8 check: is our app vulnerable to each of the top risks? One sentence per risk.
      </p>

      {risks.map(r => (
        <article key={r.code} className="risk-card">
          <h3>
            {r.code} — {r.name}
            <span className="risk-status">{r.status}</span>
          </h3>
          <p><strong>One sentence:</strong> {r.summary}</p>
          <p><strong>Our app:</strong> {r.note}</p>
        </article>
      ))}

      <p className="security-intro">
        Live test performed — XSS: typing <code>&lt;script&gt;alert(1)&lt;/script&gt;</code> into the task
        field shows it as harmless text. No pop-up appeared, so output is escaped correctly.
      </p>
    </section>
  )
}