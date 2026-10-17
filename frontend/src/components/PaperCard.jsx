import React, { useState } from 'react';
import { Tag, Quote, Calendar, User, ChevronDown, ChevronUp, Bot, ExternalLink } from 'lucide-react';

export default function PaperCard({ paper, onAskAgent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between">
      <div>
        {/* Top Meta */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {paper.categories || 'Computer Science'}
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
            <Quote className="w-3 h-3" />
            <span>{(paper.citation_count || 0).toLocaleString()} citations</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-100 mb-2 leading-snug">
          {paper.title}
        </h3>

        {/* Authors & Date */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mb-3 font-medium">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="line-clamp-1">{paper.authors}</span>
          </div>
          {paper.published_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{paper.published_date}</span>
            </div>
          )}
        </div>

        {/* Keywords */}
        {paper.keywords && paper.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {paper.keywords.map((kw, i) => (
              <span
                key={i}
                className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 flex items-center gap-1"
              >
                <Tag className="w-2.5 h-2.5 text-indigo-400" />
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Summary or Abstract */}
        <div className="text-sm text-slate-300/90 leading-relaxed">
          {paper.summary ? (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-3 text-xs text-indigo-200">
              <span className="font-semibold text-indigo-400 uppercase tracking-wider block text-[10px] mb-1">
                Executive Synthesis
              </span>
              {paper.summary}
            </div>
          ) : null}

          <p className={expanded ? '' : 'line-clamp-3'}>
            {paper.abstract}
          </p>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors font-medium"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Read abstract <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="View DOI"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => onAskAgent(`Summarize and extract keywords from the paper: "${paper.title}"`)}
            className="flex items-center gap-1 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-transparent px-3 py-1.5 rounded-lg font-medium transition-all"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask Agent</span>
          </button>
        </div>
      </div>
    </div>
  );
}
