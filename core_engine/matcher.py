from core_engine.rule_engine.skill_matcher import load_skills, extract_skills
from core_engine.rule_engine.score_calculator import calculate_match_score
from core_engine.rule_engine.gap_analyzer import find_missing_skills
from core_engine.ai_engine.gemini_analyzer import generate_suggestions


def match_resume_with_jd(resume_text: str, jd_text: str, role: str):
    """
    Complete matching pipeline:
    Resume + JD → Score + Gaps + AI Suggestions
    """

    skills = load_skills("core_engine/skills/skill_list.txt")

    resume_skills = extract_skills(resume_text, skills)
    jd_skills = extract_skills(jd_text, skills)

    match_score = calculate_match_score(resume_skills, jd_skills)
    missing_skills = find_missing_skills(resume_skills, jd_skills)

    suggestions = generate_suggestions(missing_skills, role)

    return {
        "match_score": match_score,
        "matched_skills": list(resume_skills.intersection(jd_skills)),
        "missing_skills": list(missing_skills),
        "ai_suggestions": suggestions
    }
