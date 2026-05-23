# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a full-stack voucher application with two independently-deployed services:

- **`backend/`** — Express.js 5 REST API running on port 4000. Uses PostgreSQL (`pg`), JWT auth (`jsonwebtoken`), email (`nodemailer`), and environment config via `dotenv`. Entry point: `backend/index.js`.
- **`frontend/`** — Next.js 15 (App Router) React 19 app running on port 3000. Uses Turbopack. Entry point: `frontend/app/page.js`.

Each service has its own `package.json`, `node_modules`, and `Dockerfile`. The root `package.json` contains only backend dependencies (the backend runs from the repo root in dev).

## Development Commands

### Backend (run from repo root)
```bash
node backend/index.js          # start on port 4000
```
Config is read from `backend/.env` — copy and fill in `JWT_SECRET` before starting.

### Frontend (run from `frontend/`)
```bash
cd frontend
npm run dev      # dev server with Turbopack at http://localhost:3000
npm run build
npm run start
```

### Docker (both services together)
```bash
docker compose up --build
```
Backend on port 4000, frontend on port 3000. The SQLite file is persisted via a volume at `./backend/db`.

## Architecture Details

- **Database**: SQLite via `better-sqlite3` (synchronous). The DB file is created automatically at `backend/db/vouchers.db` on first start. Schema lives in `backend/db/schema.sql` and runs on every startup via `db.exec()`.
- **Auth**: JWT (7-day expiry), verified by `backend/middleware/auth.js`. Frontend stores the token in `localStorage` and attaches it via `Authorization: Bearer` header using `frontend/lib/api.js`.
- **Email**: In dev, redemption emails are `console.log`'d. Wire up `nodemailer` in `backend/routes/vouchers.js` when real sending is needed.
- **Voucher codes**: 8-char hex strings generated with `crypto.randomBytes`.

## Key Conventions

- Frontend uses the Next.js **App Router** (`frontend/app/`). Pages: `/` (dashboard), `/login`, `/register`.
- All API calls go through `frontend/lib/api.js` (`apiFetch`) which handles token injection and error throwing.
- Backend routes live in `backend/routes/` (`auth.js`, `vouchers.js`) and are mounted in `backend/index.js`.
- No test framework is configured yet in either service.
