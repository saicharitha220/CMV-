# CMS Assignment — Setup Guide

This repository contains a small CMS application with three main parts:

- `backend/` — Express.js + Mongoose API
- `admin-frontend/` — Next.js admin panel
- `public-frontend/` — Next.js public site

The project is designed to run locally with a MongoDB instance. If no MongoDB server is available during local development, the backend can fall back to an in-memory MongoDB instance so the app can still start.

## Prerequisites

Before starting, make sure you have:

- Node.js 18+
- npm
- A MongoDB instance, or use the local fallback behavior
- Optional: Docker Desktop for `docker-compose.yml`

## 1) Install dependencies

From the project root:

```powershell
npm install
```

This installs the workspace dependencies for the backend, admin frontend, and public frontend.

## 2) Configure environment files

### Backend

Create a `.env` file inside `backend/`:

```powershell
cd backend
copy .env.example .env
```

Example backend variables:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/cms_assignment
JWT_SECRET=change_this_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Password123!
```

> Note: In production, the backend can fall back to an in-memory MongoDB when no Mongo URI is configured, but this does not persist data across deployments. For a production-ready deployment, set `MONGO_URI` (or `MONGODB_URI`) to a persistent MongoDB instance.

### Admin frontend

Create a local env file inside `admin-frontend/`:

```powershell
cd admin-frontend
copy .env.local.example .env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Public frontend

Create a local env file inside `public-frontend/`:

```powershell
cd public-frontend
copy .env.local.example .env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 3) Start the application

### Option A — Run everything together from the repo root

```powershell
npm start
```

This starts:

- Backend on `http://localhost:4000`
- Admin frontend on `http://localhost:3001`
- Public frontend on `http://localhost:3000`

### Option B — Run each service separately

```powershell
npm run start:backend
npm run start:admin
npm run start:public
```

## 4) Login to the admin panel

Open the admin frontend in your browser:

```text
http://localhost:3001
```

Use the seeded admin credentials:

- Email: `admin@example.com`
- Password: `Password123!`

After login, the admin dashboard lets you:

- view content items
- create new content
- edit existing content
- delete content

## 5) View the public site

Open:

```text
http://localhost:3000
```

The public site reads content from the backend public API and renders it to the page.

## 6) Backend health check

You can verify the backend is running with:

```text
http://localhost:4000/healthz
```

Expected response:

```json
{ "status": "ok", "mongo": "connected" }
```

If the backend is running without a reachable MongoDB server, it will attempt the local fallback and still boot for development use.

## 7) Seed sample content (optional)

If you want demo data to exist in the backend, run:

```powershell
cd backend
npm run seed
```

This script creates or updates sample content entries used by the admin and public frontends.

## Technology choices

- Frontend: Next.js
- State management: Redux Toolkit in the admin app
- Backend: Express.js
- Database: MongoDB via Mongoose
- Authentication: JWT-based login for the admin area
- Content model: flexible JSON-based content storage

## Architecture overview

The application follows a simple three-layer structure:

1. `admin-frontend/` handles authentication and content management
2. `backend/` provides REST APIs and database access
3. `public-frontend/` reads the published content and renders it publicly

The admin interface communicates with the backend using `/api/v1/...` endpoints. The public frontend consumes the public content endpoint and displays content without requiring admin authentication.

## Assumptions

- The admin and public interfaces are demonstration-level apps.
- Content is stored as structured JSON rather than a rigid relational schema.
- `JWT` is stored in the browser for assignment simplicity.
- For production, a more secure token strategy and richer content authoring experience would be recommended.

## Docker (optional)

A root-level `docker-compose.yml` is included. If Docker is available on your machine, you can run:

```powershell
docker compose up --build
```

If Docker is not working on your machine, use the local Node.js instructions above.

## Summary

To evaluate the app locally:

1. Copy the `.env` files from the examples
2. Run `npm install`
3. Start everything with `npm start`
4. Open `http://localhost:3001`
5. Log in with:
   - `admin@example.com`
   - `Password123!`

The public site is available at `http://localhost:3000`.
