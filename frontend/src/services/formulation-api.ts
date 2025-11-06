const API_BASE_URL = 'http://localhost:8000';

export const formulationApi = {
  async generateAccord(request: any) {
    const response = await fetch(`${API_BASE_URL}/api/formulations/accord/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async saveAccord(request: any) {
    const response = await fetch(`${API_BASE_URL}/api/formulations/accord/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async generateFormula(request: any) {
    const response = await fetch(`${API_BASE_URL}/api/formulations/formula/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async saveFormula(request: any) {
    const response = await fetch(`${API_BASE_URL}/api/formulations/formula/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

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
  
  async listIngredients() {
  const response = await fetch(`${API_BASE_URL}/api/ingredients`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
},

async addIngredient(data: any) {
  const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
},

async deleteIngredient(id: number) {
  const response = await fetch(`${API_BASE_URL}/api/ingredients/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
},

};