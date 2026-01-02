import React from 'react';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 카드 스타일 변형
   */
  variant?: 'default' | 'outlined' | 'elevated';

  /**
   * 호버 효과 여부
   */
  hoverable?: boolean;

  /**
   * 카드 내용
   */
  children: React.ReactNode;

  /**
   * 클릭 가능 여부
   */
  clickable?: boolean;
}

/**
 * Card 컴포넌트
 *
 * 콘텐츠를 담는 기본 카드 컴포넌트입니다.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    hoverable = false,
    clickable = false,
    children,
    className = '',
    ...rest
  }, ref) => {
    const classes = [
      styles.card,
      styles[variant],
      hoverable && styles.hoverable,
      clickable && styles.clickable,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * CardHeader 서브컴포넌트
 */
export const CardHeader = ({ children, className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`${styles.cardHeader} ${className}`} {...rest}>
      {children}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

/**
 * CardBody 서브컴포넌트
 */
export const CardBody = ({ children, className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`${styles.cardBody} ${className}`} {...rest}>
      {children}
    </div>
  );
};

CardBody.displayName = 'CardBody';

/**
 * CardFooter 서브컴포넌트
 */
export const CardFooter = ({ children, className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`${styles.cardFooter} ${className}`} {...rest}>
      {children}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';
