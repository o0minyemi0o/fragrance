import React, { useState, useEffect } from 'react';
import { formulationApi } from '../services/formulation-api';

interface Accord {
  id: number;
  name: string;
  type: string;
  ingredients_count: number;
  created_at: string;
}

interface Formula {
  id: number;
  name: string;
  type: string;
  ingredients_count: number;
  created_at: string;
}

interface Props {
  mode: 'accords' | 'formulas';
}

const LibraryView: React.FC<Props> = ({ mode }) => {
  const [items, setItems] = useState<(Accord | Formula)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    loadItems();
  }, [mode]);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (mode === 'accords') {
        response = await formulationApi.listAccords();
      } else {
        response = await formulationApi.listFormulas();
      }
      setItems(response[mode]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (id: number) => {
    try {
      let response;
      if (mode === 'accords') {
        response = await formulationApi.getAccord(id);
      } else {
        response = await formulationApi.getFormula(id);
      }
      setDetails(response);
      setSelectedId(id);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return <div className="library-view">로딩 중...</div>;

  return (
    <div className="library-view">
      <h2>💾 My {mode === 'accords' ? 'Accords' : 'Formulas'}</h2>

      {error && <div className="error-message">❌ {error}</div>}

      {items.length === 0 ? (
        <p className="empty-message">아직 저장한 {mode === 'accords' ? 'Accord' : 'Formula'}이 없습니다.</p>
      ) : (
        <div className="library-grid">
          <div className="library-list">
            <ul>
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`library-item ${selectedId === item.id ? 'active' : ''}`}
                  onClick={() => loadDetails(item.id)}
                >
                  <div className="item-name">{item.name}</div>
                  <div className="item-type">{item.type}</div>
                  <div className="item-count">
                    {item.ingredients_count} 성분
                  </div>
                  <div className="item-date">
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {details && selectedId && (
            <div className="library-details">
              <h3>{details.name}</h3>
              <p><strong>Type:</strong> {details.type}</p>
              <p><strong>Description:</strong> {details.description}</p>

              <h4>Ingredients ({details.ingredients_composition?.length || 0})</h4>
              <table className="ingredients-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>%</th>
                    <th>Note/Role</th>
                  </tr>
                </thead>
                <tbody>
                  {details.ingredients_composition?.map((ing: any, idx: number) => (
                    <tr key={idx}>
                      <td>{ing.name}</td>
                      <td>{ing.percentage}%</td>
                      <td>{ing.note_type || ing.role || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="details-info">
                <p><strong>Longevity:</strong> {details.longevity}</p>
                <p><strong>Sillage:</strong> {details.sillage}</p>
                {details.stability_notes && (
                  <p><strong>Stability:</strong> {details.stability_notes}</p>
                )}
                <p><strong>Recommendation:</strong> {details.llm_recommendation}</p>
                <p><strong>Created:</strong> {new Date(details.created_at).toLocaleString('ko-KR')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LibraryView;
