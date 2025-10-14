# backend/app.py
import os
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# Import utility functions
from utils import pdf_loader, text_splitter, embeddings, vector_store, rag_pipeline

# Configuration
UPLOAD_DIR = "./data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- FastAPI App Initialization ---
app = FastAPI(
    title="SmartStudy RAG API",
    description="API for uploading documents and chatting with them using a RAG pipeline.",
    version="1.0.0"
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the SmartStudy RAG API!"}

@app.post("/upload/")
async def upload_document(user_id: str = Form(...), file: UploadFile = File(...)):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required.")
        
    try:
        # 1. Save the uploaded file
        user_upload_dir = os.path.join(UPLOAD_DIR, user_id)
        os.makedirs(user_upload_dir, exist_ok=True)
        
        file_path = os.path.join(user_upload_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
            
        doc_id = str(uuid.uuid4()) # Unique ID for this document

        # 2. Process the document
        print(f"Processing {file.filename} for user {user_id}...")
        text = pdf_loader.extract_text_from_pdf(file_path)
        chunks = text_splitter.split_text_into_chunks(text)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not extract text from the document.")

        # 3. Generate embeddings
        chunk_embeddings = embeddings.embed_texts(chunks)

        # 4. Store in Vector DB
        collection = vector_store.get_or_create_collection(user_id)
        metadatas = [{"source": file.filename, "doc_id": doc_id} for _ in chunks]
        vector_store.store_embeddings(collection, chunks, chunk_embeddings, metadatas, doc_id)
        
        print(f"Successfully processed and stored {file.filename}.")
        return {"message": f"Document '{file.filename}' uploaded and processed successfully.", "doc_id": doc_id}

    except Exception as e:
        print(f"Error during upload: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/chat/")
async def chat_with_documents(user_id: str = Form(...), query: str = Form(...)):
    if not user_id or not query:
        raise HTTPException(status_code=400, detail="User ID and query are required.")
        
    try:
        # 1. Get the user's collection
        collection = vector_store.get_or_create_collection(user_id)
        
        # 2. Embed the query
        query_embedding = embeddings.embed_texts([query])
        
        # 3. Retrieve relevant context
        context_chunks = vector_store.retrieve_context(collection, query_embedding, top_k=5)
        
        if not context_chunks:
             return {"answer": "I couldn't find any relevant information in your documents to answer that question.", "context": []}

        # 4. Generate an answer using the RAG pipeline
        answer = rag_pipeline.generate_answer(context_chunks, query)
        
        return {"answer": answer, "context": context_chunks}

    except Exception as e:
        print(f"Error during chat: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")