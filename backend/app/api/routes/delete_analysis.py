from pydantic import BaseModel

class DeleteResponse(BaseModel):
    detail: str = "Analysis deleted successfully."

router = APIRouter()


@router.delete("/analysis/{job_id}", status_code=200)
async def delete_job_endpoint(job_id: str, user_id: str = Query(...)) -> DeleteResponse:
    """Delete an analysis report and its metadata.

    Parameters:
    - **job_id** (str): Identifier of the analysis job.
    - **user_id** (str, query): ID of the requesting user; must match the job owner.

    Responses:
    - **200** – {"detail": "Analysis deleted successfully."}
    - **403** – Unauthorized (ownership mismatch).
    - **404** – Job not found.
    """
    # The service handles all checks and raises appropriate HTTPException.
    await delete_analysis(job_id, user_id)
    return DeleteResponse()
