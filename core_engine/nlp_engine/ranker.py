from core_engine.nlp_engine.preprocessing import preprocess_text
from core_engine.nlp_engine.embedding_model import embedding_model
from core_engine.nlp_engine.feature_extractor import extract_features
import numpy as np


def rank_candidates(jd_text: str, resumes: list, weights: dict = None) -> list:
    """
    Ranks candidates based on JD.
    """

    if weights is None:
        weights = {'semantic': 0.7, 'skills': 0.3}

    # ================================
    # 1. PREPROCESSING
    # ================================
    cleaned_jd = preprocess_text(jd_text)
    cleaned_resumes_texts = [preprocess_text(r['text']) for r in resumes]

    # ================================
    # 2. EMBEDDINGS
    # ================================
    jd_embedding = embedding_model.get_embeddings([cleaned_jd])[0]

    if cleaned_resumes_texts:
        resume_embeddings = embedding_model.get_embeddings(cleaned_resumes_texts)
    else:
        resume_embeddings = []

    ranked_results = []

    # ================================
    # 3. SCORING LOOP
    # ================================
    for i, resume in enumerate(resumes):

        # ---------- Semantic Score ----------
        if len(resume_embeddings) > 0:
            sem_score = embedding_model.compute_similarity(
                jd_embedding, resume_embeddings[i]
            )
        else:
            sem_score = 0.0

        # 🔥 FIX: convert numpy → float
        sem_score = float(sem_score)
        sem_score = max(0.0, sem_score)

        # ---------- Feature Extraction ----------
        features = extract_features(
            resume["text"],
            jd_text,
            "core_engine/skills/skill_list.txt"
        )

        skill_score = float(features['skill_score'])

        # ---------- Final Score ----------
        final_score = (
            (sem_score * weights['semantic']) +
            (skill_score * weights['skills'])
        )

        # 🔥 FIX: ensure Python float
        final_score = float(final_score)
        final_score = round(final_score * 100, 2)

        # ---------- Result ----------
        result = {
            **resume,
            "score": final_score,
            "analysis": {
                "semantic_score": round(sem_score * 100, 2),
                "skill_score": round(skill_score * 100, 2),

                # 🔥 FIX: correct key
                "matched_skills": features['matched_skills'],
                "missing_skills": features['missing_skills'],

                "experience_years": float(features['experience_years'])
            }
        }

        ranked_results.append(result)

    # ================================
    # 4. SORT + RANK
    # ================================
    ranked_results.sort(key=lambda x: x['score'], reverse=True)

    for i, res in enumerate(ranked_results):
        res['rank'] = i + 1

    return ranked_results