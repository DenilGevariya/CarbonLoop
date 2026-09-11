# CarbonLoop

> **Capture. Match. Reuse.**

CarbonLoop is an intelligent carbon capture-to-product matchmaking platform that connects industrial CO₂ emitters with organizations that can utilize captured carbon in concrete mineralization, synthetic e-fuels, chemical feedstocks, and bio-technologies.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v20+)
- PostgreSQL installed and running locally on port 5432
- PostgreSQL database created: `carbonloop_db`

### 1. Backend Setup & Database Migration
```bash
cd server

# Install dependencies
npm install

# Run database migrations (creates 24 normalized tables)
npm run db:migrate

# Seed development demo data
npm run db:seed

# Start backend Express server in development mode (port 5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Start Vite dev server (port 5173)
npm run dev
```

---

## 📁 Repository Folder Tree

```
CarbonLoop/
├── client/                      # Frontend Application (React + TS + Tailwind v4 + shadcn)
│   ├── src/
│   │   ├── app/                 # Router, Providers & Global App Setup
│   │   ├── animations/          # Framer Motion Primitives (FadeUp, Counter, ScaleIn)
│   │   ├── api/                 # Typed API Client Abstraction
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui & Base UI Components (61 components)
│   │   │   ├── shared/          # Reusable Primitives (Eyebrow, MetricCard, FeaturePlaceholder)
│   │   │   └── landing/         # Landing Page Components (Hero, CarbonFlow, Problem, HowItWorks...)
│   │   ├── layouts/             # PublicLayout, AuthLayout, DashboardLayout (shadcn Sidebar)
│   │   ├── pages/               # Public, Auth, Dashboard & Not-Found Views
│   │   └── index.css            # CarbonLoop ClimateTech Design Tokens & Glow Utility Classes
│   ├── components.json          # shadcn configuration
│   └── package.json
│
├── server/                      # Backend API & Database Layer (Express + Node + pg)
│   ├── src/
│   │   ├── config/              # env.ts (Zod validation), database.ts (pg.Pool & health checks)
│   │   ├── middleware/          # Error handling, 404, Auth & Validation middleware
│   │   ├── database/
│   │   │   ├── migrations/      # 001_initial_schema.sql (24 entities)
│   │   │   ├── migrate.ts       # SQL Transaction Migration Runner
│   │   │   └── seed.ts          # Realistic CarbonLoop Seed Data Script
│   │   ├── routes/              # API Routes (/api/v1/health, /api/v1/*)
│   │   ├── app.ts               # Express App Setup
│   │   └── server.ts            # Server Entry Point
│   ├── .env.example
│   └── package.json
│
├── docs/                        # Architecture & Technical Documentation
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   └── ui-design-system.md
└── README.md
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Custom Dark Industrial Aesthetics
- **UI Components**: shadcn/ui + Base UI primitives (61 components)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router v7
- **State/API**: TanStack React Query + Typed Fetch Client

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database Access**: PostgreSQL + `pg` (node-postgres). **NO ORM**.
- **Validation**: Zod
- **Security**: JWT & bcryptjs ready

---

## 🏥 Health Endpoint
`GET http://localhost:5000/api/v1/health`

Response:
```json
{
  "success": true,
  "service": "carbonloop-api",
  "status": "healthy",
  "timestamp": "2026-09-11T19:45:47.990Z",
  "database": {
    "status": "healthy",
    "latencyMs": 1,
    "details": "Connected to carbonloop_db"
  }
}
```
