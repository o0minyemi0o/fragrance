import React, { useState } from 'react';
import './App.css';
import FormulationMode from './components/FormulationMode';
import LibraryView from './components/LibraryView';
import { formulationApi } from './services/formulation-api';

function App() {
  const [currentTab, setCurrentTab] = useState<'generate' | 'accords' | 'formulas'>('generate');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'accord' | 'formula'>('accord');
  const [error, setError] = useState<string | null>(null);
  const [refreshLibrary, setRefreshLibrary] = useState(0);

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
      setRefreshLibrary(prev => prev + 1);
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('Save error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Scent Designer</h1>
        <p>Craft Your Imagination into Scent</p>
      </header>

      <div className="main-wrapper">
        <nav className="app-nav">
          <button
            className={`nav-button ${currentTab === 'generate' ? 'active' : ''}`}
            onClick={() => setCurrentTab('generate')}
          >
            ✨ Generate
          </button>
          <button
            className={`nav-button ${currentTab === 'accords' ? 'active' : ''}`}
            onClick={() => setCurrentTab('accords')}
          >
            📋 Accords
          </button>
          <button
            className={`nav-button ${currentTab === 'formulas' ? 'active' : ''}`}
            onClick={() => setCurrentTab('formulas')}
          >
            📋 Formulas
          </button>
        </nav>

        <main className="App-main">
          {currentTab === 'generate' && (
            <>
              <FormulationMode onGenerate={handleGenerate} loading={loading} />

              {error && (
                <div className="error-message">
                  ❌ {error}
                </div>
              )}

              {result && (
                <div className="result-card">
                  <h2>✨ Generated {mode === 'accord' ? 'Accord' : 'Formula'}</h2>
                  
                  <h3>{result.name}</h3>
                  <p><strong>Type:</strong> {result.type}</p>
                  <p><strong>Description:</strong> {result.description}</p>
                  
                  <h4>Ingredients:</h4>
                  <table className="result-ingredients-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>%</th>
                        <th>Note/Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.ingredients?.map((ing: any, idx: number) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td><strong>{ing.name}</strong></td>
                          <td>{ing.percentage}%</td>
                          <td>{ing.note_type || ing.role || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="result-details">
                    <p><strong>Longevity:</strong> {result.longevity}</p>
                    <p><strong>Sillage:</strong> {result.sillage}</p>
                    {result.stability_notes && (
                      <p><strong>Stability:</strong> {result.stability_notes}</p>
                    )}
                    <p><strong>Recommendation:</strong> {result.recommendation}</p>
                  </div>

                  <button 
                    onClick={handleSave} 
                    disabled={loading} 
                    className="save-button"
                  >
                    {loading ? 'Saving...' : '💾 Save'}
                  </button>
                </div>
              )}
            </>
          )}

          {currentTab === 'accords' && (
            <LibraryView 
              key={refreshLibrary} 
              mode="accords"
              onRefresh={() => setRefreshLibrary(prev => prev + 1)}
            />
          )}

          {currentTab === 'formulas' && (
            <LibraryView 
              key={refreshLibrary} 
              mode="formulas"
              onRefresh={() => setRefreshLibrary(prev => prev + 1)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
