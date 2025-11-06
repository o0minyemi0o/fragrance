import React, { useState, useEffect } from 'react';
import { formulationApi } from '../services/formulation-api';

interface Accord {
  id: number;
  name: string;
  type: string;
  ingredients_count: number;
  created_at: string;
}

interface Props {
  mode: 'accords' | 'formulas';
  onRefresh?: () => void;
}

const LibraryView: React.FC<Props> = ({ mode, onRefresh }) => {
  const [items, setItems] = useState<Accord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);

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
      setEditData({ ...response });
      setSelectedId(id);
      setEditMode(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedId || !editData) return;

    try {
      setLoading(true);
      const updateData = {
        name: editData.name,
        description: editData.description,
        ingredients_composition: editData.ingredients_composition,
        longevity: editData.longevity,
        sillage: editData.sillage,
        llm_recommendation: editData.llm_recommendation,
        ...(mode === 'formulas' && { stability_notes: editData.stability_notes })
      };

      if (mode === 'accords') {
        await formulationApi.updateAccord(selectedId, updateData);
      } else {
        await formulationApi.updateFormula(selectedId, updateData);
      }

      alert('✓ 수정이 완료되었습니다');
      setEditMode(false);
      await loadDetails(selectedId);
      await loadItems();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      setLoading(true);
      if (mode === 'accords') {
        await formulationApi.deleteAccord(selectedId);
      } else {
        await formulationApi.deleteFormula(selectedId);
      }

      alert('✓ 삭제되었습니다');
      setDetails(null);
      setSelectedId(null);
      await loadItems();
      onRefresh?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientChange = (index: number, field: string, value: any) => {
    const newIngredients = [...editData.ingredients_composition];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setEditData({ ...editData, ingredients_composition: newIngredients });
  };

  const handleAddIngredient = () => {
    const newIngredients = [
      ...editData.ingredients_composition,
      { name: '', percentage: 0, note_type: '' }
    ];
    setEditData({ ...editData, ingredients_composition: newIngredients });
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = editData.ingredients_composition.filter(
      (_: any, i: number) => i !== index
    );
    setEditData({ ...editData, ingredients_composition: newIngredients });
  };

  if (loading && items.length === 0) return <div className="library-view">로딩 중...</div>;

  return (
    <div className="library-view">
      <h2>💾 {mode === 'accords' ? 'My Accords' : 'My Formulas'}</h2>

      {error && <div className="error-message">❌ {error}</div>}

      {items.length === 0 ? (
        <p className="empty-message">아직 저장한 항목이 없습니다.</p>
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
                  <div className="item-count">{item.ingredients_count} 성분</div>
                  <div className="item-date">
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {details && selectedId && (
            <div className="library-details">
              {editMode ? (
                <div className="edit-form">
                  <h3>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="edit-input"
                    />
                  </h3>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="edit-textarea"
                    />
                  </div>

                  <div className="form-group">
                    <label>Longevity</label>
                    <input
                      type="text"
                      value={editData.longevity || ''}
                      onChange={(e) => setEditData({ ...editData, longevity: e.target.value })}
                      className="edit-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Sillage</label>
                    <input
                      type="text"
                      value={editData.sillage || ''}
                      onChange={(e) => setEditData({ ...editData, sillage: e.target.value })}
                      className="edit-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Recommendation</label>
                    <textarea
                      value={editData.llm_recommendation || ''}
                      onChange={(e) => setEditData({ ...editData, llm_recommendation: e.target.value })}
                      className="edit-textarea"
                    />
                  </div>

                  <h4>Ingredients ({editData.ingredients_composition?.length || 0})</h4>
                  <div className="ingredients-editor">
                    <table className="edit-ingredients-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>%</th>
                          <th>Note/Role</th>
                          <th style={{ width: '50px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editData.ingredients_composition?.map((ing: any, idx: number) => (
                          <tr key={idx}>
                            <td>
                              <input
                                type="text"
                                value={ing.name}
                                onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                                className="edit-input-small"
                                placeholder="Ingredient name"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={ing.percentage}
                                onChange={(e) => handleIngredientChange(idx, 'percentage', parseFloat(e.target.value) || 0)}
                                className="edit-input-small"
                                placeholder="0"
                                min="0"
                                max="100"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={ing.note_type || ing.role || ''}
                                onChange={(e) => handleIngredientChange(idx, 'note_type', e.target.value)}
                                className="edit-input-small"
                                placeholder="top/middle/base"
                              />
                            </td>
                            <td>
                              <button
                                onClick={() => handleRemoveIngredient(idx)}
                                className="remove-ingredient-btn"
                                title="Delete this ingredient"
                              >
                                🗑
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <button onClick={handleAddIngredient} className="add-ingredient-btn">
                      + Add Ingredient
                    </button>
                  </div>

                  <div className="edit-buttons">
                    <button onClick={handleSaveEdit} className="save-btn">
                      ✓ Save
                    </button>
                    <button onClick={() => setEditMode(false)} className="cancel-btn">
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="view-form">
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

                  <div className="action-buttons">
                    <button onClick={() => setEditMode(true)} className="edit-btn">
                      ✏️ Edit
                    </button>
                    <button onClick={handleDelete} className="delete-btn">
                      🗑 Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LibraryView;
