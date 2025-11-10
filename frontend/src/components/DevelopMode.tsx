import React, { useState, useRef, useEffect } from 'react';
import { streamChatMessage} from '../api';
import ReactMarkdown from 'react-markdown';
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
}

const DevelopMode: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '안녕하세요! 어떤 향을 개발하고 싶으신가요? 원하시는 분위기, 계절, 특정 노트, 용도 등 필요한 것을 말씀해주세요.',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // API 메시지 형식으로 변환 (초기 메시지 제외)
    const apiMessages: ChatMessage[] = messages
      .filter(m => m.id !== '1') // 초기 환영 메시지 제외
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    // 현재 사용자 메시지 추가
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
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: fullResponse,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setStreamingText('');
        setIsLoading(false);
      },
      onError: (error) => {
        console.error('Chat error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
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
                    <ReactMarkdown>
                        {message.text}
                    </ReactMarkdown>
                </div>
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
                    <ReactMarkdown>
                        {streamingText}
                    </ReactMarkdown>
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
          placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
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
