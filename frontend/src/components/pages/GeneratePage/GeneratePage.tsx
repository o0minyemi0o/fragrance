import React, { useState, useCallback } from 'react';
import FormulationMode from '../../FormulationMode';
import { Button } from '../../atoms/Button/Button';
import { IngredientRow } from '../../molecules/IngredientRow/IngredientRow';
import { formulationApi } from '../../../services/formulation-api';
import styles from './GeneratePage.module.css';

export interface GeneratePageProps {
  onExportFormula?: (formula: any) => void;
  // Storybook용 optional props
  initialResult?: any;
  initialLoading?: boolean;
  initialError?: string | null;
  initialMode?: 'accord' | 'formula' | 'develop';
}

export const GeneratePage: React.FC<GeneratePageProps> = ({
  onExportFormula,
  initialResult = null,
  initialLoading = false,
  initialError = null,
  initialMode = 'accord'
}) => {
  const [result, setResult] = useState<any>(initialResult);
  const [loading, setLoading] = useState(initialLoading);
  const [mode, setMode] = useState<'accord' | 'formula' | 'develop'>(initialMode as 'accord' | 'formula');
  const [error, setError] = useState<string | null>(initialError);

  const handleModeChange = useCallback(() => {
    // Storybook에서 initialResult가 있으면 result를 지우지 않음
    if (!initialResult) {
      setResult(null);
      setError(null);
    }
  }, [initialResult]);

  const handleGenerate = async (selectedMode: 'accord' | 'formula', type: string) => {
    setMode(selectedMode);
    setLoading(true);
    setError(null);

    try {
      console.log(`Generating ${selectedMode}:`, type);

      let response;
      if (selectedMode === 'accord') {
        response = await formulationApi.generateAccord({ accord_type: type });
      } else {
        response = await formulationApi.generateFormula({ formula_type: type });
      }

      console.log('Generated data:', response);
      setResult(response.data);
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('Generation error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    setLoading(true);
    try {
      const saveData = {
        name: result.name,
        [mode === 'accord' ? 'accord_type' : 'formula_type']: result.type,
        description: result.description,
        ingredients: result.ingredients,
        longevity: result.longevity,
        sillage: result.sillage,
        recommendation: result.recommendation,
        ...(mode === 'formula' && { stability_notes: result.stability_notes })
      };

      console.log('Saving to:', mode, saveData);

      let response;
      if (mode === 'accord') {
        response = await formulationApi.saveAccord(saveData);
      } else {
        response = await formulationApi.saveFormula(saveData);
      }

      console.log('Save response:', response);
      alert(`✓ ${response.message}`);
      setResult(null);
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('Save error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.generatePage}>
      <FormulationMode
        onGenerate={handleGenerate}
        loading={loading}
        onExportFormula={onExportFormula}
        onModeChange={handleModeChange}
        initialMode={initialMode}
      />

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="result-card">
          <h2 style={{ color: '#85933e' }}>{result.name}</h2>
          <p>
            <strong style={{ color: 'var(--primary-color)' }}>Type: </strong>
            <span style={{ color: '#666' }}>{result.type}</span>
          </p>
          <p>
            <strong style={{ color: 'var(--primary-color)' }}>Description: </strong>
            <span style={{ color: '#666' }}>{result.description}</span>
          </p>
          <div style={{ marginBottom: '13px' }}></div>

          <h4 style={{ color: 'var(--primary-color)' }}>Ingredients ({result.ingredients?.length || 0})</h4>
          <table className="edit-ingredients-table">
            <thead>
              <tr>
                <th style={{ width: '30px' }}>#</th>
                <th style={{ width: '250px'}}>Name</th>
                <th style={{ width: '100px', textAlign: "center" }}>%</th>
                <th style={{ width: '120px' }}>Note</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {result.ingredients?.map((ing: any, idx: number) => (
                <IngredientRow
                  key={idx}
                  index={idx}
                  ingredient={ing}
                  variant="compact"
                />
              ))}
            </tbody>
          </table>

          <div className="result-details">
            <p>
              <strong style={{ color: 'var(--primary-color)' }}>Longevity: </strong>
              <span style={{ color: '#666' }}>{result.longevity}</span>
            </p>
            <p>
              <strong style={{ color: 'var(--primary-color)' }}>Sillage: </strong>
              <span style={{ color: '#666' }}>{result.sillage}</span>
            </p>
            {result.stability_notes && (
              <p><strong style={{ color: 'var(--primary-color)' }}>Stability:</strong> {result.stability_notes}</p>
            )}
            <p>
              <strong style={{ color: 'var(--primary-color)' }}>Recommendation: </strong>
              <span style={{ color: '#666' }}>{result.recommendation}</span>
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            variant="secondary"
            style={{
              padding: '12px 30px',
              fontSize: '1rem',
              borderRadius: '5px',
              fontWeight: 600,
              marginTop: '20px'
            }}
          >
            {loading ? 'Saving...' : '💾 Save'}
          </Button>
        </div>
      )}
    </div>
  );
};
