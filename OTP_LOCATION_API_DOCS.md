# Loopify - OTP & Location API Documentation

## Overview

This document covers the new mobile-first authentication and location detection system for Loopify.

**Features:**
- ✅ Zepto-style mobile number login
- ✅ OTP-based verification (6-digit code, 5-minute expiry)
- ✅ Automatic location detection via browser Geolocation API
- ✅ Nearest hub auto-detection using Haversine formula
- ✅ Session-based authentication with localStorage persistence
- ✅ Production-ready, hackathon-ready code

---

## Authentication Endpoints

### 1. POST /api/auth/send-otp

Send OTP to user's phone number. Creates new user if doesn't exist.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "9876543210"
  }'
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone_number | string | Yes | 10-digit Indian phone number (with or without +91) |

**Response (Success):**
```json
{
  "message": "OTP sent successfully",
  "phone": "9876543210",
  "demo_otp": "123456",
  "expires_in_seconds": 300
}
```

**Response (Error):**
```json
{
  "error": "Invalid phone number format. Use 10 digits."
}
```

**Demo Notes:**
- For MVP: OTP printed to server console
- Remove `demo_otp` field in production
- In production: Send via SMS gateway (Twilio, AWS SNS, etc.)

---

### 2. POST /api/auth/verify-otp

Verify OTP and create authenticated session.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "9876543210",
    "otp_code": "123456"
  }'
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone_number | string | Yes | 10-digit phone number |
| otp_code | string | Yes | 6-digit OTP code |

**Response (Success):**
```json
{
  "success": true,
  "session_token": "abcdef1234567890abcdef12",
  "user": {
    "user_id": 1,
    "name": "User-3210",
    "email": "user_9876543210@loopify.app",
    "phone_number": "9876543210",
    "eco_points": 0,
    "is_verified": 1
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid OTP"
}
```

**Frontend Implementation:**
```javascript
// After OTP verification
localStorage.setItem('sessionToken', data.session_token);
localStorage.setItem('user', JSON.stringify(data.user));
```

---

### 3. POST /api/auth/logout

Logout user and clear session.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "session_token": "abcdef1234567890abcdef12"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. GET /api/auth/me

Get current user from session token.

**Request:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer abcdef1234567890abcdef12"
```

**Response:**
```json
{
  "user": {
    "user_id": 1,
    "name": "User-3210",
    "email": "user_9876543210@loopify.app",
    "phone_number": "9876543210",
    "eco_points": 0,
    "is_verified": 1
  }
}
```

**Error (Unauthorized):**
```json
{
  "error": "Invalid or expired session"
}
```

---

## Location & Nearest Hub Endpoints

### 1. GET /api/location/nearest-hub

Find the nearest hub to user's coordinates using Haversine formula.

**Request:**
```bash
curl "http://localhost:3000/api/location/nearest-hub?lat=28.6139&lng=77.2090"
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | Latitude (-90 to 90) |
| lng | number | Yes | Longitude (-180 to 180) |

**Response:**
```json
{
  "hub_id": 1,
  "hub_name": "Delhi Hub",
  "location": "Connaught Place",
  "address": "123 Main Street, Delhi",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "distance_km": 0.0,
  "status": "active"
}
```

**Error:**
```json
{
  "error": "No active hubs available"
}
```

---

### 2. GET /api/location/nearby-hubs

Get all hubs within a specified radius (default 10 km).

**Request:**
```bash
curl "http://localhost:3000/api/location/nearby-hubs?lat=28.6139&lng=77.2090&radius=15"
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| lat | number | Yes | - | User latitude |
| lng | number | Yes | - | User longitude |
| radius | number | No | 10 | Search radius in kilometers |

**Response:**
```json
{
  "hubs": [
    {
      "hub_id": 1,
      "hub_name": "Delhi Hub",
      "distance_km": 0.5,
      "location": "Connaught Place",
      "address": "123 Main Street, Delhi"
    },
    {
      "hub_id": 2,
      "hub_name": "Delhi South Hub",
      "distance_km": 8.3,
      "location": "Malviya Nagar",
      "address": "456 Park Street, Delhi"
    }
  ],
  "count": 2
}
```

---

### 3. POST /api/location/record

Record user's location for analytics and tracking.

**Request:**
```bash
curl -X POST http://localhost:3000/api/location/record \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "latitude": 28.6139,
    "longitude": 77.2090,
    "accuracy_meters": 50
  }'
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | number | Yes | User ID from session |
| latitude | number | Yes | User latitude |
| longitude | number | Yes | User longitude |
| accuracy_meters | number | No | GPS accuracy in meters |

