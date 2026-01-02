import React from 'react';
import { Button } from '../../atoms/Button/Button';
import styles from './NavigationItem.module.css';

export interface NavigationItemProps {
  /**
   * 표시될 라벨
   */
  label: string;

  /**
   * 아이콘 (옵션)
   */
  icon?: React.ReactNode;

  /**
   * 활성화 상태
   */
  active?: boolean;

  /**
   * 비활성화 여부
   */
  disabled?: boolean;

  /**
   * 클릭 핸들러
   */
  onClick?: () => void;

  /**
   * 스타일 변형
   */
  variant?: 'default' | 'pills' | 'underline';
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  icon,
  active = false,
  disabled = false,
  onClick,
  variant = 'default',
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className={`${styles.navItem} ${styles[variant]} ${active ? styles.active : ''}`}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </Button>
  );
};
