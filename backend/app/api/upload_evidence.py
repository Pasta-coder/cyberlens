import hashlib, os, uuid
from fastapi import APIRouter, UploadFile, File
from app.services.chainlog import chain_log

router = APIRouter()

UPLOAD_DIR = "app/data/uploads"

def sha256_file(file_path):
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha.update(chunk)
    return sha.hexdigest()

@router.post("/upload-evidence")
async def upload_evidence(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    new_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, new_name)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    file_hash = sha256_file(file_path)

    chain_log(
        action="UPLOAD_EVIDENCE",
        actor="system",
        target=new_name,
        sha256=file_hash,
        meta={"original_name": file.filename}
    )

    return {
        "file_id": new_name,
        "filename": file.filename,
        "sha256": file_hash,
        "stored_at": file_path
    }
