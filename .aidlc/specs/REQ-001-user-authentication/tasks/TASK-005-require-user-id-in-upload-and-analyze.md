---
id: TASK-005
title: "Require user_id for /upload and /analyze and persist into jobs"
status: complete
parent: REQ-001
layer: backend
effort: M
created: 2026-04-27
updated: 2026-04-27
dependencies: ["TASK-002"]
---

## Description

Update existing endpoints to require `user_id` and ensure analysis jobs in DynamoDB store the owning user.

## Files to Create/Modify

- `backend/app/api/routes/upload.py` — require `user_id` form field; optionally namespace upload S3 keys
- `backend/app/api/routes/analyze.py` — require `user_id` form field; pass to pipeline
- `backend/app/agents/pipeline.py` — accept `user_id` and pass into `create_job`
- `backend/app/core/aws.py` — update `create_job` signature to accept `user_id` and persist it
- `backend/app/schemas/upload.py` (optional) — include `user_id` in response if needed by callers

## Acceptance Criteria

- [ ] `POST /upload` rejects missing `user_id` (FastAPI validation error; 422 by default)
- [ ] `POST /analyze` rejects missing `user_id` (FastAPI validation error; 422 by default)
- [ ] DynamoDB job records include `user_id`

## Test Plan

- Integration: analyze with user_id creates job record containing user_id
- Edge cases: invalid/empty user_id rejected

## Technical Notes

- For MVP, `user_id` is caller-provided; this will be replaced by token-derived identity later.
