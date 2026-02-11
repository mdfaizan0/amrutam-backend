# Amrutam Telemedicine Backend

A production-grade, scalable, and secure backend system for the Amrutam Telemedicine platform. Designed to handle high-concurrency bookings and complex consultation lifecycles.

## Key Features
- **Scalable Booking Engine**: Prevents double bookings using Redis Distributed Locking + SQL Transactions.
- **Advanced Search**: Filter doctors by specialization, fee range, and name with multi-layer caching.
- **Compliance Ready**: Built-in Audit Logging with Table Partitioning for high-volume logs.
- **Reliable Workflows**: Background jobs for notifications and heavy tasks using BullMQ with automatic retries.
- **Security First**: Rate limiting, RBAC, JWT Auth, and Idempotency safeguards.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Relational Data), Redis (Cache/Locking/Queues)
- **Tooling**: Docker, BullMQ, Winston (Structured Logging), Zod (Validation)

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 24+ (for local development)

### Quick Start (Docker)
1. Clone the repository.
2. Create your `.env` from `.env.example`.
3. Run the entire stack:
   ```bash
   docker-compose up --build
   ```
   The API will be available at `http://localhost:3000`.

### API Documentation
The API follows RESTful standards. Major endpoints include:
- `POST /api/v1/auth/register` - User/Doctor Registration
- `GET /api/v1/doctors/search` - Advanced search with filters
- `POST /api/v1/appointments/book` - High-reliability booking
- `GET /api/v1/admin/stats` - Administrative insights

## Documentation
- [Architecture Overview](ARCHITECTURE.md) - Design patterns and deep dives.
- [Security Audit](SECURITY.md) - Security posture and MFA roadmap.

## Project Structure
```text
src/
├── common/          # Shared middlewares, utils, and configs
├── modules/         # Domain-driven modules (Auth, Doctors, Appointments, etc.)
├── config/          # Database, Redis, and Queue setup
├── app.ts           # Express application initialization
└── server.ts        # Entry point and server lifecycle
```

---

Thank You 💚