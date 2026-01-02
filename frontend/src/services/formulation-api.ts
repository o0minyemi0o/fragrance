const API_BASE_URL = import.meta.env.VITE_API_URL;


export const formulationApi = {
  async generateAccord(request: any) {
    const response = await fetch(`${API_BASE_URL}/api/accords/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async saveAccord(request: any) {
    const response = await fetch(`${API_BASE_URL}/api/accords/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async generateFormula(request: any) {
    const response = await fetch(`${API_BASE_URL}/api/formulas/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async saveFormula(request: any) {
    const response = await fetch(`${API_BASE_URL}/api/formulas/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async listAccords() {
    const response = await fetch(`${API_BASE_URL}/api/accords`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async listFormulas() {
    const response = await fetch(`${API_BASE_URL}/api/formulas`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async getAccord(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/accords/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async getFormula(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/formulas/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async updateAccord(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/accords/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async updateFormula(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/api/formulas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async deleteAccord(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/accords/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  async deleteFormula(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/formulas/${id}`, {
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

async updateIngredient(id: number, data: any) {
  const response = await fetch(`${API_BASE_URL}/api/ingredients/${id}`, {
    method: 'PUT',
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
async autoFillIngredient(data: any) {
  const response = await fetch(`${API_BASE_URL}/api/ingredients/auto-fill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
},

};