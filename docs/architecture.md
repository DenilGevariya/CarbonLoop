# CarbonLoop System Architecture

## Overview
CarbonLoop is a full-stack ClimateTech matchmaking platform designed to connect industrial CO₂ emitters with productive off-take utilization entities.

```
+-----------------------------------------------------------------------+
|                          CLIENT (React 19 + Vite)                     |
|                                                                       |
|  [ Landing Page ] <-> [ Marketplace ] <-> [ Dashboard Shell (Sidebar) ] |
|                                   │                                   |
|                          [ Matching Engine UI ]                       |
|           MatchCard | MatchBreakdown | MatchComparison | DeliveryCost  |
|                                   │                                   |
|                     Framer Motion + Base UI + Tailwind v4             |
|                                   │                                   |
|                            matching.api.ts                            |
+-----------------------------------|-----------------------------------+
                                    │ HTTP REST / JSON
+-----------------------------------v-----------------------------------+
|                         SERVER (Node.js + Express)                    |
|                                                                       |
|                     [ App / Server Init & Config ]                    |
|                                   │                                   |
|                   [ Matching Module (/api/v1/matches) ]               |
|                 Controller ──► Service ──► Pure Engine                |
|                                             │                         |
|                                     8-Factor Scoring Engine           |
|                                     Haversine Distance Calc           |
|                                     Logistics Delivered Estimator     |
|                                   │                                   |
|                    node-postgres (pg) Repository                      |
+-----------------------------------|-----------------------------------+
                                    │ Raw SQL Queries & Transactions
+-----------------------------------v-----------------------------------+
|                       DATABASE (PostgreSQL)                           |
|                                                                       |
|             Database: carbonloop_db (No ORM / Pure SQL)               |
|          24 Normalized Tables + UUIDs + SQL Migration Engine          |
|                 `matches` & `match_scores` Audit Tables               |
+-----------------------------------------------------------------------+
```

## Modular Layers
1. **Frontend Architecture**: Hybrid feature-oriented structure with shared design system components (`client/src/components/ui`, `client/src/components/shared`) and domain feature views (`client/src/features/matching/components/*`).
2. **Backend Architecture**: Express + TypeScript with `node-postgres` (`pg`). Pure functional matching algorithm (`server/src/modules/matching/matching.engine.ts`), scoring functions (`matching.scoring.ts`), distance calculator (`matching.distance.ts`), and logistics estimator (`matching.logistics.ts`).
3. **Database Layer**: PostgreSQL (`carbonloop_db`) without ORM. Custom migration runner (`001_initial_schema.sql`, `002_matching_engine_fields.sql`), schema tracking (`schema_migrations`), connection pooling (`pg.Pool`), and atomic transaction safety.

## Intelligent Matching Engine System
The Matching Engine evaluates candidate supply listings against buyer requirements using a deterministic 8-factor normalized scoring model:
- **Quantity Compatibility (20%)**: Continuous step function scoring batch size against required volume.
- **Purity Compatibility (20%)**: Strict penalization for purity under minimum threshold; bonus for high purity matching end-use.
- **Physical Form Compatibility (10%)**: Phase compatibility matrix (Gaseous, Liquid, Supercritical, Solid Dry Ice).
- **Availability Window (15%)**: Overlap calculation between supply availability dates and buyer requirement timeframe.
- **Unit Price Feasibility (15%)**: Evaluates source unit price against buyer target budget with near-match tolerance (+20%).
- **Geographic Distance (10%)**: Great-circle Haversine formula calculation with regional fallback pairs.
- **Logistics Feasibility (5%)**: Evaluates transport modality (pipeline vs ISO tanker vs cylinder).
- **Utilization Compatibility (5%)**: End-use pathway compatibility (Concrete Curing, E-Methanol, Biorefinery, Beverage).
