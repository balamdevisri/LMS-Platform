# API Documentation

## Overview
The SHAIVIKA LMS AI Platform exposes a RESTful API to manage the platform's resources. In the future, this API will be supplemented with GraphQL for more complex querying capabilities, especially regarding learning paths and analytics.

## Base URL
`/api/v1`

## Authentication
All protected endpoints require a Bearer token in the `Authorization` header.
```
Authorization: Bearer <your_jwt_token>
```

## Initial Endpoints (Planned)

### Users
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Authenticate a user and return a JWT
- `GET /api/v1/users/me` - Get current user profile

### Courses
- `GET /api/v1/courses` - List all available courses (e.g., Linux, Git/GitHub)
- `GET /api/v1/courses/:id` - Get course details
- `POST /api/v1/courses/:id/enroll` - Enroll the current user in a course

### Modules & Content
- `GET /api/v1/courses/:id/modules` - Get modules for a course
- `GET /api/v1/modules/:id/content` - Get markdown content for a module

### AI Services
- `POST /api/v1/ai/chat` - Interact with the AI tutor regarding a specific course context
- `POST /api/v1/ai/assess` - Submit an answer for AI evaluation and feedback

## Error Handling
The API uses standard HTTP status codes and returns a consistent JSON error format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided.",
    "details": {
      "field": "email",
      "issue": "must be a valid email address"
    }
  }
}
```
