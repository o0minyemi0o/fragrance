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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatStreamCallbacks {
  onChunk: (text: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

export const streamChatMessage = async (
  messages: ChatMessage[],
  callbacks: ChatStreamCallbacks
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/development/chat`, {  // 경로 변경
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            callbacks.onComplete();
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.error) {
              callbacks.onError(parsed.error);
              return;
            }
            
            if (parsed.content) {
              callbacks.onChunk(parsed.content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    callbacks.onError(error instanceof Error ? error.message : 'Unknown error');
  }
};
