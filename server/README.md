Local MySQL + migration

1) Start MySQL using Docker Compose (recommended):

   docker compose up -d

   This will create a MySQL container with database `automated_app`, user `appuser`, password `apppass` (see `docker-compose.yml`).

2) Configure server env (copy example):

   cd server
   copy .env.example .env
   # edit values if you changed docker-compose credentials

3) Run migration/seed (creates tables and optional seed user):

   npm install
   node migrate.js

4) Start server:

   npm start

5) Dev helper: impersonate endpoint

   You can create/sign-in a user quickly (dev only):

   curl -X POST http://localhost:4000/auth/impersonate -H "Content-Type: application/json" -d '{"email":"test@example.com"}' -c cookies.txt

   This will set the auth cookie for the created user.
# Mock backend server

This is a small Express-based mock backend for local development.

Quick start:

```powershell
cd server
npm install
npm start
```

Server runs on port 4000 by default. Endpoints:
- `GET /health`
- `POST /auth/login` { email, password } -> { token, user }
- `GET /auth/me` (cookie `token` or `Authorization: Bearer <token>`)
- `GET /jobs`
- `POST /applications` { jobId, name, email, resume }
