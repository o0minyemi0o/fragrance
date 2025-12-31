import React from 'react';
import styles from './Select.module.css';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * 에러 상태
   */
  error?: boolean;

  /**
   * 전체 너비 여부
   */
  fullWidth?: boolean;

  /**
   * 선택 옵션들
   */
  children: React.ReactNode;
}

/**
 * Select 컴포넌트
 *
 * 디자인 토큰을 사용하는 기본 선택 필드입니다.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error = false, fullWidth = false, className = '', children, ...rest }, ref) => {
    const classes = [
      styles.select,
      error && styles.error,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <select ref={ref} className={classes} {...rest}>
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
