import React from 'react';
import { NavigationItem } from '../../molecules/NavigationItem';
import styles from './Navigation.module.css';

export interface NavItem {
  /**
   * 네비게이션 아이템 ID (고유값)
   */
  id: string;

  /**
   * 표시될 라벨
   */
  label: string;

  /**
   * 아이콘 (옵션)
   */
  icon?: React.ReactNode;

  /**
   * 비활성화 여부
   */
  disabled?: boolean;
}

export interface NavigationProps {
  /**
   * 네비게이션 아이템 목록
   */
  items: NavItem[];

  /**
   * 현재 활성화된 아이템 ID
   */
  activeId: string;

  /**
   * 아이템 클릭 핸들러
   */
  onItemClick: (id: string) => void;

  /**
   * 네비게이션 방향
   */
  orientation?: 'vertical' | 'horizontal';

  /**
   * 스타일 변형
   */
  variant?: 'default' | 'pills' | 'underline';
}

/**
 * Navigation 컴포넌트
 *
 * 탭 기반 네비게이션입니다.
 */
export const Navigation: React.FC<NavigationProps> = ({
  items,
  activeId,
  onItemClick,
  orientation = 'vertical',
  variant = 'default',
}) => {
  return (
    <nav className={`${styles.navigation} ${styles[orientation]} ${styles[variant]}`}>
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <NavigationItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            active={isActive}
            disabled={item.disabled}
            onClick={() => onItemClick(item.id)}
            variant={variant}
          />
        );
      })}
    </nav>
  );
};
