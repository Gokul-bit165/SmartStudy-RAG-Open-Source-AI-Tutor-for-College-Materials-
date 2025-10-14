// frontend/src/components/MessageBubble.jsx
import React from 'react';
import { Bot, User } from 'lucide-react';

const BlinkingCursor = () => (
  <span className="inline-block w-2 h-5 bg-white animate-blink" />
);

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <Bot size={20} />
        </div>
      )}
      
      <div className={`p-3 rounded-lg max-w-xl ${isUser ? 'bg-blue-600' : 'bg-gray-700'}`}>
        <p className="text-white whitespace-pre-wrap">
            {message.text}
            {message.isStreaming && <BlinkingCursor />}
        </p>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <User size={20} />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;