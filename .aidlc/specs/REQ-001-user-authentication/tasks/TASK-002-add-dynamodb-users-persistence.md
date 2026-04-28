---
id: TASK-002
title: "Add DynamoDB users persistence (create + lookup by email)"
status: complete
parent: REQ-001
layer: backend
effort: M
created: 2026-04-27
updated: 2026-04-27
dependencies: ["TASK-001"]
---

## Description

Extend the AWS integration layer to persist users in DynamoDB and support login lookup by email via a GSI.

## Files to Create/Modify

- `backend/app/core/aws.py` — add:
  - `create_user(user_id, email, password_hash, user_name, name)` (PutItem with conditional write as appropriate)
  - `get_user(user_id)`
  - `get_user_by_email(email)` (Query against GSI)
- `backend/app/core/config.py` — add users table name + GSI name settings (if not already present)

## Acceptance Criteria

- [ ] Users can be created with required fields and stored in DynamoDB
- [ ] Lookup by email returns the correct user record
- [ ] Email uniqueness is enforced (either via conditional write strategy or pre-check + safe handling)

## Test Plan

- Unit: if AWS layer is pure functions, minimal unit tests for key formation and request parameters
- Integration: exercise create + lookup against a real or local DynamoDB (if available)
- Edge cases: duplicate email results in a clear error path for the route to map to 409

## Technical Notes

- GSI design (recommended): GSI partition key `email`.
- Uniqueness in DynamoDB is non-trivial with GSIs.
  - MVP approach: do `get_user_by_email(email)` pre-check; if found, return a duplicate-email error for the route to map to 409.
  - Best-effort race handling: make `create_user` use a conditional write on PK (`attribute_not_exists(user_id)`) and treat a concurrent duplicate-email registration as a rare edge case to be addressed later with an email-lock pattern.
