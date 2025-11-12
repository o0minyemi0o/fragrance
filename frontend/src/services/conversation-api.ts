const API_URL = 'http://localhost:8000';

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
    const response = await fetch(`${API_URL}/api/development/chat`, {  
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
