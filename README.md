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

| Command | Description |
|---------|-------------|
| `npm run dev:apps` | Start API and frontend only (Postgres already running) |
| `npm run db:up` | Start PostgreSQL |
| `npm run db:down` | Stop PostgreSQL |
| `npm run db:ps` | Check PostgreSQL status |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed development data |
| `npm run db:studio` | Open Prisma Studio |

### Seed credentials (development)

After running `npm run db:seed`, these users are available for future auth testing:

| Email | Role | Password |
|-------|------|----------|
| `admin@hilite.com` | Platform Admin | `Admin@123` |
| `admin@hilitebuilders.com` | Org Admin (HiLite Builders) | `HBuilders@123` |

## Theme

The UI uses an Apple-inspired design with **light**, **dark**, and **system** modes. Use the toggle in the app header (or on the login page) to switch themes.

## Documentation

- [Task Breakdown](docs/Task_Breakdown.md) — step-by-step build checklist
- [Project Requirements Guide](docs/Project_Requirements_Guide.md) — architecture, schema, and API reference
