from google import genai
from config.gemini_config import GEMINI_API_KEY


def generate_suggestions(missing_skills, job_title="the role"):
    """
    Generates AI-based improvement suggestions.
    Handles both:
    - Missing skills case
    - Perfect match case (important fix)
    """

    # -------------------------------
    # FALLBACK (always available)
    # -------------------------------
    if missing_skills:
        fallback = [
            f"- Learn {skill} through projects and official documentation."
            for skill in missing_skills
        ]
    else:
        fallback = [
            "- Add advanced projects to strengthen your portfolio.",
            "- Optimize resume with measurable impact (metrics, results).",
            "- Tailor resume keywords for ATS systems.",
        ]

    fallback_text = "AI suggestions unavailable.\n\n" + "\n".join(fallback)

    # -------------------------------
    # AI GENERATION
    # -------------------------------
    try:
        if not GEMINI_API_KEY:
            raise ValueError("Gemini API key not loaded")

        client = genai.Client(api_key=GEMINI_API_KEY)

        # -------------------------------
        # PROMPT LOGIC (FIXED)
        # -------------------------------
        if not missing_skills:
            # ✅ PERFECT MATCH CASE (NEW)
            prompt = f"""
            You are an expert Career Coach and Technical Recruiter.

            The candidate already matches the role of '{job_title}' very well.

            Provide:
            • Advanced resume improvements
            • Portfolio project ideas
            • Ways to stand out from other candidates

            Keep it concise.
            Use bullet points.
            Tone: professional and encouraging.
            """
        else:
            # ✅ MISSING SKILLS CASE
            prompt = f"""
            You are an expert Career Coach and Technical Recruiter.

            The candidate is missing these skills for the role of '{job_title}':
            {", ".join(missing_skills)}

            Provide a VERY brief improvement plan.

            For each skill include:
            • Actionable step (project idea)
            • Topics to study
            • Learning resources

            Use bullet points.
            Keep it concise and practical.
            """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return response.text.strip() if response.text else fallback_text

    except Exception as e:
        print("Gemini Error:", e)
        return fallback_text