# Environment Setup Guide

Step-by-step instructions to set up the ContributorHub development environment from scratch on **Linux**, **macOS**, and **Windows**.

---

## Prerequisites

| Requirement | Version | How to verify |
|-------------|---------|---------------|
| Node.js | >= 20.0.0 | `node --version` |
| npm | >= 10 | `npm --version` |
| PostgreSQL | >= 16 | `psql --version` |
| Git | any recent | `git --version` |

---

## Step 1: Install Node.js

### Linux (Ubuntu/Debian)

Using [nvm](https://github.com/nvm-sh/nvm) (recommended):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

Or via NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### macOS

Using [Homebrew](https://brew.sh/) (recommended):

```bash
brew install node@20
```

Or using nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.zshrc
nvm install 20
nvm use 20
```

### Windows

**Option A — Official installer (recommended for beginners):**

1. Download the Node.js 20 LTS installer from https://nodejs.org/
2. Run the `.msi` installer and follow the prompts
3. Check "Automatically install the necessary tools" when prompted
4. Open a new terminal and verify: `node --version`

**Option B — Using [nvm-windows](https://github.com/coreybutler/nvm-windows):**

```powershell
# After installing nvm-windows from https://github.com/coreybutler/nvm-windows/releases
nvm install 20
nvm use 20
```

**Option C — Using [winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/):**

```powershell
winget install OpenJS.NodeJS.LTS
```

---

## Step 2: Install Dependencies

This step is the same on all platforms. From the workspace root:

```bash
npm install
```

This installs dependencies for all three workspaces (`client`, `server`, `shared`) and creates symlinks between them.

---

## Step 3: Install and Start PostgreSQL

### Linux (Ubuntu/Debian)

**Install:**

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
```

**Start the service:**

```bash
sudo pg_ctlcluster 16 main start
```

**Create the database and user:**

```bash
sudo -u postgres psql -c "CREATE USER contributorhub WITH PASSWORD 'contributorhub' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE contributorhub OWNER contributorhub;"
```

### macOS

**Install via Homebrew:**

```bash
brew install postgresql@16
```

**Start the service:**

```bash
brew services start postgresql@16
```

> If the `psql` command isn't found after install, add it to your PATH:
> ```bash
> echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
> source ~/.zshrc
> ```

**Create the database and user:**

```bash
psql postgres -c "CREATE USER contributorhub WITH PASSWORD 'contributorhub' CREATEDB;"
psql postgres -c "CREATE DATABASE contributorhub OWNER contributorhub;"
```

> **Note:** On macOS with Homebrew, your system user is typically the PostgreSQL superuser, so `sudo -u postgres` is not needed. If you get a "role does not exist" error, try `createuser -s contributorhub` instead.

**Alternative — Using [Postgres.app](https://postgresapp.com/):**

1. Download and install Postgres.app from https://postgresapp.com/
2. Open Postgres.app and click "Initialize" to start the server
3. Add the CLI tools to your PATH: `sudo mkdir -p /etc/paths.d && echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp`
4. Open a new terminal and run the "Create the database and user" commands above

### Windows

**Option A — Official installer (recommended):**

1. Download PostgreSQL 16 from https://www.postgresql.org/download/windows/
2. Run the installer and follow the prompts:
   - Set the superuser password (remember this for later)
   - Keep the default port (5432)
   - Select your locale
3. The installer includes pgAdmin — a graphical tool for managing PostgreSQL

**Create the database and user** using the SQL Shell (psql) that was installed:

1. Open "SQL Shell (psql)" from the Start Menu
2. Press Enter to accept defaults for server, database, port, and username
3. Enter the superuser password you set during installation
4. Run:

```sql
CREATE USER contributorhub WITH PASSWORD 'contributorhub' CREATEDB;
CREATE DATABASE contributorhub OWNER contributorhub;
\q
```

**Option B — Using [Chocolatey](https://chocolatey.org/):**

```powershell
choco install postgresql16
```

Then create the user and database using psql as described above.

**Option C — Using [Scoop](https://scoop.sh/):**

```powershell
scoop install postgresql
pg_ctl start -D ~/scoop/apps/postgresql/current/data
psql postgres -c "CREATE USER contributorhub WITH PASSWORD 'contributorhub' CREATEDB;"
psql postgres -c "CREATE DATABASE contributorhub OWNER contributorhub;"
```

**Verify PostgreSQL is running (all Windows options):**

```powershell
pg_isready
# Expected: localhost:5432 - accepting connections
```

---

## Step 4: Configure Environment Variables

Create a `.env` file in the workspace root with the following content:

```env
DATABASE_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub"
DIRECT_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub"
NODE_ENV="development"
PORT=4000
```

### Linux / macOS

```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub"
DIRECT_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub"
NODE_ENV="development"
PORT=4000
EOF
```

### Windows (PowerShell)

```powershell
@"
DATABASE_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub"
DIRECT_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub"
NODE_ENV="development"
PORT=4000
"@ | Out-File -Encoding utf8 .env
```

### Windows (Command Prompt)

Create the file manually:

1. Open Notepad or your preferred editor
2. Paste the four lines shown above (without the `cat` or PowerShell syntax)
3. Save as `.env` in the project root folder
4. Make sure the file is saved as `.env` (not `.env.txt`) — in Notepad's Save dialog, set "Save as type" to "All Files"

> **Note:** The `.env` file is gitignored. Prisma CLI auto-loads it, but Node.js/tsx does not — pass env vars explicitly when starting the server (see Step 6).

---

## Step 5: Generate Prisma Client and Run Migrations

These commands are the same on all platforms:

```bash
npx prisma generate --schema prisma/schema.prisma
npx prisma migrate dev --schema prisma/schema.prisma
```

This generates the type-safe Prisma Client and creates all database tables (Organization, User, Shift, Task, Skill, CalendarEvent, ShiftSkill, ShiftContributor).

---

## Step 6: Start the Development Servers

### Backend (Express API on port 4000)

The backend requires `DATABASE_URL` and `DIRECT_URL` environment variables.

**Linux / macOS:**

```bash
DATABASE_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub" \
DIRECT_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub" \
npm run dev -w server
```

**Windows (PowerShell):**

```powershell
$env:DATABASE_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub"
$env:DIRECT_URL="postgresql://contributorhub:contributorhub@localhost:5432/contributorhub"
npm run dev -w server
```

**Windows (Command Prompt):**

```cmd
set DATABASE_URL=postgresql://contributorhub:contributorhub@localhost:5432/contributorhub
set DIRECT_URL=postgresql://contributorhub:contributorhub@localhost:5432/contributorhub
npm run dev -w server
```

### Frontend (Vite dev server on port 5173)

In a separate terminal (same on all platforms):

```bash
npm run dev -w client
```

---

## Step 7: Verify the Setup

### Backend health check

**Linux / macOS:**

```bash
curl http://localhost:4000/health
# Expected: {"status":"ok"}
```

**Windows (PowerShell):**

```powershell
Invoke-RestMethod http://localhost:4000/health
# Expected: status: ok
```

**Windows (Command Prompt):**

```cmd
curl http://localhost:4000/health
```

> If `curl` is not available on older Windows versions, open http://localhost:4000/health in a browser instead.

### Frontend

Open http://localhost:5173/ in a browser. You should see the ContributorHub dashboard with:
- A "Welcome back" login section
- An "Upcoming Shifts" section with mock shift cards

---

## Quick Reference

| Service | Command | Port |
|---------|---------|------|
| Frontend (Vite) | `npm run dev -w client` | 5173 |
| Backend (Express) | `npm run dev -w server` | 4000 |
| PostgreSQL (Linux) | `sudo pg_ctlcluster 16 main start` | 5432 |
| PostgreSQL (macOS) | `brew services start postgresql@16` | 5432 |
| PostgreSQL (Windows) | Runs as a Windows service after install | 5432 |

---

## Other Useful Commands

These commands work the same on all platforms:

| Task | Command |
|------|---------|
| Lint (all workspaces) | `npm run lint` |
| Unit tests (all workspaces) | `npm run test` |
| E2E tests (Playwright) | `npm run test:e2e` |
| All tests (unit + E2E) | `npm run test:all` |
| Build (all workspaces) | `npm run build` |
| Regenerate Prisma Client | `npx prisma generate --schema prisma/schema.prisma` |
| Create a new migration | `npx prisma migrate dev --schema prisma/schema.prisma --name <name>` |
| Open Prisma Studio | `npx prisma studio --schema prisma/schema.prisma` |

---

## Platform-Specific Notes

### Linux

- PostgreSQL is managed via `pg_ctlcluster` or `systemctl`.
- If you get permission errors with npm global installs, configure npm to use a local prefix rather than using `sudo npm install`.

### macOS

- Homebrew is the recommended package manager for installing system dependencies.
- On Apple Silicon (M1/M2/M3), Homebrew installs to `/opt/homebrew`. If CLI tools aren't found, ensure `/opt/homebrew/bin` is in your `$PATH`.
- With Homebrew-managed PostgreSQL, your macOS username is the default superuser (no `sudo -u postgres` needed).
- If using Postgres.app, make sure to add its bin directory to your PATH for `psql` and other CLI tools.

### Windows

- Use **PowerShell** (recommended) or **Command Prompt** for running commands. Git Bash also works for most commands.
- When setting environment variables, the syntax differs between PowerShell (`$env:VAR="value"`) and Command Prompt (`set VAR=value`). The inline `VAR=value command` syntax used on Linux/macOS does not work on Windows.
- PostgreSQL installs as a Windows service and starts automatically. Use `services.msc` or pgAdmin to manage it.
- If you encounter `ENOENT` errors related to file paths, ensure you're using the correct path separators (`\` on Windows, though `/` generally works in Node.js).
- **WSL2 (Windows Subsystem for Linux)** is an excellent alternative — follow the Linux instructions inside a WSL2 terminal for a near-identical experience.

---

## Troubleshooting

For common issues and their solutions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

### Quick fixes by platform

| Issue | Linux | macOS | Windows |
|-------|-------|-------|---------|
| `psql: command not found` | `sudo apt install postgresql-client` | `brew link postgresql@16` | Add PostgreSQL bin dir to PATH |
| PostgreSQL not running | `sudo pg_ctlcluster 16 main start` | `brew services start postgresql@16` | Start "postgresql" in Services |
| Permission denied (npm) | Fix npm prefix (never use `sudo npm`) | Fix npm prefix | Run terminal as Administrator |
| Port already in use | `lsof -i :PORT` to find PID | `lsof -i :PORT` to find PID | `netstat -ano \| findstr :PORT` |
| Prisma version error | Ensure `prisma@6` and `@prisma/client@6` | Same | Same |
| `.env` not loaded by server | Pass env vars inline before command | Same | Use `$env:` (PS) or `set` (cmd) |

### Shared package build fails

The `shared` workspace build (`npm run build -w shared`) fails with TS2835 due to missing `.js` extensions in `shared/src/index.ts`. This is a known issue on all platforms that does not affect runtime — both Vite and tsx handle extensionless imports correctly.
