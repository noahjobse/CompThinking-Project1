# Team Collaboration Workspace

A Google Docs–style collaboration system built with FastAPI (Python) and Next.js (TypeScript).
Supports multi-user document editing, task management, and realtime activity logging via WebSockets.

---

1. Overview

---

This project implements a full-stack prototype for CMPS-3000 Project 1 – Fall 2025:

Backend: FastAPI (Python 3.11) with JSON persistence and WebSocket endpoints
Frontend: Next.js 15 (React 19 + TypeScript 5)
Realtime: WebSocket channel (/ws/document) for live document sync
Persistence: Local JSON files in backend/data/
Testing: Full coverage using pytest and FastAPI’s TestClient

---

2. Folder Structure

---

project-root/
│
├── backend/                (FastAPI backend)
│   ├── main.py
│   ├── routes/api/         (REST routes)
│   ├── routes/ws/          (WebSocket route)
│   ├── utils/              (helpers: auth, files, constants)
│   ├── models/             (Pydantic schemas)
│   └── tests/              (pytest suite)
│
├── frontend/               (Next.js 15 frontend)
│   ├── app/                (App Router pages)
│   ├── components/         (UI + Auth)
│   ├── context/            (AuthProvider)
│   └── lib/                (API helpers)
│
└── combine.py              (utility script to combine text/code files)

---

3. Requirements

---

Python 3.11 or newer
Node.js 18 or newer
npm (or yarn/pnpm)
pytest (for backend tests)

---

4. Backend Setup (FastAPI)

---

1. Open a terminal and go to the backend folder:
   cd backend

2. Create a virtual environment:
   python -m venv .venv
   ..venv\Scripts\activate     (on Windows)
   source .venv/bin/activate    (on macOS/Linux)

3. Install dependencies:
   pip install fastapi uvicorn pydantic pytest

4. Run the server:
   uvicorn main:app --reload

5. The API will start at:
   [http://localhost:8000](http://localhost:8000)

   OpenAPI docs:
   [http://localhost:8000/docs](http://localhost:8000/docs)

---

5. Frontend Setup (Next.js)

---

1. Open another terminal:
   cd frontend

2. Install dependencies:
   npm install

3. Run the development server:
   npm run dev

4. The site will be available at:
   [http://localhost:3000](http://localhost:3000)

The frontend expects the backend to be running on port 8000.

---

6. Running Tests

---

From inside the backend folder:

pytest -v

This runs all API, task, user, and document tests using FastAPI’s TestClient.

---

7. Common Accounts (for testing)

---

Admin:  username=admin123,  password=admin123
Editor: username=editor123, password=editor123
Viewer: username=viewer123, password=viewer123

---

8. Notes

---

All persistent data (users, tasks, document, activity logs) is stored as JSON files in backend/data/.
You can reset the data by deleting these files and restarting the backend.
Realtime editing uses a single WebSocket endpoint at /ws/document.

---

9. Optional Utilities

---

combine.py merges all text/code files in the project into a single combined_output.txt file for submission or review.

Usage:
python combine.py
Enter the root folder path when prompted.
