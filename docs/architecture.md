# CarbonLoop System Architecture

## Overview
CarbonLoop is a full-stack ClimateTech matchmaking platform designed to connect industrial CO₂ emitters with productive off-take utilization entities.

```
+-----------------------------------------------------------------------+
|                          CLIENT (React 19 + Vite)                     |
|                                                                       |
|  [ Landing Page ] <-> [ Marketplace ] <-> [ Dashboard Shell (Sidebar) ] |
|                                                                       |
|                     Framer Motion + shadcn/ui + Tailwind v4           |
|                                     |                                 |
|                             apiClient / TanStack Query                |
+-------------------------------------|---------------------------------+
                                      | HTTP REST / JSON
+-------------------------------------v---------------------------------+
|                         SERVER (Node.js + Express)                    |
|                                                                       |
|                     [ App / Server Init & Config ]                    |
|                                     |                                 |
|                       [ Centralized Error & Auth ]                    |
|                                     |                                 |
|                     [ Modular API Routes (/api/v1/*) ]                |
|                                     |                                 |
|                    node-postgres (pg) Connection Pool                 |
+-------------------------------------|---------------------------------+
                                      | Raw SQL Queries
+-------------------------------------v---------------------------------+
|                       DATABASE (PostgreSQL)                           |
|                                                                       |
|             Database: carbonloop_db (No ORM / Pure SQL)               |
|            24 Normalized Tables + UUIDs + SQL Migration Engine        |
+-----------------------------------------------------------------------+
```

## Modular Layers
1. **Frontend Architecture**: Hybrid feature-oriented structure with shared design system components (`src/components/ui`, `src/components/shared`) and domain feature views (`src/pages/*`).
2. **Backend Architecture**: Express + TypeScript with node-postgres (`pg`). Raw SQL migrations with transaction safety and schema tracking.
3. **Database Layer**: PostgreSQL (`carbonloop_db`) without ORM. Connection pooling (`pg.Pool`), health check helper (`checkDatabaseHealth`), and query duration telemetry.
