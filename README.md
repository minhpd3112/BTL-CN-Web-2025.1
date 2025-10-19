# EduLearn Platform Monorepo

Full-stack codebase for EduLearn, split into dedicated `frontend/` and `backend/` workspaces, with shared documentation under `docs/`.

## Project Structure

```
/                            # repository root
|-- frontend/                # Vite + React client
|   |-- package.json
|   |-- vite.config.ts
|   |-- public/
|   |   |-- index.html       # app entry (mirrored at project root for Vite)
|   |   `-- assets/
|   |       |-- images/
|   |       `-- fonts/
|   `-- src/
|       |-- assets/          # component-scoped static assets
|       |-- components/      # reusable UI (shadcn) + custom widgets
|       |-- features/        # feature modules (layout shell, etc.)
|       |-- hooks/           # shared React hooks
|       |-- pages/           # route-level components
|       |-- services/        # API clients & mock data (`services/mocks`)
|       |-- styles/          # Tailwind/global CSS
|       |-- types/           # TypeScript contracts
|       |-- App.tsx
|       `-- main.tsx
|-- backend/                 # Express + Supabase API
|   |-- package.json
|   |-- tsconfig*.json
|   |-- src/
|   |   |-- config/          # env, logger, Supabase clients
|   |   |-- controllers/     # request handlers
|   |   |-- models/          # DB schemas (to be implemented)
|   |   |-- routes/          # API route definitions
|   |   |-- services/        # business logic
|   |   |-- middlewares/     # error & 404 handlers
|   |   |-- utils/           # shared helpers (HTTP status, etc.)
|   |   |-- app.ts           # Express app factory
|   |   `-- server.ts        # HTTP bootstrap
|   `-- tests/               # Vitest suites
`-- docs/                    # product & technical documentation
    `-- ...                  # SYSTEM_OVERVIEW, USER_GUIDE, etc.
```

## Getting Started

```bash
# install dependencies
npm run install:frontend
npm run install:backend
# or install both at once
npm run install:all

# run frontend (Vite dev server)
npm run dev           # alias for npm run dev:frontend

# run backend API (Express + tsx)
npm run dev:backend

# build & preview frontend bundle
npm run build
npm run preview

# backend quality gates
npm run lint:backend
npm run test:backend
npm run build:backend
```

Feel free to `cd frontend` or `cd backend` and run npm scripts directly if you prefer working inside each workspace.

## Next Steps

- Replace `frontend/src/services/mocks` with real API calls once the Supabase backend is ready.
- Extend backend `models/`, `services/`, and `routes/` following the Supabase schema described in the docs.
- Add CI/CD and Docker workflows at the repo root to automate testing, linting, and deployments.