**Response:**
```json
{
  "success": true,
  "nearest_hub_id": 1,
  "distance_km": 0.5
}
```

---

## Database Schema Changes

### Users Table (New Columns)

```sql
ALTER TABLE users ADD COLUMN phone_number TEXT UNIQUE;
ALTER TABLE users ADD COLUMN otp_code TEXT;
ALTER TABLE users ADD COLUMN otp_expires_at DATETIME;
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0;
ALTER TABLE users ADD COLUMN session_token TEXT UNIQUE;
ALTER TABLE users ADD COLUMN last_login DATETIME;
```

### Hubs Table (Updated)

```sql
-- Latitude and Longitude columns already exist
-- If missing, add:
ALTER TABLE hubs ADD COLUMN latitude REAL;
ALTER TABLE hubs ADD COLUMN longitude REAL;

-- Update with real coordinates:
UPDATE hubs SET latitude = 28.6139, longitude = 77.2090 
WHERE hub_name = 'Delhi Hub';
```

### New Tables

**otp_sessions** - Track OTP requests and verification attempts
```sql
CREATE TABLE otp_sessions (
  session_id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending'
);
```

**location_history** - Track user locations over time
```sql
CREATE TABLE location_history (
  location_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  nearest_hub_id INTEGER,
  distance_km REAL,
  accuracy_meters INTEGER,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);
```

---

## Frontend Implementation

### Login Page

Open [/static/login-mobile.html](login-mobile.html) for complete mobile-first login UI.

**Features:**
- Phone number input with Indian formatting
- 6-digit OTP input with individual boxes
- Auto-focus and keyboard navigation
- Real-time location detection
- Hub selection (manual or auto)
- Success screen with user details

### Integration in Existing Pages

Add to any HTML page:

```html
<!-- At the end of body, before closing tag -->
<script src="/static/loopify-auth-integration.js"></script>

<script>
  // Require login to access this page
  requireLogin();

  // Get current user
  const user = getCurrentUser();
  console.log('Logged in as:', user.name);

  // Get selected hub
  const hub = getSelectedHub();
  console.log('Nearest hub:', hub.hub_name);

  // Make authenticated API call
  authenticatedFetch('/api/users/' + user.user_id)
    .then(r => r.json())
    .then(data => console.log('User data:', data));
</script>
```

---

## Haversine Formula (Distance Calculation)

The distance between two coordinates is calculated using the Haversine formula:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
```

**Accuracy:** Accurate to within 0.5% for distances up to 100 km.

---

## OTP Rules & Security

| Rule | Value |
|------|-------|
| OTP Length | 6 digits |
| Expiry Time | 5 minutes |
| Max Attempts | 3 |
| Phone Format | 10 digits (Indian) |
| Session Duration | Unlimited (with manual logout) |
| Hash Algorithm | Plain text (MVP) → bcrypt (Production) |

**Security Notes for Production:**
- Hash OTP codes before storing in DB
- Implement rate limiting (3 OTP requests per hour)
- Use HTTPS for all endpoints
- Encrypt session tokens
- Implement JWT for stateless auth
- Add SMS verification via Twilio/AWS SNS

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request format and required fields |
| 401 | Unauthorized | Session expired, re-login required |
| 404 | Not Found | User/Hub doesn't exist |
| 500 | Server Error | Check server logs |

---

## Testing & Demo

### Using cURL

```bash
# 1. Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9876543210"}'

# Check console for OTP

# 2. Verify OTP (replace with actual OTP from console)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "9876543210", "otp_code": "123456"}'

# 3. Find nearest hub
curl "http://localhost:3000/api/location/nearest-hub?lat=28.6139&lng=77.2090"

# 4. Get nearby hubs
curl "http://localhost:3000/api/location/nearby-hubs?lat=28.6139&lng=77.2090&radius=10"
```

### Using Browser Console

```javascript
// Open http://localhost:3000/static/login-mobile.html

// In console:
loopifyAuth.isLoggedIn()
loopifyAuth.getCurrentUser()
loopifyAuth.getSelectedHub()
loopifyAuth.simulateLocation('delhi')
loopifyAuth.clearSession()
```

---

## Deployment Checklist

- [ ] Run database migrations
- [ ] Update hubs with real coordinates
- [ ] Configure SMS gateway (Twilio/AWS)
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Implement OTP hashing
- [ ] Add JWT tokens
- [ ] Set up monitoring
- [ ] Test on actual devices
- [ ] Deploy to production

---

## Support & Documentation

- **Live API**: http://localhost:3000/api/health
- **Login Page**: http://localhost:3000/static/login-mobile.html
- **Integration**: Include `loopify-auth-integration.js`
- **Database**: `loopify.db` (SQLite)

