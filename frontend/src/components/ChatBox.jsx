// frontend/src/components/ChatBox.jsx
import React, { useState, useRef, useEffect } from 'react';
import { streamQuery } from '../api/api';
import { supabase } from '../supabaseClient';
import MessageBubble from './MessageBubble';
import { Send, Loader2 } from 'lucide-react';

const ChatBox = ({ session }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // --- CORRECTED: Load chat history ---
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      // Explicitly select the correct columns
      const { data, error } = await supabase
        .from('chat_history')
        .select('id, message, sender') 
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching chat history:", error);
      } else {
        const formattedHistory = data.map(item => ({
          id: item.id,
          text: item.message,
          sender: item.sender,
          isStreaming: false,
        }));
        setMessages(formattedHistory);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [session]);

  useEffect(scrollToBottom, [messages]);

  // --- CORRECTED: Handle sending and saving messages ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessageText = input;
    setInput('');
    
    const userMessageForUI = { id: Date.now(), text: userMessageText, sender: 'user' };
    const aiMessageForUI = { id: Date.now() + 1, text: '', sender: 'ai', isStreaming: true };
    setMessages(prev => [...prev, userMessageForUI, aiMessageForUI]);
    
    // Save the user's message to the database with the correct schema
    await supabase.from('chat_history').insert({
      user_id: session.user.id,
      message: userMessageText, // Use 'message' column
      sender: 'user',           // Use 'sender' column
    });

    try {
      const response = await streamQuery(userMessageText);
      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullResponseText += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageForUI.id ? { ...msg, text: fullResponseText } : msg
          )
        );
      }

      // Save the final AI response to the database with the correct schema
      await supabase.from('chat_history').insert({
        user_id: session.user.id,
        message: fullResponseText, // Use 'message' column
        sender: 'ai',           // Use 'sender' column
      });
      
      // Update the final message in the UI and refetch history to get proper DB IDs
      const { data: newHistory } = await supabase.from('chat_history').select('id, message, sender').eq('user_id', session.user.id).order('created_at', { ascending: true });
      setMessages(newHistory.map(item => ({ id: item.id, text: item.message, sender: item.sender, isStreaming: false })));

    } catch (error) {
      console.error("Error during streaming or saving AI response:", error);
      // Optionally remove the optimistic messages on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessageForUI.id && msg.id !== aiMessageForUI.id));
    }
  };
  
  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg border border-gray-700 shadow-xl">
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>
        ) : (
          messages.length > 0 
            ? messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
            : <div className="flex h-full items-center justify-center text-gray-500">Your chat history is empty.</div>
        )}
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
           <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask a question..." className="flex-1 p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows="1" disabled={isLoading} />
           <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"><Send className="h-5 w-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;