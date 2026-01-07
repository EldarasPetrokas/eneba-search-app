# AI Prompt History (Summary)

This document summarizes the AI prompts used during development of the Eneba Game Search App.  
I intentionally include only the prompts relevant to the final architecture and features.

## 1) Architecture & Tech Choices
- “Given the homework requirements (React frontend, backend preferred Node/Go/PHP, SQL DB), propose a minimal full-stack architecture that is easy to deploy publicly (frontend + backend + database).”
- “Recommend a PostgreSQL schema for a game listing page like the screenshot (name, image, price, cashback badge, platform, region, store).”

## 2) Database & Seed Data
- “Provide SQL to create a `games` table with appropriate types and constraints for the UI requirements.”
- “Provide SQL insert statements to seed at least 3 games: FIFA 23, Red Dead Redemption 2, Split Fiction (including image URLs and prices).”
- “How to enable and use PostgreSQL trigram search (`pg_trgm`) for fuzzy matching?”

## 3) Backend API (Node.js + Express)
- “Implement an Express API with endpoints:
  - GET /health
  - GET /list
  - GET /list?search=<gamename>
  using `pg` Pool and environment variables.”
- “Implement fuzzy search in PostgreSQL with ranking/sorting, and return JSON fields formatted for frontend usage.”

## 4) Search Quality Improvements
- “Improve fuzzy search to avoid false positives on small datasets (e.g., adjust similarity threshold).”
- “Add simple query alias support (e.g., `rdr`, `rdr2` → Red Dead Redemption 2) while keeping the implementation clean.”

## 5) Frontend (React + Vite) UI
- “Build a React UI matching the screenshot style:
  - top title + search input
  - grid of game cards
  - image, cashback badge, name, price, platform/region, store”
- “Implement debounced search and connect to the backend `/list` endpoint.”
- “Polish the layout using Tailwind CSS utilities (spacing, gradients, rounded cards, hover effects).”

## 6) CORS & Deployment (Render + Vercel)
- “Explain CORS for a frontend deployed on Vercel and backend on Render, and implement a safe CORS configuration using an allowlist.”
- “Provide a deployment checklist:
  - Render (Node backend) environment variables and start command
  - Vercel (Vite frontend) root directory, build command, and `VITE_API_URL` env var”
- “Troubleshoot CORS errors in production and confirm what needs redeploy vs. refresh.”

## Notes on Usage
- AI was used as an assistant to speed up setup, provide reference implementations, and help troubleshoot deployment/CORS.
- All code was reviewed, adjusted, and implemented by me; final decisions (schema, endpoints, thresholds, UI layout) were validated through local testing and production verification.
