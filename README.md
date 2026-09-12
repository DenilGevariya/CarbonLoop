# CarbonLoop 🌿

> **Capture. Match. Reuse.**  
> *Industrial CO₂ Marketplace & Infrastructure Intelligence Platform*

[![Live Demo](https://img.shields.io/badge/Live_Demo-carbonloop--hackout.vercel.app-173D32?style=for-the-badge&logo=vercel)](http://carbonloop-hackout.vercel.app)
[![React](https://img.shields.io/badge/React_19-TypeScript-blue?style=flat-square&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-TypeScript-green?style=flat-square&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-Design_System-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌐 Live Demo & Deployment

- **Live Application**: [http://carbonloop-hackout.vercel.app](http://carbonloop-hackout.vercel.app)
- **Database Engine**: Neon PostgreSQL Serverless (PostgreSQL 18.6 over WebSockets)
- **API Backend**: Express + TypeScript REST API Engine

---

## 📌 Executive Summary

**CarbonLoop** is an enterprise-grade ClimateTech marketplace and infrastructure intelligence platform connecting **CO₂ emitters** (cement, steel, thermal power, chemical refiners) with **CO₂ utilizers** (concrete mineralization, synthetic e-fuels, chemical feedstocks, bio-technologies), **logistics providers** (cryogenic ISO tankers, rail cascades), and **verification auditors**.

By treating industrial CO₂ as a valuable circular commodity rather than a waste pollutant, CarbonLoop enables verifiable carbon reuse, automated commercial transactions, physical shipment tracking, and audited impact reporting across regional industrial hubs.

---

## ✨ Core Platform Capabilities

### 1. 🛒 CO₂ Supply & Demand Marketplace
- **Industrial Supply Listings**: Emitters list available CO₂ volumes, purity assays (95.0% - 99.99%), state forms (`LIQUID`, `GASEOUS`, `SOLID_CO2`, `SUPERCRITICAL`), minimum order thresholds, and pricing.
- **Buyer Demand Requirements**: Utilizers post feedstock specifications, required purity levels, delivery schedules, and ceiling prices.
- **Purity & State Form Specs**: Full gas chromatography assay tracking (flue gas, high-purity food grade, industrial technical grade).

### 2. ⚡ 8-Factor Algorithmic Matchmaking Engine
Pure, deterministic mathematical scoring algorithm evaluating candidate compatibility without black-box LLM non-determinism or ORM overhead:
- **Chemical Purity Compatibility (20%)**: Compares listing assay against buyer minimum requirement.
- **Quantity Satisfiability (20%)**: Validates available batch volume against requested volume.
- **Geospatial Transit Distance (10%)**: Calculates Great-Circle Haversine distance between origin and destination coordinates across Gujarat industrial clusters (Dahej, Hazira, Vadodara, Ahmedabad, Surat).
- **Price Budget Alignment (15%)**: Evaluates unit price against buyer target budget with +20% near-match tolerance.
- **Availability Window Overlap (15%)**: Ensures temporal alignment between supply availability and buyer schedule.
- **Physical Form Matching (10%)**: Checks compatibility between liquid, gaseous, and supercritical streams.
- **Verification Bonus (5%)**: Trust rating bonus for verified lab assays.
- **Utilization Pathway (5%)**: Alignment with concrete mineralization, e-fuels, or bio-technologies.
- **Quality Band Classifications**: `EXCELLENT` (90–100), `STRONG` (80–89), `GOOD` (70–79), `POSSIBLE` (55–69), `WEAK` (0–54).

### 3. 📄 Commercial Transaction Engine
- **Inquiry & Negotiation**: Direct commercial inquiry workflow between buyers and emitters.
- **Binding Counter-Offers**: Negotiate volume, unit price, delivery terms, and contract duration.
- **Contract & Order Execution**: Automated order generation, status transitions (`CONFIRMED`, `FULFILLED`, `CANCELLED`), and automated invoice ledger.

### 4. 🚚 Logistics & ISO Tanker Dispatch
- **Cryogenic Rate Quotes**: Transport rate quotes for specialized ISO tank trucks, cylinder cascades, rail tankers, and pipelines.
- **Freight Tariff Calculation**: Automated distance and weight-based transport cost estimates.
- **Real-Time Shipment Tracking**: GPS telemetry, route waypoints, checkpoint inspections, hazmat pressure monitoring (bar), and delay/exception notifications.

### 5. 🛡️ Trust Network & Independent Verification
- **Document Vault**: Upload and audit chemical laboratory purity reports, corporate licenses, and environmental permits.
- **Quality Records**: Immutable quality logs linking gas chromatography lab reports to specific supply batches.
- **Verification Review Queue**: Independent third-party verifier audit workflow for approving listing and facility certificates.

### 6. 📊 Impact MRV & ESG Reporting
- **Carbon Avoided Counter**: Real-time tracking of net tonnes CO₂e captured, matched, and permanently sequestered or utilized.
- **Fossil Displacement Metrics**: Measures virgin chemical and fossil fuel displacement ratios.
- **Circularity Score**: Evaluates supply chain reuse efficiency and transport emission intensity.
- **Audit-Ready ESG Export**: One-click download of compliance reports for corporate carbon accounting.

### 7. 🛡️ Admin Command Center
- **8 Headline Metric KPIs**: Pure PostgreSQL aggregations for active organizations, facilities, supply volume, demand volume, matched volume, orders, shipments, and pending verifications.
- **Operational System Alerts**: Real-time hazard notifications (pressure excursions, expiring permits, shipment exceptions) with operator resolution workflow.
- **Organization & User Governance**: Audit-backed organization suspension (requiring mandatory reason) and session token revocation.
- **Match Score Factor Debugger**: Step-by-step mathematical decomposition of match scores.
- **Global Command Search (`Cmd+K`)**: Instant search across Organizations, Facilities, Supply Listings, Requirements, Orders, Shipments, and Verifications.
- **Infrastructure Geo-Map & System Health**: Interactive Gujarat industrial corridor map and PostgreSQL WebSocket connection latency diagnostics.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User[Browser / Client React 19] -->|HTTPS REST API| Express[Express + TypeScript Server]
    
    subgraph Express Backend
        Auth[Auth & Security Module]
        Marketplace[Supply & Demand Module]
        Engine[8-Factor Matching Engine]
        Commercial[Inquiry, Offer & Order Engine]
        Logistics[Logistics & Tracking Module]
        Trust[Verification & Document Module]
        Analytics[Impact & MRV Analytics Engine]
        Admin[Admin Command Center Module]
    end
    
    Express -->|WebSocket / Port 443| NeonDB[(Neon PostgreSQL Serverless)]
    
    subgraph PostgreSQL Database Schema
        Schema[25 Normalized Tables & Indexes]
        Schema --> Migrations[schema_migrations tracking]
        Schema --> Audit[immutable audit_logs]
        Schema --> Alerts[system_alerts]
    end
```

---

## 💻 Technology Stack

### Frontend Application
- **Core**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS, Tailwind CSS v4, CarbonLoop Paper Industrial Aesthetic (`#FAF8F5`, `#173D32`, `#171A18`, `#E2DDD5`)
- **UI Components**: custom ClimateTech design tokens, Lucide React Icons, Framer Motion
- **Routing**: React Router v7
- **HTTP Client**: Typed `apiClient` abstraction

### Backend Service
- **Core**: Node.js, Express, TypeScript
- **Database Driver**: `@neondatabase/serverless` (WebSocket Pooler on Port 443) + `node-postgres` (`pg`)
- **Data Access**: Pure PostgreSQL queries (No ORM overhead for maximum performance)
- **Validation**: Zod schema validation
- **Authentication**: JWT access tokens + HTTP auth session tracking

### Database Infrastructure
- **Engine**: PostgreSQL 18.6 (Hosted on Neon Serverless)
- **Migrations**: 25 SQL migration scripts with transaction rollback safety
- **Security**: Role-Based Access Control (`platform_admin`, `emitter`, `utilizer`, `logistics_provider`, `verifier`, `regulator`)

---

## 📁 Repository Directory Structure

```
CarbonLoop/
├── client/                              # Frontend React 19 Application
│   ├── src/
│   │   ├── api/                         # Typed API client wrapper
│   │   ├── app/                         # App router & providers
│   │   ├── features/
│   │   │   ├── admin/                   # Admin Command Center components & hooks
│   │   │   ├── analytics/               # MRV impact analytics components
│   │   │   ├── logistics/               # Rate quotes & shipment components
│   │   │   ├── matching/                # Match breakdown & score UI
│   │   │   └── verification/            # Trust network & audit components
│   │   ├── layouts/                     # Public, Auth, Dashboard, Admin Layouts
│   │   ├── pages/                       # Public, Dashboard, Admin views
│   │   └── index.css                    # CarbonLoop industrial design tokens
│   ├── package.json
│   └── vite.config.ts
│
├── server/                              # Backend Express REST API Service
│   ├── src/
│   │   ├── config/                      # env.ts, database.ts (Neon WebSocket Pool)
│   │   ├── database/
│   │   │   ├── migrations/              # 001 - 024 SQL schema migration scripts
│   │   │   ├── migrate.ts               # Migration runner script
│   │   │   ├── seed.ts                  # Core dataset seed script
│   │   │   ├── seed_logistics_demo.ts   # Shipment tracking seed script
│   │   │   ├── seed_verification_demo.ts# Verification audit seed script
│   │   │   └── seed_admin_demo.ts       # System alerts & audit seed script
│   │   ├── middleware/                  # auth.middleware.ts, error handling
│   │   ├── modules/
│   │   │   ├── admin/                   # Repository, Health, Search, Alerts, Service, Controller, Routes
│   │   │   ├── analytics/               # Impact aggregations & MRV metrics
│   │   │   ├── logistics/               # Rate calculator & quote engine
│   │   │   ├── matching/                # 8-factor score evaluation engine
│   │   │   ├── verification/            # Document & audit queue handler
│   │   │   └── shipments/               # Checkpoints & telemetry tracking
│   │   ├── routes/                      # Router index mounting all modules
│   │   ├── app.ts                       # Express app configuration
│   │   └── server.ts                    # Entry point listener
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                                # Technical Architecture Documentation
│   ├── architecture.md
│   ├── database.md
│   └── api.md
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js (v20+ or v24+)
- npm or yarn

### 1. Environment Configuration

Create `.env` inside `server/`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_tN4ED9egMyBZ@ep-twilight-sound-ayc3syaf-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=carbonloop_super_secret_jwt_key_2026_climate_tech
```

Create `.env` inside `client/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 2. Backend Setup & Database Population

```bash
cd server

# 1. Install dependencies
npm install

# 2. Check Database Health (Neon PostgreSQL connection check)
npm run db:health

# 3. Execute all 25 SQL migrations
npm run db:migrate

# 4. Seed core dataset (Organizations, Facilities, Listings, Requirements, Orders)
npm run db:seed

# 5. Seed specialized demo datasets
npx tsx src/database/seed_logistics_demo.ts
npx tsx src/database/seed_verification_demo.ts
npx tsx src/database/seed_admin_demo.ts

# 6. Run Unit & Service Test Suite
npx tsx src/modules/admin/__tests__/admin.test.ts

# 7. Start backend server in dev mode
npm run dev
```

### 3. Frontend Setup

```bash
cd client

# 1. Install dependencies
npm install

# 2. Run TypeScript build verification
npm run build

# 3. Start Vite client development server
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 🔑 Demo Access Accounts

You can test different platform roles using the following pre-seeded demo credentials:

| Role | Email | Password | Primary Focus |
| :--- | :--- | :--- | :--- |
| **Platform Admin** | `admin@carbonloop.com` | `password123` | Full Command Center, System Alerts, Session Revocation, Audit Log |
| **CO₂ Emitter** | `emitter@terracem.com` | `password123` | Supply Listing Management, Capture Facilities, Inquiry Responses |
| **CO₂ Utilizer / Buyer** | `buyer@greenforge.com` | `password123` | Feedstock Demand Posting, Algorithmic Matching, Order Execution |
| **Logistics Provider** | `logistics@transcarbon.com` | `password123` | Cryogenic Freight Rate Quotes, ISO Tanker Dispatch, GPS Telemetry |
| **Third-Party Verifier** | `verifier@gpcb.gov.in` | `password123` | Chemical Lab Assay Audits, Facility Certificate Verifications |

---

## 📄 License & Attribution

Developed with ❤️ for ClimateTech Innovation.  
CarbonLoop — *Capture. Match. Reuse.*
