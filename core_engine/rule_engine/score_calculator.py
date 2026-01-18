def calculate_match_score(resume_skills, jd_skills):
    if not jd_skills:
        return 0.0

    matched = resume_skills.intersection(jd_skills)
    score = (len(matched) / len(jd_skills)) * 100
    return round(score, 2)
