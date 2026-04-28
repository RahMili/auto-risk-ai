---
req: REQ-001
status: complete
created: 2026-04-27
updated: 2026-04-28
---

## Overview

Implement minimal user registration and login backed by DynamoDB, with bcrypt password hashing. Requests to `/upload`, `/analyze`, and `/download/{job_id}` will require a caller-supplied `user_id` for MVP, and DynamoDB job records will persist `user_id` so downloads can enforce ownership.

This matches current patterns (FastAPI routes for HTTP boundary, `app/core/aws.py` for AWS persistence helpers) and delivers the requested “track jobs per user” without introducing a full auth token mechanism yet.

## System Context

Layers touched: backend | database | infra

- Backend: add new routes `register.py` and `login.py`, plus schemas and password hashing utilities.
- Database: extend DynamoDB usage with a Users table (or new item type) plus a GSI on `email`.
- Infra: requires DynamoDB table provisioning (and GSI) via existing deployment mechanism.

## Data Model Changes

| Entity | Change | Notes |
|--------|--------|-------|
| DynamoDB Users | New | Partition key `user_id`; GSI on `email` for lookup + uniqueness enforcement |
| DynamoDB Jobs | Modified | Add `user_id` attribute to job records for ownership enforcement |

## API Changes

| Method | Path | Description | Identity Required |
|--------|------|-------------|------------------|
| POST | /register | Create user with hashed password; enforce unique email | No (MVP) |
| POST | /login | Validate credentials and return user info incl. `user_id` | No (MVP) |
| POST | /upload | Add required `user_id` form field | No (MVP; user_id required) |
| POST | /analyze | Add required `user_id` form field and persist into job record | No (MVP; user_id required) |
| GET | /download/{job_id} | Add required `user_id` query param; enforce job ownership (403) | No (MVP; user_id required) |

## Service Layer

- `app/core/aws.py`
  - Add Users table helpers:
    - `get_user_by_email(email)` (via GSI)
    - `create_user(user)` (PutItem)
    - `get_user(user_id)`
  - Extend `create_job(job_id, user_id)` to store `user_id`.

- `app/core/security.py` (new)
  - `hash_password(password) -> str`
  - `verify_password(password, password_hash) -> bool`

## Key Decisions (ADRs)

### ADR-1: MVP identity via required `user_id` (no token yet)
- **Context**: Requirement explicitly allows deferring JWT/session; existing API has no auth middleware.
- **Decision**: Require `user_id` in requests for upload/analyze/download, and enforce download ownership by comparing request `user_id` to job record `user_id`.
- **Rationale**: Lowest-change approach that satisfies “track per user” and blocks cross-user downloads.
- **Consequences**: Susceptible to `user_id` spoofing; follow-up should derive identity from a signed token.

### ADR-2: DynamoDB Users table with GSI on email
- **Context**: Requirement prefers DynamoDB with GSI on email.
- **Decision**: Store users with PK `user_id` and a GSI (`email` as partition key) to enforce uniqueness and support login.
- **Rationale**: Aligns with current AWS usage and avoids adding a relational DB.
- **Consequences**: Must handle GSI consistency/uniqueness carefully (conditional writes + check by email).

### ADR-3: Password hashing using bcrypt via passlib
- **Context**: Passwords must not be stored in plaintext.
- **Decision**: Use `passlib[bcrypt]` for hashing and verification.
- **Rationale**: Standard, well-reviewed library; simple integration.
- **Consequences**: Adds dependency; ensure bcrypt settings are adequate and hashes are treated as secrets.

## Open Questions

- [ ] Should `user_name` be a separate unique username or can it be omitted for MVP? (owner: @ramili, due: 2026-04-29)
- [ ] For `/download/{job_id}`, should `user_id` be required as query param or header for consistency? (owner: @ramili, due: 2026-04-29)
- [ ] Should we namespace S3 keys by `user_id` as defense-in-depth (e.g., `reports/{user_id}/{job_id}.json`)? (owner: @ramili, due: 2026-05-02)
