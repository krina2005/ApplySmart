from google import genai
from config.gemini_config import GEMINI_API_KEY

def generate_suggestions(missing_skills, job_title="the role"):
    # Fallback (Keep this for robustness)
    if not missing_skills:
        return "Your resume already matches the job requirements very well."

    fallback = [f"- Consider learning {skill} through online documentation or projects." for skill in missing_skills]
    fallback_text = "AI suggestions unavailable. Basic suggestions:\n" + "\n".join(fallback)

    try:
        if not GEMINI_API_KEY:
            raise ValueError("Gemini API key not loaded")

        client = genai.Client(api_key=GEMINI_API_KEY)

        # UPDATED PROMPT: More structured, resource-heavy, and step-by-step
        prompt = f"""
        You are an expert Career Coach and Technical Recruiter.
        
        The candidate is missing these skills for the role of '{job_title}': 
        {", ".join(missing_skills)}

        Provide a structured, step-by-step improvement plan to increase their resume score. 
        For each skill, include:
        1. **Actionable Step**: How to bridge the gap (e.g., a specific project idea).
        2. **Study Resources**: Specific topics to master.
        3. **Course/Reference Links**: Suggest high-quality learning platforms (Coursera, Udemy, edX) or documentation (MDN, Official Docs).

        Format the response clearly with bold headings and bullet points. 
        Keep the tone professional and encouraging.
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash", # Note: Standardizing model name
            contents=prompt
        )

        return response.text.strip()

    except Exception as e:
        print("Gemini Error:", e)
        return fallback_text

print("GEMINI_API_KEY:", GEMINI_API_KEY)

# def generate_suggestions(missing_skills, job_title="the role"):
#     # Fallback (GOOD PRACTICE – keep this)
#     if not missing_skills:
#         return "Your resume already matches the job requirements very well."

#     fallback = [
#         f"- Consider learning or adding a project related to {skill}."
#         for skill in missing_skills
#     ]

#     fallback_text = (
#         "AI suggestions are temporarily unavailable.\n"
#         "Rule-based improvement suggestions:\n" +
#         "\n".join(fallback)
#     )

#     try:
#         if not GEMINI_API_KEY:
#             raise ValueError("Gemini API key not loaded")

#         client = genai.Client(api_key=GEMINI_API_KEY)

#         prompt = f"""
#             You are an AI career assistant.

#             The candidate is missing the following skills for the {job_title}:
#             {", ".join(missing_skills)}

#             Provide 3 clear, actionable suggestions to improve the resume.
#             Keep it concise and practical.
#             """

#         response = client.models.generate_content(
#             model="models/gemini-2.5-flash",
#             contents=prompt
#         )

#         return response.text.strip()

#     except Exception as e:
#         print("Gemini Error:", e)
#         return fallback_text