# CompThinking Project 1 – Team Setup Guide

## Overview

This project uses Docker to run both the FastAPI backend and the Next.js frontend.
No Python or Node.js setup is required — everything runs inside containers.

---

## Requirements

* Install **Docker Desktop**
  [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
* Access to the team’s **Supabase project** (URL, anon key, and service role key)

---

## Folder Layout

```
CompThinking-Project1/
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
└── docker-compose.yml
```

---

## 1. Setup Environment Variables

Copy the backend example file and fill in your Supabase credentials.

```bash
cp backend/.env.example backend/.env
```

Example:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

---

## 2. Build and Run the App

From the **project root**:

```bash
docker compose build
docker compose up
```

Then open:

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:8000](http://localhost:8000)

---

## 3. Stop the Containers

```bash
docker compose down
```

---

## 4. Common Commands

| Task         | Command                           |
| ------------ | --------------------------------- |
| View logs    | `docker compose logs -f`          |
| Rebuild      | `docker compose build --no-cache` |
| Run detached | `docker compose up -d`            |

---

## 5. Troubleshooting

**Problem:** “getaddrinfo failed”
→ Ensure `SUPABASE_URL` starts with `https://`.

**Problem:** “Could not find table 'public.users'”
→ Create it in Supabase SQL Editor:

```sql
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamp default now()
);
```

---

## Summary

1. Copy `.env.example` → `.env`
2. Fill in Supabase credentials
3. Run:

   ```bash
   docker compose build
   docker compose up
   ```
4. Visit:

   * Backend: [http://localhost:8000](http://localhost:8000)
   * Frontend: [http://localhost:3000](http://localhost:3000)

---