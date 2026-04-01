from pydantic import BaseModel


class UploadResponse(BaseModel):
    filename: str
    content_type: str
    extracted_text: str
    char_count: int
    message: str
    s3_key: str
    