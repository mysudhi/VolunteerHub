# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

VolunteerHub is a multi-tenant volunteer scheduling platform. It's a TypeScript npm-workspaces monorepo with three packages: `client` (React + Vite), `server` (Express + tsx), and `shared` (types/schemas).

### Services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Frontend (Vite) | `npm run dev -w client` | 5173 | Hot-reloads automatically |
| Backend (Express) | `npm run dev -w server` | 4000 | Uses `tsx watch`; requires `DATABASE_URL` and `DIRECT_URL` env vars |
| PostgreSQL | `sudo pg_ctlcluster 16 main start` | 5432 | Must be started before the backend |

### Starting the backend

The backend requires PostgreSQL connection env vars. Export them before running:

```bash
export DATABASE_URL="postgresql://volunteerhub:volunteerhub@localhost:5432/volunteerhub"
export DIRECT_URL="postgresql://volunteerhub:volunteerhub@localhost:5432/volunteerhub"
npm run dev -w server
```

Or inline: `DATABASE_URL=... DIRECT_URL=... npm run dev -w server`

### Database

- PostgreSQL 16 with user `volunteerhub` / password `volunteerhub` and database `volunteerhub`.
- Prisma ORM (v6.x) manages the schema at `prisma/schema.prisma`.
- After schema changes: `npx prisma migrate dev --schema prisma/schema.prisma`
- To regenerate client: `npx prisma generate --schema prisma/schema.prisma`

### Lint / Test / Build

- `npm run lint` — stubs only (echoes "not configured yet" in all workspaces)
- `npm run test` — no test scripts defined in any workspace
- `npm run build` — client and server succeed; shared fails due to missing `.js` extensions in imports (pre-existing issue)
- TypeScript checking: `npx tsc -p client/tsconfig.json --noEmit` and `npx tsc -p server/tsconfig.json --noEmit`

### Known issues

- The `shared` package build fails with TS2835 because `shared/src/index.ts` uses extensionless imports under NodeNext module resolution. This does not affect runtime (tsx/vite don't enforce extensions).
- Lint and test are stubs — no ESLint, Prettier, or test framework is configured.

### Gotchas

- The `.env` file at the workspace root is gitignored. Prisma CLI auto-loads it, but `tsx`/Node do not — pass env vars explicitly or use `dotenv-cli`.
- Prisma v6.x is required. Prisma v7+ rejects the `url`/`directUrl` fields in `schema.prisma`.
- The server's `src/config/env.ts` validates `DATABASE_URL` and `DIRECT_URL` via Zod, but nothing currently imports it at startup. If future code imports it, ensure the env vars are set.
