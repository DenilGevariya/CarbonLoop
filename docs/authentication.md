# CarbonLoop Authentication & Identity Architecture

This document specifies the technical architecture for identity, authentication, session management, organization onboarding, and Role-Based Access Control (RBAC) implemented in CarbonLoop.

---

## 1. Security & Token Strategy

CarbonLoop uses a dual-token identity architecture designed to balance low-latency API authorization with revocation security:

- **Short-Lived Access Token**:
  - Format: Signed JSON Web Token (JWT) using HMAC-SHA256 (`JWT_ACCESS_SECRET`).
  - Lifetime: 15 minutes (`JWT_ACCESS_EXPIRES_IN=15m`).
  - Transmission: Sent in HTTP `Authorization: Bearer <access_token>` header.
  - Storage: In-memory (`accessTokenMemory` in `api.ts`), never saved to `localStorage` or `sessionStorage`.
  - Minimal Payload: `userId`, `email`, `sessionId`, `roles`. No sensitive database attributes or raw secrets.

- **Long-Lived Refresh Token**:
  - Format: Signed JWT (`JWT_REFRESH_SECRET`) containing `{ userId, sessionId }`.
  - Lifetime: 7 days (`JWT_REFRESH_EXPIRES_IN=7d`).
  - Transmission: Sent in `HttpOnly`, `Secure` (production), `SameSite=Lax` cookie (`carbonloop_refresh_token`).
  - Storage: Database table `auth_sessions` stores the **SHA-256 hash** (`refresh_token_hash`). Raw refresh tokens are **never** stored in plaintext.

---

## 2. Database Schema Extensions

### Migration `017_auth_sessions_and_onboarding.sql`

```sql
-- Auth Sessions Table for Session Management & Token Rotation
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Onboarding Timestamp Tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
```

---

## 3. Role-Based Access Control (RBAC) Architecture

CarbonLoop separates **User Role** (permissions on what a user can perform) from **Organization Type** (domain classification of the entity):

- **User Roles (`user_roles`)**:
  - `platform_admin`: Superuser access across all regional hubs and organization data.
  - `emitter`: Emitter operations (CO₂ supply listings, stack telematic onboarding).
  - `utilizer`: Off-take buyer operations (CO₂ requirements, off-take bids).
  - `logistics_provider`: Freight fleet operations (ISO tanker routing, shipping telematics).
  - `regulator`: Environmental compliance auditing (pollution control board).

- **Organization Types (`organizations.org_type`)**:
  - `EMITTER`: Heavy calcination / flue gas capture facility (Cement, Steel, Power).
  - `BUYER`: Carbon utilizing plant (Concrete curing, E-Fuels, Bioplastics).
  - `LOGISTICS_PROVIDER`: Cryogenic transport carrier.
  - `REGULATOR`: State environmental protection agency.

---

## 4. API Endpoint Reference

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new user profile. |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user, issue access token + HttpOnly refresh cookie. |
| `POST` | `/api/v1/auth/refresh` | Cookie | Verify refresh cookie, rotate refresh token, issue new access token. |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revoke active session in DB, clear refresh cookie. |
| `GET`  | `/api/v1/auth/me` | Authenticated | Retrieve authenticated user profile, roles, and organizations. |
| `POST` | `/api/v1/auth/onboarding` | Authenticated | Complete organization onboarding wizard. |
| `POST` | `/api/v1/auth/change-password` | Authenticated | Change password & revoke all active sessions. |
| `GET`  | `/api/v1/auth/sessions` | Authenticated | List all active sessions for current user. |
| `DELETE`| `/api/v1/auth/sessions/:id` | Authenticated | Revoke specific session by ID. |
| `GET`  | `/api/v1/users/profile` | Authenticated | Retrieve detailed user profile. |
| `PUT`  | `/api/v1/users/profile` | Authenticated | Update user first name, last name, phone, or avatar. |
| `GET`  | `/api/v1/organizations/me` | Authenticated | Retrieve active organization details and members. |
| `PUT`  | `/api/v1/organizations/:id` | Org Member | Update corporate organization parameters. |

---

## 5. Development Test Credentials

All pre-seeded development test accounts use the password: `Password123!`

| Role | Email Login | Local Demo Email | Organization |
| :--- | :--- | :--- | :--- |
| **Emitter** | `supply@terracem.com` | `demo.emitter@carbonloop.local` | TerraCem Industries |
| **Utilizer** | `procurement@greenforge.com` | `demo.utilizer@carbonloop.local` | GreenForge Materials |
| **Logistics** | `logistics@transcarbon.com` | `demo.logistics@carbonloop.local` | TransCarbon Logistics |
| **Admin** | `admin@carbonloop.io` | `demo.admin@carbonloop.local` | GPCB Regulatory Oversight |

---

## 6. How to Run Locally

1. **Database Migration & Seed**:
   ```bash
   cd server
   npm run db:migrate
   npm run db:seed
   ```
2. **Start Backend Server**:
   ```bash
   cd server
   npm run dev
   ```
3. **Start Frontend Client**:
   ```bash
   cd client
   npm run dev
   ```
4. **Access Web App**: Open `http://localhost:5173` in your browser.
