---
id: LESSON-001
title: "MVP Identity via Caller-Provided user_id Works for Ownership Checks"
domain: Security
component: API/auth
tags: [authentication, authorization, mvp, user-identity]
frequency: occasional
source_pr: 15
---

## Summary

For MVP, requiring `user_id` as a form field/header from the caller (rather than deriving it from a signed token) is sufficient to implement ownership checks for downloads and job tracking, as long as the threat model assumes honest users or a trusted client.

## Context

REQ-001 needed to track jobs per user and prevent cross-user report downloads. Building a full JWT/session auth system would have delayed the feature. The team opted for an MVP approach where:
- Registration/login create and validate users
- Downstream APIs (`/upload`, `/analyze`, `/download`) require `user_id` from the caller
- DynamoDB job records store `user_id` for ownership enforcement

## What Happened

The MVP approach worked as intended:
- Users can register and login
- Upload/analyze requests include `user_id` and persist it to DynamoDB
- Download endpoint enforces ownership by comparing request `user_id` to job record

## Key Insight

The vulnerability (user_id spoofing) is acceptable for MVP/internal testing where:
1. Clients are trusted (official frontend/mobile app)
2. No public API exposure yet
3. The goal is validating the user-tracking flow, not preventing malicious actors

## Recommendation

Before public launch, replace caller-provided `user_id` with token-derived identity:
- Issue JWT on login with `user_id` in claims
- Validate JWT middleware on protected routes
- Extract `user_id` from token, not request body

## Related

- ADR-1 in `.aidlc/specs/REQ-001-user-authentication/architecture.md`
- Follow-up: REQ-002 (JWT authentication)
