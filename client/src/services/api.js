const API_BASE = '/api/v1';

export const api = {
  uploadPack: async (fileOrText, isFile = true) => {
    let body;
    let headers = {};
    if (isFile) {
      body = new FormData();
      body.append('file', fileOrText);
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ text: fileOrText });
    }
    const res = await fetch(`${API_BASE}/packs/upload`, {
      method: 'POST',
      headers,
      body,
    });
    return res.json();
  },

  processSession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/process`, {
      method: 'POST',
    });
    return res.json();
  },

  getSession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
    return res.json();
  },

  getMessages: async (sessionId) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/messages`);
    return res.json();
  },

  getFacts: async (sessionId) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/facts`);
    return res.json();
  },

  getPlan: async (sessionId) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/plan`);
    return res.json();
  },

  getPlansHistory: async (sessionId) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/plans`);
    return res.json();
  },

  getTrace: async (sessionId) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/trace`);
    return res.json();
  },

  getRejected: async (sessionId) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/rejected`);
    return res.json();
  },

  sendIncrementalUpdate: async (sessionId, message) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return res.json();
  },

  exportPlanAndTrace: async (sessionId) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/export`);
    return res.json();
  },
};
