from pathlib import Path
from uuid import uuid4
import json
import shutil
import subprocess

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

BASE = Path(__file__).resolve().parent
INBOX = BASE / "data" / "inbox"
OUTBOX = BASE / "data" / "outbox"
TEMP = BASE / "data" / "temp"
for folder in (INBOX, OUTBOX, TEMP):
    folder.mkdir(parents=True, exist_ok=True)

MAX_BYTES = 500 * 1024 * 1024
FORMATS = {"9:16": "crop=ih*9/16:ih", "1:1": "crop=min(iw\\,ih):min(iw\\,ih)", "16:9": "crop=iw:iw*9/16", "original": None}
VIDEO_SUFFIXES = {".mp4", ".mov", ".webm"}
CAPTION_STYLES = {
    "clean": {"font": "Arial", "size": 48, "primary": "&H00FFFFFF", "outline": 3, "shadow": 1},
    "bold": {"font": "Arial", "size": 58, "primary": "&H0000FFFF", "outline": 4, "shadow": 2},
    "minimal": {"font": "Arial", "size": 42, "primary": "&H00FFFFFF", "outline": 1, "shadow": 0},
}

app = FastAPI(title="KREA VIDEO ENGINE Local Worker", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

def ffmpeg_path():
    return shutil.which("ffmpeg")

def save_upload(file: UploadFile, destination: Path):
    size = 0
    with destination.open("wb") as target:
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_BYTES:
                destination.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="La vidéo dépasse la limite de 500 Mo.")
            target.write(chunk)
    return size

def ass_timestamp(seconds):
    centiseconds = max(0, round(seconds * 100))
    hours, remainder = divmod(centiseconds, 360000)
    minutes, remainder = divmod(remainder, 6000)
    whole_seconds, fraction = divmod(remainder, 100)
    return f"{hours}:{minutes:02d}:{whole_seconds:02d}.{fraction:02d}"

def ass_escape(value):
    return str(value).replace("\\", r"\\").replace("{", r"\{").replace("}", r"\}").replace("\r", "").replace("\n", r"\N")

