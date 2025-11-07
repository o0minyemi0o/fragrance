import React, { useState } from 'react';
import './App.css';
import FormulationMode from './components/FormulationMode';
import LibraryView from './components/LibraryView';
import IngredientManager from './components/IngredientManager';
import { formulationApi } from './services/formulation-api';

function App() {
  const [currentTab, setCurrentTab] = useState<'generate' | 'ingredients' | 'accords' | 'formulas'>('generate');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'accord' | 'formula'>('accord');
  const [error, setError] = useState<string | null>(null);
  const [refreshLibrary, setRefreshLibrary] = useState(0);
  const [libraryKey, setLibraryKey] = useState(0);

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

  const handleTabChange = (tab: 'generate' | 'ingredients' | 'accords' | 'formulas') => {
  if (currentTab === 'generate' && tab !== 'generate') {
    setResult(null);
    setError(null);
  }

  // 같은 탭 다시 클릭하면 LibraryView 리셋
  if ((tab === 'accords' && currentTab === 'accords') || 
      (tab === 'formulas' && currentTab === 'formulas')) {
    setLibraryKey(prev => prev + 1);
  }

  setCurrentTab(tab);
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
             Generate 
          </button>
          <button
            className={`nav-button ${currentTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setCurrentTab('ingredients')}
          >
             Ingredients
          </button>
          <button
            className={`nav-button ${currentTab === 'accords' ? 'active' : ''}`}
            onClick={() => handleTabChange('accords')}
          >
             Accords 
          </button>
          <button
            className={`nav-button ${currentTab === 'formulas' ? 'active' : ''}`}
            onClick={() => handleTabChange('formulas')}
          >
             Formulas 
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
                        <th>Name</th>
                        <th style={{ width: '60px' }}>%</th>
                        <th>Note/Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.ingredients?.map((ing: any, idx: number) => (
                        <tr key={idx}>
                          <td className="index-cell">{idx + 1}</td>
                          <td><strong>{ing.name}</strong></td>
                          <td style={{ textAlign: 'center', fontWeight: '600', color: '#666' }}>
                            {ing.percentage}%
                          </td>
                          <td>{ing.note_type || ing.role || '-'}</td>
                        </tr>
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

          {currentTab === 'ingredients' && (
            <IngredientManager /> 
          )}

          {currentTab === 'accords' && (
            <LibraryView 
              key={libraryKey} 
              mode="accords"
              onRefresh={() => setRefreshLibrary(prev => prev + 1)}
            />
          )}

          {currentTab === 'formulas' && (
            <LibraryView 
              key={libraryKey} 
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