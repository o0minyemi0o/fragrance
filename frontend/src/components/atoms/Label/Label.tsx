import React from 'react';
import styles from './Label.module.css';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * 필수 필드 표시
   */
  required?: boolean;

  /**
   * 라벨 텍스트
   */
  children: React.ReactNode;
}

/**
 * Label 컴포넌트
 *
 * Form 입력 필드의 라벨입니다.
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, children, className = '', ...rest }, ref) => {
    const classes = [styles.label, className].filter(Boolean).join(' ');

    return (
      <label ref={ref} className={classes} {...rest}>
        {children}
        {required && <span className={styles.required}>*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';
