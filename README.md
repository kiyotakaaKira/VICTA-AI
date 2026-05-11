# 🔬 Forensic AI Platform

An AI-Powered Forensic Intelligence Platform for advanced case management, evidence analysis, timeline reconstruction, and knowledge graph visualization — powered by Gemini AI.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| UI | Shadcn UI, Framer Motion, React Flow, Recharts |
| Auth | Clerk |
| Backend | Express.js, Node.js |
| Database | Supabase (PostgreSQL) |
| Storage | Firebase Storage |
| AI | Google Gemini 1.5 Flash |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## 📁 Project Structure

```
forensic-ai-platform/
├── frontend/   ← Next.js 14 App Router
└── backend/    ← Express.js REST API + WebSocket
```

---

## ⚙️ Setup

### Prerequisites
- Node.js >= 18
- npm or pnpm
- Supabase project
- Firebase project
- Clerk account
- Google AI Studio API key

### 1. Clone & Install

```bash
git clone <repo-url>
cd forensic-ai-platform

# Install frontend deps
cd frontend && npm install

# Install backend deps
cd ../backend && npm install
```

### 2. Environment Variables

**Frontend** — copy `frontend/.env.local.example` → `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**Backend** — copy `backend/.env.example` → `backend/.env`:

```
PORT=5000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
GEMINI_API_KEY=AIza...
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
CLERK_SECRET_KEY=sk_...
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5000/api/health

---

## 🗄️ Supabase Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Cases
create table cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text default 'active',
  priority text default 'medium',
  risk_score integer default 0,
  tags text[],
  assigned_to text,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Evidence
create table evidence (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id),
  name text not null,
  type text,
  url text,
  size integer,
  analysis jsonb,
  risk_score integer default 0,
  authenticity_score integer default 100,
  uploaded_by text,
  created_at timestamptz default now()
);

-- Insights
create table insights (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id),
  title text not null,
  description text,
  severity text default 'info',
  source text,
  created_at timestamptz default now()
);

-- Timeline Events
create table timeline_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id),
  title text not null,
  description text,
  type text,
  timestamp timestamptz,
  confidence integer default 100,
  created_at timestamptz default now()
);
```

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```
Set all `NEXT_PUBLIC_*` env vars in Vercel dashboard.

### Backend → Railway
Push `backend/` folder to a Railway project.
Set all backend env vars in Railway dashboard.

---

## 📝 License

MIT — built for forensic intelligence research.
