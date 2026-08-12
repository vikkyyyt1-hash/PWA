# Capstone Project

This project is a modern web-based capstone starter designed for students building a polished portfolio piece. It is intended for learners who want a simple, professional foundation for a web app or game idea, and it provides a clear structure for organizing code, assets, documentation, and future features. The current version includes a polished landing experience with an interactive quiz loop, local progress saving, and responsive styling that can be extended into a full feature-rich app.

## Project structure

```text
your-project/
├── src/           # your code
├── assets/        # images, sounds, data
├── README.md      # the front door of your project
├── .gitignore
└── vite.config.js
```

## Getting started

```bash
npm install
npm run dev
```

Verify the offline mode really works (builds and tests in Chrome):

```bash
npm run check-offline
```

## Planning artifacts

- Issues: [docs/issues.md](docs/issues.md)
- Project board: [docs/project-board.md](docs/project-board.md)

## Deployment

Build the project for production with:

```bash
npm run build
```

The output will be generated in the dist folder.

Use this project as the base for your own capstone implementation.

# TrackS — Capstone Task Manager

An installable, accessible, and secure task management application built with React and Vite.

## 🔒 Security & PWA Features (Day 6 & Day 7)

- **Installable PWA**: Integrated `beforeinstallprompt` listener providing a native "Install App" button.
- **Offline Support**: Automatically detects offline status (`navigator.onLine`) and retains full functionality using `localStorage`.
- **Hashed Passwords**: Passwords are SHA-256 hashed (`crypto.subtle`) before storage — the plaintext is never written to `localStorage`, only a hashed marker is compared at login.
- **XSS Prevention**: React escapes all rendered output by default, so a task containing `<script>` is shown as harmless text, never executed.
- **Validation**: Enforces char limits, blocks empty entries, and eliminates duplicate tasks.
- **Data Storage**: User credentials (hashes) and tasks are isolated per account in `localStorage`.

## 🔐 Security Audit (Day 8)

OWASP Top 10 summary, our vulnerability assessment, XSS test and DevTools notes: [docs/security-notes.md](docs/security-notes.md)

## 🛡️ Hardening (Day 9)

Input validation + sanitisation, output escaping (proven by an automated XSS test), salted password hashing, security headers via meta tags (CSP, nosniff, no-referrer). Verify with:

```bash
npm run check-security
```