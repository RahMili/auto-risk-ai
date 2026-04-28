---
id: TASK-003
title: "Implement POST /register endpoint"
status: complete
parent: REQ-001
layer: backend
effort: M
created: 2026-04-27
updated: 2026-04-27
dependencies: ["TASK-001","TASK-002"]
---

## Description

Add a `/register` route that validates inputs, hashes passwords, and creates a user record in DynamoDB.

## Files to Create/Modify

- `backend/app/api/routes/register.py` — new router and handler for `POST /register`
- `backend/app/main.py` — include the new router
- `backend/app/schemas/auth.py` — ensure request/response models cover register
- `backend/app/core/aws.py` — call `create_user` and `get_user_by_email`

## Acceptance Criteria

- [ ] Accepts `email`, `password`, `confirm_password`, optional `name` (default empty)
- [ ] Returns 400 if password and confirm_password mismatch
- [ ] Returns 400 if email invalid
- [ ] Returns 409 if email already exists
- [ ] Returns created user info including `user_id`

## Test Plan

- Unit: schema validation around email and confirm_password
- Integration: register a new email returns 200; registering same email returns 409
- Edge cases: blank name becomes empty string; mixed-case emails are handled consistently

## Technical Notes

- Use `uuid4` for `user_id`.
- Consider normalizing email to lowercase before storing/lookup.
