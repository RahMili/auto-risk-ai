import io
import uuid
import PyPDF2
import docx
from fastapi import APIRouter, HTTPException, File, UploadFile
from app.schemas.upload import UploadResponse
from app.core.aws import save_upload_to_s3

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}
MAX_FILE_SIZE = 5 * 1024 * 1024


def extract_text_from_pdf(content: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(content))
    return "\n".join(page.extract_text() for page in reader.pages if page.extract_text())

def extract_text_from_docx(content: bytes) -> str:
    doc = docx.Document(io.BytesIO(content))
    return "\n".join(para.text for para in doc.paragraphs if para.text.strip())

def extract_text_from_txt(content: bytes) -> str:
    return content.decode("utf-8", errors="ignore")

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file.content_type}. Upload a PDF, DOCX, or TXT file.",
        )
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Max size allowed is 5MB."
        )
    
    if file.content_type == "application/pdf":
        text = extract_text_from_pdf(content=content)
    elif file.content_type == "text/plain":
        text = extract_text_from_txt(content=content)
    else:
        text = extract_text_from_docx(content=content)

    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract any text from the file.")

    
    file_id = str(uuid.uuid4())
    key = await save_upload_to_s3(file_id=file_id, file=file, content=content, extracted_text=text)

    return UploadResponse(
        filename=file.filename,
        content_type=file.content_type,
        extracted_text=text,
        char_count=len(text),
        message="File parsed successfully.",
        s3_key=key
    )