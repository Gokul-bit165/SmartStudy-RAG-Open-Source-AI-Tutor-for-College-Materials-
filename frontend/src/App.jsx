// frontend/src/App.jsx

// --- IMPORTS ---
import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { MessageSquare, BarChart2, User, LogOut, BookOpen, Settings, Lightbulb, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage'; // Import our new ChatPage

// --- IMPORTS FOR THE MANAGE DOCS PAGE ---
import FileUpload from './components/FileUpload';
import DocumentList from './components/DocumentList';
import QuizModal from './components/QuizModal';
import { generateQuiz } from './api/api';

// --- Rename RagDashboard to ManageDocsPage for clarity ---
const ManageDocsPage = ({ session }) => {
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const handleUploadSuccess = (filename) => setUploadSuccess(filename + Date.now());

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    toast.loading("Generating your quiz...");
    try {
      const response = await generateQuiz();
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
    setTimeout(() => handleGenerateQuiz(), 100);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Manage Documents</h1>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
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
        </div>
        <div>
          <DocumentList onUploadSuccess={uploadSuccess} />
        </div>
      </main>
      {quizData && (
        <QuizModal
          quiz={quizData}
          onClose={() => setQuizData(null)}
          onRetake={handleRetakeQuiz}
        />
      )}
    </div>
  );
};

// --- ReportsDashboard and ProfilePage remain the same ---
const ReportsDashboard = ({ session }) => {
  const [stats, setStats] = useState({ documents: 0, questions: 0, quizzes: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: docCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
      const { count: questionCount } = await supabase.from('chat_history').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
      const { count: quizCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
      setStats({ documents: docCount || 0, questions: questionCount || 0, quizzes: quizCount || 0 });
    };
    fetchStats();
  }, [session]);

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Your Activity Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-blue-400">Documents Uploaded</h3>
          <p className="text-4xl font-bold mt-2">{stats.documents}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-blue-400">Questions Asked</h3>
          <p className="text-4xl font-bold mt-2">{stats.questions}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-blue-400">Quizzes Taken</h3>
          <p className="text-4xl font-bold mt-2">{stats.quizzes}</p>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ session }) => {
  const [profile, setProfile] = useState({ full_name: 'Loading...', email: session.user.email });
  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single();
      if (data) setProfile({ ...profile, full_name: data.full_name });
    };
    fetchProfile();
  }, [session]);
  
  return (
   <div className="p-8 text-white max-w-2xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Manage Profile</h1>
    <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
      <div className="mb-4">
        <label className="block text-gray-400 mb-2">Name</label>
        <input
          type="text"
          value={profile.full_name}
          onChange={(e) => setProfile({...profile, full_name: e.target.value})}
          className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 mb-2">Email</label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="w-full p-3 bg-gray-900 rounded-md text-gray-400"
        />
      </div>
      <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save Changes</button>
    </div>
   </div>
  );
};

// --- The Main App Component ---
function App() {
  const [session, setSession] = useState(null);
  // Default to the new Chat page
  const [currentPage, setCurrentPage] = useState('chat');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <AuthPage />;
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-gray-900 text-white flex">
        <nav className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
          <div className="mb-8 flex items-center">
            <BookOpen className="h-8 w-8 text-blue-400 mr-2" />
            <h1 className="text-xl font-bold">SmartStudy</h1>
          </div>
          <ul className="space-y-2">
            {/* --- UPDATED NAVIGATION --- */}
            <NavItem icon={<MessageSquare size={20} />} label="Chat" active={currentPage === 'chat'} onClick={() => setCurrentPage('chat')} />
            <NavItem icon={<BookOpen size={20} />} label="Manage Documents" active={currentPage === 'docs'} onClick={() => setCurrentPage('docs')} />
            <NavItem icon={<BarChart2 size={20} />} label="Reports" active={currentPage === 'reports'} onClick={() => setCurrentPage('reports')} />
            <NavItem icon={<User size={20} />} label="Profile" active={currentPage === 'profile'} onClick={() => setCurrentPage('profile')} />
          </ul>
          <div className="mt-auto">
            <NavItem icon={<Settings size={20} />} label="Settings" />
            <NavItem icon={<LogOut size={20} />} label="Logout" onClick={() => supabase.auth.signOut()} />
          </div>
        </nav>
        {/* --- UPDATED MAIN CONTENT ROUTING --- */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'chat' && <ChatPage session={session} />}
          {currentPage === 'docs' && <ManageDocsPage session={session} />}
          {currentPage === 'reports' && <ReportsDashboard session={session} />}
          {currentPage === 'profile' && <ProfilePage session={session} />}
        </main>
      </div>
    </>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick();
      }}
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