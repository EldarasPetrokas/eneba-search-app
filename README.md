# Eneba Game Search App

A simple full-stack web application built as a homework assignment for the Software Engineer Intern position at Eneba.

The app allows users to search for games using a REST API with fuzzy search support.

---

## Live Demo

Frontend (Vercel):
https://eneba-search-app-nu.vercel.app/

Backend API (Render):
https://eneba-search-backend.onrender.com

Example endpoints:
- /list
- /list?search=fifa
- /list?search=rdr2

---

## Tech Stack

Frontend:
- React (Vite)
- Tailwind CSS
- Deployed on Vercel

Backend:
- Node.js
- Express
- PostgreSQL
- Deployed on Render

Database:
- PostgreSQL (Supabase)
- Fuzzy search using pg_trgm similarity

---

## Search Features

- Default list of games
- Case-insensitive search
- Fuzzy search using PostgreSQL similarity
- Alias support (rdr, rdr2 → Red Dead Redemption 2)

---

## Project Structure

eneba-search-app/
├── backend/
│   ├── src/
│   │   └── index.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
└── README.md

---

## Running the Project Locally

1. Clone repository

git clone https://github.com/EldarasPetrokas/eneba-search-app.git
cd eneba-search-app

---

2. Backend setup

cd backend
npm install

Create .env file with:

DATABASE_URL=your_postgres_connection_string
CORS_ORIGIN=http://localhost:5173
PORT=8080

Start backend:

npm start

---

3. Frontend setup

cd ../frontend
npm install

Create .env file with:

VITE_API_URL=http://localhost:8080

Start frontend:

npm run dev

Frontend will be available at:
http://localhost:5173

---

## AI Usage

AI tools were used during development to:
- clarify requirements
- design backend architecture
- debug CORS and deployment issues
- improve fuzzy search logic

All architectural decisions and final code were fully understood and implemented by the author.

---

## Notes

- The project was intentionally kept simple and focused on clarity and correctness.
- No authentication or pagination was implemented, as it was outside the scope of the assignment.
- The application is fully self-hosted and publicly accessible.

---

## Author

Eldaras Petrokas
