# HILITE Sales OS

A multi-tenant Sales ERP MVP built for the HILITE technical assessment.

## Project Overview

HILITE Sales OS is a **multi-tenant sales platform** where each organization (tenant) gets isolated users, teams, roles, leads, and dashboards. A **platform** layer above tenants handles cross-organization administration. User identity is global (one email per person); org access is modeled via `organization_members` so the same user can belong to multiple organizations in the future. See [Multi-Org Readiness](docs/architecture.md#multi-org-readiness).

### Capabilities

| Area               | Description                                                                     |
| ------------------ | ------------------------------------------------------------------------------- |
| **Multi-tenancy**  | Shared database with row-level isolation per organization                       |
| **Authentication** | Email/password login with httpOnly cookie sessions (access + refresh tokens)    |
| **RBAC**           | One role per org membership; permissions enforced on API and mirrored in the UI |
| **Teams**          | Org teams with member management                                                |
| **Sales CRM**      | Lead pipeline with assignment, status workflow, and activity logging            |
| **Dashboards**     | Role-scoped analytics with customizable widget layouts                          |
| **Notifications**  | In-app alerts for lead events and account welcome (event-driven)                |
| **Audit trails**   | Append-only compliance logs at org and platform scope                           |
| **Platform admin** | Create/suspend orgs, manage modules, manage platform admins                     |

### Tech stack

| Layer    | Technology                                                                             |
| -------- | -------------------------------------------------------------------------------------- |
| Frontend | React 19, Vite, Redux Toolkit, React Router, Axios, shadcn/ui                          |
| Backend  | Express 5, TypeScript, Prisma 7                                                        |
| Database | PostgreSQL 16 (Docker Compose for local dev)                                           |
| Monorepo | npm workspaces — `apps/frontend`, `apps/backend`, `packages/shared` (`@hilite/shared`) |

### Repository layout

```
apps/backend/     Express API, Prisma schema, migrations, seeds
apps/frontend/    React SPA
packages/shared/  Shared constants, types, and Zod schemas
docs/             Product guide, architecture, OpenAPI spec, schema reference
docs/assets/      Screenshots and other documentation assets
```

## Prerequisites

- **Node.js** 20 or later
- **Docker Desktop** (for PostgreSQL)

## Installation Steps

From the repository root:

```powershell
copy apps\backend\.env.example apps\backend\.env
copy apps\frontend\.env.example apps\frontend\.env
npm run setup
```

`npm run setup` runs `npm ci` (workspace root), starts PostgreSQL, runs migrations, regenerates the Prisma client (fallback if migrate did not), and seeds development data.

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
| `LOG_LEVEL`                | Logging verbosity                            | `info`                                                 |

For local HTTP development (`http://localhost:5173`), set `COOKIE_SECURE=false` in `apps/backend/.env` so auth cookies are sent over plain HTTP.

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

The UI uses **light**, **dark**, and **system** modes. Use the toggle in the app header (or on the login page) to switch themes.

## Screenshots

![Login page](docs/assets/screenshots/public/login-page.png)

Full UI screenshots by role and feature area are in the [Product guide - UI screenshots](docs/product-guide.md#20-ui-screenshots).

## Documentation

- [Product guide](docs/product-guide.md) - features, roles, permissions, notifications, audit, dashboards, UI reference, and [screenshots](docs/product-guide.md#20-ui-screenshots)
- [API specification (OpenAPI)](docs/openapi.yaml) - import into [Swagger Editor](https://editor.swagger.io) to browse and try endpoints
- [Architecture](docs/architecture.md) - system design, auth, tenancy, multi-org readiness, notifications, scaling
- [Database schema](docs/database-schema.md) - table-level reference, columns, enums, and relationships
- [ER diagram](docs/er-diagram.md) - entity-relationship diagram of all database tables
