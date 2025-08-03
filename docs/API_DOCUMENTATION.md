# API Documentation - Blood Pressure Monitoring Application

## Base URL
```
Development: http://localhost:5000
Production: https://your-app-domain.com
```

## Authentication
The API uses session-based authentication with active profile management. All endpoints that require profile data will use the currently active profile from the session.

## Response Format
All API responses follow a consistent JSON format:

### Success Response
```json
{
  "data": { ... },
  "status": "success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

## Profiles API

### Get All Profiles
Retrieve all user profiles in the system.

```http
GET /api/profiles
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "gender": "male",
    "age": 46,
    "medicalConditions": [],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Get Active Profile
Retrieve the currently active profile.

```http
GET /api/profiles/active
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "gender": "male",
  "age": 46,
  "medicalConditions": [],
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - No active profile set

### Create Profile
Create a new user profile.

```http
POST /api/profiles
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "gender": "female",
  "age": 35,
  "medicalConditions": ["Diabetes", "Hypertension"]
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `gender`: Required, must be "male" or "female"
- `age`: Required, integer between 1-150
- `medicalConditions`: Optional array of strings

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Jane Smith",
  "gender": "female",
  "age": 35,
  "medicalConditions": ["Diabetes", "Hypertension"],
  "isActive": false,
  "createdAt": "2024-01-15T10:35:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid profile data

### Activate Profile
Set a profile as the active profile for the session.

```http
POST /api/profiles/{profileId}/activate
```

**Response:**
```json
{
  "message": "Profile activated successfully"
}
```

**Error Responses:**
- `404 Not Found` - Profile not found

## Blood Pressure Readings API

### Get Readings
Retrieve blood pressure readings for the active profile.

```http
GET /api/readings
```

**Query Parameters:**
- `startDate` (optional): ISO 8601 date string for filtering start date
- `endDate` (optional): ISO 8601 date string for filtering end date

**Examples:**
```http
GET /api/readings
GET /api/readings?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "profileId": "550e8400-e29b-41d4-a716-446655440000",
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72,
    "readingDate": "2024-01-15T08:30:00.000Z",
    "classification": "Normal",
    "pulseStressure": 40,
    "meanArterialPressure": 93,
    "createdAt": "2024-01-15T08:30:00.000Z"
  }
]
```

**Error Responses:**
- `404 Not Found` - No active profile found

### Create Reading
Add a new blood pressure reading for the active profile.

```http
POST /api/readings
Content-Type: application/json
```

**Request Body:**
```json
{
  "systolic": 125,
  "diastolic": 82,
  "pulse": 75,
  "readingDate": "2024-01-15T14:30:00.000Z"
}
```

**Validation Rules:**
- `systolic`: Required, integer between 70-250
- `diastolic`: Required, integer between 40-150
- `pulse`: Required, integer between 40-200
- `readingDate`: Required, valid ISO 8601 datetime string

