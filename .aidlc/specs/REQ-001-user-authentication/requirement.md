---
id: REQ-001
title: "User Registration and Login"
status: complete
priority: high
effort: L
deployable: true
created: 2026-04-24
updated: 2026-04-28
---

## Description

Add user registration and login to AutoRisk AI so resume uploads and analysis jobs can be tracked per user.

This feature introduces:
- A user model and persistence layer
- `POST /register` and `POST /login` APIs
- Requiring `user_id` on upload/analyze requests so downstream storage/job tracking can be attributed to the user

## Acceptance Criteria

- [ ] `POST /register` accepts `email`, `password`, `confirm_password`, and optionally `name` (defaults to empty)
- [ ] `POST /register` returns 400 if `password` and `confirm_password` do not match
- [ ] `POST /register` returns 400 if email is invalid
- [ ] `POST /register` returns 409 if email already exists
- [ ] Passwords are never stored in plaintext; only a secure hash is stored
- [ ] User model includes: `user_id`, `user_name`, `email`, `password_hash`, `name` (optional, default empty)
- [ ] `POST /login` accepts `email` and `password`
- [ ] `POST /login` returns 401 for invalid credentials
- [ ] `POST /login` returns the authenticated user info including `user_id`
- [ ] `POST /upload` requires `user_id` as part of the request
- [ ] `POST /analyze` requires `user_id` as part of the request
- [ ] DynamoDB job records include `user_id`
- [ ] Report download is only allowed for the user that owns the job (403 otherwise)

## External Dependencies

- Password hashing: `passlib[bcrypt]` (or equivalent)
- User persistence store:
  - Prefer DynamoDB (consistent with existing job tracking), with a GSI on `email`

## Assumptions

- Email verification is not required for MVP.
- Password reset/forgot password is not required for MVP.
- Authentication mechanism (JWT/session) can be added later; for this requirement, the key deliverable is user creation + login validation and passing `user_id` into downstream flows.

## Risks

- Risk: insecure password storage. likelihood: low, impact: high, mitigation: enforce bcrypt hashing + code review.
- Risk: user_id spoofing if the API trusts caller-provided `user_id`. likelihood: medium, impact: high, mitigation: in a follow-up, derive `user_id` from auth token instead of accepting arbitrary ids.

## Questions

- [ ] Should `/upload` and `/analyze` accept `user_id` in form fields or headers?
- [ ] Do we need `user_name` separate from email, or should it be derived/optional?
- [ ] Should login return a token now (JWT) or just return user info for MVP?

## Out of Scope

- OAuth/SSO
- Email verification
- Password reset
- MFA
- RBAC/admin roles

## Success Metrics

- Users can register and then login with the same credentials.
- Upload/analyze requests can be attributed to a user via `user_id` in DynamoDB records.
- Users cannot download another user's report.
