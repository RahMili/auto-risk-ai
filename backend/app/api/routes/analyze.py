from fastapi import APIRouter, Form
from fastapi.responses import StreamingResponse
from app.agents.pipeline import run_pipeline

router = APIRouter()



@router.post("/analyze")
async def analyze(
    text: str = Form(...),
    user_id: str = Form(...),
    roast_mode: bool = Form(False),
):
    return StreamingResponse(
        run_pipeline(text, user_id, roast_mode),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
