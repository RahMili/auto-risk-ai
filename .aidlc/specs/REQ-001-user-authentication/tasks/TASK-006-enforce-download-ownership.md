---
id: TASK-006
title: "Enforce report download ownership"
status: complete
parent: REQ-001
layer: backend
effort: S
created: 2026-04-27
updated: 2026-04-27
dependencies: ["TASK-005"]
---

## Description

Prevent users from downloading other users’ reports by enforcing ownership checks using `user_id` stored on the DynamoDB job record.

## Files to Create/Modify

- `backend/app/api/routes/download.py` — require `user_id` (query param or header) and check `job.user_id` matches; return 403 otherwise
- `backend/app/core/aws.py` — ensure `get_job` returns `user_id` and existing records tolerate missing field (if any)

## Acceptance Criteria

- [ ] Download requires `user_id`
- [ ] Returns 403 when `user_id` does not match job owner
- [ ] Returns 200 when `user_id` matches job owner and job is complete

## Test Plan

- Integration: create two users, create job for user A, downloading with user B returns 403
- Edge cases: job record missing user_id returns 403 (conservative default)

## Technical Notes

- Perform the ownership check immediately after fetching the job, before S3 access.
