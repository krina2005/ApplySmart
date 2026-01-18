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
