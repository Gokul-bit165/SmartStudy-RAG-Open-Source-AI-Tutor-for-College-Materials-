# backend/utils/rag_pipeline.py
import subprocess
from typing import List

def generate_answer(context: List[str], query: str, llm_model: str = "llama3") -> str:
    """Generates an answer using a local LLM with the provided context and query."""
    
    context_str = "\n".join(context)
    
    # Simple and clear prompt template
    prompt = f"""
    You are a helpful AI assistant for students. Use the following context to answer the question.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    
    Context:
    {context_str}
    
    Question: {query}
    
    Answer:
    """

    try:
        # Using ollama run command
        command = ["ollama", "run", llm_model, prompt]
        
        # Execute the command
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        
        # The output from the LLM is in result.stdout
        return result.stdout.strip()

    except FileNotFoundError:
        return "Error: 'ollama' command not found. Make sure Ollama is installed and in your PATH."
    except subprocess.CalledProcessError as e:
        return f"Error executing Ollama: {e.stderr}"
    except Exception as e:
        return f"An unexpected error occurred: {str(e)}"