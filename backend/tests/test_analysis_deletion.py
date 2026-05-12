import pytest
import asyncio
from unittest.mock import AsyncMock, patch

from app.services.analysis_deletion import delete_analysis
from fastapi import HTTPException

# Helper to create a fake job dict

def make_job(user_id: str = "user123"):
    return {"job_id": "job123", "user_id": user_id}

@pytest.mark.asyncio
async def test_successful_deletion(monkeypatch):
    # Mock get_job to return a job
    monkeypatch.setattr("app.core.aws.get_job", AsyncMock(return_value=make_job()))

    # Mock session client for S3 delete
    mock_s3 = AsyncMock()
    mock_s3.__aenter__.return_value = mock_s3
    mock_s3.delete_object = AsyncMock()
    # Mock session resource for DynamoDB delete
    mock_dynamo = AsyncMock()
    mock_dynamo.__aenter__.return_value = mock_dynamo
    mock_table = AsyncMock()
    mock_table.delete_item = AsyncMock()
    mock_dynamo.Table = AsyncMock(return_value=mock_table)
    # Patch session attributes
    monkeypatch.setattr("app.core.aws.session.client", lambda *args, **kwargs: mock_s3)
    monkeypatch.setattr("app.core.aws.session.resource", lambda *args, **kwargs: mock_dynamo)

    # Call service – should not raise
    await delete_analysis("job123", "user123")
    # Verify mocks were called
    mock_s3.delete_object.assert_awaited_once()
    mock_table.delete_item.assert_awaited_once()

@pytest.mark.asyncio
async def test_job_not_found(monkeypatch):
    monkeypatch.setattr("app.core.aws.get_job", AsyncMock(return_value=None))
    with pytest.raises(HTTPException) as exc:
        await delete_analysis("job123", "user123")
    assert exc.value.status_code == 404

@pytest.mark.asyncio
async def test_user_mismatch(monkeypatch):
    monkeypatch.setattr("app.core.aws.get_job", AsyncMock(return_value=make_job(user_id="other")))
    with pytest.raises(HTTPException) as exc:
        await delete_analysis("job123", "user123")
    assert exc.value.status_code == 403

@pytest.mark.asyncio
async def test_s3_error_propagates(monkeypatch):
    monkeypatch.setattr("app.core.aws.get_job", AsyncMock(return_value=make_job()))
    mock_s3 = AsyncMock()
    mock_s3.__aenter__.return_value = mock_s3
    mock_s3.delete_object = AsyncMock(side_effect=Exception("S3 fail"))
    mock_dynamo = AsyncMock()
    mock_dynamo.__aenter__.return_value = mock_dynamo
    mock_table = AsyncMock()
    mock_table.delete_item = AsyncMock()
    mock_dynamo.Table = AsyncMock(return_value=mock_table)
    monkeypatch.setattr("app.core.aws.session.client", lambda *args, **kwargs: mock_s3)
    monkeypatch.setattr("app.core.aws.session.resource", lambda *args, **kwargs: mock_dynamo)
    with pytest.raises(HTTPException) as exc:
        await delete_analysis("job123", "user123")
    assert exc.value.status_code == 500

@pytest.mark.asyncio
async def test_dynamodb_error_propagates(monkeypatch):
    monkeypatch.setattr("app.core.aws.get_job", AsyncMock(return_value=make_job()))
    mock_s3 = AsyncMock()
    mock_s3.__aenter__.return_value = mock_s3
    mock_s3.delete_object = AsyncMock()
    mock_dynamo = AsyncMock()
    mock_dynamo.__aenter__.return_value = mock_dynamo
    mock_table = AsyncMock()
    mock_table.delete_item = AsyncMock(side_effect=Exception("Dynamo fail"))
    mock_dynamo.Table = AsyncMock(return_value=mock_table)
    monkeypatch.setattr("app.core.aws.session.client", lambda *args, **kwargs: mock_s3)
    monkeypatch.setattr("app.core.aws.session.resource", lambda *args, **kwargs: mock_dynamo)
    with pytest.raises(HTTPException) as exc:
        await delete_analysis("job123", "user123")
    assert exc.value.status_code == 500
