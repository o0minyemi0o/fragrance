const API_BASE_URL = 'http://localhost:8000';

export const formulationApi = {
  // ... 기존 메서드들 ...

  async listAccords() {
    const response = await fetch(`${API_BASE_URL}/api/formulations/accords`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async listFormulas() {
    const response = await fetch(`${API_BASE_URL}/api/formulations/formulas`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async getAccord(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/formulations/accords/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async getFormula(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/formulations/formulas/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async deleteAccord(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/formulations/accords/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async deleteFormula(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/formulations/formulas/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async updateAccord(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/formulations/accords/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async updateFormula(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/formulations/formulas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

};


