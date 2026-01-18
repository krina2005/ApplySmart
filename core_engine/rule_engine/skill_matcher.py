def load_skills(skill_file_path):
    with open(skill_file_path, "r", encoding="utf-8") as file:
        return [skill.strip().lower() for skill in file.readlines()]

def extract_skills(text, skills):
    found_skills = set()
    for skill in skills:
        if skill in text:
            found_skills.add(skill)
    return found_skills
