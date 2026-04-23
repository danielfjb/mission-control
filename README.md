# Mission Control — Project Tracker

A personal project tracker with Firebase backend. Stay oriented across everything you're building.

## Features

- **Dashboard** — list all projects with status, completion, and current focus at a glance
- **Drag-to-reorder** — set priorities by dragging cards
- **Filter by status** — active / paused / completed / archived
- **Project detail** — milestones, progress journal with full history
- **Firebase** — Google Auth + Firestore, per-user data isolation
- **SOLID architecture** — repository → service → hook → component layers

---

## Architecture

```
src/
├── types/              # Shared TypeScript types (single source of truth)
├── firebase.ts         # Firebase app init
├── repositories/
│   └── ProjectRepository.ts   # All Firestore reads/writes
├── services/
│   └── ProjectService.ts      # Business logic, validation
├── hooks/
│   ├── useProjects.ts          # Projects list state
│   └── useProject.ts           # Single project state
├── contexts/
│   └── AuthContext.tsx         # Auth state + Google sign-in
└── components/
    ├── LoginPage.tsx
    ├── shared/
    │   ├── StatusBadge.tsx
    │   ├── ProgressBar.tsx
    │   └── ProjectForm.tsx
    ├── ProjectList/
    │   ├── ProjectList.tsx      # Dashboard / list view
    │   └── ProjectCard.tsx      # Draggable project card
    └── ProjectDetail/
        ├── ProjectDetail.tsx    # Full project page
        ├── MilestonesPanel.tsx  # Add/check/delete milestones
        └── ProgressPanel.tsx   # Progress journal + history
```

### SOLID principles applied

| Principle | Where |
|---|---|
| **Single Responsibility** | `ProjectRepository` only does Firestore I/O; `ProjectService` only does validation/logic |
| **Open/Closed** | Add new project fields by extending types + repository methods, never modifying existing ones |
| **Liskov** | Hooks return consistent interfaces regardless of data source |
| **Interface Segregation** | Each component receives only the props it needs |
| **Dependency Inversion** | Components depend on hooks; hooks depend on services; services depend on repository |

---

## Firestore Structure

```
users/
  {uid}/
    projects/
      {projectId}/         ← title, description, status, completion, priority, currentFocus
        milestones/
          {milestoneId}/   ← title, completed, dueDate
        progressHistory/
          {entryId}/       ← content, createdAt
```

---

## Setup

### 1. Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project
3. Enable **Authentication** → Google sign-in provider
4. Enable **Firestore Database** → start in production mode
5. Add `danielfjb.github.io` to **Authentication → Settings → Authorized domains**
6. Deploy security rules (see `firestore.rules`)

### 2. Environment variables

```bash
cp .env.example .env
```

Fill in `.env` with your Firebase project config (found in Project Settings → Your apps → SDK setup).

> **Note:** Vite uses `VITE_` prefix (not `REACT_APP_`) and exposes vars via `import.meta.env`.

### 3. Install & run

```bash
npm install       # clean install, no peer dependency conflicts
npm run dev       # starts dev server at http://localhost:5173
```

### 4. Deploy to GitHub Pages

```bash
npm run deploy    # builds and pushes to gh-pages branch
```

Then in your repo: **Settings → Pages → Source: gh-pages branch**.

### 5. Deploy Firestore rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
firebase deploy --only firestore:rules
```

---

## Extending the app

**Add a new field to Project** (e.g. `tags: string[]`):
1. Add to `types/index.ts` → `Project` interface
2. Add to `ProjectRepository.ts` → map it in `getAll` and `getById`
3. Add to `ProjectForm.tsx` → render the input
4. Done — service and hooks pick it up automatically

**Add a new page** (e.g. a Kanban board):
1. Create `components/KanbanBoard/` with its component
2. Add a new view type to `App.tsx` → `type View`
3. Wire navigation — no other files need changing
