---
id: TASK-001
title: "Create user schemas and password hashing utilities"
status: complete
parent: REQ-001
layer: backend
effort: S
created: 2026-04-27
updated: 2026-04-27
dependencies: []
---

## Description

Add Pydantic schemas for registration/login and implement password hashing + verification utilities.

## Files to Create/Modify

- `backend/app/core/security.py` — implement `hash_password` and `verify_password` using `passlib[bcrypt]`
- `backend/app/schemas/auth.py` — Pydantic request/response models for register/login
- `backend/app/schemas/__init__.py` (if present) — export models if the project uses re-exports
- `backend/pyproject.toml` or `backend/requirements.txt` — add `passlib[bcrypt]` dependency (whichever this repo uses)

## Acceptance Criteria

- [ ] Password hashing uses a strong one-way hash (bcrypt via passlib)
- [ ] Verification returns true only for matching password/hash
- [ ] Registration schema validates email format and confirm_password match (or exposes enough fields for route-level validation)

## Test Plan

- Unit: hashing produces different hashes for same password (salted); verify succeeds/fails correctly
- Integration: N/A (covered in route tasks)
- Edge cases: empty password rejected by schema/route; invalid email rejected

## Technical Notes

- Prefer `EmailStr` from Pydantic for email validation.
- Keep hashing logic out of route files to avoid duplication.
