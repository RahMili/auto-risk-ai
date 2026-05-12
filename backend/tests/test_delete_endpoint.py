import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from app.main import app

client = TestClient(app)

# Helper to simulate the service function behavior
async def mock_delete_success(job_id: str, user_id: str):
    return None

async def mock_delete_not_found(job_id: str, user_id: str):
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Job not found")

async def mock_delete_unauthorized(job_id: str, user_id: str):
    from fastapi import HTTPException
    raise HTTPException(status_code=403, detail="User not authorized to delete this job")

@pytest.fixture(autouse=True)
def patch_service(monkeypatch):
    # Default to success; individual tests will override as needed
    monkeypatch.setattr("app.services.analysis_deletion.delete_analysis", AsyncMock(side_effect=mock_delete_success))
    yield

def test_successful_delete(monkeypatch):
    response = client.delete("/analysis/job123", params={"user_id": "user123"})
    assert response.status_code == 200
    assert response.json() == {"detail": "Analysis deleted successfully."}

def test_unauthorized_delete(monkeypatch):
    # Override service to raise 403
    monkeypatch.setattr("app.services.analysis_deletion.delete_analysis", AsyncMock(side_effect=mock_delete_unauthorized))
    response = client.delete("/analysis/job123", params={"user_id": "wrong_user"})
    assert response.status_code == 403

def test_delete_nonexistent(monkeypatch):
    # Override service to raise 404
    monkeypatch.setattr("app.services.analysis_deletion.delete_analysis", AsyncMock(side_effect=mock_delete_not_found))
    response = client.delete("/analysis/nonexistent", params={"user_id": "user123"})
    assert response.status_code == 404
