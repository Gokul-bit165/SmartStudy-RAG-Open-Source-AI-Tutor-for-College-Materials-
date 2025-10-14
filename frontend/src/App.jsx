// frontend/src/App.jsx

// --- IMPORTS FOR THE ENTIRE APP ---
import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { MessageSquare, BarChart2, User, LogIn, BookOpen, Settings, Lightbulb, Loader2 } from 'lucide-react';

// --- IMPORTS FOR THE RAG DASHBOARD PAGE ---
import FileUpload from './components/FileUpload';
import DocumentList from './components/DocumentList';
import ChatBox from './components/ChatBox';
import QuizModal from './components/QuizModal';
import { generateQuiz } from './api/api';


// --- PAGE COMPONENTS ---

const LoginPage = ({ onLogin }) => (
  <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
    <div className="w-full max-w-md text-center">
      <h1 className="text-5xl font-bold text-blue-400 mb-4 animate-fade-in">🎓 SmartStudy RAG</h1>
      <p className="text-gray-400 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        Log in to unlock your AI-powered study partner.
      </p>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-2xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-2xl font-semibold text-white mb-6">Welcome Back</h2>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="mb-4">
            <input type="email" placeholder="Email" required className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-6">
            <input type="password" placeholder="Password" required className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors duration-300">
            Log In
          </button>
        </form>
        <p className="text-gray-500 text-sm mt-6">
          Don't have an account? <a href="#" className="text-blue-400 hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  </div>
);

// --- vvv THIS IS THE FULLY INTEGRATED COMPONENT vvv ---
const RagDashboard = () => {
  const USER_ID = "local-user-01";

  // State and logic are now encapsulated within this "page" component
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
  
  const handleRetakeQuiz = () => {
    setQuizData(null);
    setTimeout(() => {
        handleGenerateQuiz();
    }, 100);
  };

  return (
    <>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Study Session</h1>
        <main className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Column with real components */}
          <div className="md:col-span-2 space-y-8">
            <FileUpload userId={USER_ID} onUploadSuccess={handleUploadSuccess} />
            
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-center text-gray-300">Test Your Knowledge</h2>
              <button
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 disabled:bg-gray-600"
              >
                {isGeneratingQuiz ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lightbulb className="mr-2 h-5 w-5" />}
                {isGeneratingQuiz ? 'Generating...' : 'Generate Pop Quiz'}
              </button>
            </div>

            <DocumentList userId={USER_ID} onUploadSuccess={uploadSuccess} />
          </div>

          {/* Right Column with real ChatBox */}
          <div className="md:col-span-3">
            <ChatBox userId={USER_ID} />
          </div>
        </main>
      </div>
      
      {/* The Quiz Modal, controlled by this page's state */}
      {quizData && <QuizModal quiz={quizData} onClose={() => setQuizData(null)} onRetake={handleRetakeQuiz} />}
    </>
  );
};

const ReportsDashboard = () => (
  <div className="p-8 text-white">
    <h1 className="text-3xl font-bold mb-6">Your Activity Reports</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-blue-400">Documents Uploaded</h3>
        <p className="text-4xl font-bold mt-2">12</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-blue-400">Questions Asked</h3>
        <p className="text-4xl font-bold mt-2">84</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-blue-400">Quizzes Taken</h3>
        <p className="text-4xl font-bold mt-2">7</p>
      </div>
    </div>
  </div>
);

const ProfilePage = () => (
   <div className="p-8 text-white max-w-2xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Manage Profile</h1>
     <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
        <div className="mb-4">
            <label className="block text-gray-400 mb-2">Name</label>
            <input type="text" defaultValue="Gokul" className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
         <div className="mb-4">
            <label className="block text-gray-400 mb-2">Email</label>
            <input type="email" defaultValue="gokul@example.com" className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save Changes</button>
    </div>
  </div>
);


// --- The Main App Component (Router) ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('rag'); // 'rag', 'reports', 'profile'

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }
  
  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-gray-900 text-white flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
          <div className="mb-8 flex items-center">
             <BookOpen className="h-8 w-8 text-blue-400 mr-2" />
             <h1 className="text-xl font-bold">SmartStudy</h1>
          </div>
          <ul className="space-y-2">
            <NavItem icon={<MessageSquare size={20} />} label="Study Session" active={currentPage === 'rag'} onClick={() => setCurrentPage('rag')} />
            <NavItem icon={<BarChart2 size={20} />} label="Reports" active={currentPage === 'reports'} onClick={() => setCurrentPage('reports')} />
            <NavItem icon={<User size={20} />} label="Profile" active={currentPage === 'profile'} onClick={() => setCurrentPage('profile')} />
          </ul>
          <div className="mt-auto">
            <NavItem icon={<Settings size={20} />} label="Settings" />
            <NavItem icon={<LogIn size={20} />} label="Logout" onClick={() => setIsLoggedIn(false)} />
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'rag' && <RagDashboard />}
          {currentPage === 'reports' && <ReportsDashboard />}
          {currentPage === 'profile' && <ProfilePage />}
        </main>
      </div>
    </>
  );
}

// Helper component for sidebar items
const NavItem = ({ icon, label, active, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center p-3 rounded-md transition-colors duration-200 ${
        active ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="ml-4">{label}</span>
    </a>
  </li>
);

export default App;