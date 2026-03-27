'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Globe, Loader2, ChevronDown, Trash2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
}

interface CopilotCapabilities {
  status: string;
  languages: string[];
  suggested_prompts: {
    en: string[];
    hi: string[];
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const COPILOT_API = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [capabilities, setCapabilities] = useState<CopilotCapabilities | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [pulseCount, setPulseCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initial pulse animation for the chat bubble
  useEffect(() => {
    if (pulseCount < 3) {
      const timer = setTimeout(() => setPulseCount(p => p + 1), 5000);
      return () => clearTimeout(timer);
    }
  }, [pulseCount]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      // Load capabilities on first open
      if (!capabilities) {
        loadCapabilities();
      }
    }
  }, [isOpen]);

  const loadCapabilities = async () => {
    try {
      const res = await fetch(`${COPILOT_API}/copilot/capabilities`);
      if (res.ok) {
        const data = await res.json();
        setCapabilities(data);
      }
    } catch {
      // Capabilities endpoint optional
    }
  };

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    try {
      const res = await fetch(`${COPILOT_API}/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
          language,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Connection failed' }));
        throw new Error(errorData.detail || `Error ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        language: data.language,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `⚠️ ${err.message || 'Unable to reach AI Copilot. Please check if the backend is running.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, language]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  const suggestedPrompts = language === 'hi'
    ? capabilities?.suggested_prompts?.hi || [
      'सभी डैशबोर्ड का सारांश दो',
      'threshold gaming पैटर्न समझाओ',
      'किन क्षेत्रों को ऑडिट की ज़रूरत है?',
    ]
    : capabilities?.suggested_prompts?.en || [
      'Give me a summary of all dashboards',
      'Explain the threshold gaming pattern',
      'Which areas need immediate audit?',
    ];

  // Render markdown-light formatting
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li key={i} className="ml-4 list-disc text-sm" dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
        );
      }
      // Numbered lists
      const numMatch = line.match(/^(\d+)\.\s/);
      if (numMatch) {
        return (
          <li key={i} className="ml-4 list-decimal text-sm" dangerouslySetInnerHTML={{ __html: formatted.slice(numMatch[0].length) }} />
        );
      }
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={i} className="font-bold text-sm mt-2 mb-1">{line.slice(4)}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} className="font-bold text-base mt-2 mb-1">{line.slice(3)}</h3>;
      }
      // Empty line = paragraph break
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i} className="text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════
          FLOATING CHAT BUBBLE
          ═══════════════════════════════════════════════ */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open AI Copilot"
        >
          <div className="relative">
            {/* Pulse rings */}
            {pulseCount < 3 && (
              <>
                <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20" />
                <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-10" style={{ animationDelay: '500ms' }} />
              </>
            )}
            {/* Main button */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-full shadow-xl shadow-blue-500/25 flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40">
              <Bot className="h-7 w-7 text-white" />
            </div>
            {/* Label */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Sparkles className="h-3 w-3 inline mr-1" />
              AI Investigation Copilot
              <div className="absolute top-full right-4 w-2 h-2 bg-slate-900 rotate-45 -translate-y-1" />
            </div>
          </div>
        </button>
      )}

      {/* ═══════════════════════════════════════════════
          CHAT PANEL
          ═══════════════════════════════════════════════ */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)] h-[620px] max-h-[calc(100vh-120px)] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* ── Header ──────────────────────────── */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                <Bot className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  SatyaSetu AI
                  <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded-full font-medium">
                    LIVE
                  </span>
                </h3>
                <p className="text-blue-300 text-[11px]">
                  Investigation Copilot · {language === 'hi' ? 'हिन्दी' : 'English'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Language toggle */}
              <button
                onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-blue-300 hover:text-white"
                title="Switch language"
              >
                <Globe className="h-4 w-4" />
              </button>
              {/* Clear chat */}
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-blue-300 hover:text-white"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-blue-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Messages ──────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-base mb-1">
                  {language === 'hi' ? 'नमस्ते! मैं सत्यसेतु AI हूँ' : 'Hello! I\'m SatyaSetu AI'}
                </h4>
                <p className="text-gray-500 text-xs max-w-[280px] mx-auto mb-1">
                  {language === 'hi'
                    ? 'मैं शासन डेटा का विश्लेषण करने में आपकी मदद कर सकता हूँ। कोई भी सवाल पूछें!'
                    : 'I can help you investigate governance data across Fiscal, Procurement & Welfare dashboards.'}
                </p>
                <p className="text-[10px] text-gray-400 mb-4">Powered by Llama 3 · Live Database</p>
              </div>
            )}

            {/* Suggested prompts */}
            {showSuggestions && messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                  {language === 'hi' ? 'सुझाए गए प्रश्न' : 'Suggested Questions'}
                </p>
                {suggestedPrompts.slice(0, 5).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all hover:shadow-sm group"
                  >
                    <span className="text-blue-500 mr-2 group-hover:text-blue-600">→</span>
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                }`}>
                  {msg.role === 'user'
                    ? <User className="h-3.5 w-3.5 text-white" />
                    : <Bot className="h-3.5 w-3.5 text-white" />
                  }
                </div>
                {/* Message bubble */}
                <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}>
                  <div className={`space-y-0.5 leading-relaxed ${
                    msg.role === 'user' ? 'text-sm' : ''
                  }`}>
                    {msg.role === 'user'
                      ? <p className="text-sm">{msg.content}</p>
                      : renderContent(msg.content)
                    }
                  </div>
                  <p className={`text-[10px] mt-1.5 ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.language && msg.role === 'assistant' && (
                      <span className="ml-1.5">· {msg.language === 'hi' ? 'हिन्दी' : 'EN'}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    <span className="text-sm text-gray-500">
                      {language === 'hi' ? 'विश्लेषण कर रहा हूँ...' : 'Analyzing data...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area ──────────────────────────── */}
          <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={language === 'hi' ? 'कोई भी सवाल पूछें...' : 'Ask anything about the data...'}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-300 transition-all max-h-24"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '40px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                  input.trim() && !loading
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-lg hover:scale-105'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              SatyaSetu AI · Powered by Groq · Policy-safe language
            </p>
          </div>
        </div>
      )}
    </>
  );
}
