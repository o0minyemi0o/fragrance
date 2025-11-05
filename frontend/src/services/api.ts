import axios from 'axios';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 인터페이스
export interface RecommendationRequest {
  user_id?: string;
  preference_input: string;
  preferred_notes?: string[];
  budget_range?: string;
  restrictions?: string[];
}

export interface RecommendationResponse {
  id: number;
  user_id?: string;
  preference_input: string;
  recommended_accord_id?: number;
  confidence_score?: number;
  created_at: string;
}

// API 함수들
export const apiService = {
  async healthCheck() {
    return api.get('/health');
  },

  async createRecommendation(data: RecommendationRequest): Promise<RecommendationResponse> {
    const response = await api.post('/api/recommendations/', data);
    return response.data;
  },

  async getRecommendation(id: number): Promise<RecommendationResponse> {
    const response = await api.get(`/api/recommendations/${id}`);
    return response.data;
  },

  async getRegulations(ingredientName: string, region: string = 'US') {
    const response = await api.get(`/api/regulations/${ingredientName}`, {
      params: { region },
    });
    return response.data;
  },

  async getIngredients() {
    const response = await api.get('/api/db-test/ingredients');
    return response.data;
  },

  async getAccords() {
    const response = await api.get('/api/db-test/accords');
    return response.data;
  },
};

export default api;
