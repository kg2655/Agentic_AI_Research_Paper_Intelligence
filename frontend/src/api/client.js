const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = {
  async getPapers(params = {}) {
    const query = new URLSearchParams();
    if (params.query) query.append('query', params.query);
    if (params.category) query.append('category', params.category);
    if (params.limit) query.append('limit', params.limit);
    if (params.skip) query.append('skip', params.skip);

    const res = await fetch(`${API_BASE}/papers/?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch papers');
    return res.json();
  },

  async getPaper(id) {
    const res = await fetch(`${API_BASE}/papers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch paper');
    return res.json();
  },

  async createPaper(data, asyncProcessing = true) {
    const res = await fetch(`${API_BASE}/papers/?async_processing=${asyncProcessing}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create paper');
    return res.json();
  },

  async seedPapers() {
    const res = await fetch(`${API_BASE}/papers/seed`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to seed papers');
    return res.json();
  },

  async chatWithAgent(message, history = []) {
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Agent request failed');
    }
    return res.json();
  },

  async getGraphData() {
    const res = await fetch(`${API_BASE}/graph/`);
    if (!res.ok) throw new Error('Failed to fetch citation graph data');
    return res.json();
  },

  async getTaskStatus(taskId) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`);
    if (!res.ok) throw new Error('Failed to fetch task status');
    return res.json();
  }
};
