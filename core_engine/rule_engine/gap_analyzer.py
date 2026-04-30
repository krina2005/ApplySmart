def find_missing_skills(resume_skills, jd_skills):
    return sorted(list(set(jd_skills) - set(resume_skills)))