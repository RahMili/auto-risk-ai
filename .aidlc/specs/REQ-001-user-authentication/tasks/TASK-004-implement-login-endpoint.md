---
id: TASK-004
title: "Implement POST /login endpoint"
status: complete
parent: REQ-001
layer: backend
effort: M
created: 2026-04-27
updated: 2026-04-27
dependencies: ["TASK-001","TASK-002"]
---

## Description

Add a `/login` route that validates user credentials by looking up the user by email and verifying the password hash.

## Files to Create/Modify

- `backend/app/api/routes/login.py` — new router and handler for `POST /login`
- `backend/app/main.py` — include the new router
- `backend/app/schemas/auth.py` — ensure request/response models cover login
- `backend/app/core/aws.py` — call `get_user_by_email`

## Acceptance Criteria

- [ ] Accepts `email` and `password`
- [ ] Returns 401 for invalid credentials
- [ ] Returns user info including `user_id` on success

## Test Plan

- Integration: login succeeds after register; wrong password returns 401; unknown email returns 401
- Edge cases: email casing normalization matches registration behavior

## Technical Notes

- Do not leak whether the email exists; use same 401 response for unknown email and wrong password.
