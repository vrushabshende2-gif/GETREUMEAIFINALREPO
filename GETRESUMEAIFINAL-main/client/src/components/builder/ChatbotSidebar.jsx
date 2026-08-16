import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import useResumeStore from '../../store/useResumeStore';
import axios from 'axios';

// Auth token is in an httpOnly cookie — sent automatically via withCredentials.
axios.defaults.withCredentials = true;

const ChatbotSidebar = ({ isOpen, onClose }) => {
  const { currentResumeData, setResumeData } = useResumeStore();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your AI Builder assistant. I have direct write permissions to edit your resume.\n\nTry telling me:\n- \"Add TypeScript, React, and AWS to my skills\"\n- \"Draft a professional summary for a Senior Frontend Developer\"\n- \"Update my work history to include a 25% query speedup metric\""
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chatEndRef = useRef(null);

  // Auto scroll to chat end
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (!isOpen) return null;

  const handleSend = async (customMessage) => {
    const textToSend = customMessage || inputVal;
    if (!textToSend.trim() || isSending) return;

    // Append user message
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setInputVal('');
    setIsSending(true);
    setErrorMsg('');

    // Format history context for backend
    const contextHistory = messages.map(m => ({
      role: m.role,
      content: m.text
    }));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/chatbot`,
        {
          resumeData: currentResumeData,
          message: textToSend,
          history: contextHistory.slice(-6) // last 6 messages
        }
        // No Authorization header needed — httpOnly cookie is sent automatically
      );

      const { updatedResumeData, message } = response.data;

      // Update Resume Store (overwriting resumeData coordinates!)
      if (updatedResumeData) {
        setResumeData(updatedResumeData);
      }

      // Append assistant's answer
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: message || 'I have completed your request, but no modifications were made.' }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMsg('Failed to process. Please check if server is running.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const prebuiltPrompts = [
    "Format experiences with Google ABC metrics",
    "Add AWS, Docker, Git to my skills",
    "Suggest a professional summary",
    "Refine project bullets"
  ];

  return (
    <div className="fixed top-0 right-0 z-[70] h-screen w-[380px] sm:w-[420px] bg-white border-l border-black/5 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-16 px-6 border-b border-black/5 flex items-center justify-between bg-stone-50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-black">AI Resume Chatbot</h3>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Assistant Mode</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="h-8 w-8 rounded-lg border border-black/5 flex items-center justify-center hover:bg-stone-105 active:scale-95 transition-all text-stone-400 hover:text-black cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Chat Messages Panel */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-hide">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse text-right' : 'text-left'}`}
          >
            <div className={`h-8 w-8 rounded-full border border-black/5 flex items-center justify-center shrink-0 shadow-sm ${
              m.role === 'user' ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-500'
            }`}>
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            
            <div className={`rounded-2xl p-4 text-xs font-semibold leading-relaxed shadow-sm whitespace-pre-line ${
              m.role === 'user' 
                ? 'bg-orange-500 text-white rounded-tr-none' 
                : 'bg-stone-50 border border-black/[0.03] text-stone-700 rounded-tl-none font-bold'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex gap-3 max-w-[85%] text-left">
            <div className="h-8 w-8 rounded-full bg-stone-100 border border-black/5 flex items-center justify-center text-stone-400 shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-stone-50 border border-black/[0.03] rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
              <Loader2 className="animate-spin text-orange-500" size={14} />
              <span className="text-xs font-bold text-stone-400">Rewriting resume sections...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length === 1 && (
        <div className="px-6 py-3 border-t border-black/[0.02] bg-stone-50/50">
          <p className="text-[10px] uppercase tracking-wider font-extrabold text-stone-400 mb-2 flex items-center gap-1">
            <Sparkles size={10} className="text-orange-500" /> Quick Commands
          </p>
          <div className="flex flex-wrap gap-2">
            {prebuiltPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="text-[10px] font-bold text-stone-500 border border-black/5 hover:border-orange-500/30 hover:bg-orange-50/50 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <div className="p-6 border-t border-black/5 flex flex-col gap-3 bg-stone-50">
        {errorMsg && (
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}
        <div className="relative">
          <input
            type="text"
            placeholder="Type an editing instruction..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="w-full rounded-2xl border border-black/10 bg-white pl-4 pr-12 py-3.5 text-xs font-bold focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-black disabled:opacity-70"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || isSending}
            className="absolute right-2 top-2 h-8 w-8 rounded-xl bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotSidebar;
