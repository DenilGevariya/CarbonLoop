# CarbonLoop Database Architecture & Data Foundation

**Tagline:** *"Capture. Match. Reuse."*  
**Database System:** PostgreSQL (`carbonloop_db`)  
**Access Library:** `node-postgres` (`pg`) + Plain SQL Migrations (No ORM)

---

## 1. Database Purpose & Overview

CarbonLoop is a B2B ClimateTech industrial marketplace connecting CO₂ emitters, carbon-utilizing manufacturers, cryogenic logistics providers, and regulatory authorities.

The database foundation provides:
- **Normalized Relational Model:** 32 core business entities without ORM overhead.
- **Scientific & Financial Precision:** Exact `NUMERIC(14,3)` storage for mass/volume quantities and `NUMERIC(12,2)` for currency calculations.
- **Auditability & Traceability:** Immutable status change histories (`co2_listing_status_history`, `buyer_requirement_status_history`), shipment tracking events, and system audit logs.
- **Multi-Factor Match Scoring:** Detailed factor breakdowns (`quantity_score`, `purity_score`, `distance_score`, `price_score`, `availability_score`, `use_case_score`).

---

## 2. Textual Entity-Relationship (ER) Architecture

```
User ──< User_Roles >── Role
  │
  ├──< Organization_Members >── Organization (Emitter / Utilizer / Logistics / Regulator)
                                   │
                                   ├──< Facilities
                                   │      ├──< Certifications
                                   │      └──< CO₂ Supply Listings ──< Listing_Documents
                                   │            │                        └──< Listing_Status_History
                                   │            │
                                   │            └───┐ (Match Engine)
                                   │                ▼
                                   ├──< Buyer Requirements ────────────► Matches ──< Match_Scores
                                   │      │                                  │
                                   │      └──< Requirement_Status_History    ▼
                                   │                                     Inquiries
                                   │                                         │
                                   │                                         ▼
                                   │                                      Offers ──< Offer_Items
                                   │                                         │
                                   └─────────────────────────────────────────┼──────┐
                                                                             ▼      │
                                                                          Orders ◄──┘
                                                                             │
                                   ┌─────────────────────────────────────────┼──────────────────┐
                                   ▼                                         ▼                  ▼
                              Contracts                                  Shipments           Invoices
                                   │                                         │                  │
                                   ▼                                         ├── Route          ▼
                               Documents                                     └── Tracking    Payments
```

---

## 3. Core Entity Breakdown

| Entity / Table | Purpose & Key Columns | Key Foreign Keys |
| :--- | :--- | :--- |
| **`users`** | Platform user credentials & profiles (`email`, `password_hash`, `is_active`) | — |
| **`roles`** & **`user_roles`** | Role-based access control (`platform_admin`, `emitter`, `utilizer`, `logistics_provider`, `regulator`) | `users.id`, `roles.id` |
| **`organizations`** | B2B industrial entities (`name`, `legal_name`, `slug`, `org_type`, `status`, `latitude`, `longitude`) | — |
| **`organization_members`** | User membership within organizations | `organizations.id`, `users.id` |
| **`facilities`** | Industrial plants capturing or utilizing CO₂ (`facility_code`, `annual_co2_capacity_tons`, `capture_technology`) | `organizations.id` |
| **`documents`** | Central metadata store for purity certificates, permits, and agreements | `organizations.id`, `facilities.id`, `users.id` |
| **`facility_certifications`** | Compliance and ISO carbon verification records | `facilities.id`, `documents.id` |
| **`co2_listings`** | CO₂ supply offerings (`listing_code`, `available_quantity`, `purity_percentage`, `co2_physical_form`, `price_per_unit`) | `organizations.id`, `facilities.id` |
| **`co2_listing_documents`** | Links purity test reports to supply listings | `co2_listings.id`, `documents.id` |
| **`co2_listing_status_history`** | Immutable status change log for supply listings | `co2_listings.id`, `users.id` |
| **`buyer_requirements`** | CO₂ demand requirements (`requirement_code`, `required_quantity`, `minimum_purity`, `maximum_price_per_unit`) | `organizations.id`, `facilities.id` |
| **`buyer_requirement_status_history`** | Immutable status change log for demand requirements | `buyer_requirements.id`, `users.id` |
| **`matches`** | Matchmaking records (`overall_score`, `purity_score`, `distance_score`, `estimated_distance_km`, `matching_reason`) | `buyer_requirements.id`, `co2_listings.id` |
| **`match_scores`** | Factor-by-factor breakdown of match compatibility | `matches.id` |
| **`inquiries`** | Buyer initial commercial contact requests | `co2_listings.id`, `buyer_requirements.id`, `organizations.id` |
| **`offers`** & **`offer_items`** | Commercial proposals with line-item pricing (`quantity`, `unit_price`, `delivery_cost`, `total_estimated_cost`) | `inquiries.id`, `organizations.id` |
| **`orders`** & **`order_items`** | Confirmed commercial transactions | `organizations.id`, `co2_listings.id`, `offers.id` |
| **`contracts`** | Legal bilateral supply agreements | `orders.id`, `documents.id` |
| **`logistics_quotes`** | Transport carrier cost estimations (`distance_km`, `base_cost`, `fuel_surcharge`, `estimated_co2e_kg`) | `orders.id`, `organizations.id`, `facilities.id` |
| **`shipments`** | Physical movement of pressurized / cryogenic CO₂ | `orders.id`, `organizations.id`, `facilities.id` |
| **`shipment_routes`** | Geographical route waypoints & checkpoints | `shipments.id` |
| **`shipment_tracking_events`** | Real-time transit updates with GPS coordinates | `shipments.id` |
| **`verification_requests`** | Third-party purity and emissions verification workflow | `organizations.id`, `facilities.id`, `co2_listings.id` |
| **`invoices`** & **`payments`** | Financial settlement foundation (`subtotal`, `tax_amount`, `total_amount`, `payment_method`, `provider_reference`) | `orders.id`, `organizations.id` |
| **`notifications`** | User alerts (`match_found`, `inquiry_received`, `shipment_update`) | `users.id` |
| **`favorites`** | User bookmarks for listings, requirements, and facilities | `users.id` |
| **`reviews`** | Organization performance ratings (1–5 scale) | `orders.id`, `organizations.id` |
| **`audit_logs`** | Platform compliance & security audit log (`actor_user_id`, `action`, `old_values`, `new_values`) | `users.id`, `organizations.id` |

