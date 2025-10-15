# backend/app.py

import os
import uuid
import json
import shutil
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import StreamingResponse
from supabase import create_client, Client
from gotrue.errors import AuthApiError
import re 

# Import utility functions and config
from utils import pdf_loader, text_splitter, embeddings, vector_store, rag_pipeline
from config import SUPABASE_URL, SUPABASE_KEY

# --- FastAPI App Initialization ---
app = FastAPI(title="SmartStudy RAG API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- Supabase & Auth Initialization ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
UPLOAD_DIR = "./data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --- Secure User Dependency (Corrected Version) ---
async def get_current_user(token: str = Depends(oauth2_scheme)): # <-- This line is now fixed
    try:
        # Use the official Supabase client to verify the token.
        # This correctly handles the secure RS256 algorithm.
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return {"id": user.id}
    except AuthApiError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid credentials: {e.message}")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

# --- API Endpoints (All Secured) ---

@app.post("/upload/")
async def upload_document(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    user_upload_dir = os.path.join(UPLOAD_DIR, user_id)
    os.makedirs(user_upload_dir, exist_ok=True)
    
    file_path = os.path.join(user_upload_dir, file.filename)
    with open(file_path, "wb") as f: f.write(await file.read())

    text = pdf_loader.extract_text_from_pdf(file_path)
    chunks = text_splitter.split_text_into_chunks(text)
    chunk_embeddings = embeddings.embed_texts(chunks)
    
    collection = vector_store.get_or_create_collection(user_id)
    metadatas = [{"source": file.filename} for _ in chunks]
    vector_store.store_embeddings(collection, chunks, chunk_embeddings, metadatas, str(uuid.uuid4()))

    supabase.table('documents').insert({"user_id": user_id, "filename": file.filename}).execute()
    return {"message": f"Document '{file.filename}' uploaded successfully."}


@app.get("/documents/")
async def list_documents(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    response = supabase.table('documents').select('filename').eq('user_id', user_id).execute()
    return sorted([item['filename'] for item in response.data]) if response.data else []


@app.delete("/documents/{filename}")
async def delete_document(filename: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    file_path = os.path.join(UPLOAD_DIR, user_id, filename)
    if os.path.exists(file_path): os.remove(file_path)
    
    collection = vector_store.get_or_create_collection(user_id)
    collection.delete(where={"source": filename})
    
    supabase.table('documents').delete().eq('user_id', user_id).eq('filename', filename).execute()
    return {"message": f"Document '{filename}' deleted successfully."}


@app.post("/chat/stream")
async def stream_chat(query: str = Form(...), current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    supabase.table('chat_history').insert({"user_id": user_id, "message": query, "sender": "user"}).execute()

    collection = vector_store.get_or_create_collection(user_id)
    query_embedding = embeddings.embed_texts([query])
    context_chunks = vector_store.retrieve_context(collection, query_embedding)
    
    return StreamingResponse(rag_pipeline.generate_stream(context_chunks, query), media_type="text/event-stream")


@app.post("/generate-quiz")
async def generate_quiz(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    collection = vector_store.get_or_create_collection(user_id)
    context_chunks = collection.get(limit=20)["documents"]
    
    if not context_chunks:
        raise HTTPException(status_code=404, detail="Not enough content to generate a quiz.")
    
    context_str = "\n".join(context_chunks)
    quiz_prompt = f"""
    Based on the following context, generate exactly 3 multiple-choice quiz questions.
    You MUST respond with only a valid JSON object. Do not include any text or formatting before or after the JSON.
    The JSON object should be an array of questions...
    Context:
    {context_str}
    """
    
    full_response = rag_pipeline.generate_non_stream_answer(quiz_prompt)
    
    # --- THIS IS THE NEW, ROBUST PARSING LOGIC ---
    try:
        # Use regex to find the JSON array within the response text
        # This looks for the first '[' and the last ']'
        json_match = re.search(r'\[.*\]', full_response, re.DOTALL)
        
        if not json_match:
            raise ValueError("No valid JSON array found in the LLM response.")
            
        json_str = json_match.group(0)
        quiz_json = json.loads(json_str)
        
        # Log quiz attempt in Supabase database
        supabase.table('quizzes').insert({"user_id": user_id, "score": 0, "total_questions": len(quiz_json)}).execute()
        return quiz_json

    except (json.JSONDecodeError, ValueError) as e:
        print(f"Failed to parse LLM response as JSON. Error: {e}")
        print(f"Original LLM Response:\n---\n{full_response}\n---")
        raise HTTPException(status_code=500, detail="Failed to generate a valid quiz from the model's response.")