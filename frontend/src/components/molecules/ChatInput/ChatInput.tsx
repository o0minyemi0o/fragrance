import React, { useRef, useEffect } from 'react';
import { Textarea } from '../../atoms/Textarea/Textarea';
import { Button } from '../../atoms/Button/Button';
import styles from './ChatInput.module.css';

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Enter your message.',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={styles.inputContainer}>
      <Textarea
        ref={textareaRef}
        className={styles.messageInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <Button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        variant="primary"
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          borderRadius: '5px',
          fontWeight: 600,
        }}
      >
        전송
      </Button>
    </div>
  );
};
