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

# Run database migrations (creates 24 normalized tables + matching engine fields)
npm run db:migrate

# Seed development demo data (Organizations, Facilities, CO2 Listings, Requirements)
npm run db:seed

# Run Matching Engine Unit Tests (15 tests)
npm run test:matching

# Start backend Express server in development mode (port 5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Build client application
npm run build

# Start Vite dev server (port 5173)
npm run dev
```

---

## ⚡ Intelligent Matching Engine Highlights

CarbonLoop features a pure, deterministic rule-based matching engine designed without ORM overhead or black-box LLM non-determinism:
- **8-Factor Normalized Scoring (0–100)**: Quantity (20%), Purity (20%), Physical Form (10%), Availability Window (15%), Unit Price (15%), Distance (10%), Logistics (5%), Utilization Pathway (5%).
- **Great-Circle Distance Calculation**: Haversine formula calculation between emitter and buyer facility coordinates with regional Indian industrial city fallback.
- **Logistics & Delivered Cost Estimator**: Calculates transport freight tariffs and indicative delivered cost per tonne based on stream state form and distance.
- **Quality Bands**: `EXCELLENT` (90–100), `STRONG` (80–89), `GOOD` (70–79), `POSSIBLE` (55–69), `WEAK` (0–54).
- **Hard Eligibility & Near Matches**: Strict hard constraints with explicit flags for candidates slightly exceeding price budget (+20% near match tolerance).
- **Explainable Match Reasons & Warnings**: Human-readable natural language justification for every calculated match score.

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
│   │   │   └── shared/          # Reusable Primitives (Eyebrow, MetricCard, FeaturePlaceholder)
│   │   ├── features/
│   │   │   └── matching/        # Matching Engine UI (MatchScore, Breakdown, Comparison, DeliveryCost)
│   │   ├── layouts/             # PublicLayout, AuthLayout, DashboardLayout (shadcn Sidebar)
│   │   ├── pages/               # Public, Auth, Dashboard & Matches Views
│   │   └── index.css            # CarbonLoop ClimateTech Design Tokens & Glow Utility Classes
│   ├── package.json
│   └── vite.config.ts
│
├── server/                      # Backend API & Database Layer (Express + Node + pg)
│   ├── src/
│   │   ├── config/              # env.ts (Zod validation), database.ts (pg.Pool & health checks)
│   │   ├── database/
│   │   │   ├── migrations/      # 001_initial_schema.sql, 002_matching_engine_fields.sql
│   │   │   ├── migrate.ts       # SQL Transaction Migration Runner
│   │   │   └── seed.ts          # Seed Data Script
│   │   ├── modules/
│   │   │   └── matching/        # Engine, Scoring, Distance, Logistics, Repository, Controller, Tests
│   │   ├── routes/              # API Routes (/api/v1/health, /api/v1/matches, /api/v1/recommendations)
│   │   ├── app.ts               # Express App Setup
│   │   └── server.ts            # Server Entry Point
│   ├── package.json
│   └── tsconfig.json
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
- **Framework**: Node.js + Express + TypeScript
- **Database Access**: `node-postgres` (`pg`) + Raw SQL (No ORM)
- **Validation**: Zod + custom matching engine validators
- **Testing**: `tsx` test harness for pure unit testing
