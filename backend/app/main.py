from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings, Settings
from app.api.routes import health, upload, analyze, download 
from app.core.logging import setup_logging
setup_logging()


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",         # local dev
        f"http://{settings.ec2_public_ip}",     # production
    ],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(upload.router, tags=["Upload"])
app.include_router(analyze.router, tags=["Analysis"])
app.include_router(download.router, tags=['Download'])
