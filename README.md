# HILITE Sales OS

A multi-tenant Sales ERP MVP built for the HILITE technical assessment. The platform supports multiple organizations with isolated users, teams, leads, and dashboards along with platform administration, RBAC, and event-driven notifications.

User identity is global (one email per person); org access is modeled via `organization_members` so the same user can belong to multiple organizations in the future. See [Multi-Org Readiness](docs/architecture.md#multi-org-readiness).

## Prerequisites

- **Node.js** 20 or later
- **Docker Desktop** (for PostgreSQL)

## Installation Steps

From the repository root:

```powershell
npm install
copy apps\backend\.env.example apps\backend\.env
copy apps\frontend\.env.example apps\frontend\.env
npm run setup
```

`npm run setup` runs `npm install` (workspace root), starts PostgreSQL, runs migrations, regenerates the Prisma client (fallback if migrate did not), and seeds development data.

This repo uses npm workspaces. Shared constants, types, and Zod schemas live in `packages/shared` (`@hilite/shared`) and are consumed by both apps.

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable                   | Description                                  | Default                                                |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| `PORT`                     | API server port                              | `3000`                                                 |
| `DATABASE_URL`             | PostgreSQL connection string                 | `postgresql://hilite:hilite@localhost:5432/hilite_erp` |
| `JWT_SECRET`               | Secret used to sign access tokens            | `change-me`                                            |
| `JWT_EXPIRES_IN`           | Access token lifetime                        | `1d`                                                   |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime                       | `7d`                                                   |
| `FRONTEND_URL`             | Allowed frontend origin for CORS and cookies | `http://localhost:5173`                                |
| `COOKIE_SECURE`            | Set `Secure` flag on auth cookies            | `true`                                                 |

For local HTTP development (`http://localhost:5173`), set `COOKIE_SECURE=false` in `apps/backend/.env` so auth cookies are sent over plain HTTP.
| `LOG_LEVEL` | Logging verbosity | `info` |

### Frontend (`apps/frontend/.env`)

| Variable       | Description          | Default                 |
| -------------- | -------------------- | ----------------------- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

Copy the `.env.example` files to `.env` in each app directory and adjust values as needed.

## Running the Application

### Daily development

From the repository root:

```powershell
npm run dev
```

This starts PostgreSQL (if not already running), the API, and the web app together.

- API: [http://localhost:3000](http://localhost:3000)
- Frontend: [http://localhost:5173](http://localhost:5173)

Press **Ctrl+C** to stop the API and frontend. PostgreSQL keeps running in the background until you run `npm run db:down`.

### Other useful commands

| Command               | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `npm run dev:apps`    | Start API and frontend only (Postgres already running) |
| `npm run db:up`       | Start PostgreSQL                                       |
| `npm run db:down`     | Stop PostgreSQL                                        |
| `npm run db:ps`       | Check PostgreSQL status                                |
| `npm run db:migrate`  | Run database migrations                                |
| `npm run db:generate` | Regenerate Prisma client from schema                   |
| `npm run db:seed`     | Seed development data                                  |
| `npm run db:studio`   | Open Prisma Studio                                     |

### Seed credentials (development)

After running `npm run db:seed`, these users are available for auth testing:

| Email                      | Role                        | Password        |
| -------------------------- | --------------------------- | --------------- |
| `admin@hilite.com`         | Platform Admin              | `Admin@123`     |
| `admin@hilitebuilders.com` | Org Admin (HiLite Builders) | `HBuilders@123` |

## Theme

The UI uses an Apple-inspired design with **light**, **dark**, and **system** modes. Use the toggle in the app header (or on the login page) to switch themes.

## Documentation

- [Product guide](docs/product-guide.md) — features, roles, permissions, notifications, audit, dashboards, and UI reference
- [API specification (OpenAPI)](docs/openapi.yaml) — import into [Swagger Editor](https://editor.swagger.io) to browse and try endpoints
- [Architecture](docs/architecture.md) — system design, auth, tenancy, multi-org readiness, notifications, scaling
- [Database schema](docs/database-schema.md)
- [ER diagram](docs/er-diagram.md)
