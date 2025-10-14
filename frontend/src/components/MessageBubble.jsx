// frontend/src/components/MessageBubble.jsx
import React from 'react';
import { Bot, User } from 'lucide-react';

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
        <p className="text-white whitespace-pre-wrap">{message.text}</p>
        {!isUser && message.context && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <h4 className="text-xs font-bold text-gray-400 mb-2">Sources:</h4>
            <div className="space-y-2">
              {message.context.slice(0, 2).map((ctx, index) => (
                <div key={index} className="p-2 bg-gray-800 rounded-md text-xs text-gray-400 truncate">
                  "{ctx}"
                </div>
              ))}
            </div>
          </div>
        )}
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