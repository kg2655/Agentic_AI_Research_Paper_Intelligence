import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, onSearch }) {
  const categories = [
    { label: 'All Fields', value: '' },
    { label: 'NLP / LLMs (cs.CL)', value: 'cs.CL' },
    { label: 'Computer Vision (cs.CV)', value: 'cs.CV' },
    { label: 'Machine Learning (cs.LG)', value: 'cs.LG' },
    { label: 'Medical Imaging (eess.IV)', value: 'eess.IV' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers by concept, title, or abstract (e.g. attention, medical imaging, resnet)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); onSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); }}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
