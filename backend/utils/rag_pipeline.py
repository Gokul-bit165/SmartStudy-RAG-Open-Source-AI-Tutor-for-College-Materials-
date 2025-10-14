# backend/utils/rag_pipeline.py
import ollama
from typing import List, Generator

def generate_stream(context: List[str], query: str, llm_model: str = "llama3") -> Generator:
    """Generates a streaming response for the chat."""
    context_str = "\n".join(context)
    
    prompt = f"""
    Use the following context to answer the question.
    If the context doesn't contain the answer, say that you couldn't find the relevant information.
    
    Context:
    {context_str}
    
    Question: {query}
    """

    try:
        stream = ollama.chat(
            model=llm_model,
            messages=[{'role': 'user', 'content': prompt}],
            stream=True,
        )
        
        for chunk in stream:
            yield chunk['message']['content']

    except Exception as e:
        print(f"An error occurred while connecting to Ollama: {e}")
        yield (
            "Error: Could not connect to Ollama. "
            "Please make sure the Ollama application is running."
        )

# --- NEW FUNCTION FOR QUIZ GENERATION ---
def generate_non_stream_answer(prompt: str, llm_model: str = "llama3") -> str:
    """Generates a complete, non-streaming response for tasks like quiz generation."""
    try:
        response = ollama.chat(
            model=llm_model,
            messages=[{'role': 'user', 'content': prompt}],
            stream=False, # Ensure streaming is off
        )
        return response['message']['content']
    except Exception as e:
        print(f"An error occurred while connecting to Ollama: {e}")
        return (
            "Error: Could not connect to Ollama. "
            "Please make sure the Ollama application is running."
        )