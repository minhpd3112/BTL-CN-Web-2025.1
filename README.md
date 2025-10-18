
# EduLearn Platform Monorepo

This repository hosts the EduLearn Platform codebase. Frontend assets now live under a dedicated `frontend/` workspace, while shared product documentation is collected inside `docs/`.

## Project Structure

```
/
├── frontend/              # Vite + React application
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── app/           # Layout shell, global state
│       ├── components/    # Shared UI (shadcn) + domain widgets
│       ├── data/          # Mock datasets (to swap with backend API)
│       ├── pages/         # Route-level React components
│       ├── styles/        # Tailwind & global CSS
│       └── types/         # TypeScript contracts
├── docs/                  # Architecture & product documentation
│   └── ...                # SYSTEM_OVERVIEW, USER_GUIDE, etc.
└── package.json           # Root helper scripts (delegates to frontend)
```

## Getting Started

```bash
# install frontend dependencies
npm run install:frontend

# start the dev server (Vite, port 3000)
npm run dev

# build production bundle (outputs to frontend/build)
npm run build

# preview the production build
npm run preview
```

All commands proxy to the `frontend/` workspace. You can also `cd frontend` and run npm scripts directly if preferred.

## Next Steps

- Connect the mock `frontend/src/data` layer to the real Supabase backend once available.
- Extend this monorepo with a `backend/` package (Express/Supabase API) when you start implementing server-side logic.
- Wire CI/CD and Docker definitions at the repository root to automate testing and deployments.
  
