import React from 'react';
import LibraryView from '../../LibraryView';
import styles from './AccordsPage.module.css';

export interface AccordsPageProps {
  refreshKey?: number;
  onRefresh?: () => void;
}

export const AccordsPage: React.FC<AccordsPageProps> = ({ refreshKey = 0, onRefresh }) => {
  return (
    <div className={styles.accordsPage}>
      <LibraryView
        key={refreshKey}
        mode="accords"
        onRefresh={onRefresh}
      />
    </div>
  );
};
