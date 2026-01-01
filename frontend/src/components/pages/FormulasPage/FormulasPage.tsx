import React from 'react';
import LibraryView from '../../organisms/LibraryView/LibraryView';
import styles from './FormulasPage.module.css';

export interface FormulasPageProps {
  refreshKey?: number;
  onRefresh?: () => void;
}

export const FormulasPage: React.FC<FormulasPageProps> = ({ refreshKey = 0, onRefresh }) => {
  return (
    <div className={styles.formulasPage}>
      <LibraryView
        key={refreshKey}
        mode="formulas"
        onRefresh={onRefresh}
      />
    </div>
  );
};
