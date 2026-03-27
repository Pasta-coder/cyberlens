# SatyaSetu.AI — Developer Setup Guide

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## 1. Create Environment Files

### Backend (`cyberlens/backend/.env`)

```env
Groq_api=<your-groq-api-key>
```

> Get a free Groq API key from [console.groq.com](https://console.groq.com). Ask the team lead for the shared key.

### Frontend (`cyberlens/webapp/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

> **Note:** The database (Neon PostgreSQL) connection is already configured in the codebase. No additional DB setup needed — everyone shares the same cloud database.

## 2. Backend Setup

```bash
cd cyberlens/backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

You should see:
```
✅ Database connected successfully (Neon PostgreSQL)
✅ Admin user ready
🚀 SatyaSetu.AI v2.0 — All systems operational
```

## 3. Frontend Setup

```bash
cd cyberlens/webapp
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 4. Admin Login

- **Username:** `admin`
- **Password:** `satyasetu2026`

## Key URLs

| Service         | URL                              |
|-----------------|----------------------------------|
| Frontend        | http://localhost:3000             |
| Backend API     | http://localhost:8000             |
| API Docs        | http://localhost:8000/docs        |
| Admin Console   | http://localhost:3000/admin       |
