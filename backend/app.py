# backend/app.py
import os
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
from fastapi.responses import StreamingResponse

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
    

@app.get("/documents/")
async def list_documents(user_id: str):
    """Lists all documents uploaded by a user."""
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required.")
    
    user_upload_dir = os.path.join(UPLOAD_DIR, user_id)
    if not os.path.exists(user_upload_dir):
        return []
    
    return sorted([f for f in os.listdir(user_upload_dir) if f.endswith('.pdf')])

@app.delete("/documents/{filename}")
async def delete_document(user_id: str, filename: str):
    """Deletes a specific document and its associated embeddings."""
    if not user_id or not filename:
        raise HTTPException(status_code=400, detail="User ID and filename are required.")

    try:
        # 1. Delete the physical file
        file_path = os.path.join(UPLOAD_DIR, user_id, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        else:
            raise HTTPException(status_code=404, detail="File not found.")

        # 2. Delete embeddings from ChromaDB
        collection = vector_store.get_or_create_collection(user_id)
        # This is powerful: we delete vectors based on their source metadata
        collection.delete(where={"source": filename})
        
        print(f"Successfully deleted {filename} and its embeddings for user {user_id}.")
        return {"message": f"Document '{filename}' and its embeddings deleted successfully."}

    except Exception as e:
        print(f"Error during deletion: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    

@app.post("/chat/stream")
async def stream_chat_with_documents(user_id: str = Form(...), query: str = Form(...)):
    """Handles streaming chat with documents."""
    if not user_id or not query:
        raise HTTPException(status_code=400, detail="User ID and query are required.")
    
    try:
        collection = vector_store.get_or_create_collection(user_id)
        query_embedding = embeddings.embed_texts([query])
        context_chunks = vector_store.retrieve_context(collection, query_embedding, top_k=5)
        
        if not context_chunks:
            async def empty_stream():
                yield "I couldn't find any relevant information in your documents to answer that."
            return StreamingResponse(empty_stream(), media_type="text/event-stream")

        # The generator function is passed directly to StreamingResponse
        response_generator = rag_pipeline.generate_stream(context_chunks, query)
        return StreamingResponse(response_generator, media_type="text/event-stream")

    except Exception as e:
        print(f"Error during chat stream: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}") 

    # backend/app.py
# ... (keep all existing imports and code)
import json

@app.post("/generate-quiz")
async def generate_quiz(user_id: str = Form(...)):
    """Generates a quiz from the user's documents."""
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required.")

    try:
        # 1. Retrieve a broad context from all user documents
        collection = vector_store.get_or_create_collection(user_id)
        # We get a large number of chunks to give the LLM enough material
        context_chunks = collection.get(limit=20)["documents"]
        
        if not context_chunks:
            raise HTTPException(status_code=404, detail="Not enough document content to generate a quiz.")
        
        context_str = "\n".join(context_chunks)
        
        # 2. Create a specific prompt for the LLM to generate JSON
        quiz_prompt = f"""
        Based on the following context, generate exactly 3 multiple-choice quiz questions.
        You MUST respond with only a valid JSON object. Do not include any text or formatting before or after the JSON.
        The JSON object should be an array of questions. Each question object must have three keys:
        1. "question": A string for the question text.
        2. "options": An array of 4 strings representing the possible answers.
        3. "answer": A string that is the correct answer from the "options" array.

        Here is an example of the required format:
        [
            {{
                "question": "What is the capital of France?",
                "options": ["London", "Berlin", "Paris", "Madrid"],
                "answer": "Paris"
            }}
        ]

        Context:
        {context_str}
        """

        # 3. Call Ollama to get the structured JSON response
        full_response = rag_pipeline.generate_non_stream_answer(quiz_prompt, llm_model="llama3")

        # 4. Parse and validate the JSON
        try:
            quiz_json = json.loads(full_response)
            # Basic validation to ensure it's a list
            if not isinstance(quiz_json, list):
                raise ValueError("Response is not a list.")
            return quiz_json
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Failed to parse LLM response as JSON: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate a valid quiz. The model response was not in the correct format.")

    except Exception as e:
        print(f"Error during quiz generation: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")  