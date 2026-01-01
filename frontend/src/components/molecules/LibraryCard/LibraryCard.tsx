import React from 'react';
import styles from './LibraryCard.module.css';

export interface LibraryCardProps {
  name: string;
  type: string;
  ingredientsCount: number;
  onClick: () => void;
  active?: boolean;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({
  name,
  type,
  ingredientsCount,
  onClick,
  active = false,
}) => {
  return (
    <div
      className={`${styles.card} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.header}>
        <h4>{name}</h4>
      </div>
      <div className={styles.body}>
        <p className={styles.type}>{type}</p>
        <p className={styles.count}>{ingredientsCount} ingredients</p>
      </div>
    </div>
  );
};
