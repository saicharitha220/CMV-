# CMS Assignment — README

This repository contains a small CMS project with:
- `backend/` — Express + Mongoose backend API
- `admin-frontend/` — Next.js admin panel (Redux Toolkit)
- `public-frontend/` — Next.js public site

This README explains how to run the project locally, the main architecture decisions, and assumptions.

## Quick start (development)

1. Backend

```powershell
cd backend
copy .env.example .env
npm install
npm run dev
```

The backend will try to connect to MongoDB defined in `MONGO_URI`. If a Mongo server is not available it will automatically start an in-memory MongoDB for local development. The server seeds an admin user on first successful DB connection using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the `.env` file.

Default backend port: 4000 (configurable via `PORT` in `.env`).

2. Admin frontend

```powershell
cd admin-frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Default admin frontend port: 3001. Make sure `NEXT_PUBLIC_API_URL` points to the running backend (e.g. `http://localhost:4000`).

3. Public frontend

```powershell
cd public-frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Default public frontend port: 3000. It fetches content from the backend's `/content` endpoint.

## Environment variables

Backend `.env.example` contains:

- PORT=4000
- MONGO_URI=mongodb://127.0.0.1:27017/cms_assignment
- JWT_SECRET=change_this_secret
- ADMIN_EMAIL=admin@example.com
- ADMIN_PASSWORD=Password123!

Frontends `.env.local.example` contains:

- NEXT_PUBLIC_API_URL=http://localhost:4000

Adjust `NEXT_PUBLIC_API_URL` to the backend address and port you use.

## Architecture and decisions

- Backend: Express.js + Mongoose. A flexible `Content` model stores `key`, `name`, `description`, and `value` (arbitrary JSON). This lets the admin panel store structured content (lists, nested objects, tables represented as JSON) without schema migrations.
- Authentication: JWT-based login (`/api/v1/auth/login`) used by admin frontend. Token stored in `localStorage` by the admin UI and sent as `Authorization: Bearer <token>` for protected admin APIs.
- Admin UI: Next.js + Redux Toolkit. The admin UI provides login, content list, create/edit (JSON editor), and delete functionality.
- Public site: Next.js that fetches `/content` (public endpoint) and renders content JSON.
- Local dev: The backend has a robust DB connection flow and will start an in-memory MongoDB when external Mongo is unreachable. This ensures the project runs without extra setup.

## Assumptions

- The admin UI and public site are simple examples — content rendering is JSON-based. For production you would add content types, richer editors (Markdown/WYSIWYG), and field-level validation.
- Storing `JWT` in localStorage is acceptable for this assignment demo; for production use HttpOnly cookies for improved security.

## How to seed / reset admin

- On first DB connection the backend will seed an admin user using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.
- To change admin credentials after seeding, either update the record directly in the DB or delete the admin document so the seed runs again.

### Seeding example content

Run the following from the `backend/` folder to create a few example content items used by the admin and public frontends:

```powershell
cd backend
npm run seed
```

This script upserts sample items with keys `SUPER`, `CHARIITHA`, and `CONTENT_1`.

## Running with Docker (optional)

The repository includes a `docker-compose.yml` at the root. If Docker Desktop is available on your machine you can start services with:

```powershell
docker compose up --build
```

If Docker fails on Windows due to engine/pipe issues, run the local development instructions above (the backend will fall back to in-memory MongoDB).

## What I implemented to satisfy the assignment

- Admin authentication (login/logout)
- Admin dashboard with content CRUD
- Public website consuming backend content APIs
- Flexible content model supporting arbitrary structured JSON
- README with setup and architecture notes (this file)

If you'd like, I can:
- Add a small CSS polish to improve responsive behavior
- Add a sample seed script to create a few example content items
- Dockerize frontends in `docker-compose.yml` (currently you can run them locally)

---
Enjoy — let me know if you want a browser opened to the admin or public site.
