# backend/utils/pdf_loader.py
import fitz  # PyMuPDF
import os
from typing import List

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts text from a single PDF file."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"The file {file_path} was not found.")
    
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text