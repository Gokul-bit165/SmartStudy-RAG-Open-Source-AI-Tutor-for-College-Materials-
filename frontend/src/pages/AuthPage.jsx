// frontend/src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Toaster, toast } from 'sonner';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Please check your email to verify.');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-5xl font-bold text-blue-400 mb-4 animate-fade-in">🎓 SmartStudy RAG</h1>
          <p className="text-gray-400 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {isLogin ? 'Log in to continue' : 'Create an account to get started'}
          </p>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-2xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-2xl font-semibold text-white mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <form onSubmit={handleAuth}>
              {!isLogin && (
                <div className="mb-4">
                  <input type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <div className="mb-4">
                <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-6">
                <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors duration-300 disabled:bg-gray-600">
                {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
              </button>
            </form>
            <p className="text-gray-500 text-sm mt-6">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:underline ml-1">
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;