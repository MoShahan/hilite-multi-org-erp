# Database Schema

PostgreSQL schema for Hilite ERP, managed with Prisma.

**Source of truth:** [`apps/backend/prisma/schema.prisma`](../apps/backend/prisma/schema.prisma)

## Overview

| Domain             | Tables                                                                                                      | Purpose                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Platform / Tenancy | `organizations`, `organization_modules`                                                                   | Multi-tenant orgs and feature toggles            |
| Auth & RBAC        | `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `refresh_tokens`                         | Users, roles, permission grants, refresh sessions |
| Teams              | `teams`, `team_members`                                                                                     | Org teams and membership                         |
| Sales CRM          | `leads`, `activities`                                                                                       | Lead pipeline and activity log                   |
| Notifications      | `notifications`                                                                                             | In-app alerts (lead events and account welcome)  |
| Audit              | `audit_logs`                                                                                                | Compliance and security audit trail              |
| Dashboard          | `user_dashboard_layouts`                                                                                    | Per-user widget layout preferences               |

**Database:** PostgreSQL  
**Tables:** 15  
**ORM:** Prisma

---

## Enums

### `OrganizationStatus`

| Value       | Description                      |
| ----------- | -------------------------------- |
| `ACTIVE`    | Organization is active (default) |
| `SUSPENDED` | Organization is suspended        |

### `UserStatus`

| Value      | Description                |
| ---------- | -------------------------- |
| `ACTIVE`   | User can sign in (default) |
| `INACTIVE` | User is deactivated        |

### `PermissionScope`

| Value          | Description                    |
| -------------- | ------------------------------ |
| `PLATFORM`     | Platform-level permission      |
| `ORGANIZATION` | Organization-scoped permission |

### `RoleMembershipScope`

| Value          | Description                   |
| -------------- | ----------------------------- |
| `TEAM`         | Role requires team membership |
| `ORGANIZATION` | Role is org-wide              |

### `LeadStatus`

| Value                  |
| ---------------------- |
| `NEW` (default)        |
| `CONTACTED`            |
| `NEGOTIATION`          |
| `WON`                  |
| `LOST`                 |
| `SITE_VISIT_COMPLETED` |
| `VISIT_SCHEDULED`      |

### `ActivityType`

| Value             |
| ----------------- |
| `CALL`            |
| `EMAIL`           |
| `OFFLINE_MEETING` |
| `NOTE`            |
| `ONLINE_MEETING`  |
| `SITE_VISIT`      |
| `MESSAGE`         |

### `NotificationType`

| Value                     |
| ------------------------- |
| `LEAD_CREATED`            |
| `LEAD_ASSIGNED`           |
| `LEAD_REASSIGNED`         |
| `LEAD_STATUS_CHANGED`     |
| `ACTIVITY_LOGGED`         |
| `WELCOME_CHANGE_PASSWORD` |

### `AuditAction`

Persisted on `audit_logs.action`. Full list is defined in [`schema.prisma`](../apps/backend/prisma/schema.prisma); notable values include auth events (`AUTH_*`), lead lifecycle (`LEAD_*`), user/team/role/org mutations, and `PLATFORM_USER_CREATED` for platform admin provisioning.

### `ModuleKey`

| Value           | Description          |
| --------------- | -------------------- |
| `SALES_ERP`     | Sales / leads module |
| `DASHBOARDS`    | Dashboard module     |
| `NOTIFICATIONS` | Notifications module |

---

## Tables

### `organizations`

Top-level tenant.

| Column        | Type                 | Constraints                     |
| ------------- | -------------------- | ------------------------------- |
| `id`          | UUID                 | PK, default `gen_random_uuid()` |
| `name`        | TEXT                 | NOT NULL                        |
| `code`        | TEXT                 | NOT NULL, UNIQUE                |
| `logo_url`    | TEXT                 | NULL                            |
| `description` | TEXT                 | NULL                            |
| `status`      | `OrganizationStatus` | NOT NULL, default `ACTIVE`      |
| `created_at`  | TIMESTAMPTZ          | NOT NULL, default now           |
| `updated_at`  | TIMESTAMPTZ          | NOT NULL                        |

**Relations:** users, roles, teams, leads, notifications, organization_modules

---

### `organization_modules`

Per-organization feature flags.

| Column            | Type        | Constraints                                   |
| ----------------- | ----------- | --------------------------------------------- |
| `organization_id` | UUID        | PK, FK → `organizations.id` ON DELETE CASCADE |
| `module_key`      | `ModuleKey` | PK                                            |
| `enabled`         | BOOLEAN     | NOT NULL, default `true`                      |
| `updated_at`      | TIMESTAMPTZ | NOT NULL                                      |

**Primary key:** `(organization_id, module_key)`

---

### `users`

| Column                 | Type         | Constraints                   |
| ---------------------- | ------------ | ----------------------------- |
| `id`                   | UUID         | PK                            |
| `email`                | TEXT         | NOT NULL, UNIQUE              |
| `name`                 | TEXT         | NOT NULL                      |
| `phone_number`         | TEXT         | NULL                          |
| `password_hash`        | TEXT         | NOT NULL                      |
| `must_change_password` | BOOLEAN      | NOT NULL, default `false`     |
| `status`               | `UserStatus` | NOT NULL, default `ACTIVE`    |
| `organization_id`      | UUID         | NULL, FK → `organizations.id` |
| `created_at`           | TIMESTAMPTZ  | NOT NULL                      |
| `updated_at`           | TIMESTAMPTZ  | NOT NULL                      |

**Indexes:** `organization_id`

**Notes:** `organization_id` is nullable for platform-level users (e.g. platform admin). New users provisioned with a default password are created with `must_change_password = true` and receive a `WELCOME_CHANGE_PASSWORD` notification.

---

### `refresh_tokens`

Server-side refresh sessions. Only the SHA-256 hash of the opaque token is stored.

| Column       | Type        | Constraints                              |
| ------------ | ----------- | ---------------------------------------- |
| `id`         | UUID        | PK                                       |
| `user_id`    | UUID        | NOT NULL, FK → `users.id` ON DELETE CASCADE |
| `token_hash` | TEXT        | NOT NULL, UNIQUE                         |
| `family_id`  | UUID        | NOT NULL                                 |
| `expires_at` | TIMESTAMPTZ | NOT NULL                                 |
| `revoked_at` | TIMESTAMPTZ | NULL                                     |
| `user_agent` | TEXT        | NULL                                     |
| `ip`         | TEXT        | NULL                                     |
| `created_at` | TIMESTAMPTZ | NOT NULL                                 |

**Indexes:** `user_id`, `family_id`

**Notes:** Tokens rotate on each refresh; reuse of a revoked token revokes the entire `family_id`.

---

### `user_dashboard_layouts`

Per-user saved dashboard widget visibility and ordering.

| Column       | Type        | Constraints                              |
| ------------ | ----------- | ---------------------------------------- |
| `user_id`    | UUID        | PK, FK → `users.id` ON DELETE CASCADE    |
| `view`       | TEXT        | NOT NULL (`me`, `team`, or `org`)        |
| `widgets`    | JSONB       | NOT NULL — array of `{ key, order, visible }` |
| `updated_at` | TIMESTAMPTZ | NOT NULL                                 |

---

### `roles`

| Column             | Type                  | Constraints                                     |
| ------------------ | --------------------- | ----------------------------------------------- |
| `id`               | UUID                  | PK                                              |
| `organization_id`  | UUID                  | NULL, FK → `organizations.id` ON DELETE CASCADE |
| `name`             | TEXT                  | NOT NULL                                        |
| `slug`             | TEXT                  | NOT NULL                                        |
| `membership_scope` | `RoleMembershipScope` | NOT NULL                                        |
| `created_at`       | TIMESTAMPTZ           | NOT NULL                                        |
| `updated_at`       | TIMESTAMPTZ           | NOT NULL                                        |

**Unique:** `(organization_id, slug)`  
**Indexes:** `organization_id`

**Notes:** Platform role (`platform_admin`) has `organization_id = NULL`.

---

### `permissions`

Global permission catalog (seeded at startup, not org-specific).

| Column        | Type              | Constraints |
| ------------- | ----------------- | ----------- |
| `key`         | TEXT              | PK          |
| `label`       | TEXT              | NOT NULL    |
| `description` | TEXT              | NULL        |
| `scope`       | `PermissionScope` | NOT NULL    |

#### Seeded permission keys

| Key                       | Scope        |
| ------------------------- | ------------ |
| `platform:orgs:read`      | PLATFORM     |
| `platform:orgs:write`     | PLATFORM     |
| `platform:users:read`     | PLATFORM     |
| `platform:users:write`    | PLATFORM     |
| `platform:audit:read`     | PLATFORM     |
| `users:read`              | ORGANIZATION |
| `users:read:team`         | ORGANIZATION |
| `users:write`             | ORGANIZATION |
| `users:write:team`        | ORGANIZATION |
| `teams:read`              | ORGANIZATION |
| `teams:write`             | ORGANIZATION |
| `roles:read`              | ORGANIZATION |
| `roles:read:team`         | ORGANIZATION |
| `roles:write`             | ORGANIZATION |
| `leads:read`              | ORGANIZATION |
| `leads:read:team`         | ORGANIZATION |
| `leads:read:org`          | ORGANIZATION |
| `leads:write`             | ORGANIZATION |
| `leads:status:write`      | ORGANIZATION |
| `leads:status:write:team` | ORGANIZATION |
| `leads:assignable`        | ORGANIZATION |
| `activities:write`        | ORGANIZATION |
| `dashboard:me`            | ORGANIZATION |
| `dashboard:team`          | ORGANIZATION |
| `dashboard:org`           | ORGANIZATION |
| `audit:read`              | ORGANIZATION |

---

### `role_permissions`

Junction table: roles ↔ permissions.

| Column           | Type | Constraints                                   |
| ---------------- | ---- | --------------------------------------------- |
| `role_id`        | UUID | PK, FK → `roles.id` ON DELETE CASCADE         |
| `permission_key` | TEXT | PK, FK → `permissions.key` ON DELETE RESTRICT |

---

### `user_roles`

User ↔ role assignment.

| Column    | Type | Constraints                           |
| --------- | ---- | ------------------------------------- |
| `user_id` | UUID | PK, FK → `users.id` ON DELETE CASCADE |
| `role_id` | UUID | PK, FK → `roles.id` ON DELETE CASCADE |

**Unique:** `user_id` — each user has at most one role.

---

### `teams`

| Column            | Type        | Constraints                                         |
| ----------------- | ----------- | --------------------------------------------------- |
| `id`              | UUID        | PK                                                  |
| `organization_id` | UUID        | NOT NULL, FK → `organizations.id` ON DELETE CASCADE |
| `name`            | TEXT        | NOT NULL                                            |
| `created_at`      | TIMESTAMPTZ | NOT NULL                                            |
| `updated_at`      | TIMESTAMPTZ | NOT NULL                                            |

**Indexes:** `organization_id`

---

### `team_members`

Junction table: teams ↔ users.

| Column    | Type | Constraints                           |
| --------- | ---- | ------------------------------------- |
| `team_id` | UUID | PK, FK → `teams.id` ON DELETE CASCADE |
| `user_id` | UUID | PK, FK → `users.id` ON DELETE CASCADE |

**Indexes:** `user_id`

---

### `leads`

| Column            | Type         | Constraints                                         |
| ----------------- | ------------ | --------------------------------------------------- |
| `id`              | UUID         | PK                                                  |
| `organization_id` | UUID         | NOT NULL, FK → `organizations.id` ON DELETE CASCADE |
| `team_id`         | UUID         | NOT NULL, FK → `teams.id` ON DELETE RESTRICT        |
| `assigned_to_id`  | UUID         | NULL, FK → `users.id` ON DELETE SET NULL            |
| `name`            | TEXT         | NOT NULL                                            |
| `mobile_number`   | TEXT         | NULL                                                |
| `email`           | TEXT         | NULL                                                |
| `source`          | TEXT         | NULL                                                |
| `project`         | TEXT         | NULL                                                |
| `status`          | `LeadStatus` | NOT NULL, default `NEW`                             |
| `created_by_id`   | UUID         | NOT NULL, FK → `users.id` ON DELETE RESTRICT        |
| `created_at`      | TIMESTAMPTZ  | NOT NULL                                            |
| `updated_at`      | TIMESTAMPTZ  | NOT NULL                                            |

**Indexes:** `organization_id`, `team_id`, `assigned_to_id`, `status`, `created_at`

---

### `activities`

| Column          | Type           | Constraints                                  |
| --------------- | -------------- | -------------------------------------------- |
| `id`            | UUID           | PK                                           |
| `lead_id`       | UUID           | NOT NULL, FK → `leads.id` ON DELETE CASCADE  |
| `type`          | `ActivityType` | NOT NULL                                     |
| `notes`         | TEXT           | NOT NULL                                     |
| `created_by_id` | UUID           | NOT NULL, FK → `users.id` ON DELETE RESTRICT |
| `created_at`    | TIMESTAMPTZ    | NOT NULL                                     |

**Indexes:** `(lead_id, created_at)`

---

### `notifications`

| Column            | Type               | Constraints                                         |
| ----------------- | ------------------ | --------------------------------------------------- |
| `id`              | UUID               | PK                                                  |
| `organization_id` | UUID               | NULL, FK → `organizations.id` ON DELETE SET NULL    |
| `user_id`         | UUID               | NOT NULL, FK → `users.id` ON DELETE CASCADE         |
| `type`            | `NotificationType` | NOT NULL                                            |
| `title`           | TEXT               | NOT NULL                                            |
| `body`            | TEXT               | NOT NULL                                            |
| `entity_type`     | TEXT               | NULL (polymorphic, e.g. `"lead"`, `"account"`)      |
| `entity_id`       | UUID               | NULL                                                |
| `read_at`         | TIMESTAMPTZ        | NULL                                                |
| `created_at`      | TIMESTAMPTZ        | NOT NULL                                            |

**Indexes:** `(user_id, read_at)`, `organization_id`, `(user_id, organization_id, read_at)`

**Notes:** `organization_id` is nullable for platform users (e.g. welcome notifications for platform admins). Org-scoped lead notifications always set `organization_id`.

---

### `audit_logs`

Append-only compliance and security audit trail.

| Column            | Type          | Constraints                                         |
| ----------------- | ------------- | --------------------------------------------------- |
| `id`              | UUID          | PK                                                  |
| `organization_id` | UUID          | NULL, FK → `organizations.id` ON DELETE SET NULL  |
| `actor_id`        | UUID          | NULL, FK → `users.id` ON DELETE SET NULL            |
| `action`          | `AuditAction` | NOT NULL                                            |
| `entity_type`     | TEXT          | NOT NULL                                            |
| `entity_id`       | TEXT          | NULL                                                |
| `metadata`        | JSONB         | NULL                                                |
| `created_at`      | TIMESTAMPTZ   | NOT NULL                                            |

**Indexes:** `(organization_id, created_at)`, `(entity_type, entity_id)`, `(actor_id, created_at)`

**Notes:** `organization_id` is `null` for platform-wide events (org create, platform login, platform admin create).

---

## Foreign key delete behavior

| Relationship                          | ON DELETE |
| ------------------------------------- | --------- |
| Organization → child records          | CASCADE   |
| Organization → notifications, audit_logs | SET NULL |
| Role → role_permissions, user_roles   | CASCADE   |
| Permission → role_permissions         | RESTRICT  |
| Team → team_members                   | CASCADE   |
| Team → leads                          | RESTRICT  |
| Lead → activities                     | CASCADE   |
| Lead assignee → users                 | SET NULL  |
| Lead creator, activity author → users | RESTRICT  |
| User → user_dashboard_layouts         | CASCADE   |
| User → refresh_tokens                 | CASCADE   |
| Actor → audit_logs                    | SET NULL  |

---

## Default roles (seeded)

Defined in application code, not as separate DB tables.

| Slug             | Scope        | Key permissions                                                                 |
| ---------------- | ------------ | ------------------------------------------------------------------------------- |
| `platform_admin` | Platform     | `platform:orgs:*`, `platform:users:*`, `platform:audit:read`                    |
| `org_admin`      | Organization | users, teams, roles, org-wide leads, `audit:read`                               |
| `executive`      | Team         | own leads, activities, `dashboard:me`                                           |
| `team_lead`      | Team         | team users/leads, team lead write, `dashboard:team`                             |
| `sales_manager`  | Organization | all org leads (read/write)                                                      |
| `director`       | Organization | all org leads, `dashboard:org`                                                  |

---

## Relationship summary

```
Organization (1) ──< (N) User
Organization (1) ──< (N) Role
Organization (1) ──< (N) Team
Organization (1) ──< (N) Lead
Organization (1) ──< (N) Notification (optional FK)
Organization (1) ──< (N) AuditLog (optional FK)
Organization (1) ──< (N) OrganizationModule

User (1) ──< (0..1) UserRole ──> (1) Role
User (1) ──< (0..1) UserDashboardLayout
User (1) ──< (N) RefreshToken
Role (N) ──< (M) Permission  [via role_permissions]

Team (N) ──< (M) User  [via team_members]
Team (1) ──< (N) Lead

User (1) ──< (N) Lead [created_by]
User (1) ──< (N) Lead [assigned_to, optional]
Lead (1) ──< (N) Activity
User (1) ──< (N) Activity [created_by]
User (1) ──< (N) Notification
User (1) ──< (N) AuditLog [as actor, optional]
```
