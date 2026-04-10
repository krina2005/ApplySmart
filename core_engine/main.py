from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os

from core_engine.utils.pdf_reader import extract_text_from_pdf
from core_engine.utils.text_cleaner import clean_text
from core_engine.matcher import match_resume_with_jd

app = FastAPI(title="ApplySmart API")

# ── CORS ──────────────────────────────────────────────────────────────────────
# In production (HF Spaces) the same origin serves both frontend + API,
# so we only need localhost for local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── AI Endpoints ───────────────────────────────────────────────────────────────

from typing import List

@app.post("/analyze-resume")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    role: str = Form("Python Backend Developer")
):
    resume_text = extract_text_from_pdf(resume.file)
    resume_text = clean_text(resume_text)
    jd_text = clean_text(job_description)
    result = match_resume_with_jd(resume_text, jd_text, role)
    return {
        "filename": resume.filename,
        "analysis": result
    }


from core_engine.nlp_engine.ranker import rank_candidates

@app.post("/rank-resumes")
async def rank_resumes(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...)
):
    processed_resumes = []
    for resume in resumes:
        content = extract_text_from_pdf(resume.file)
        processed_resumes.append({
            "filename": resume.filename,
            "text": content
        })
    ranking_results = rank_candidates(job_description, processed_resumes)
    return {
        "job_description_snippet": job_description[:100] + "...",
        "results": ranking_results
    }


from core_engine.job_ranker import fetch_and_rank_applications

@app.post("/rank-job/{job_id}")
async def rank_job(job_id: str, request: Request):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    try:
        token = auth_header.split(" ")[1]
        results = fetch_and_rank_applications(job_id, token)
        return {"status": "success", "ranked_count": len(results), "results": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ── Serve React Frontend (production) ─────────────────────────────────────────
# The Dockerfile builds the React app into frontend/dist.
# FastAPI serves those static files for any non-API route.

STATIC_DIR = Path(__file__).parent.parent / "frontend" / "dist"

if STATIC_DIR.exists():
    # Serve JS/CSS/assets
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react(full_path: str):
        """Catch-all: serve index.html for all non-API routes (React Router SPA)."""
        index = STATIC_DIR / "index.html"
        return FileResponse(str(index))
