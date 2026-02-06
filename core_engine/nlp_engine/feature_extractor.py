import re

def extract_skills_from_text(text: str, skill_list: list = None) -> list:
    """
    Extracts skills from text based on a provided list or common keywords.
    For now, we can use a basic set of common tech skills if no list is provided.
    """
    if skill_list is None:
        # Basic default list, can be expanded or loaded from a file
        skill_list = [
            "python", "java", "c++", "javascript", "react", "node", "aws", "docker", "kubernetes",
            "sql", "nosql", "machine learning", "deep learning", "nlp", "pytorch", "tensorflow",
            "git", "ci/cd", "linux", "agile", "scrum", "project management", "communication"
        ]
    
    found_skills = []
    text_lower = text.lower()
    
    for skill in skill_list:
        # Simple keyword matching
        # Use regex to ensure whole word match to avoid partial matches (e.g., "java" in "javascript")
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill)
            
    return found_skills

def extract_experience(text: str) -> float:
    """
    Attempts to extract years of experience using regex.
    Returns the maximum number of years found found, or 0 if none.
    """
    # Patterns like "5 years", "5+ years", "5 years of experience"
    pattern = r'(\d+)\+?\s*(?:years|yrs)'
    matches = re.findall(pattern, text, re.IGNORECASE)
    
    if matches:
        # Convert to integers and find the max. 
        # Be careful with very high numbers (e.g., year 2020), but "years" context usually filters that.
        years = [int(m) for m in matches if int(m) < 50] # Filter out year numbers like 2020
        if years:
            return max(years)
            
    return 0.0

def extract_features(text: str, jd_text: str) -> dict:
    """
    Extracts features for ranking.
    """
    # 1. Skill Match
    # Ideally, we extract skills from JD and Resume separately and intersect them.
    # For now, let's assume we use the default list + some extracted from JD if possible.
    
    # Simple strategy: Extract skills from JD to build the "required" list
    jd_skills = extract_skills_from_text(jd_text)
    
    # Extract skills from Resume
    resume_skills = extract_skills_from_text(text, jd_skills) # Check if resume has JD's skills
    
    # Calculate skill overlap score
    skill_score = 0.0
    if jd_skills:
        skill_score = len(resume_skills) / len(jd_skills)
    
    # 2. Experience
    # Extract experience from resume. JD experience requirement is harder to parse consistently,
    # but we can try to find it or just use the resume's raw number as a feature.
    experience_years = extract_experience(text)
    
    return {
        "found_skills": resume_skills,
        "missing_skills": [s for s in jd_skills if s not in resume_skills],
        "skill_score": skill_score,
        "experience_years": experience_years
    }
