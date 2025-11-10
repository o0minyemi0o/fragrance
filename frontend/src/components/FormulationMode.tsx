import React, { useState, useEffect } from 'react';
import DevelopMode from './DevelopMode';

interface FormulaData {
  name: string;
  totalIngredients: number;
  ingredients: Array<{
    name: string;
    percentage: number;
    role: string;
  }>;
}

interface Props {
  onGenerate: (mode: 'accord' | 'formula', type: string) => void;
  loading: boolean;
  onExportFormula?: (formula: FormulaData) => void;
  onModeChange?: () => void;
}

const FormulationMode: React.FC<Props> = ({ onGenerate, loading, onExportFormula, onModeChange }) => {
  const [mode, setMode] = useState<'accord' | 'formula' | 'develop'>('accord');
  const [input, setInput] = useState('');

  useEffect(() => {
    setInput('');
    onModeChange?.();
  }, [mode]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && mode !== 'develop') {
      onGenerate(mode, input.trim());
    }
  };

  return (
    <div>
      <div className="mode-selector">
        <label>
          <input
            type="radio"
            value="accord"
            checked={mode === 'accord'}
            onChange={(e) => setMode(e.target.value as 'accord' | 'formula' | 'develop')}
            disabled={loading}
          />
          Accord Mode (Simple & Clear)
        </label>
        <label>
          <input
            type="radio"
            value="formula"
            checked={mode === 'formula'}
            onChange={(e) => setMode(e.target.value as 'accord' | 'formula' | 'develop')}
            disabled={loading}
          />
          Formula Mode (Complete Product)
        </label>
        <label>
          <input
            type="radio"
            value="develop"
            checked={mode === 'develop'}
            onChange={(e) => setMode(e.target.value as 'accord' | 'formula' | 'develop')}
            disabled={loading}
          />
          Develop Mode (Conversation)
        </label>
      </div>

      {mode === 'develop' ? (
        <DevelopMode key={mode} onExportFormula={onExportFormula} />
      ) : (
        <form onSubmit={handleSubmit} className="formulation-form">
          <div className="form-group">
            <label>
              {mode === 'accord' ? 'Accord Type' : 'Formula Type'}:
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'accord'
                  ? 'e.g., Pineapple Accord'
                  : 'e.g., White Floral Soap Type Formula'
              }
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>
      )}
    </div>
  );
};

export default FormulationMode;
