from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import logging

# Set up logging
logger = logging.getLogger(__name__)

class EmbeddingModel:
    _instance = None
    _model = None

    def __new__(cls):
        """Singleton to ensure model is loaded only once"""
        if cls._instance is None:
            cls._instance = super(EmbeddingModel, cls).__new__(cls)
            try:
                logger.info("Loading Sentence Transformer model...")
                # 'all-MiniLM-L6-v2' is a good balance of speed and performance
                cls._model = SentenceTransformer('all-MiniLM-L6-v2') 
                logger.info("Model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                cls._model = None
        return cls._instance

    def get_embeddings(self, texts: list):
        """
        Generate embeddings for a list of texts.
        """
        if self._model is None:
            raise RuntimeError("Model is not loaded.")
        
        if not texts:
            return np.array([])

        return self._model.encode(texts)

    def compute_similarity(self, embedding1, embedding2):
        """
        Compute cosine similarity between two embeddings.
        Input embeddings should be 1D or 2D arrays.
        Returns a float between -1 and 1.
        """
        # Ensure inputs are 2D arrays for sklearn's cosine_similarity
        if len(embedding1.shape) == 1:
            embedding1 = embedding1.reshape(1, -1)
        if len(embedding2.shape) == 1:
            embedding2 = embedding2.reshape(1, -1)

        sim_matrix = cosine_similarity(embedding1, embedding2)
        return sim_matrix[0][0]

# Global instance
embedding_model = EmbeddingModel()
