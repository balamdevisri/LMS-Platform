# Database Architecture

## Overview
The SHAIVIKA LMS AI Platform utilizes a robust relational database for structured data management, supplemented by caching layers and document storage where necessary for AI capabilities and unstructured markdown content.

## Primary Database
- **Engine**: PostgreSQL (Planned)
- **ORM**: Prisma or TypeORM
- **Why PostgreSQL**: Excellent support for complex relational data (users, enrollments, progress) and robust JSONB support for flexible metadata (e.g., AI chat logs, assessment contexts).

## Caching Layer
- **Engine**: Redis
- **Usage**:
  - Session management and rate limiting.
  - Caching frequently accessed course metadata.
  - Temporary storage for AI processing queues.

## Key Entities & Relationships

### Users
- `id` (UUID)
- `email` (String, Unique)
- `passwordHash` (String)
- `role` (Enum: STUDENT, INSTRUCTOR, ADMIN)
- `createdAt` (Timestamp)

### Courses
- `id` (UUID)
- `title` (String)
- `description` (Text)
- `category` (Enum: LINUX, GIT, etc.)
- `difficulty` (Enum: BEGINNER, INTERMEDIATE, ADVANCED)

### Enrollments
- `userId` (UUID, Foreign Key)
- `courseId` (UUID, Foreign Key)
- `progress` (Integer, Percentage)
- `enrolledAt` (Timestamp)

### Progress Tracking
- `userId` (UUID, Foreign Key)
- `moduleId` (UUID, Foreign Key)
- `status` (Enum: NOT_STARTED, IN_PROGRESS, COMPLETED)
- `score` (Float, Optional, for graded modules)

## Migrations Strategy
Database migrations will be handled automatically via the chosen ORM's migration tool, version-controlled alongside the application code in the `backend/prisma/migrations` or similar directory.
