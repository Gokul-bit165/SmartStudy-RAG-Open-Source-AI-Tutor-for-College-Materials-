// frontend/src/App.jsx
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import DocumentList from './components/DocumentList';
import ChatBox from './components/ChatBox';
import QuizModal from './components/QuizModal'; // Import the new modal
import { generateQuiz } from './api/api'; // Import the new api function
import { Toaster, toast } from 'sonner';
import { Lightbulb, Loader2 } from 'lucide-react';

const USER_ID = "local-user-01";

function App() {
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const handleUploadSuccess = (filename) => {
    setUploadSuccess(filename + Date.now());
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    toast.loading("Generating your quiz... This may take a moment.");
    try {
      const response = await generateQuiz(USER_ID);
      setQuizData(response.data);
      toast.dismiss();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to generate quiz.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-400">🎓 SmartStudy RAG</h1>
            <p className="text-gray-400 mt-2">Upload your notes, manage your documents, and start asking questions!</p>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-8">
              <FileUpload userId={USER_ID} onUploadSuccess={handleUploadSuccess} />
              
              {/* Quiz Generator Button */}
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-center text-gray-300">Test Your Knowledge</h2>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 disabled:bg-gray-600"
                >
                  {isGeneratingQuiz ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Lightbulb className="mr-2 h-5 w-5" />
                  )}
                  {isGeneratingQuiz ? 'Generating...' : 'Generate Pop Quiz'}
                </button>
              </div>

              <DocumentList userId={USER_ID} onUploadSuccess={uploadSuccess} />
            </div>

            <div className="md:col-span-3">
              <ChatBox userId={USER_ID} />
            </div>
          </main>
        </div>
      </div>
      
      {quizData && <QuizModal quiz={quizData} onClose={() => setQuizData(null)} onRetake={handleGenerateQuiz} />}
    </>
  );
}

export default App;