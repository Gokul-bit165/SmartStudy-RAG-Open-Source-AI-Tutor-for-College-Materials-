// frontend/src/components/ChatBox.jsx
import React, { useState, useRef, useEffect } from 'react';
// Import the new streamQuery function
import { streamQuery } from '../api/api';
import MessageBubble from './MessageBubble';
import { Send, Loader2 } from 'lucide-react';

const ChatBox = ({ userId }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! Ask me anything about your documents.", sender: 'ai', isStreaming: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    // Create an initial, empty AI message that will be populated by the stream
    const aiMessage = { id: Date.now() + 1, text: '', sender: 'ai', isStreaming: true };
    
    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInput('');

    try {
      const response = await streamQuery(userId, input);

      if (!response.body) {
        throw new Error("Response body is null");
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessage.id ? { ...msg, text: msg.text + chunk } : msg
          )
        );
      }

      // Mark the message as finished streaming
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessage.id ? { ...msg, isStreaming: false } : msg
        )
      );

    } catch (error) {
      const errorMessage = {
        id: aiMessage.id, // Replace the empty AI message with an error
        text: "Sorry, I couldn't get a response. Please try again.",
        sender: 'ai',
        isStreaming: false,
      };
      setMessages(prev => prev.map(msg => msg.id === aiMessage.id ? errorMessage : msg));
    } finally {
      setIsLoading(false);
    }
  };

  // ... (keep handleKeyPress function)
  // ... (JSX is almost the same, but pass the isStreaming prop)
  return (
    <div className="flex flex-col h-[70vh] bg-gray-800 rounded-lg border border-gray-700 shadow-xl">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
           <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            // onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-1 p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="1"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;