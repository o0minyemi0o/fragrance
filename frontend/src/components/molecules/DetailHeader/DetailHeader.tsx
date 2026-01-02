import React from 'react';
import { Button } from '../../atoms/Button/Button';
import styles from './DetailHeader.module.css';

export interface DetailHeaderProps {
  title: string;
  onBack: () => void;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({ title, onBack }) => {
  return (
    <div className={styles.header}>
      <Button onClick={onBack} variant="outline" className={styles.backBtn}>
        ← Back
      </Button>
      <h2 className={styles.title}>{title}</h2>
      <div style={{ width: '50px' }}></div>
    </div>
  );
};
