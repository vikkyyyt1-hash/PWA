# 📱 PWA Task App

A secure, offline-first, installable task manager built with React + Vite, hardened against the OWASP Top 10.

## What it is / who it's for

A small but real Progressive Web App (PWA): sign up, keep a task list, install it on your phone, and use it offline. Built as a **Track S capstone** — the goal is not just "it runs", but *it is hardened*: every input is validated, output is escaped, passwords are never stored, and the security model is documented.

**Live link:** https://vikkyyyt1-hash.github.io/PWA/

## Features

- Installable PWA (manifest + service worker + "Download App" button)
- Works **offline** (verified by an automated browser test)
- Local accounts: the **first user is admin**, others are regular users
- **Admin Panel**: all users, task counts, and a local security audit log
- Input validation + sanitisation, XSS-safe output (React escaping)
- Salted password hashing — plaintext never touches `localStorage`
- Lighthouse: Performance / Accessibility / Best Practices / SEO = **100/100/100/100**

## Project structure

```text
├── src/                  # React components + security helpers
├── public/               # manifest, icons, service worker
├── scripts/              # automated checks (offline, security, lighthouse, screenshots)
├── docs/                 # security notes, issues board, lighthouse report, screenshots
└── index.html            # app shell (includes CSP meta headers)
```


