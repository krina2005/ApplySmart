from core_engine.nlp_engine.preprocessing import preprocess_text
from core_engine.nlp_engine.embedding_model import embedding_model
from core_engine.nlp_engine.feature_extractor import extract_features
import numpy as np

def rank_candidates(jd_text: str, resumes: list, weights: dict = None) -> list:
    """
    Ranks candidates based on JD.
    
    Args:
        jd_text: String content of the Job Description.
        resumes: List of dicts, where each dict has 'id', 'text', 'filename', etc.
                 Example: [{'id': '1', 'text': '...', 'filename': 'resume1.pdf'}]
        weights: Dictionary of weights for scoring. Defaults to {'semantic': 0.7, 'skills': 0.3}.
        
    Returns:
        List of resumes with added 'score', 'rank', and 'analysis' fields, sorted by score.
    """
    if weights is None:
        weights = {'semantic': 0.7, 'skills': 0.3}

    # 1. Preprocess
    cleaned_jd = preprocess_text(jd_text)
    cleaned_resumes_texts = [preprocess_text(r['text']) for r in resumes]

    # 2. Embeddings & Semantic Score
    # Get embedding for JD
    jd_embedding = embedding_model.get_embeddings([cleaned_jd])[0]
    
    # Get embeddings for all resumes (batch processing)
    if cleaned_resumes_texts:
        resume_embeddings = embedding_model.get_embeddings(cleaned_resumes_texts)
    else:
        resume_embeddings = []

    ranked_results = []

    for i, resume in enumerate(resumes):
        # Semantic Similarity
        if len(resume_embeddings) > 0:
            sem_score = embedding_model.compute_similarity(jd_embedding, resume_embeddings[i])
        else:
            sem_score = 0.0
            
        # Feature Extraction
        features = extract_features(resume['text'], jd_text)
        skill_score = features['skill_score']
        
        # Combined Score
        # Normalize scores to 0-100 roughly, well here they are 0-1
        # Semantic is -1 to 1 (usually 0 to 1 for text), Skills is 0 to 1
        
        # Clip sem_score to 0-1 just in case
        sem_score = max(0.0, sem_score)
        
        final_score = (sem_score * weights['semantic']) + (skill_score * weights['skills'])
        final_score = round(final_score * 100, 2) # Scale to 0-100 for display
        
        result = {
            **resume, # Include original resume data
            "score": final_score,
            "analysis": {
                "semantic_score": round(sem_score * 100, 2),
                "skill_score": round(skill_score * 100, 2),
                "matched_skills": features['found_skills'],
                "missing_skills": features['missing_skills'],
                "experience_years": features['experience_years']
            }
        }
        ranked_results.append(result)

    # Sort by score descending
    ranked_results.sort(key=lambda x: x['score'], reverse=True)
    
    # Add Rank
    for i, res in enumerate(ranked_results):
        res['rank'] = i + 1
        
    return ranked_results
