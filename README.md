# 🎓 SmartStudy RAG

This is a full-stack AI web application that allows users to upload their college materials (PDFs, notes, slides) and chat with them using a Retrieval-Augmented Generation (RAG) pipeline powered entirely by open-source tools.

## 🏗️ System Architecture

-   **Frontend:** React (Vite) + TailwindCSS
-   **Backend:** FastAPI (Python)
-   **LLM:** Local model (e.g., Llama 3, Mistral) served via [Ollama](https://ollama.com/)
-   **Embeddings:** `sentence-transformers/all-MiniLM-L6-v2`
-   **Vector Store:** ChromaDB

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

-   **Python 3.8+** and `pip`
-   **Node.js 18+** and `npm`
-   **Ollama:** Make sure you have Ollama installed and running. Download it from [ollama.com](https://ollama.com/).

### 2. Install an LLM Model

After installing Ollama, pull a model to use for generation. We recommend `llama3` (8B) or `mistral`.

```bash
# Pull the Llama 3 8B model (recommended)
ollama pull llama3

# Or pull the Mistral model
ollama pull mistral
```

### 3. Backend Setup

Navigate to the `backend` directory and set up the Python environment.

```bash
# Go to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# Install the required packages
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app:app --reload
```

The backend API will now be running at `http://127.0.0.1:8000`.

### 4. Frontend Setup

Open a new terminal, navigate to the `frontend` directory, and set up the React app.

```bash
# Go to the frontend directory
cd frontend

# Install npm packages
npm install

# Run the development server
npm run dev
```

The frontend will now be available at `http://localhost:5173` (or another port if 5173 is in use).

### 5. How to Use

1.  Open your browser to the frontend URL (`http://localhost:5173`).
2.  Drag and drop a PDF file into the upload area. You'll see notifications for the upload progress.
3.  Once the file is processed, you can start asking questions in the chatbox on the right.
4.  The AI will use the content from your uploaded documents to answer your questions.

Enjoy your new AI-powered study partner!