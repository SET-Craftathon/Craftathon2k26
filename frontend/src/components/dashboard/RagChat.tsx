'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Loader2, ArrowRight, Plus, Clock as ClockIcon, History, ShieldAlert, Database } from 'lucide-react';
import clsx from 'clsx';
import { useAppStore } from '@/store/useAppStore';
import ReportModal, { ReportData } from './ReportModal';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface Thread {
  threadId: string;
  title: string;
  updatedAt: string;
}

export default function RagChat() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isFetchingReport, setIsFetchingReport] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const { token } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/chat/threads', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.status === 'success') {
          setThreads(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch threads:', err);
      }
    };
    if (token) fetchThreads();
  }, [token]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentThreadId) {
        setMessages([{
          id: 'welcome',
          type: 'assistant',
          content: 'I am your Government Intelligence Assistant. Please ask any questions regarding recent public incident reports, metrics, or guidelines.'
        }]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/admin/chat/threads/${currentThreadId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.status === 'success') {
          const mapped = json.data.map((m: any) => ({
            id: m._id,
            type: m.role,
            content: m.content,
            sources: m.sources
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchMessages();
  }, [currentThreadId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const tempUserId = Date.now().toString();
    
    setMessages(prev => [...prev, { id: tempUserId, type: 'user', content: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/admin/chat/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          question: userText,
          threadId: currentThreadId
        })
      });

      const data = await res.json();
      
      if (data.status === 'success') {
         if (!currentThreadId) {
           setCurrentThreadId(data.data.threadId);
           const tRes = await fetch('http://localhost:5000/api/admin/chat/threads', {
             headers: { Authorization: `Bearer ${token}` }
           });
           const tJson = await tRes.json();
           if (tJson.status === 'success') setThreads(tJson.data);
         }

         const assistantMsg: Message = {
           id: data.data.messageId,
           type: 'assistant',
           content: data.data.answer,
           sources: data.data.sources
         };
         setMessages(prev => [...prev, assistantMsg]);
      } else {
         throw new Error(data.message || 'Failed to fetch AI response');
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        type: 'assistant',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferenceClick = async (reportId: string) => {
    if (isFetchingReport) return;
    setIsFetchingReport(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/dashboard/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.status === 'success') {
        setSelectedReport(json.data);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setIsFetchingReport(false);
    }
  };

  return (
    <div className="w-full flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 font-sans pb-6">
      
      {/* Session Sidebar */}
      <motion.div 
        animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white rounded-xl shadow-sm flex flex-col overflow-hidden border border-gray-200"
      >
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <History size={16} className="text-gray-400" /> Chat History
          </h3>
          <button 
            onClick={() => setCurrentThreadId(null)}
            className="p-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            title="Start New Session"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {threads.map(thread => (
            <button
              key={thread.threadId}
              onClick={() => setCurrentThreadId(thread.threadId)}
              className={clsx(
                "w-full text-left p-4 rounded-lg transition-colors flex flex-col gap-1.5",
                currentThreadId === thread.threadId 
                  ? "bg-blue-50 border border-blue-100 text-blue-900" 
                  : "bg-white border border-transparent hover:bg-gray-50 text-gray-700"
              )}
            >
              <span className="text-sm font-medium tracking-tight truncate">
                {thread.title}
              </span>
              <div className="flex items-center gap-1.5 opacity-60">
                <ClockIcon size={12} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-500">
                  {new Date(thread.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col relative overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="px-8 py-5 flex items-center justify-between border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-sm">
               <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                {currentThreadId ? threads.find(t => t.threadId === currentThreadId)?.title : 'New Inquiry'}
              </h2>
              <p className="text-xs text-gray-500 font-medium">GovPortal Secure Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <button
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const res = await fetch('http://localhost:5000/api/admin/chat/embed', {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    const text = await res.text();
                    console.log('Sync response:', text);
                    alert('Data sync completed successfully!');
                  } catch (err) {
                    console.error('Failed to sync:', err);
                    alert('Data sync failed.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="px-4 h-10 flex items-center justify-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                title="Sync Reports Database"
             >
                <Database size={16} className={isLoading ? "animate-pulse" : ""} />
                Sync Data
             </button>
             <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle History"
             >
                <History size={20} />
             </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 flex flex-col scroll-smooth bg-white">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  "flex gap-4 max-w-3xl",
                  msg.type === 'user' ? "ml-auto" : "mr-auto"
                )}
              >
                {msg.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <ShieldAlert size={16} />
                  </div>
                )}
                
                <div className="flex flex-col gap-2 min-w-0">
                   <div className={clsx(
                     "px-5 py-4 rounded-2xl text-sm leading-relaxed border shadow-sm",
                     msg.type === 'user' 
                       ? "bg-blue-900 text-white border-blue-900 rounded-tr-sm" 
                       : "bg-gray-50 text-gray-800 border-gray-200 rounded-tl-sm"
                   )}>
                     {msg.content.split('\n').map((line, i) => (
                       <span key={i} className="block mb-2 last:mb-0 break-words">
                         {line.includes('**') ? (
                            line.split('**').map((p, idx) => idx % 2 === 1 
                              ? <strong key={idx} className="font-semibold text-gray-900">{p}</strong> 
                              : p)
                         ) : line}
                       </span>
                     ))}
                   </div>
                   
                   {msg.sources && msg.sources.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-1">
                       {msg.sources.map(src => (
                         <button 
                           key={src} 
                           onClick={() => handleReferenceClick(src)}
                           disabled={isFetchingReport}
                           className="px-3 py-1.5 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-md text-xs font-medium text-gray-600 hover:text-blue-700 transition-colors flex items-center gap-1.5"
                         >
                           <ArrowRight size={10} />
                           REF: {String(src).slice(0, 8).toUpperCase()}
                         </button>
                       ))}
                     </div>
                   )}
                </div>

                {msg.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 border border-gray-200 flex items-center justify-center shrink-0 mt-1">
                    <User size={16} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-1">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-sm text-gray-500 text-sm font-medium animate-pulse">
                Analyzing records...
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="relative w-full max-w-4xl mx-auto flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1 bg-gray-50 border border-gray-300 focus:bg-white rounded-lg py-3 px-5 text-sm font-medium text-gray-900 transition-all outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={clsx(
                "w-12 h-12 rounded-lg flex items-center justify-center transition-colors shrink-0",
                input.trim() ? "bg-blue-900 text-white hover:bg-blue-800 shadow-sm focus:ring-2 focus:ring-blue-900 focus:ring-offset-2" : "bg-gray-100 text-gray-400"
              )}
            >
              <Send size={18} className="translate-x-[1px]" />
            </button>
          </form>
        </div>
      </div>

      {selectedReport && <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
      
      {isFetchingReport && (
        <div className="fixed inset-0 z-[100] bg-gray-900/20 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white px-8 py-6 rounded-xl shadow-lg flex items-center gap-4">
               <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
               <span className="text-sm font-medium text-gray-700">Retrieving document...</span>
            </div>
        </div>
      )}
    </div>
  );
}
