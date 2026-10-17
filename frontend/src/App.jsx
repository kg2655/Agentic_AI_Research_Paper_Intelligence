import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import PaperCard from './components/PaperCard';
import ChatDrawer from './components/ChatDrawer';
import GraphView from './components/GraphView';
import UploadModal from './components/UploadModal';
import { api } from './api/client';
import { BookOpen, Layers, Sparkles, RefreshCw, AlertCircle, Database, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('papers'); // 'papers' | 'graph'
  const [papers, setPapers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [agentInitialPrompt, setAgentInitialPrompt] = useState('');
  const [apiOnline, setApiOnline] = useState(true);

  const fetchPapers = async (query = searchQuery, category = selectedCategory) => {
    setLoading(true);
    try {
      const data = await api.getPapers({ query, category, limit: 30 });
      setPapers(data.papers || []);
      setTotal(data.total || 0);
      setApiOnline(true);
    } catch (err) {
      console.error('Error fetching papers:', err);
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers(searchQuery, selectedCategory);
  }, [selectedCategory]);

  const handleAskAgent = (promptText) => {
    setAgentInitialPrompt(promptText);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setUploadOpen(true)}
        onOpenChat={() => {
          setAgentInitialPrompt('');
          setChatOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fullstack Intelligence Platform • GoComet Ready</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Agentic Research Paper Discovery & Citation Intelligence
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore 15,000+ academic papers with <strong>FastAPI</strong> REST microservices, <strong>React</strong> reactive UI, <strong>Celery & Redis</strong> async ingestion pipelines, <strong>PostgreSQL</strong> relational storage, and <strong>Neo4j</strong> citation graph traversals.
            </p>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Dynamic Views */}
        {activeTab === 'papers' ? (
          <div>
            {/* Search Bar */}
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSearch={() => fetchPapers(searchQuery, selectedCategory)}
            />

            {/* Results Count & Refresh */}
            <div className="flex items-center justify-between mb-4 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Showing {papers.length} of {total} indexed papers</span>
              </div>
              <button
                onClick={() => fetchPapers(searchQuery, selectedCategory)}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Grid of Papers */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-64 bg-slate-900/40 border border-slate-800/80 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : papers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {papers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    onAskAgent={handleAskAgent}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/30 border border-slate-800/80 rounded-2xl">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-200">No papers found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query, selecting another category, or seeding foundational research papers.
                </p>
                <button
                  onClick={async () => {
                    await api.seedPapers();
                    fetchPapers();
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20"
                >
                  Seed Foundational Papers
                </button>
              </div>
            )}
          </div>
        ) : (
          <GraphView onSelectPaper={(p) => handleAskAgent(`Tell me about ${p.title}`)} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-mono mt-12 bg-slate-950">
        <p>Built with FastAPI • ReactJS • PostgreSQL • Celery • Redis • Neo4j • LangChain</p>
      </footer>

      {/* Slide-over AI Agent Drawer */}
      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialQuery={agentInitialPrompt}
      />

      {/* Modal for Paper Ingestion */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onPaperCreated={() => fetchPapers()}
      />
    </div>
  );
}
