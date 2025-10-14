# backend/utils/vector_store.py
import chromadb
from typing import List, Dict, Any
import numpy as np

# Initialize a persistent ChromaDB client
client = chromadb.PersistentClient(path="./data/chroma_db")

def get_or_create_collection(user_id: str):
    """Gets or creates a ChromaDB collection for a given user."""
    return client.get_or_create_collection(name=user_id)

def store_embeddings(collection, chunks: List[str], embeddings: np.ndarray, metadatas: List[Dict[str, Any]], doc_id_prefix: str):
    """Stores text chunks and their embeddings in the specified collection."""
    if embeddings.size == 0:
        return
        
    ids = [f"{doc_id_prefix}_{i}" for i in range(len(chunks))]
    collection.add(
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )

def retrieve_context(collection, query_embedding: np.ndarray, top_k: int = 5) -> List[str]:
    """Queries the collection to retrieve the most relevant document chunks."""
    if query_embedding.size == 0:
        return []

    results = collection.query(
        query_embeddings=query_embedding.tolist(),
        n_results=top_k
    )
    return results['documents'][0] if results['documents'] else []