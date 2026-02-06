import re
import string

def clean_text(text: str) -> str:
    """
    Cleans the input text by:
    - Lowercasing
    - Removing special characters and numbers (keeping only letters and basic punctuation if needed)
    - Removing extra whitespace
    """
    if not text:
        return ""
    
    # Lowercase
    text = text.lower()
    
    # Remove special characters (keep only alphanumeric and spaces)
    # You might want to keep some punctuation depending on the model, but usually removing it is safer for simple comparison
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def preprocess_text(text: str) -> str:
    """
    Main preprocessing function.
    Can be expanded to include tokenization or lemmatization if using Spacy.
    For Sentence-Transformers, raw text is often preferred, but cleaning helps.
    """
    return clean_text(text)
