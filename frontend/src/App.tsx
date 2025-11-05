import React, { useState } from 'react';
import './App.css';

function App() {
  const [preference, setPreference] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preference.trim()) {
      alert('Please enter your preference');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/recommendations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preference_input: preference,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      const data = await response.json();
      setResult(data);
      console.log('Result:', data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌸 Fragrance Formulation AI</h1>
        <p>AI-powered fragrance recommendation system</p>
      </header>

      <main className="App-main">
        <form onSubmit={handleSubmit} className="recommendation-form">
          <div className="form-group">
            <label>Your Fragrance Preference:</label>
            <textarea
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              placeholder="e.g., I love warm, romantic fragrances with floral notes..."
              rows={4}
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Generating...' : 'Get Recommendation'}
          </button>
        </form>

        {result && (
          <div className="recommendation-result">
            <h2>✨ Your Fragrance Recommendation</h2>
            <div className="result-card">
              <p><strong>Accord ID:</strong> {result.recommended_accord_id}</p>
              <p><strong>Confidence:</strong> {(result.confidence_score * 100).toFixed(1)}%</p>
              <p><strong>Request:</strong> {result.preference_input}</p>
              <p><strong>Created:</strong> {new Date(result.created_at).toLocaleString()}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
