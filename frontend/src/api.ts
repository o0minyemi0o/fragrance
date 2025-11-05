const API_URL = 'http://localhost:8000';

export interface RecommendationResponse {
  id: number;
  preference_input: string;
  recommended_accord_id?: number;
  confidence_score?: number;
  created_at: string;
}

export const apiService = {
  async createRecommendation(data: any): Promise<RecommendationResponse> {
    const response = await fetch(`${API_URL}/api/recommendations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create recommendation');
    }

    return response.json();
  },
};
