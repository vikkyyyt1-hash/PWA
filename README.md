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

## 🔒 Security & Validation (Day 6)

- **XSS Prevention**: Input sanitization function replaces dangerous HTML entities (`<`, `>`, `&`, `"`, `'`).
- **Input Validation**: Rejects empty strings, limits task length to 100 characters, and prevents duplicate task entries.

## 💾 App Data & User Accounts (Day 7)

- **Authentication Flow**: Supports local user registration and login with password hashing.
- **Data Persistence**: Uses `localStorage` to separate tasks for each user profile.
- **Where is data stored?** Stored locally in the browser's `localStorage`.
- **Who could read it?** Anyone with physical access to the browser's Developer Tools on the target device. No data is sent to external servers.