# HILITE Sales OS

A multi-tenant Sales ERP MVP built for the HILITE technical assessment. The platform supports multiple organizations with isolated users, teams, leads, and dashboards — plus platform administration, RBAC, and event-driven notifications.

## Prerequisites

- **Node.js** 20 or later
- **Docker Desktop** (for PostgreSQL)

## Getting started

### First-time setup

From the repository root:

```powershell
npm install
copy apps\backend\.env.example apps\backend\.env
copy apps\frontend\.env.example apps\frontend\.env
npm run setup
```

`npm run setup` installs app dependencies, starts PostgreSQL, runs migrations, and seeds development data.

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `PORT` | API server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://hilite:hilite@localhost:5432/hilite_erp` |
| `JWT_SECRET` | Secret used to sign access tokens | `change-me` |
| `JWT_EXPIRES_IN` | Access token lifetime | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `FRONTEND_URL` | Allowed frontend origin for CORS and cookies | `http://localhost:5173` |
| `COOKIE_SECURE` | Set `Secure` flag on auth cookies | `true` |
| `LOG_LEVEL` | Logging verbosity | `info` |

### Frontend (`apps/frontend/.env`)

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

Copy the `.env.example` files to `.env` in each app directory and adjust values as needed.

### Daily development

From the repository root:

```powershell
npm run dev
```

This starts PostgreSQL (if not already running), the API, and the web app together.

- API: [http://localhost:3000](http://localhost:3000) — health check: [http://localhost:3000/health](http://localhost:3000/health)
- Frontend: [http://localhost:5173](http://localhost:5173)

Press **Ctrl+C** to stop the API and frontend. PostgreSQL keeps running in the background until you run `npm run db:down`.

### Other useful commands

| Command              | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `npm run dev:apps`   | Start API and frontend only (Postgres already running) |
| `npm run db:up`      | Start PostgreSQL                                       |
| `npm run db:down`    | Stop PostgreSQL                                        |
| `npm run db:ps`      | Check PostgreSQL status                                |
| `npm run db:migrate` | Run database migrations                                |
| `npm run db:seed`    | Seed development data                                  |
| `npm run db:studio`  | Open Prisma Studio                                     |

### Seed credentials (development)

After running `npm run db:seed`, these users are available for future auth testing:

| Email                      | Role                        | Password        |
| -------------------------- | --------------------------- | --------------- |
| `admin@hilite.com`         | Platform Admin              | `Admin@123`     |
| `admin@hilitebuilders.com` | Org Admin (HiLite Builders) | `HBuilders@123` |

## Theme

The UI uses an Apple-inspired design with **light**, **dark**, and **system** modes. Use the toggle in the app header (or on the login page) to switch themes.

## Documentation

- [Architecture](docs/architecture.md) — system design, auth, tenancy, notifications, scaling
- [Database schema](docs/database-schema.md)
- [ER diagram](docs/er-diagram.md)
