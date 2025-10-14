# backend/utils/embeddings.py
from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np

# Load the model from the cache or download it if not present
print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Embedding model loaded.")

def embed_texts(texts: List[str]) -> np.ndarray:
    """Generates embeddings for a list of text chunks."""
    if not texts:
        return np.array([])
    embeddings = model.encode(texts, show_progress_bar=True)
    return embeddings