import sys
import os

# Ensure core_engine can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core_engine.nlp_engine.ranker import rank_candidates

def run_evaluation():
    print("Running NLP Ranking System Evaluation...")

    # Dummy Job Description
    jd_text = """
    We are looking for a Senior Python Developer with experience in machine learning and cloud platforms.
    Key skills required:
    - Python (Advanced)
    - Django or FastAPI
    - AWS or Google Cloud
    - Docker and Kubernetes
    - Machine Learning (scikit-learn, TensorFlow)
    - 5+ years of experience
    """

    # Dummy Resumes
    resumes = [
        {
            "id": "1",
            "filename": "alice_resume.pdf",
            "text": """
            Alice
            Python Developer with 6 years of experience.
            Skills: Python, Django, AWS, Docker, Kubernetes, Linux.
            Experience: Built scalable web apps using Django. 
            Deployed on AWS using EKS.
            """
        },
        {
            "id": "2",
            "filename": "bob_resume.pdf",
            "text": """
            Bob
            Junior Developer
            Skills: HTML, CSS, JavaScript, some Python.
            Experience: 1 year of experience in frontend development.
            Looking for a full-stack role.
            """
        },
        {
            "id": "3",
            "filename": "charlie_resume.pdf",
            "text": """
            Charlie
            Data Scientist
            Skills: Python, TensorFlow, PyTorch, Scikit-learn, Pandas.
            Experience: 4 years working on NLP models and predictive analytics.
            Familiar with cloud deployment on GCP.
            """
        }
    ]

    print("\nJob Description Snippet:", jd_text.strip()[:100] + "...")
    print(f"\nEvaluating {len(resumes)} resumes...")

    results = rank_candidates(jd_text, resumes)

    print("\nRanking Results:")
    print("-" * 50)
    for res in results:
        print(f"Rank: {res['rank']} | Score: {res['score']}")
        print(f"Name: {res['filename']}")
        print(f"Semantic Score: {res['analysis']['semantic_score']}")
        print(f"Skill Score: {res['analysis']['skill_score']}")
        print(f"Matched Skills: {res['analysis']['matched_skills']}")
        print("-" * 50)
        
    # Validation logic
    top_candidate = results[0]
    if top_candidate['filename'] == "alice_resume.pdf":
        print("\nSUCCESS: Alice (Senior Python Dev) is ranked first.")
    elif top_candidate['filename'] == "charlie_resume.pdf":
        print("\nNOTE: Charlie (Data Scientist) is ranked first. Check if weights favor ML too much.")
    else:
        print(f"\nWARNING: Unexpected top candidate: {top_candidate['filename']}")

if __name__ == "__main__":
    run_evaluation()
