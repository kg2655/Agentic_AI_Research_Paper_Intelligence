import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Terminal, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { api } from '../api/client';

export default function ChatDrawer({ isOpen, onClose, initialQuery }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your **Agentic Research Assistant** powered by LangChain and Groq. I can dynamically route queries to specialized tools: **keyword extraction**, **comparative analysis**, or **semantic RAG search**. What would you like to explore today?',
      toolCalls: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      setInput(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.chatWithAgent(query);
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        toolCalls: data.tool_calls || [],
        sources: data.sources || []
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Agent Error:** ${err.message || 'Unable to complete request.'}`,
          toolCalls: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    "Compare Attention Is All You Need vs BERT",
    "Extract the top keywords from Deep Learning for Medical Image Reconstruction",
    "Find literature on few-shot learning"
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              PaperMind AI Agent
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                Tool Routing Active
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">Llama-3.1 + LangChain + FAISS</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Tool execution badge if present */}
            {m.toolCalls && m.toolCalls.length > 0 && (
              <div className="mb-2 w-full space-y-1.5">
                {m.toolCalls.map((tc, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300"
                  >
                    <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
                      <Terminal className="w-3 h-3 text-indigo-400" />
                      <span>Agent Tool Dispatched: `{tc.tool_name}`</span>
                    </div>
                    <div className="text-slate-400 text-[10px] truncate">
                      Args: {JSON.stringify(tc.tool_args)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              className={`max-w-[90%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/80 border border-slate-700/60 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-indigo-400 animate-pulse font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Agent reasoning and dispatching retrieval tools...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/50">
        <div className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-amber-400" /> Quick Agent Workflows:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md border border-slate-700/60 truncate max-w-full text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask agent to search, extract keywords, or compare..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
