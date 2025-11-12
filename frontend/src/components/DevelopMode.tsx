import React, { useState, useRef, useEffect } from 'react';
import { streamChatMessage } from '../services/conversation-api';
import ReactMarkdown from 'react-markdown';
import { formulationApi } from '../services/formulation-api';
import './DevelopMode.css';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  formula?: FormulaData;
}

interface FormulaData {
  name: string;
  totalIngredients: number;
  ingredients: Array<{
    name: string;
    percentage: number;
    note: string;
    role: string;
  }>;
  type?: string;  
  description?: string;  
  longevity?: string; 
  sillage?: string; 
  recommendation?: string;
}

interface DevelopModeProps {
  onExportFormula?: (formula: FormulaData) => void;
}

const DevelopMode: React.FC<DevelopModeProps> = ({ onExportFormula }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! What kind of scent would you like to create? Please tell me your desired mood, season, specific notes, or intended use.',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [savingFormulaId, setSavingFormulaId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const extractFormula = (text: string): FormulaData | null => {
    try {
      const codeBlockMatch = text.match(/`{3}json\s*([\s\S]*?)\s*`{3}/);
      if (codeBlockMatch) {
        try {
          const parsed = JSON.parse(codeBlockMatch[1]);
          if (parsed.formula) return parsed.formula;
        } catch (e) {}
      }
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = text.substring(jsonStart, jsonEnd + 1);
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.formula) return parsed.formula;
          if (parsed.name && parsed.ingredients) return parsed;
        } catch (e) {}
      }
    } catch (e) {}
    return null;
  };

  // JSON 부분 제거하고 설명 텍스트만 추출
  const removeJsonFromText = (text: string): string => {
    // `````` 블록 제거
    let cleaned = text.replace(/``````/g, '');
    
    // { ... } JSON 객체 제거
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleaned = cleaned.substring(0, jsonStart) + cleaned.substring(jsonEnd + 1);
    }
    
    return cleaned.trim();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setStreamingText('');

    const apiMessages: ChatMessage[] = messages
      .filter(m => m.id !== '1')
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    apiMessages.push({
      role: 'user',
      content: inputValue,
    });

    let fullResponse = '';

    await streamChatMessage(apiMessages, {
      onChunk: (chunk) => {
        fullResponse += chunk;
        setStreamingText(fullResponse);
      },
      onComplete: () => {
        const formula = extractFormula(fullResponse);
        const cleanedText = removeJsonFromText(fullResponse);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: cleanedText,
          sender: 'ai',
          timestamp: new Date(),
          formula: formula || undefined,
        };
        setMessages(prev => [...prev, aiMessage]);
        setStreamingText('');
        setIsLoading(false);
      },
      onError: (error) => {
        console.error('Chat error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Error occurd. Plaese try again.',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setStreamingText('');
        setIsLoading(false);
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveFormula = async (formula: FormulaData, messageId: string) => {
    setSavingFormulaId(messageId);
    
    try {
        const saveData = {
        name: formula.name,
        formula_type: formula.type || '',  
        description: formula.description || ``,  
        ingredients: formula.ingredients.map(ing => ({
            name: ing.name,
            percentage: ing.percentage,
            note: ing.note,
            role: ing.role
        })),
        longevity: formula.longevity || '',  
        sillage: formula.sillage || '',  
        recommendation: formula.recommendation || '',  
        };

      const response = await formulationApi.saveFormula(saveData);
      alert(`${formula.name} formula has been saved!`);
    } catch (error) {
      console.error('Save error:', error);
      alert("An error occurred while saving. Please try again.");
    } finally {
      setSavingFormulaId(null);
    }
  };

  return (
    <div className="develop-mode">
      <div className="chat-window">
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'message-user' : 'message-ai'}`}
            >
              <div className="message-bubble">
                <div className="message-text">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
                
                {/* 포뮬러 시각화 카드 */}
                {message.formula && (
                <div className="formula-card">
                    <h3 className="formula-title">{message.formula.name}</h3>
                    
                    {/* Type & Description */}
                    {message.formula.type && (
                    <div className="formula-info">
                        <span className="info-label">Type:</span>
                        <span className="info-value">{message.formula.type}</span>
                    </div>
                    )}
                    
                    {message.formula.description && (
                    <div className="formula-info">
                        <span className="info-label">Description:</span>
                        <span className="info-value">{message.formula.description}</span>
                    </div>
                    )}
                    
                    {/* Ingredients Table */}
                    <h4 className="section-title">Ingredients ({message.formula.totalIngredients})</h4>
                    <div className="formula-table">
                    <table>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>%</th>
                            <th>Role</th>
                        </tr>
                        </thead>
                        <tbody>
                        {message.formula.ingredients.map((ing, idx) => (
                            <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{ing.name}</td>
                            <td>{ing.percentage}%</td>
                            <td>{ing.role.replace('_', ' ')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                    
                    {/* Longevity & Sillage */}
                    <div className="formula-properties">
                    {message.formula.longevity && (
                        <div className="property-item">
                        <span className="property-label">Longevity:</span>
                        <span className="property-value">{message.formula.longevity}</span>
                        </div>
                    )}
                    
                    {message.formula.sillage && (
                        <div className="property-item">
                        <span className="property-label">Sillage:</span>
                        <span className="property-value">{message.formula.sillage}</span>
                        </div>
                    )}
                    </div>
                    
                    {/* Recommendation */}
                    {message.formula.recommendation && (
                    <div className="formula-info recommendation">
                        <span className="info-label">Recommendation:</span>
                        <span className="info-value">{message.formula.recommendation}</span>
                    </div>
                    )}
                    
                    <button 
                    className="save-formula-button"
                    onClick={() => handleSaveFormula(message.formula!, message.id)}
                    disabled={savingFormulaId === message.id}
                    >
                    {savingFormulaId === message.id ? '💾 Saving...' : '💾 Save'}
                    </button>
                </div>
                )}

                <span className="message-time">
                  {message.timestamp.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
          
          {streamingText && (
            <div className="message message-ai">
              <div className="message-bubble">
                <div className="message-text">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          
          {isLoading && !streamingText && (
            <div className="message message-ai">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-container">
        <textarea
          className="message-input"
          placeholder="Enter your message."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
        />
        <button
          className="send-button"
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default DevelopMode;
