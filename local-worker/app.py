from pathlib import Path
from uuid import uuid4
import os
import shutil
import subprocess

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi import Request

BASE = Path(__file__).resolve().parent
INBOX = BASE / "data" / "inbox"
OUTBOX = BASE / "data" / "outbox"
INBOX.mkdir(parents=True, exist_ok=True)
OUTBOX.mkdir(parents=True, exist_ok=True)
MAX_BYTES = 500 * 1024 * 1024
FORMATS = {"9:16": "crop=ih*9/16:ih", "1:1": "crop=min(iw\\,ih):min(iw\\,ih)", "16:9": "crop=iw:iw*9/16", "original": None}

app = FastAPI(title="KREA VIDEO ENGINE Local Worker", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

def ffmpeg_path():
    return shutil.which("ffmpeg")

@app.get("/health")
def health():
    return {"ok": True, "ffmpeg": bool(ffmpeg_path()), "mode": "local"}

@app.post("/api/render")
async def render(file: UploadFile = File(...), format: str = Form("9:16")):
    if not ffmpeg_path():
        raise HTTPException(status_code=503, detail="FFmpeg n'est pas installé ou absent du PATH Windows.")
    if format not in FORMATS:
        raise HTTPException(status_code=400, detail="Format non pris en charge.")
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".mp4", ".mov", ".webm"}:
        raise HTTPException(status_code=415, detail="Utilisez un fichier MP4, MOV ou WebM.")
    job_id = uuid4().hex
    source = INBOX / f"{job_id}{suffix}"
    output = OUTBOX / f"{job_id}.mp4"
    size = 0
    try:
        with source.open("wb") as target:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_BYTES:
                    raise HTTPException(status_code=413, detail="La vidéo dépasse la limite de 500 Mo.")
                target.write(chunk)
        args = [ffmpeg_path(), "-y", "-i", str(source), "-map", "0:v:0", "-map", "0:a?", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-c:a", "aac", "-movflags", "+faststart"]
        crop = FORMATS[format]
        if crop:
            args += ["-vf", crop]
        args.append(str(output))
        result = subprocess.run(args, capture_output=True, text=True, timeout=1800)
        if result.returncode != 0 or not output.exists():
            raise HTTPException(status_code=422, detail="FFmpeg n'a pas pu traiter cette vidéo. Vérifiez le fichier et ses codecs.")
        return {"job_id": job_id, "status": "completed", "download_url": f"/api/download/{job_id}"}
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Le rendu a dépassé 30 minutes.")
    finally:
        source.unlink(missing_ok=True)
        await file.close()

@app.get("/api/download/{job_id}")
def download(job_id: str):
    if not job_id.isalnum() or len(job_id) != 32:
        raise HTTPException(status_code=400, detail="Identifiant invalide.")
    output = OUTBOX / f"{job_id}.mp4"
    if not output.is_file():
        raise HTTPException(status_code=404, detail="Fichier introuvable ou déjà supprimé.")
    return FileResponse(output, media_type="video/mp4", filename="krea-video.mp4")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8765)