---

## 4. Key Constraints & Data Integrity Rules

1. **Scientific Quantities:**  
   `available_quantity`, `remaining_quantity`, and `required_quantity` use `NUMERIC(14,3)` (supporting fractional industrial tonnes).
2. **Financial Precision:**  
   `price_per_unit`, `subtotal`, `transport_cost`, `tax_amount`, and `total_amount` use `NUMERIC(12,2)`. Floating point types are forbidden for financial data.
3. **Purity & Score Bounds:**  
   `purity_percentage`, `minimum_purity`, `maximum_purity`, and match scores are constrained between `0` and `100`.
4. **Geographic Coordinate Validation:**  
   `latitude` constrained to `[-90, 90]`, `longitude` constrained to `[-180, 180]`.
5. **Rating Scale:**  
   `reviews.rating` constrained between `1` and `5`.
6. **Date Logic:**  
   `available_until >= available_from` and `required_until >= required_from`.

---

## 5. Migration & Utility Commands

All database scripts are executed using `tsx` in `server/`:

```bash
# Run pending PostgreSQL migrations inside transactional blocks
npm run db:migrate

# Check status of applied vs pending migration files
npm run db:status

# Run database health check (latency, server version, database name)
npm run db:health

# Seed database with realistic industrial demo dataset
npm run db:seed
```

---

## 6. pgAdmin Inspection Guide

To inspect `carbonloop_db` in **pgAdmin**:

1. Open pgAdmin and register server connection:
   - **Host:** `localhost` (or `127.0.0.1`)
   - **Port:** `5432`
   - **Database:** `carbonloop_db`
   - **Username:** `denil` (or `postgres`)
   - **Password:** `system` (or configured password)
2. Expand `Servers` -> `carbonloop_db` -> `Schemas` -> `public` -> `Tables`.
3. View applied migration log:
   ```sql
   SELECT * FROM schema_migrations ORDER BY applied_at DESC;
   ```
4. Query active marketplace supply vs demand:
   ```sql
   SELECT l.title, l.purity_percentage, l.available_quantity, l.price_per_unit, f.name AS facility_name, o.name AS emitter_name
   FROM co2_listings l
   JOIN facilities f ON l.facility_id = f.id
   JOIN organizations o ON l.organization_id = o.id
   WHERE l.status = 'active';
   ```

---

## 7. Development Demo Accounts

All demo accounts use the standard development password: **`Password123!`**

| Email | Role | Organization |
| :--- | :--- | :--- |
| `admin@carbonloop.io` | Platform Administrator | CarbonLoop Administration |
| `supply@terracem.com` | Emitter (CO₂ Supplier) | TerraCem Industries (Ahmedabad Cement Plant) |
| `supply@novasteel.com` | Emitter (CO₂ Supplier) | NovaSteel Energy (Hazira Steel Hub) |
| `procurement@greenforge.com` | Utilizer (CO₂ Buyer) | GreenForge Materials (Vadodara Mineralization Unit) |
| `procurement@carbonarc.com` | Utilizer (CO₂ Buyer) | CarbonArc Fuels (Dahej E-Fuel Refinery) |
| `procurement@algaenova.com` | Utilizer (CO₂ Buyer) | AlgaeNova Labs (Hazira Bio-Refinery) |
| `logistics@transcarbon.com` | Cryogenic Logistics Partner | TransCarbon Logistics |
| `regulator@gpcb.gov.in` | Environmental Regulator | Gujarat Pollution Control Board (GPCB) |

---

## 8. Future Architecture & Extension Points

1. **Geographic Indexing (PostGIS):**  
   Latitude and longitude columns (`latitude`, `longitude`) are stored as standard `NUMERIC(10,7)` to allow seamless migration to PostGIS `GEOGRAPHY(Point, 4326)` for spatial bounding box and route calculations.
2. **AI Matchmaking Engine:**  
   The `matches` and `match_scores` structure accepts dynamic weighting matrices to support machine-learning compatibility scoring.
3. **Blockchain Carbon Accounting Audit:**  
   The immutable `audit_logs` and `shipment_tracking_events` tables are structured for cryptographic hash chaining (e.g. SHA-256 state roots).
