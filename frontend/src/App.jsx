// frontend/src/App.jsx
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChatBox from './components/ChatBox';

// A hardcoded user ID for demonstration purposes
const USER_ID = "local-user-01";

function App() {
  const [lastUpload, setLastUpload] = useState(null);

  const handleUploadSuccess = (filename) => {
    // This state update can be used to trigger a refresh or show a notification
    setLastUpload(filename);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400">🎓 SmartStudy RAG</h1>
          <p className="text-gray-400 mt-2">Your AI-powered study partner. Upload your notes and start asking questions!</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: File Upload */}
          <div className="md:col-span-1">
            <FileUpload userId={USER_ID} onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Right Column: Chat Interface */}
          <div className="md:col-span-2">
            <ChatBox userId={USER_ID} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;