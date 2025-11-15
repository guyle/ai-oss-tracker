# API Design

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Optional: Add Bearer token authentication for admin endpoints.

## Endpoints

### Projects

#### GET /projects
List all tracked projects with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50, max: 100)
- `language` (string, optional) - Filter by programming language
- `topics` (string[], optional) - Filter by topics
- `sortBy` (string: 'stars' | 'velocity' | 'created', default: 'stars')
- `order` (string: 'asc' | 'desc', default: 'desc')

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "fullName": "openai/gpt-4",
      "name": "gpt-4",
      "description": "GPT-4 model implementation",
      "language": "Python",
      "stars": 45230,
      "forks": 3421,
      "starsVelocity": 125.5,
      "starsGained7d": 876,
      "topics": ["ai", "gpt", "llm"],
      "url": "https://github.com/openai/gpt-4",
      "lastUpdated": "2025-11-15T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

#### GET /projects/:id
Get detailed information about a specific project.

**Response:**
```json
{
  "id": 1,
  "fullName": "openai/gpt-4",
  "name": "gpt-4",
  "description": "GPT-4 model implementation",
  "language": "Python",
  "homepage": "https://openai.com",
  "license": "MIT",
  "topics": ["ai", "gpt", "llm"],
  "isArchived": false,
  "createdAt": "2023-03-14T00:00:00Z",
  "firstTrackedAt": "2025-11-01T00:00:00Z",
  "currentMetrics": {
    "stars": 45230,
    "forks": 3421,
    "watchers": 1234,
    "openIssues": 45,
    "starsVelocity": 125.5,
    "starsGained24h": 125,
    "starsGained7d": 876
  },
  "url": "https://github.com/openai/gpt-4"
}
```

#### GET /projects/:id/history
Get historical metrics for a project.

**Query Parameters:**
- `from` (ISO date, optional)
- `to` (ISO date, optional)
- `interval` (string: 'hour' | 'day' | 'week', default: 'day')

**Response:**
```json
{
  "projectId": 1,
  "fullName": "openai/gpt-4",
  "history": [
    {
      "recordedAt": "2025-11-15T00:00:00Z",
      "stars": 45230,
      "forks": 3421,
      "watchers": 1234,
      "starsGained": 125
    },
    {
      "recordedAt": "2025-11-14T00:00:00Z",
      "stars": 45105,
      "forks": 3418,
      "watchers": 1231,
      "starsGained": 98
    }
  ]
}
```

### Trending

#### GET /trending
Get current trending projects from latest snapshot.

**Query Parameters:**
- `language` (string, optional)
- `timeRange` (string: 'daily' | 'weekly' | 'monthly', default: 'daily')
- `limit` (number, default: 25)

**Response:**
```json
{
  "date": "2025-11-15",
  "timeRange": "daily",
  "language": null,
  "projects": [
    {
      "rank": 1,
      "project": {
        "id": 1,
        "fullName": "openai/gpt-4",
        "stars": 45230,
        "starsGained7d": 876
      }
    }
  ]
}
```

### Analytics

#### GET /analytics/top-gainers
Projects with highest star velocity in specified period.

**Query Parameters:**
- `period` (string: '24h' | '7d' | '30d', default: '7d')
- `limit` (number, default: 10)
- `language` (string, optional)

**Response:**
```json
{
  "period": "7d",
  "projects": [
    {
      "id": 1,
      "fullName": "openai/gpt-4",
      "starsGained": 876,
      "velocity": 125.1,
      "currentStars": 45230
    }
  ]
}
```

#### GET /analytics/topics
Trending topics in AI projects.

**Response:**
```json
{
  "topics": [
    {
      "name": "llm",
      "projectCount": 145,
      "totalStars": 234567,
      "averageVelocity": 45.2
    },
    {
      "name": "machine-learning",
      "projectCount": 298,
      "totalStars": 567890,
      "averageVelocity": 38.7
    }
  ]
}
```

#### GET /analytics/languages
Language statistics for tracked AI projects.

**Response:**
```json
{
  "languages": [
    {
      "name": "Python",
      "projectCount": 678,
      "totalStars": 1234567,
      "averageStars": 1821
    }
  ]
}
```

### Admin

#### POST /admin/sync
Manually trigger a sync job.

**Body:**
```json
{
  "type": "trending" | "metrics" | "full"
}
```

**Response:**
```json
{
  "jobId": "abc123",
  "status": "started",
  "message": "Sync job initiated"
}
```

#### GET /admin/stats
Get system statistics and health.

**Response:**
```json
{
  "totalProjects": 1547,
  "totalMetrics": 234567,
  "lastSync": "2025-11-15T08:00:00Z",
  "apiQuota": {
    "remaining": 4523,
    "limit": 5000,
    "resetAt": "2025-11-15T09:00:00Z"
  },
  "health": {
    "database": "healthy",
    "github": "healthy"
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid parameter: limit must be between 1 and 100",
    "details": {}
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Invalid request parameters
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
