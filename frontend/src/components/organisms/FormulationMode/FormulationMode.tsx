import React, { useState, useEffect } from 'react';
import DevelopMode from '../DevelopMode/DevelopMode';
import { Input } from '../../atoms/Input/Input';
import { Button } from '../../atoms/Button/Button';
import { Radio } from '../../atoms/Radio/Radio';
import './FormulationMode.css';

interface FormulaData {
  name: string;
  totalIngredients: number;
  ingredients: Array<{
    name: string;
    percentage: number;
    note: string;
    role: string;
  }>;
}

interface Props {
  onGenerate: (mode: 'accord' | 'formula', type: string) => void;
  loading: boolean;
  onExportFormula?: (formula: FormulaData) => void;
  onModeChange?: () => void;
  initialMode?: 'accord' | 'formula' | 'develop';
}

const FormulationMode: React.FC<Props> = ({
  onGenerate,
  loading,
  onExportFormula,
  onModeChange,
  initialMode = 'accord'
}) => {
  const [mode, setMode] = useState<'accord' | 'formula' | 'develop'>(initialMode);
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
        <Radio
          label="Accord Mode (Simple & Clear)"
          value="accord"
          checked={mode === 'accord'}
          onChange={(e) => setMode(e.target.value as 'accord' | 'formula' | 'develop')}
          disabled={loading}
          name="formulation-mode"
        />
        <Radio
          label="Formula Mode (Complete Product)"
          value="formula"
          checked={mode === 'formula'}
          onChange={(e) => setMode(e.target.value as 'accord' | 'formula' | 'develop')}
          disabled={loading}
          name="formulation-mode"
        />
        <Radio
          label="Develop Mode (Conversation)"
          value="develop"
          checked={mode === 'develop'}
          onChange={(e) => setMode(e.target.value as 'accord' | 'formula' | 'develop')}
          disabled={loading}
          name="formulation-mode"
        />
      </div>

      {mode === 'develop' ? (
        <DevelopMode key={mode} onExportFormula={onExportFormula} />
      ) : (
        <form onSubmit={handleSubmit} className="formulation-form">
          <div className="form-group">
            <label>
              {mode === 'accord' ? 'Accord Type' : 'Formula Type'}:
            </label>
            <Input
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

          <Button
            type="submit"
            disabled={loading}
            variant="secondary"
            fullWidth
            style={{
              padding: '12px 30px',
              fontSize: '1rem',
              borderRadius: '5px',
              fontWeight: 600
            }}
          >
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default FormulationMode;
