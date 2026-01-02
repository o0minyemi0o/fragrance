import React from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * 에러 상태
   */
  error?: boolean;

  /**
   * 전체 너비 여부
   */
  fullWidth?: boolean;

  /**
   * 자동 높이 조절
   */
  autoResize?: boolean;
}

/**
 * Textarea 컴포넌트
 *
 * 디자인 토큰을 사용하는 기본 텍스트 영역입니다.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, fullWidth = false, autoResize = false, className = '', ...rest }, ref) => {
    const classes = [
      styles.textarea,
      error && styles.error,
      fullWidth && styles.fullWidth,
      autoResize && styles.autoResize,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <textarea ref={ref} className={classes} {...rest} />;
  }
);

Textarea.displayName = 'Textarea';
