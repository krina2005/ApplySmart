import re


# ================================
# LOAD SKILL MAP
# ================================
def load_skill_map(skill_file_path: str):
    skill_map = {}

    with open(skill_file_path, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip().lower()

            if not line or line.startswith("#"):
                continue

            variations = [v.strip() for v in line.split(",")]
            main_skill = variations[0]

            skill_map[main_skill] = variations

    return skill_map


# ================================
# SKILL EXTRACTION
# ================================
def extract_skills(text: str, skill_map: dict) -> list:
    text = text.lower()
    found_skills = set()

    for main_skill, variations in skill_map.items():
        for keyword in variations:
            pattern = rf"\b{re.escape(keyword)}\b"

            if re.search(pattern, text):
                found_skills.add(main_skill)
                break

    return sorted(list(found_skills))