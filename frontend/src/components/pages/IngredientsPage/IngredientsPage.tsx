import React from 'react';
import IngredientManager from '../../IngredientManager';
import styles from './IngredientsPage.module.css';

export interface IngredientsPageProps {}

export const IngredientsPage: React.FC<IngredientsPageProps> = () => {
  return (
    <div className={styles.ingredientsPage}>
      <IngredientManager />
    </div>
  );
};
