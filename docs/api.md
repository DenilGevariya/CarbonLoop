# CarbonLoop REST API Reference

## Base URL
`http://localhost:5000/api/v1`

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable explanation"
  }
}
```

---

## 1. Health & System Endpoints

### Health Check
- **`GET /api/v1/health`**
- Returns real-time database connection latency, PostgreSQL version, and database name.

### Public Listings Demo
- **`GET /api/v1/listings/public`**
- Returns published CO₂ supply listings for guest preview.

---

## 2. Matching Engine API (`/matches`)

The CarbonLoop Intelligent Matching Engine provides deterministic 8-factor scoring, commercial transport estimation, and match explanations.

### Generate / Recalculate Matches
- **`POST /api/v1/matches/generate`**
- **Request Body:**
  ```json
  {
    "requirementId": "70000000-0000-4000-a000-000000000001"
  }
  ```
  *(or `{"listingId": "60000000-0000-4000-a000-000000000001"}`)*
- **Response:**
  ```json
  {
    "success": true,
    "generatedMatches": [
      {
        "id": "match-uuid",
        "listing_id": "60000000-0000-4000-a000-000000000001",
        "requirement_id": "70000000-0000-4000-a000-000000000001",
        "status": "SUGGESTED",
        "overall_score": 94.2,
        "grade": "EXCELLENT",
        "quantity_score": 100,
        "purity_score": 98,
        "physical_form_score": 100,
        "availability_score": 90,
        "price_score": 95,
        "distance_score": 88,
        "logistics_score": 90,
        "utilization_score": 92,
        "estimated_distance_km": 140.5,
        "estimated_transport_cost": 27810,
        "estimated_delivered_cost": 4555.62,
        "matching_reason": "EXCELLENT match (94.2/100)...",
        "explanations": [ ... ],
        "warnings": [ ... ]
      }
    ]
  }
  ```

### Get Requirement Matches
- **`GET /api/v1/matches/requirements/:requirementId/matches?minScore=0`**
- Retrieves ranked supply matches for a specific buyer requirement.

### Get Listing Matches
- **`GET /api/v1/matches/listings/:listingId/matches?minScore=0`**
- Retrieves ranked demand requirements for a supply listing.

### Get Single Match Details
- **`GET /api/v1/matches/:matchId`**
- Retrieves complete match detail with full listing and requirement objects.

---

## 3. Platform Recommendations API (`/recommendations`)

### Get Top Recommendations
- **`GET /api/v1/recommendations/top?limit=5`**
- Returns top ranked matches across active requirements for executive dashboard feeds.

---

## 4. Operational API Modules
- `GET /api/v1/auth` - Authentication & JWT token verification
- `GET /api/v1/users` - User profiles & team management
- `GET /api/v1/organizations` - Organization profiles & verification
- `GET /api/v1/facilities` - Capture & utilization facility registry
- `GET /api/v1/listings` - CO₂ supply listing management
- `GET /api/v1/requirements` - Buyer requirement management
- `GET /api/v1/orders` - Confirmed transaction orders & contracts
- `GET /api/v1/logistics` - Transport carrier quotes & routing
- `GET /api/v1/shipments` - Real-time ISO tanker tracking
- `GET /api/v1/verification` - Lab test verification & ISO certs
- `GET /api/v1/notifications` - Real-time alerts
- `GET /api/v1/admin` - Platform administration
