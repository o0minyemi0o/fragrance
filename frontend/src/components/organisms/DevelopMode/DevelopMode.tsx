import React, { useState, useRef, useEffect } from 'react';
import { streamChatMessage } from '../../../services/conversation-api';
import { formulationApi } from '../../../services/formulation-api';
import { ChatMessage } from '../../molecules/ChatMessage';
import { FormulaCard } from '../../molecules/FormulaCard';
import { ChatInput } from '../../molecules/ChatInput';
import './DevelopMode.css';

interface ApiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  formula?: FormulaData;
}

export interface FormulaData {
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
  initialMessages?: Message[];
}

const defaultInitialMessage: Message = {
  id: '1',
  text: 'Hello! What kind of scent would you like to create? Please tell me your desired mood, season, specific notes, or intended use.',
  sender: 'ai',
  timestamp: new Date(),
};

const DevelopMode: React.FC<DevelopModeProps> = ({
  onExportFormula: _onExportFormula,
  initialMessages
}) => {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages || [defaultInitialMessage]
  );
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

    const apiMessages: ApiChatMessage[] = messages
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

      await formulationApi.saveFormula(saveData);
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
            <ChatMessage
              key={message.id}
              sender={message.sender}
              text={message.text}
              timestamp={message.timestamp}
            >
              {message.formula && (
                <FormulaCard
                  name={message.formula.name}
                  totalIngredients={message.formula.totalIngredients}
                  ingredients={message.formula.ingredients}
                  type={message.formula.type}
                  description={message.formula.description}
                  longevity={message.formula.longevity}
                  sillage={message.formula.sillage}
                  recommendation={message.formula.recommendation}
                  onSave={() => handleSaveFormula(message.formula!, message.id)}
                  isSaving={savingFormulaId === message.id}
                />
              )}
            </ChatMessage>
          ))}

          {streamingText && (
            <ChatMessage
              sender="ai"
              text={streamingText}
              timestamp={new Date()}
            />
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

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={isLoading}
        placeholder="Enter your message."
      />
    </div>
  );
};

export default DevelopMode;
