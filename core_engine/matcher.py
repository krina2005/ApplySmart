from core_engine.rule_engine.skill_matcher import load_skill_map, extract_skills
from core_engine.rule_engine.score_calculator import calculate_match_score
from core_engine.rule_engine.gap_analyzer import find_missing_skills
from core_engine.ai_engine.gemini_analyzer import generate_suggestions


def match_resume_with_jd(resume_text: str, jd_text: str, role: str):
    """
    Complete matching pipeline:
    Resume + JD → Score + Gaps + AI Suggestions
    """

    skill_map = load_skill_map("core_engine/skills/skill_list.txt")

    # Extract skills (lists)
    resume_skills = extract_skills(resume_text, skill_map)
    jd_skills = extract_skills(jd_text, skill_map)

    # Convert to sets ONCE (important)
    resume_set = set(resume_skills)
    jd_set = set(jd_skills)

    # Matching
    matched_skills = sorted(list(resume_set & jd_set))
    missing_skills = sorted(list(jd_set - resume_set))

    # Score
    match_score = calculate_match_score(resume_skills, jd_skills)

    # AI Suggestions
    suggestions = generate_suggestions(missing_skills, role)

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "ai_suggestions": suggestions
    }