# backend/utils/text_splitter.py
from typing import List

def split_text_into_chunks(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    """Splits text into overlapping chunks."""
    if not text:
        return []
        
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks