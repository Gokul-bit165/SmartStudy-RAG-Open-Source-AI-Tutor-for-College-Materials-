// frontend/src/App.jsx
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import DocumentList from './components/DocumentList';
import ChatBox from './components/ChatBox';

const USER_ID = "local-user-01";

function App() {
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const handleUploadSuccess = (filename) => {
    // This state update will trigger the DocumentList to refresh
    setUploadSuccess(filename + Date.now()); // Add timestamp to ensure it's a new value
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl"> {/* Increased max-width for better layout */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400">🎓 SmartStudy RAG</h1>
          <p className="text-gray-400 mt-2">Upload your notes, manage your documents, and start asking questions!</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Left Column: File Management */}
          <div className="md:col-span-2 space-y-8">
            <FileUpload userId={USER_ID} onUploadSuccess={handleUploadSuccess} />
            <DocumentList userId={USER_ID} onUploadSuccess={uploadSuccess} />
          </div>

          {/* Right Column: Chat Interface */}
          <div className="md:col-span-3">
            <ChatBox userId={USER_ID} />
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;