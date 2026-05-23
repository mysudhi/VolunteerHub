# Environment Setup Guide

Step-by-step instructions to set up the VolunteerHub development environment from scratch.

## Prerequisites

- **Node.js** >= 20.0.0 (verify with `node --version`)
- **npm** >= 10 (comes with Node.js 20+)
- **PostgreSQL** 16

---

## Step 1: Install Node.js Dependencies

From the workspace root, install all packages across the monorepo:

```bash
npm install
```

This installs dependencies for all three workspaces (`client`, `server`, `shared`) and creates symlinks between them.

---

## Step 2: Install and Start PostgreSQL

### Install PostgreSQL (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
```

### Start the PostgreSQL service

```bash
sudo pg_ctlcluster 16 main start
```

### Create the database and user

```bash
sudo -u postgres psql -c "CREATE USER volunteerhub WITH PASSWORD 'volunteerhub' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE volunteerhub OWNER volunteerhub;"
```

---

## Step 3: Configure Environment Variables

Create a `.env` file in the workspace root:

```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://volunteerhub:volunteerhub@localhost:5432/volunteerhub"
DIRECT_URL="postgresql://volunteerhub:volunteerhub@localhost:5432/volunteerhub"
NODE_ENV="development"
PORT=4000
EOF
```

> **Note:** The `.env` file is gitignored. Prisma CLI auto-loads it, but Node.js/tsx does not — pass env vars explicitly when starting the server.

---

## Step 4: Generate Prisma Client

```bash
npx prisma generate --schema prisma/schema.prisma
```

---

## Step 5: Run Database Migrations

Apply the Prisma schema to the database:

```bash
npx prisma migrate dev --schema prisma/schema.prisma
```

This creates all tables (Organization, User, Shift, Task, Skill, CalendarEvent, ShiftSkill, ShiftVolunteer).

---

## Step 6: Start the Development Servers

### Backend (Express API on port 4000)

```bash
DATABASE_URL="postgresql://volunteerhub:volunteerhub@localhost:5432/volunteerhub" \
DIRECT_URL="postgresql://volunteerhub:volunteerhub@localhost:5432/volunteerhub" \
npm run dev -w server
```

### Frontend (Vite dev server on port 5173)

In a separate terminal:

```bash
npm run dev -w client
```

---

## Step 7: Verify the Setup

### Backend health check

```bash
curl http://localhost:4000/health
# Expected: {"status":"ok"}
```

### Frontend

Open http://localhost:5173/ in a browser. You should see the VolunteerHub dashboard with:
- A "Welcome back" login section
- An "Upcoming Shifts" section with mock shift cards

---

## Quick Reference

| Service | Command | Port |
|---------|---------|------|
| Frontend (Vite) | `npm run dev -w client` | 5173 |
| Backend (Express) | `npm run dev -w server` | 4000 |
| PostgreSQL | `sudo pg_ctlcluster 16 main start` | 5432 |

---

## Other Useful Commands

| Task | Command |
|------|---------|
| Lint (all workspaces) | `npm run lint` |
| Test (all workspaces) | `npm run test` |
| Build (all workspaces) | `npm run build` |
| Regenerate Prisma Client | `npx prisma generate --schema prisma/schema.prisma` |
| Create a new migration | `npx prisma migrate dev --schema prisma/schema.prisma --name <name>` |
| Open Prisma Studio | `npx prisma studio --schema prisma/schema.prisma` |

---

## Troubleshooting

### Prisma version mismatch

This project requires **Prisma v6.x**. If you see errors about `url` or `directUrl` no longer being supported in schema files, you have Prisma v7+ installed. Ensure `package.json` in the server workspace pins `prisma` and `@prisma/client` to `^6.x`.

### Server crashes on startup

If the server imports `src/config/env.ts`, it validates `DATABASE_URL` and `DIRECT_URL` via Zod. Ensure these environment variables are set before starting the server.

### Shared package build fails

The `shared` workspace build (`npm run build -w shared`) fails with TS2835 due to missing `.js` extensions in `shared/src/index.ts`. This is a known issue that does not affect runtime — both Vite and tsx handle extensionless imports correctly.
