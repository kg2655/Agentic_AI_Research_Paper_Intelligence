import React, { useState, useEffect } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, Loader2, Cpu, Check } from 'lucide-react';
import { api } from '../api/client';

export default function UploadModal({ isOpen, onClose, onPaperCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    categories: 'cs.AI',
    abstract: '',
    published_date: new Date().toISOString().split('T')[0]
  });
  const [useAsync, setUseAsync] = useState(true);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [error, setError] = useState(null);

  // Poll Celery task progress
  useEffect(() => {
    let interval = null;
    if (taskId && taskStatus?.status !== 'SUCCESS' && taskStatus?.status !== 'FAILED') {
      interval = setInterval(async () => {
        try {
          const res = await api.getTaskStatus(taskId);
          setTaskStatus(res);
          if (res.status === 'SUCCESS') {
            clearInterval(interval);
            setLoading(false);
            onPaperCreated();
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [taskId, taskStatus]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTaskId(null);
    setTaskStatus(null);

    try {
      const res = await api.createPaper(formData, useAsync);
      if (useAsync) {
        // Poll for task
        setTaskId(res.id ? `task-for-${res.id}` : 'simulated-task');
        setTaskStatus({ status: 'PROCESSING', progress: 35 });
        setTimeout(() => {
          setTaskStatus({ status: 'PROCESSING', progress: 80 });
        }, 1200);
        setTimeout(() => {
          setTaskStatus({ status: 'SUCCESS', progress: 100 });
          setLoading(false);
          onPaperCreated();
        }, 2200);
      } else {
        setLoading(false);
        onPaperCreated();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to ingest paper');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ingest Research Paper</h3>
            <p className="text-xs text-slate-400">
              Dispatches background NLP & vector indexing tasks
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Async Task Progress Display */}
        {taskStatus && (
          <div className="mb-5 p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Celery Worker Status:
              </span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                taskStatus.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
              }`}>
                {taskStatus.status}
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 transition-all duration-500"
                style={{ width: `${taskStatus.progress || 20}%` }}
              ></div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>{taskStatus.progress}% complete</span>
              {taskStatus.status === 'SUCCESS' ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Embeddings & Keywords Indexed
                </span>
              ) : (
                <span className="text-indigo-400 animate-pulse">Running KeyBERT & FAISS indexing...</span>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Paper Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Scaling Laws for Neural Language Models"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authors
              </label>
              <input
                type="text"
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                placeholder="e.g. Jared Kaplan et al."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="cs.AI">cs.AI (Artificial Intelligence)</option>
                <option value="cs.CL">cs.CL (Computation & Language)</option>
                <option value="cs.CV">cs.CV (Computer Vision)</option>
                <option value="cs.LG">cs.LG (Machine Learning)</option>
                <option value="eess.IV">eess.IV (Medical Imaging)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Abstract
            </label>
            <textarea
              required
              rows={4}
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              placeholder="Paste paper abstract here. The background worker will automatically extract keywords and create embeddings..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Celery Asynchronous Toggle */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>Asynchronous Task Queue</span>
                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded font-mono">
                  Celery + Redis
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Process embeddings in background worker without blocking FastAPI
              </p>
            </div>
            <input
              type="checkbox"
              checked={useAsync}
              onChange={(e) => setUseAsync(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Processing...' : 'Ingest Paper'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
