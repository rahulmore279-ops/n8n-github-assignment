# Hotel Banquet Management System (BMS)

A full-stack starter architecture for a production-ready Hotel Banquet Management System. The first milestone sets up the application foundation for enquiry, hall, booking, availability, payment, reporting, and user-management workflows.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- Authentication: username/password login with bcrypt password hashes and JWT bearer tokens
- API style: REST

## Project structure

```text
apps/
  api/        Express API, PostgreSQL access, validation, migrations
  web/        React TypeScript web application
```

## Setup

1. Install Node.js 20+ and PostgreSQL 15+.
2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your PostgreSQL credentials and a long `JWT_SECRET`.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Create the database and run migrations:

   ```bash
   createdb bms
   npm run migrate -w @bms/api
   npm run seed:halls -w @bms/api
   ```

6. Create the first local admin user after migrations. Set temporary local-only admin seed variables in `.env`, then run the seed command. Do not commit real values. The seed command creates an admin only when the `users` table is empty.

   ```bash
   ADMIN_USERNAME=admin \
   ADMIN_PASSWORD='choose-a-local-password-with-12-plus-characters' \
   ADMIN_FULL_NAME='System Administrator' \
   npm run seed:admin -w @bms/api
   ```

7. Start development servers:

   ```bash
   npm run dev
   ```

   - API: <http://localhost:4000/api>
   - Web: <http://localhost:5173>

## Available scripts

- `npm run build` - build all workspaces
- `npm run typecheck` - run TypeScript checks across workspaces
- `npm run migrate -w @bms/api` - apply PostgreSQL migrations
- `npm run seed:admin -w @bms/api` - create the first local admin user when no users exist
- `npm run seed:halls -w @bms/api` - safely upsert default hall master data
- `npm run dev` - start API and web development servers

## Initial modules planned

- Login
- Dashboard
- Hall Management
- Enquiry Management
- Booking Management
- Hall Availability
- Booking Calendar
- Customer/Company Details
- Payment Tracking
- Reports
- User Management

## Notes for future development

- Extend role-based access control before exposing management actions beyond the authenticated dashboard shell.
- Keep every module behind validated REST endpoints.
- Add automated tests alongside each backend service and frontend workflow as modules are implemented.
- Use real customer and booking records only from the configured PostgreSQL database; no mock production data is included.

## Authentication flow

- `POST /api/auth/login` accepts `username` and `password`, validates the payload, compares the submitted password with the stored bcrypt password hash, and returns a JWT plus the public user profile.
- `GET /api/auth/me` requires `Authorization: Bearer <token>` and returns the current active user.
- `POST /api/auth/logout` requires a valid bearer token and returns `204 No Content`; JWTs are stateless, so the web app removes its locally stored session after this call.
- The dashboard shell is protected in the web app by verifying saved sessions with `/api/auth/me`; invalid or expired sessions are cleared and the user is returned to login.

## Local admin seed variables

Add these values only to your local `.env` or pass them inline when running the seed command:

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose-a-local-password-with-12-plus-characters
ADMIN_FULL_NAME=System Administrator
```

The seed command hashes the password with bcrypt before inserting the user and skips creation if any user already exists.


## Hall Management and Availability

Default local hall master data can be seeded with:

```bash
npm run seed:halls -w @bms/api
```

The hall seed is idempotent by unique hall `code` and creates/updates these master records only:

| Hall | Code | Capacity |
| --- | --- | ---: |
| Banquet Hall | BANQUET-HALL | 300 |
| Conf-1 | CONF-1 | 20 |
| Conf-2 | CONF-2 | 50 |
| Lawn | LAWN | 100 |

Authenticated hall API endpoints:

- `GET /api/halls` — list halls.
- `GET /api/halls/:id` — get one hall.
- `POST /api/halls` — create a hall; requires `admin` or `manager` role.
- `PUT /api/halls/:id` — update a hall; requires `admin` or `manager` role.
- `PATCH /api/halls/:id/status` — activate/deactivate a hall; requires `admin` or `manager` role. Deactivation is blocked when active or future bookings exist.
- `GET /api/halls/availability?hallId=<uuid>&date=<YYYY-MM-DD>` — check whether a hall is active and has no booking overlap on that date.

Hard deletion is intentionally not exposed in the current architecture; use inactive status so booking history remains safe.
