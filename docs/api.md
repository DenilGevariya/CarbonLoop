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

## System Endpoints
- `GET /api/v1/health` - Database & service status check
- `GET /api/v1/listings/public` - Public supply streams demo data from database

## Modular Endpoint Foundations
- `GET /api/v1/auth`
- `GET /api/v1/users`
- `GET /api/v1/organizations`
- `GET /api/v1/facilities`
- `GET /api/v1/listings`
- `GET /api/v1/requirements`
- `GET /api/v1/matches`
- `GET /api/v1/orders`
- `GET /api/v1/logistics`
- `GET /api/v1/shipments`
- `GET /api/v1/verification`
- `GET /api/v1/notifications`
- `GET /api/v1/admin`
