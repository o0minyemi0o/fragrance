import React, { useState } from 'react';

interface Props {
  onGenerate: (mode: 'accord' | 'formula', type: string) => void;
  loading: boolean;
}

const FormulationMode: React.FC<Props> = ({ onGenerate, loading }) => {
  const [mode, setMode] = useState<'accord' | 'formula'>('accord');
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onGenerate(mode, input.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formulation-form">
      <div className="mode-selector">
        <label>
          <input
            type="radio"
            value="accord"
            checked={mode === 'accord'}
            onChange={(e) => setMode(e.target.value as 'accord')}
            disabled={loading}
          />
          Accord Mode (Simple & Clear)
        </label>
        <label>
          <input
            type="radio"
            value="formula"
            checked={mode === 'formula'}
            onChange={(e) => setMode(e.target.value as 'formula')}
            disabled={loading}
          />
          Formula Mode (Complete Product)
        </label>
      </div>

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
              : 'e.g., White Floral Soap Type'
          }
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </form>
  );
};

export default FormulationMode;
