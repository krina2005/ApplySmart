from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from core_engine.utils.pdf_reader import extract_text_from_pdf
from core_engine.utils.text_cleaner import clean_text
from core_engine.matcher import match_resume_with_jd

app = FastAPI()

# Allow frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-resume")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    role: str = Form("Python Backend Developer")
):
    # Read & process resume
    resume_text = extract_text_from_pdf(resume.file)
    resume_text = clean_text(resume_text)

    # Clean JD
    jd_text = clean_text(job_description)

    # Match
    result = match_resume_with_jd(resume_text, jd_text, role)

    return {
        "filename": resume.filename,
        "analysis": result
    }

from core_engine.nlp_engine.ranker import rank_candidates
from typing import List

@app.post("/rank-resumes")
async def rank_resumes(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...)
):
    """
    Accepts a JD and multiple resume files.
    Returns a ranked list of candidates.
    """
    processed_resumes = []
    
    for resume in resumes:
        # Extract text
        content = extract_text_from_pdf(resume.file)
        
        # We pass raw text, ranker handles preprocessing
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


from fastapi import Request, Depends, HTTPException

@app.post("/rank-job/{job_id}")
async def rank_job(job_id: str, request: Request):
    """
    Triggers ranking for a specific job.
    Fetches apps from DB using User's Auth Token.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")

    try:
        token = auth_header.split(" ")[1]
        results = fetch_and_rank_applications(job_id, token)
        return {"status": "success", "ranked_count": len(results), "results": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}
