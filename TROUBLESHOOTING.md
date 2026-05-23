# Troubleshooting Guide

This guide helps you resolve common issues when setting up and running the VolunteerHub development environment. It covers problems encountered during setup and anticipates issues for developers new to this stack.

---

## Table of Contents

1. [Node.js and npm Issues](#1-nodejs-and-npm-issues)
2. [Dependency Installation Issues](#2-dependency-installation-issues)
3. [PostgreSQL Issues](#3-postgresql-issues)
4. [Environment Variables Issues](#4-environment-variables-issues)
5. [Prisma Issues](#5-prisma-issues)
6. [Backend Server Issues](#6-backend-server-issues)
7. [Frontend / Vite Issues](#7-frontend--vite-issues)
8. [TypeScript Issues](#8-typescript-issues)
9. [Git and Version Control Issues](#9-git-and-version-control-issues)
10. [General Tips](#10-general-tips)

---

## 1. Node.js and npm Issues

### Wrong Node.js version

**Symptom:** Errors mentioning unsupported syntax, or npm refusing to install with engine warnings.

**Fix:** This project requires Node.js >= 20. Check your version:

```bash
node --version
```

If outdated, update using [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install 20
nvm use 20
```

Or download from https://nodejs.org/

---

### `npm` command not found

**Symptom:** `bash: npm: command not found`

**Fix:** npm ships with Node.js. If missing, reinstall Node.js. If using nvm:

```bash
nvm install --lts
```

---

### Permission denied errors with npm

**Symptom:** `EACCES: permission denied` when running `npm install`

**Fix:** Never use `sudo npm install`. Instead, fix npm permissions:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

Add the `export` line to your `~/.bashrc` or `~/.zshrc`.

---

## 2. Dependency Installation Issues

### `npm install` fails or hangs

**Symptom:** Installation stalls or throws network errors.

**Fixes:**
- Check internet connectivity: `ping registry.npmjs.org`
- Clear npm cache: `npm cache clean --force`
- Delete lockfile and retry: `rm package-lock.json && npm install`
- If behind a corporate proxy, configure npm:
  ```bash
  npm config set proxy http://proxy.example.com:8080
  npm config set https-proxy http://proxy.example.com:8080
  ```

---

### `node_modules` out of sync or corrupted

**Symptom:** Strange import errors, missing modules, or version conflicts.

**Fix:** Clean everything and reinstall:

```bash
rm -rf node_modules client/node_modules server/node_modules shared/node_modules package-lock.json
npm install
```

---

### Workspace linking not working

**Symptom:** Cannot find module `@volunteerhub/shared` or similar workspace package errors.

**Fix:** Ensure you run `npm install` from the **workspace root** (the folder containing the root `package.json` with `"workspaces"`), not from inside a sub-package.

---

## 3. PostgreSQL Issues

### PostgreSQL not installed

**Symptom:** `psql: command not found` or `pg_ctlcluster: command not found`

**Fix (Ubuntu/Debian):**

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
```

**Fix (macOS with Homebrew):**

```bash
brew install postgresql@16
brew services start postgresql@16
```

**Fix (Windows):** Download installer from https://www.postgresql.org/download/windows/

---

### PostgreSQL service not running

**Symptom:** `connection refused` or `could not connect to server`

**Fix:**

```bash
# Ubuntu/Debian
sudo pg_ctlcluster 16 main start

# macOS
brew services start postgresql@16

# Check status
pg_lsclusters          # Ubuntu
brew services list     # macOS
```

---

### Cannot create user or database

**Symptom:** `FATAL: role "volunteerhub" does not exist` or permission errors during creation.

**Fix:** Run the creation commands as the postgres superuser:

```bash
sudo -u postgres psql -c "CREATE USER volunteerhub WITH PASSWORD 'volunteerhub' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE volunteerhub OWNER volunteerhub;"
```

On macOS (if your system user is the postgres superuser):

```bash
createuser -s volunteerhub
createdb -O volunteerhub volunteerhub
```

---

### Authentication failed

**Symptom:** `FATAL: password authentication failed for user "volunteerhub"`

**Fixes:**
1. Verify the password matches what's in your `.env` file
2. Check PostgreSQL's `pg_hba.conf` allows password authentication:
   ```bash
   # Find the file
   sudo -u postgres psql -c "SHOW hba_file;"
   ```
   Ensure there's a line like:
   ```
   local   all   all   md5
   host    all   all   127.0.0.1/32   md5
   ```
   Restart PostgreSQL after changes:
   ```bash
   sudo pg_ctlcluster 16 main restart
   ```

---

### Port 5432 already in use

**Symptom:** `Is another postmaster already running?` or port conflict.

**Fix:** Check what's using the port:

```bash
sudo lsof -i :5432
```

Stop the conflicting service or change the PostgreSQL port in `postgresql.conf`.

---

## 4. Environment Variables Issues

### Missing `.env` file

**Symptom:** Prisma commands fail with `Environment variable not found: DATABASE_URL`

**Fix:** Create the `.env` file in the workspace root:

```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://volunteerhub:volunteerhub@localhost:5432/volunteerhub"
DIRECT_URL="postgresql://volunteerhub:volunteerhub@localhost:5432/volunteerhub"
NODE_ENV="development"
PORT=4000
EOF
```

---

### Server doesn't pick up `.env` file

**Symptom:** Server crashes with Zod validation errors about missing `DATABASE_URL`.

**Explanation:** Prisma CLI auto-loads `.env`, but Node.js/tsx does **not**. You must pass environment variables explicitly when starting the server:

```bash
DATABASE_URL="postgresql://volunteerhub:volunteerhub@localhost:5432/volunteerhub" \
DIRECT_URL="postgresql://volunteerhub:volunteerhub@localhost:5432/volunteerhub" \
npm run dev -w server
```

**Alternative:** Install `dotenv-cli` globally:

```bash
npm install -g dotenv-cli
dotenv -- npm run dev -w server
```

---

### Env vars set but not recognized

**Symptom:** Variables are exported but the app doesn't see them.

**Fixes:**
- Make sure you're exporting in the same shell session that runs the server
- Check for typos in variable names (they're case-sensitive)
- If using a `.env` file with a tool, ensure the file is in the correct directory

---

## 5. Prisma Issues

### Prisma version mismatch (v7 errors)

**Symptom:**
```
Error: The datasource property `url` is no longer supported in schema files.
```

**Explanation:** This project uses Prisma v6.x schema format. Prisma v7 removed `url`/`directUrl` from schema files.

**Fix:** Ensure the server workspace pins Prisma to v6:

```bash
cd /workspace
npm install -w server prisma@6 @prisma/client@6
```

Verify:
```bash
npx prisma --version
# Should show prisma: 6.x.x
```

---

### `prisma generate` fails with module not found

**Symptom:** `Cannot find module '@prisma/client/runtime/...'`

**Fix:** This usually happens when `@prisma/client` and `prisma` CLI are different major versions. Ensure both are v6:

```bash
npm ls prisma @prisma/client
```

If mismatched, reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npx prisma generate --schema prisma/schema.prisma
```

---

### Migration fails

**Symptom:** `Error: P3014: Prisma Migrate could not create the shadow database`

**Fix:** Ensure the database user has `CREATEDB` permission:

```bash
sudo -u postgres psql -c "ALTER USER volunteerhub CREATEDB;"
```

---

### Database schema out of sync

**Symptom:** `The database schema is not empty` or migration drift errors.

**Fix:** For development, you can reset the database:

```bash
npx prisma migrate reset --schema prisma/schema.prisma
```

> **Warning:** This deletes all data in the database.

---

### Prisma Studio won't open

**Symptom:** `prisma studio` opens but shows connection errors.

**Fix:** Ensure PostgreSQL is running and the `.env` file has correct connection strings:

```bash
npx prisma studio --schema prisma/schema.prisma
```

---

## 6. Backend Server Issues

### Port 4000 already in use

**Symptom:** `Error: listen EADDRINUSE: address already in use :::4000`

**Fix:** Find and stop the process using the port:

```bash
lsof -i :4000
# Note the PID, then:
kill <PID>
```

Or change the port via the `PORT` environment variable:

```bash
PORT=4001 npm run dev -w server
```

---

### Server crashes immediately on start

**Symptom:** Process exits with a Zod validation error.

**Explanation:** If any code imports `src/config/env.ts`, Zod validates that `DATABASE_URL` and `DIRECT_URL` are present and valid URLs.

**Fix:** Ensure both env vars are set (see [Section 4](#4-environment-variables-issues)).

---

### `tsx` not found

**Symptom:** `sh: tsx: command not found` when running `npm run dev -w server`

**Fix:** `tsx` is a devDependency of the server package. Reinstall:

```bash
npm install
```

If it still fails, the package might not be hoisted. Run directly:

```bash
npx tsx watch server/src/index.ts
```

---

### Express route returns 404

**Symptom:** `Cannot GET /api/...`

**Explanation:** The API router at `server/src/routes/index.ts` is initially empty. You need to add route handlers as you develop features.

The only built-in endpoint is:
```
GET /health → {"status":"ok"}
```

---

## 7. Frontend / Vite Issues

### Vite dev server won't start

**Symptom:** `vite: command not found` or module resolution errors.

**Fix:**

```bash
npm install
npm run dev -w client
```

---

### Port 5173 already in use

**Symptom:** Vite reports the port is occupied.

**Fix:** Vite usually auto-picks the next available port. If not, stop the conflicting process:

```bash
lsof -i :5173
kill <PID>
```

---

### Blank page in browser

**Symptom:** http://localhost:5173 loads but shows a white screen.

**Fixes:**
1. Open browser DevTools (F12) → Console tab. Look for JavaScript errors.
2. Ensure `client/index.html` has `<div id="root"></div>`.
3. Check that React and ReactDOM are installed: `npm ls react react-dom`

---

### Hot Module Replacement (HMR) not working

**Symptom:** Changes to `.tsx` files don't auto-refresh the browser.

**Fixes:**
- Ensure the Vite config has `server.host: "0.0.0.0"` (already set)
- Try a hard refresh: `Ctrl+Shift+R`
- Check that `@vitejs/plugin-react` is installed
- If running inside a container/VM, ensure the Vite websocket port is accessible

---

### CSS/styles not loading

**Symptom:** Page renders but looks unstyled.

**Fix:** Verify that `client/src/main.tsx` imports `./styles.css`. The project uses utility class names (Tailwind-style) but no Tailwind CSS is configured — the classes in the code are purely illustrative.

---

## 8. TypeScript Issues

### `shared` package build fails with TS2835

**Symptom:**
```
error TS2835: Relative import paths need explicit file extensions in ECMAScript imports
when '--moduleResolution' is 'node16' or 'nodenext'.
```

**Explanation:** This is a known pre-existing issue. The `shared/src/index.ts` uses extensionless imports (`./types/rbac` instead of `./types/rbac.js`) while the tsconfig uses `NodeNext` module resolution.

**Impact:** This only affects the `tsc` build command. Runtime tools (tsx, Vite) handle extensionless imports fine. Development is not blocked.

**Fix (if you want to resolve it):** Add `.js` extensions to imports in `shared/src/index.ts`:

```typescript
export * from "./types/rbac.js";
export * from "./schemas/organization.js";
```

---

### Cannot find type declarations

**Symptom:** `Cannot find module 'express'` or `Cannot find type definitions`

**Fix:** Ensure type packages are installed:

```bash
npm install -w server -D @types/express @types/node
npm install -w client -D @types/react @types/react-dom
```

---

### `tsc` reports errors but app runs fine

**Explanation:** TypeScript type-checking is stricter than what tsx/Vite enforce at runtime. You can run type-checking separately:

```bash
npx tsc -p client/tsconfig.json --noEmit
npx tsc -p server/tsconfig.json --noEmit
```

Fix type errors for code quality, but they won't prevent the dev servers from running.

---

## 9. Git and Version Control Issues

### Accidentally committed `.env` file

**Symptom:** Secrets visible in git history.

**Fix:** The `.env` file is in `.gitignore`, but if you force-added it:

```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

> **Important:** If secrets were pushed to a remote, rotate all passwords immediately.

---

### Merge conflicts in `package-lock.json`

**Symptom:** Large merge conflicts in the lockfile.

**Fix:** Don't manually resolve lockfile conflicts. Instead:

```bash
git checkout --theirs package-lock.json
npm install
git add package-lock.json
git commit
```

---

### Prisma migration conflicts

**Symptom:** Two developers created migrations with overlapping changes.

**Fix:**

```bash
npx prisma migrate reset --schema prisma/schema.prisma
```

Then re-run migrations to verify they apply cleanly.

---

## 10. General Tips

### How to completely reset the development environment

If things are in a broken state and you want to start fresh:

```bash
# 1. Remove all node_modules and lockfile
rm -rf node_modules client/node_modules server/node_modules shared/node_modules package-lock.json

# 2. Reset the database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS volunteerhub;"
sudo -u postgres psql -c "CREATE DATABASE volunteerhub OWNER volunteerhub;"

# 3. Reinstall everything
npm install
npx prisma generate --schema prisma/schema.prisma
npx prisma migrate dev --schema prisma/schema.prisma
```

---

### Checking if all services are running

Quick health check for all services:

```bash
# PostgreSQL
pg_isready -h localhost -p 5432

# Backend
curl -s http://localhost:4000/health

# Frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
```

Expected output:
```
localhost:5432 - accepting connections
{"status":"ok"}
200
```

---

### Understanding the monorepo structure

- **Root `package.json`** — defines workspaces and shared scripts
- **`client/`** — React frontend (runs independently)
- **`server/`** — Express API (requires PostgreSQL)
- **`shared/`** — Shared TypeScript types/schemas (imported by both client and server)
- **`prisma/`** — Database schema and migrations

Changes to `shared/` are picked up automatically by both client and server dev servers.

---

### Where to find logs

| Service | Log Location |
|---------|-------------|
| PostgreSQL | `/var/log/postgresql/postgresql-16-main.log` |
| Backend | Terminal where `npm run dev -w server` is running |
| Frontend | Terminal where `npm run dev -w client` is running + browser DevTools |
| Prisma | Inline in terminal output |

---

### Getting help

- **Node.js docs:** https://nodejs.org/docs/
- **npm docs:** https://docs.npmjs.com/
- **PostgreSQL docs:** https://www.postgresql.org/docs/16/
- **Prisma docs:** https://www.prisma.io/docs
- **Vite docs:** https://vite.dev/guide/
- **React docs:** https://react.dev/
- **Express docs:** https://expressjs.com/
- **TypeScript docs:** https://www.typescriptlang.org/docs/
