import React from 'react';
import styles from './IngredientRow.module.css';

export interface Ingredient {
  name: string;
  percentage: number;
  note?: string;
  role?: string;
}

export interface IngredientRowProps {
  index: number;
  ingredient: Ingredient;
  variant?: 'default' | 'compact';
}

export const IngredientRow: React.FC<IngredientRowProps> = ({
  index,
  ingredient,
  variant = 'default'
}) => {
  const isCompact = variant === 'compact';

  return (
    <tr>
      <td className={isCompact ? styles.indexCellCompact : styles.indexCell}>
        {index + 1}
      </td>
      <td className={isCompact ? styles.nameCellCompact : styles.nameCell}>
        {isCompact ? <strong>{ingredient.name}</strong> : ingredient.name}
      </td>
      <td className={isCompact ? styles.percentageCellCompact : styles.percentageCell}>
        {ingredient.percentage}%
      </td>
      <td className={isCompact ? styles.noteCellCompact : styles.noteCell}>
        {ingredient.note || '-'}
      </td>
      <td className={isCompact ? styles.roleCellCompact : styles.roleCell}>
        {ingredient.role || '-'}
      </td>
    </tr>
  );
};
