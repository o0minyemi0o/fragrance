import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼 스타일 변형
   */
  variant?: 'primary' | 'secondary' | 'outline';

  /**
   * 버튼 크기
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * 버튼 내용
   */
  children: React.ReactNode;

  /**
   * 전체 너비 여부
   */
  fullWidth?: boolean;
}

/**
 * Button 컴포넌트
 *
 * 디자인 토큰을 사용하는 기본 버튼 컴포넌트입니다.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    fullWidth = false,
    disabled = false,
    ...rest
  }, ref) => {
    const classes = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
