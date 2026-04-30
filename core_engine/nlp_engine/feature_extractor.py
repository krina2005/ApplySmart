import re
from core_engine.rule_engine.skill_matcher import load_skill_map, extract_skills
#  ================================
# EXPERIENCE EXTRACTION
# ================================
def extract_experience(text: str) -> float:
    pattern = r'(\d+)\+?\s*(?:years|yrs)'
    matches = re.findall(pattern, text, re.IGNORECASE)

    if matches:
        years = [int(m) for m in matches if int(m) < 50]
        if years:
            return max(years)

    return 0.0


# ================================
# MAIN FEATURE PIPELINE
# ================================
def extract_features(resume_text, jd_text, skill_file_path="core_engine/skills/skill_list.txt") -> dict:
    
    skill_map = load_skill_map(skill_file_path)

    # Extract skills separately
    resume_skills = set(extract_skills(resume_text, skill_map))
    jd_skills = set(extract_skills(jd_text, skill_map))

    # Matching
    matched_skills = sorted(list(resume_skills & jd_skills))
    missing_skills = sorted(list(jd_skills - resume_skills))

    # Score
    skill_score = (len(matched_skills) / len(jd_skills)) if jd_skills else 0

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "skill_score": round(skill_score, 2),
        "experience_years": extract_experience(resume_text),
        "found_skills": matched_skills
    }