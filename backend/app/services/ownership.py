from fastapi import HTTPException

async def verify_ownership(job: dict, user_id: str) -> None:
    """Raise HTTPException 403 if the job is not owned by the user.

    Args:
        job: The job record dictionary.
        user_id: ID of the requesting user.
    """
    if not job.get("user_id") or job.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Access denied: you do not own this report.")