**Response:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "profileId": "550e8400-e29b-41d4-a716-446655440000",
  "systolic": 125,
  "diastolic": 82,
  "pulse": 75,
  "readingDate": "2024-01-15T14:30:00.000Z",
  "classification": "Normal",
  "pulseStressure": 43,
  "meanArterialPressure": 96,
  "createdAt": "2024-01-15T14:30:00.000Z"
}
```

**Automatic Calculations:**
- `classification`: Determined by ACC/AHA 2017 guidelines
- `pulseStressure`: Calculated as `systolic - diastolic`
- `meanArterialPressure`: Calculated as `diastolic + (pulseStressure / 3)`

**Error Responses:**
- `400 Bad Request` - Invalid reading data
- `404 Not Found` - No active profile found

### Delete Reading
Remove a blood pressure reading.

```http
DELETE /api/readings/{readingId}
```

**Response:**
```json
{
  "message": "Reading deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - Reading not found

## Statistics API

### Get Statistics
Retrieve aggregated statistics for the active profile.

```http
GET /api/statistics
```

**Query Parameters:**
- `days` (optional): Number of days to include in statistics (default: 30)

**Examples:**
```http
GET /api/statistics
GET /api/statistics?days=60
GET /api/statistics?days=90
```

**Response:**
```json
{
  "totalReadings": 25,
  "averages": {
    "systolic": 125,
    "diastolic": 82,
    "pulse": 74,
    "pulseStressure": 43,
    "meanArterialPressure": 96
  },
  "ranges": {
    "systolic": {
      "min": 110,
      "max": 140
    },
    "diastolic": {
      "min": 70,
      "max": 95
    },
    "pulse": {
      "min": 65,
      "max": 85
    }
  },
  "distribution": {
    "Normal": 15,
    "Elevated": 5,
    "Hypertension Stage 1": 4,
    "Hypertension Stage 2": 1,
    "Hypertensive Crisis": 0
  },
  "period": {
    "startDate": "2023-12-16T00:00:00.000Z",
    "endDate": "2024-01-15T23:59:59.999Z",
    "days": 30
  }
}
```

**Error Responses:**
- `404 Not Found` - No active profile found

## Reminders API

### Get Reminders
Retrieve all reminders for the active profile.

```http
GET /api/reminders
```

**Response:**
```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "profileId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Take blood pressure",
    "time": "08:00",
    "isRepeating": true,
    "daysOfWeek": ["monday", "wednesday", "friday"],
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

### Create Reminder
Add a new reminder for the active profile.

```http
POST /api/reminders
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Evening blood pressure check",
  "time": "19:00",
  "isRepeating": true,
  "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"]
}
```

**Validation Rules:**
- `title`: Required, non-empty string
- `time`: Required, time in HH:MM format (24-hour)
- `isRepeating`: Optional, boolean (default: false)
- `daysOfWeek`: Optional, array of day names (lowercase)

**Valid Day Names:**
- monday, tuesday, wednesday, thursday, friday, saturday, sunday

**Response:**
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440005",
  "profileId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Evening blood pressure check",
  "time": "19:00",
  "isRepeating": true,
  "daysOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "isActive": true,
  "createdAt": "2024-01-15T19:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid reminder data
- `404 Not Found` - No active profile found

## Blood Pressure Classification

The API automatically classifies blood pressure readings according to ACC/AHA 2017 guidelines:

| Classification | Systolic (mmHg) | Diastolic (mmHg) |
|---------------|----------------|------------------|
| Normal | < 120 | AND < 80 |
| Elevated | 120-129 | AND < 80 |
| Hypertension Stage 1 | 130-139 | OR 80-89 |
| Hypertension Stage 2 | ≥ 140 | OR ≥ 90 |
| Hypertensive Crisis | > 180 | OR > 120 |

## Error Codes

### HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Validation Errors
When validation fails, the response includes detailed error information:

```json
{
  "message": "Invalid profile data",
  "errors": [
    {
      "field": "age",
      "message": "Expected number, received string"
    }
  ]
}
```

## Rate Limiting
Currently no rate limiting is implemented. In production, consider implementing:
- 100 requests per minute per IP
- 1000 requests per hour per session

## CORS Policy
Development: All origins allowed
Production: Specific domain whitelist

## Example Usage

### JavaScript/Fetch
```javascript
// Get all readings
const response = await fetch('/api/readings');
const readings = await response.json();

// Create new reading
const newReading = {
  systolic: 125,
  diastolic: 82,
  pulse: 75,
  readingDate: new Date().toISOString()
};

const response = await fetch('/api/readings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newReading)
});

const createdReading = await response.json();
```

### cURL Examples
```bash
# Get statistics for last 60 days
curl -X GET "http://localhost:5000/api/statistics?days=60"

# Create new profile
curl -X POST "http://localhost:5000/api/profiles" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "gender": "female",
    "age": 42,
    "medicalConditions": ["Diabetes"]
  }'

# Add blood pressure reading
curl -X POST "http://localhost:5000/api/readings" \
  -H "Content-Type: application/json" \
  -d '{
    "systolic": 130,
    "diastolic": 85,
    "pulse": 78,
    "readingDate": "2024-01-15T08:30:00.000Z"
  }'
```

## Data Export
The application provides client-side export functionality for medical reports:
- **PDF Export**: Medical-grade reports with patient information and classification charts
- **CSV Export**: Raw data suitable for clinical analysis systems

These exports are generated client-side and do not require API endpoints.