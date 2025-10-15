// frontend/src/pages/ChatPage.jsx
import React from 'react';
import ChatBox from '../components/ChatBox';

// This component provides the full-page layout for the chat
const ChatPage = ({ session }) => {
  return (
    <div className="p-8 h-full">
      <div className="flex flex-col h-full">
        <h1 className="text-3xl font-bold mb-6 text-white">Chat with your Documents</h1>
        <div className="flex-grow">
          {/* The ChatBox now fills the available space */}
          <ChatBox session={session} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;