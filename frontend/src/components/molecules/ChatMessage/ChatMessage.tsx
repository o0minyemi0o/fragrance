import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './ChatMessage.module.css';

export interface ChatMessageProps {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  children?: React.ReactNode;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  text,
  timestamp,
  children,
}) => {
  return (
    <div className={`${styles.message} ${sender === 'user' ? styles.messageUser : styles.messageAi}`}>
      <div className={styles.messageBubble}>
        <div className={styles.messageText}>
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>

        {children}

        <span className={styles.messageTime}>
          {timestamp.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};
