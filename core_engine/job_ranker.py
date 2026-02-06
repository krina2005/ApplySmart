
from supabase import create_client, Client
import os
import requests
import io
from core_engine.nlp_engine.ranker import rank_candidates
from core_engine.utils.text_cleaner import clean_text
from core_engine.utils.pdf_reader import extract_text_from_pdf

def fetch_and_rank_applications(job_id: str, token: str):
    """
    Fetches job JD and all applications for the job using the user's token.
    Downloads resumes, ranks them, and updates the database.
    """
    # Create a client specifically for this user context
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        raise Exception("Supabase credentials missing on backend")

    # Create client and set auth token
    supabase: Client = create_client(url, key)
    supabase.postgrest.auth(token)
    supabase.auth.set_session(token, token)

    # 1. Fetch Job Description
    job_response = supabase.table('jobs').select('description, title').eq('id', job_id).single().execute()
    
    if not job_response.data:
        raise Exception(f"Job {job_id} not found")
        
    job_data = job_response.data
    jd_text = job_data.get('description', '')
    if not jd_text:
        jd_text = job_data.get('title', '')

    # 2. Fetch Applications (only pending ones)
    apps_response = supabase.table('applications').select('id, resume_url, user_id').eq('job_id', job_id).or_('status.is.null,status.eq.Pending').execute()
    applications = apps_response.data

    if not applications:
        return []

    # 3. Process Applications
    processed_resumes = []
    
    for app in applications:
        resume_url = app.get('resume_url')
        if not resume_url:
            continue
            
        try:
            # Download PDF
            response = requests.get(resume_url)
            response.raise_for_status()
            
            # Extract text
            file_stream = io.BytesIO(response.content)
            text = extract_text_from_pdf(file_stream)
            cleaned_text = clean_text(text)
            
            processed_resumes.append({
                "id": app['id'], 
                "user_id": app['user_id'],
                "filename": resume_url.split('/')[-1],
                "text": cleaned_text
            })
            
        except Exception as e:
            print(f"Error processing app {app['id']}: {e}")
            
    if not processed_resumes:
        return []
        
    # 4. Rank
    ranking_results = rank_candidates(jd_text, processed_resumes)
    
    # 5. Update Database
    final_results = []
    
    for res in ranking_results:
        app_id = res['id']
        score = res['score']
        analysis = res['analysis']
        
        update_data = {
            "score": score,
            "rank_analysis": analysis
        }
        
        try:
            supabase.table('applications').update(update_data).eq('id', app_id).execute()
            final_results.append(res)
        except Exception as e:
            print(f"Error updating app {app_id}: {e}")
            final_results.append(res)

    return final_results
