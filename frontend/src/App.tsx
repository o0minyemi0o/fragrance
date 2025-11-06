import React, { useState } from 'react';
import './App.css';
import FormulationMode from './components/FormulationMode';

function App() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'accord' | 'formula'>('accord');

  const handleGenerate = async (selectedMode: 'accord' | 'formula', type: string) => {
    setMode(selectedMode);
    setLoading(true);
    
    try {
      console.log(`Generating ${selectedMode}:`, type);
      
      const endpoint = `http://localhost:8000/api/formulations/${selectedMode}/generate`;
      const payload = selectedMode === 'accord' 
        ? { accord_type: type }
        : { formula_type: type };
      
      console.log('Request to:', endpoint, payload);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Generated data:', data);
      
      setResult(data.data);
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      const endpoint = `http://localhost:8000/api/formulations/${mode}/save`;
      const payload = {
        name: result.name,
        [mode === 'accord' ? 'accord_type' : 'formula_type']: result.type,
        description: result.description,
        ingredients: result.ingredients,
        longevity: result.longevity,
        sillage: result.sillage,
        recommendation: result.recommendation,
        ...(mode === 'formula' && { stability_notes: result.stability_notes })
      };

      console.log('Saving to:', endpoint, payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      alert(`✓ ${data.message}`);
      setResult(null);
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌸 Fragrance Formulation AI</h1>
        <p>Generate Accords & Formulas</p>
      </header>

      <main className="App-main">
        <FormulationMode onGenerate={handleGenerate} loading={loading} />

        {result && (
          <div className="result-card">
            <h2>✨ Generated {mode === 'accord' ? 'Accord' : 'Formula'}</h2>
            
            <h3>{result.name}</h3>
            <p><strong>Type:</strong> {result.type}</p>
            <p><strong>Description:</strong> {result.description}</p>
            
            <h4>Ingredients:</h4>
            <ul>
              {result.ingredients?.map((ing: any, idx: number) => (
                <li key={idx}>
                  <strong>{ing.name}</strong> - {ing.percentage}% 
                  ({ing.note_type || ing.role})
                </li>
              ))}
            </ul>
            
            <p><strong>Longevity:</strong> {result.longevity}</p>
            <p><strong>Sillage:</strong> {result.sillage}</p>
            
            {result.stability_notes && (
              <p><strong>Stability:</strong> {result.stability_notes}</p>
            )}
            
            <p><strong>Recommendation:</strong> {result.recommendation}</p>

            <button onClick={handleSave} disabled={loading} className="save-button">
              {loading ? 'Saving...' : '💾 Save'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
