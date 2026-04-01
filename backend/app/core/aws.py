import json
import aioboto3
from fastapi import UploadFile
from app.core.config import get_settings

settings = get_settings()

session = aioboto3.Session(
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region,
)


async def save_upload_to_s3(file_id: str, file: UploadFile, content: bytes, extracted_text: str) -> str:
    key = f"uploads/{file_id}/original/{file.filename}"
    async with session.client("s3") as s3:
        await s3.put_object(
            Bucket=settings.s3_uploads_bucket_name,
            Key=key,
            Body=content,
            ContentType=file.content_type,
        )

        await s3.put_object(
            Bucket=settings.s3_uploads_bucket_name,
            Key=f"uploads/{file_id}/extracted_text.txt",
            Body=extracted_text,
            ContentType="text/plain"
        )
    return key


async def save_report_to_s3(job_id: str, report: dict) -> str:
    key = f"reports/{job_id}.json"
    async with session.client("s3") as s3:
        await s3.put_object(
            Bucket=settings.s3_report_bucket_name,
            Key=key,
            Body=json.dumps(report),
            ContentType="application/json",
        )
    return key


async def get_report_from_s3(s3_key: str) -> dict:
    async with session.client("s3") as s3:
        response = await s3.get_object(
            Bucket=settings.s3_report_bucket_name,
            Key=s3_key,
        )
        content = await response["Body"].read()
        return json.loads(content)


async def create_job(job_id: str) -> None:
    async with session.resource("dynamodb") as dynamodb:
        table = await dynamodb.Table(settings.dynamodb_table_name)
        await table.put_item(Item={
            "job_id": job_id,
            "status": "processing",
        })


async def update_job(job_id: str, status: str, s3_key: str = "", error: str = "") -> None:
    async with session.resource("dynamodb") as dynamodb:
        table = await dynamodb.Table(settings.dynamodb_table_name)
        await table.update_item(
            Key={"job_id": job_id},
            UpdateExpression="SET #s = :s, s3_key = :k, #e = :e",
            ExpressionAttributeNames={
                "#s": "status",
                "#e": "error_message",
            },
            ExpressionAttributeValues={
                ":s": status,
                ":k": s3_key,
                ":e": error,
            },
        )


async def get_job(job_id: str) -> dict:
    async with session.resource("dynamodb") as dynamodb:
        table = await dynamodb.Table(settings.dynamodb_table_name)
        response = await table.get_item(Key={"job_id": job_id})
        return response.get("Item", {})
