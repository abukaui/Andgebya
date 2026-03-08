# Ardi Marketplace - MVP Foundations

This project is a three-sided marketplace (Customer, Shop, Courier) built with the PERN stack (PostgreSQL, Express, React, Node.js).

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL with PostGIS extension
- Redis (for matching logic locking)

### 2. Database Setup
1. Create a database named `ardi_db`.
2. Run the schema script:
   ```bash
   psql -d ardi_db -f database/schema.sql
   ```
3. Update `.env` with your database credentials.

### 3. Installation
Install dependencies for both backend and frontend:
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
```

### 4. Running the Project
You need to run both the backend and frontend servers:

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, PostgreSQL, PostGIS, Zod, JWT.
- **Frontend**: React (Vite), Tailwind CSS, Lucide React, Axios.
- **Security**: Bcryptjs, JWT-stateless auth.
