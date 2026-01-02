import React from 'react';
import { Button } from '../../atoms/Button/Button';
import styles from './FormulaCard.module.css';

export interface FormulaIngredient {
  name: string;
  percentage: number;
  note: string;
  role: string;
}

export interface FormulaCardProps {
  name: string;
  totalIngredients: number;
  ingredients: FormulaIngredient[];
  type?: string;
  description?: string;
  longevity?: string;
  sillage?: string;
  recommendation?: string;
  onSave?: () => void;
  isSaving?: boolean;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  name,
  totalIngredients,
  ingredients,
  type,
  description,
  longevity,
  sillage,
  recommendation,
  onSave,
  isSaving = false,
}) => {
  return (
    <div className={styles.formulaCard}>
      <h3 className={styles.formulaTitle}>{name}</h3>

      {/* Type & Description */}
      {type && (
        <div className={styles.formulaInfo}>
          <span className={styles.infoLabel}>Type:</span>
          <span className={styles.infoValue}>{type}</span>
        </div>
      )}

      {description && (
        <div className={styles.formulaInfo}>
          <span className={styles.infoLabel}>Description:</span>
          <span className={styles.infoValue}>{description}</span>
        </div>
      )}

      {/* Ingredients Table */}
      <h4 className={styles.sectionTitle}>Ingredients ({totalIngredients})</h4>
      <div className={styles.formulaTable}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>%</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{ing.name}</td>
                <td>{ing.percentage}%</td>
                <td>{ing.role.replace('_', ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Longevity & Sillage */}
      {(longevity || sillage) && (
        <div className={styles.formulaProperties}>
          {longevity && (
            <div className={styles.propertyItem}>
              <span className={styles.propertyLabel}>Longevity:</span>
              <span className={styles.propertyValue}>{longevity}</span>
            </div>
          )}

          {sillage && (
            <div className={styles.propertyItem}>
              <span className={styles.propertyLabel}>Sillage:</span>
              <span className={styles.propertyValue}>{sillage}</span>
            </div>
          )}
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className={`${styles.formulaInfo} ${styles.recommendation}`}>
          <span className={styles.infoLabel}>Recommendation:</span>
          <span className={styles.infoValue}>{recommendation}</span>
        </div>
      )}

      {/* Save Button */}
      {onSave && (
        <Button
          onClick={onSave}
          disabled={isSaving}
          variant="primary"
          fullWidth
          style={{
            padding: '12px',
            fontSize: '16px',
            borderRadius: '5px',
            fontWeight: 600,
          }}
        >
          {isSaving ? '💾 Saving...' : '💾 Save'}
        </Button>
      )}
    </div>
  );
};
