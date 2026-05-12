import logging
import asyncio
from fastapi import HTTPException
from app.core.aws import get_job, settings, session

logger = logging.getLogger(__name__)
MAX_RETRIES = 3



async def delete_analysis(job_id: str, user_id: str) -> None:
    """Delete an analysis report and its metadata.

    Steps:
    1. Retrieve the job record.
    2. Verify the requesting user owns the job.
    3. Delete the JSON report from S3.
    4. Delete the DynamoDB item.
    5. Raise HTTPException on errors.
    """
    # 1. Retrieve job
    job = await get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Verify ownership
    from app.services.ownership import verify_ownership
    await verify_ownership(job, user_id)

    # 3. Delete report from S3
    s3_key = f"reports/{job_id}.json"
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with session.client("s3") as s3:
                await s3.delete_object(Bucket=settings.s3_report_bucket_name, Key=s3_key)
            break
        except Exception as exc:
            logger.error("S3 delete attempt %d failed: %s", attempt, exc)
            if attempt == MAX_RETRIES:
                raise HTTPException(status_code=500, detail="Failed to delete report from S3")
            await asyncio.sleep(0.2)
                # Log successful DynamoDB deletion
                logger.info("Deleted DynamoDB job record for job %s", job_id)
    # Log successful S3 deletion
    logger.info("Deleted S3 report %s for job %s", s3_key, job_id)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with session.resource("dynamodb") as dynamodb:
                table = await dynamodb.Table(settings.dynamodb_table_name)
                await table.delete_item(Key={"job_id": job_id})
            break
        except Exception as exc:
            logger.error("DynamoDB delete attempt %d failed: %s", attempt, exc)
            if attempt == MAX_RETRIES:
                raise HTTPException(status_code=500, detail="Failed to delete job from DynamoDB")
            await asyncio.sleep(0.2)
                # Log successful DynamoDB deletion
                logger.info("Deleted DynamoDB job record for job %s", job_id)

