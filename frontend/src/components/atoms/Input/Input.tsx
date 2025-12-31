import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * 에러 상태
   */
  error?: boolean;

  /**
   * 전체 너비 여부
   */
  fullWidth?: boolean;
}

/**
 * Input 컴포넌트
 *
 * 디자인 토큰을 사용하는 기본 입력 필드입니다.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, fullWidth = false, className = '', ...rest }, ref) => {
    const classes = [
      styles.input,
      error && styles.error,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <input ref={ref} className={classes} {...rest} />;
  }
);

Input.displayName = 'Input';
