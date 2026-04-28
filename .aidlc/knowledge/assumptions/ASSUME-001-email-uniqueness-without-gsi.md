---
id: ASSUME-001
title: "Email Uniqueness Can Be Enforced Without DynamoDB GSI for MVP"
domain: Database
component: Database/users
tags: [dynamodb, uniqueness, email, mvp]
frequency: rare
source_pr: 15
status: validated
---

## Assumption

Email uniqueness can be enforced at the application layer via pre-check + conditional write, without requiring a DynamoDB GSI or email-lock pattern, for low-concurrency MVP.

## Validation

The implementation uses:
1. `get_user_by_email(email)` pre-check before creating user
2. Conditional write on PK (`attribute_not_exists(user_id)`) as a safety net

This approach was validated for MVP because:
- Race conditions (two simultaneous registrations of same email) are rare
- The conditional write prevents duplicate PK creation
- GSI eventual consistency could cause false negatives anyway

## Outcome

**Validated** — The MVP approach works for the expected load. The rare race condition is documented as a known edge case to address with an email-lock pattern if/when concurrency increases.

## Follow-up

If duplicate registrations occur in production, implement email-lock pattern:
- Create a lock item with email as PK before user creation
- Use transactional writes to ensure atomicity