def write_ass(path, segments, style_name):
    style = CAPTION_STYLES[style_name]
    header = f"""[Script Info]
Title: KREA VIDEO ENGINE Captions
ScriptType: v4.00+
WrapStyle: 2
ScaledBorderAndShadow: yes
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: KREA,{style['font']},{style['size']},{style['primary']},&H000000FF,&H00101010,&H80000000,1,0,0,0,100,100,0,0,1,{style['outline']},{style['shadow']},2,70,70,100,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    rows = []
    for item in segments:
        try:
            start, end = float(item["start"]), float(item["end"])
            text = ass_escape(item["text"]).strip()
        except (KeyError, TypeError, ValueError):
            continue
        if start < 0 or end <= start or not text:
            continue
        rows.append(f"Dialogue: 0,{ass_timestamp(start)},{ass_timestamp(end)},KREA,,0,0,0,,{text}")
    path.write_text(header + "\n".join(rows) + "\n", encoding="utf-8-sig")

def ffmpeg_filter_path(path):
    # FFmpeg filter syntax needs Windows drive-colons escaped and forward slashes.
    return path.resolve().as_posix().replace(":", r"\:").replace("'", r"\'")

@app.get("/health")
def health():
    return {"ok": True, "ffmpeg": bool(ffmpeg_path()), "transcription": "faster-whisper", "caption_burn_in": True, "mode": "local"}

@app.post("/api/render")
async def render(file: UploadFile = File(...), format: str = Form("9:16")):
    if not ffmpeg_path():
        raise HTTPException(status_code=503, detail="FFmpeg n'est pas installé ou absent du PATH Windows.")
    if format not in FORMATS:
        raise HTTPException(status_code=400, detail="Format non pris en charge.")
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in VIDEO_SUFFIXES:
        raise HTTPException(status_code=415, detail="Utilisez un fichier MP4, MOV ou WebM.")
    job_id = uuid4().hex
    source = INBOX / f"{job_id}{suffix}"
    output = OUTBOX / f"{job_id}.mp4"
    try:
        save_upload(file, source)
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

@app.post("/api/transcribe")
async def transcribe(file: UploadFile = File(...), language: str = Form("auto")):
    if not ffmpeg_path():
        raise HTTPException(status_code=503, detail="FFmpeg est nécessaire pour extraire l'audio.")
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in VIDEO_SUFFIXES:
        raise HTTPException(status_code=415, detail="Utilisez un fichier MP4, MOV ou WebM.")
    if language not in {"auto", "fr", "en", "es", "pt", "ar"}:
        raise HTTPException(status_code=400, detail="Langue non prise en charge.")
    job_id = uuid4().hex
    source = INBOX / f"{job_id}{suffix}"
    audio = TEMP / f"{job_id}.wav"
    try:
        save_upload(file, source)
        extract = subprocess.run(
            [ffmpeg_path(), "-y", "-i", str(source), "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(audio)],
            capture_output=True, text=True, timeout=600,
        )
        if extract.returncode != 0 or not audio.exists():
            raise HTTPException(status_code=422, detail="Impossible d'extraire l'audio de cette vidéo.")
        try:
            from faster_whisper import WhisperModel
        except ImportError:
            raise HTTPException(status_code=503, detail="Installez les dépendances avec : pip install -r requirements.txt")
        model = WhisperModel("tiny", device="cpu", compute_type="int8")
        segments, info = model.transcribe(str(audio), language=None if language == "auto" else language, vad_filter=True)
        transcript = [
            {"start": round(segment.start, 2), "end": round(segment.end, 2), "text": segment.text.strip()}
            for segment in segments
        ]
        return {"status": "completed", "language": info.language, "language_probability": round(info.language_probability, 3), "segments": transcript}
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="L'extraction audio a dépassé le délai autorisé.")
    finally:
        source.unlink(missing_ok=True)
        audio.unlink(missing_ok=True)
        await file.close()

@app.post("/api/render-subtitled")
async def render_subtitled(
    file: UploadFile = File(...),
    format: str = Form("9:16"),
    style: str = Form("clean"),
    subtitles: str = Form(...),
):
    if not ffmpeg_path():
        raise HTTPException(status_code=503, detail="FFmpeg n'est pas installé ou absent du PATH Windows.")
    if format not in FORMATS or style not in CAPTION_STYLES:
        raise HTTPException(status_code=400, detail="Format ou style de sous-titres non pris en charge.")
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in VIDEO_SUFFIXES:
        raise HTTPException(status_code=415, detail="Utilisez un fichier MP4, MOV ou WebM.")
    try:
        segments = json.loads(subtitles)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Données de sous-titres invalides.")
    if not isinstance(segments, list) or not segments or len(segments) > 2000:
        raise HTTPException(status_code=400, detail="Fournissez entre 1 et 2000 segments de sous-titres.")
    job_id = uuid4().hex
    source = INBOX / f"{job_id}{suffix}"
    output = OUTBOX / f"{job_id}.mp4"
    ass_file = TEMP / f"{job_id}.ass"
    try:
        save_upload(file, source)
        write_ass(ass_file, segments, style)
        filters = []
        if FORMATS[format]:
            filters.append(FORMATS[format])
        filters.append(f"subtitles='{ffmpeg_filter_path(ass_file)}'")
        args = [ffmpeg_path(), "-y", "-i", str(source), "-map", "0:v:0", "-map", "0:a?", "-vf", ",".join(filters), "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-c:a", "aac", "-movflags", "+faststart", str(output)]
        result = subprocess.run(args, capture_output=True, text=True, timeout=1800)
        if result.returncode != 0 or not output.exists():
            raise HTTPException(status_code=422, detail="Impossible d'incruster les sous-titres. Vérifiez FFmpeg et ses filtres.")
        return {"job_id": job_id, "status": "completed", "download_url": f"/api/download/{job_id}"}
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Le rendu avec sous-titres a dépassé 30 minutes.")
    finally:
        source.unlink(missing_ok=True)
        ass_file.unlink(missing_ok=True)
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
