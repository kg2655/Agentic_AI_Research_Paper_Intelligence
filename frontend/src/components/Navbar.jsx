import React from 'react';
import { BookOpen, Network, Bot, PlusCircle, Database, Cpu } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenUpload, onOpenChat }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">PaperMind AI</span>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
                Agentic v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Fullstack Research Discovery & Agentic Intelligence Platform
            </p>
          </div>
        </div>

        {/* Stack Badges (Highlights JD Technologies) */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-1 rounded text-emerald-400 flex items-center gap-1">
            <Cpu className="w-3 h-3" /> FastAPI
          </span>
          <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-1 rounded text-cyan-400">
            ReactJS
          </span>
          <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-1 rounded text-blue-400 flex items-center gap-1">
            <Database className="w-3 h-3" /> PostgreSQL
          </span>
          <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-1 rounded text-rose-400">
            Celery+Redis
          </span>
          <span className="bg-slate-800/80 border border-slate-700/60 px-2 py-1 rounded text-amber-400">
            Neo4j
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Tab switchers */}
          <button
            onClick={() => setActiveTab('papers')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'papers'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Papers</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'graph'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Citation Graph</span>
          </button>

          {/* New Ingest */}
          <button
            onClick={onOpenUpload}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/70 flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Ingest Paper</span>
          </button>

          {/* AI Agent Chat Trigger */}
          <button
            onClick={onOpenChat}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>AI Agent</span>
          </button>
        </div>

      </div>
    </header>
  );
}
