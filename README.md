# Go Voucher

A full-stack voucher management app. Create vouchers, share codes, and redeem them — with JWT-based authentication and a SQLite database.

## Stack

- **Backend** — Node.js, Express 5, SQLite (`better-sqlite3`), JWT, bcrypt
- **Frontend** — Next.js 15 (App Router), React 19
- **Infra** — Docker Compose

## Getting Started

### With Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### Without Docker

**Backend** (from repo root):
```bash
cp backend/.env.example backend/.env   # fill in JWT_SECRET
node backend/index.js
```

**Frontend** (from `frontend/`):
```bash
npm install
npm run dev
```

## Environment Variables

Create `backend/.env`:

```env
PORT=4000
DB_PATH=./db/vouchers.db
JWT_SECRET=your_secret_here
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register, returns JWT |
| POST | `/auth/login` | — | Login, returns JWT |
| POST | `/vouchers` | ✓ | Create a voucher |
| GET | `/vouchers` | ✓ | List your vouchers |
| POST | `/vouchers/redeem` | ✓ | Redeem a voucher by code |

## Features

- User registration and login
- Create vouchers with a value and optional expiry
- Unique 8-character voucher codes
- Redeem vouchers — codes can only be used once
- Voucher status tracking: `active`, `redeemed`, `expired`
