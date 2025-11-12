import React, { useState, useEffect } from 'react';
import { formulationApi } from '../services/formulation-api';
import './LibraryView.css';

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
  const [viewMode, setViewMode] = useState<'gallery' | 'detail'>('gallery');

  useEffect(() => {
    loadItems();
    setViewMode('gallery');
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
      setViewMode('detail');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const backToGallery = () => {
    setViewMode('gallery');
    setDetails(null);
    setSelectedId(null);
    setEditMode(false);
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

      alert('Successfully updated');
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
    if (!window.confirm('Are you sure you want to delete this?')) return;

    try {
      setLoading(true);
      if (mode === 'accords') {
        await formulationApi.deleteAccord(selectedId);
      } else {
        await formulationApi.deleteFormula(selectedId);
      }

      alert('Deleted');
      backToGallery();
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
      { name: '', percentage: 0, note: '' }
    ];
    setEditData({ ...editData, ingredients_composition: newIngredients });
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = editData.ingredients_composition.filter(
      (_: any, i: number) => i !== index
    );
    setEditData({ ...editData, ingredients_composition: newIngredients });
  };

  const handleMoveIngredientUp = (index: number) => {
    if (index === 0) return;
    const newIngredients = [...editData.ingredients_composition];
    [newIngredients[index], newIngredients[index - 1]] = [newIngredients[index - 1], newIngredients[index]];
    setEditData({ ...editData, ingredients_composition: newIngredients });
  };

  const handleMoveIngredientDown = (index: number) => {
    if (index === editData.ingredients_composition.length - 1) return;
    const newIngredients = [...editData.ingredients_composition];
    [newIngredients[index], newIngredients[index + 1]] = [newIngredients[index + 1], newIngredients[index]];
    setEditData({ ...editData, ingredients_composition: newIngredients });
  };

  if (loading && items.length === 0) return <div className="library-view">Loading...</div>;

  // 갤러리 뷰
  if (viewMode === 'gallery') {
    return (
      <div className="library-view">
        <h2>{mode === 'accords' ? 'My Accords' : 'My Formulas'}</h2>

        {error && <div className="error-message">❌ {error}</div>}

        {items.length === 0 ? (
          <p className="empty-message">No items have been saved yet.</p>
        ) : (
          <div className="library-gallery">
            <div className="gallery-grid">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="gallery-card"
                  onClick={() => loadDetails(item.id)}
                >
                  <div className="card-header">
                    <h4>{item.name}</h4>
                  </div>
                  <div className="card-body">
                    <p className="card-type">{item.type}</p>
                    <p className="card-count">{item.ingredients_count} ingredients</p>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 디테일 뷰
  return (
    <div className="library-view">
      <div className="detail-header">
        <button
          onClick={backToGallery}
          className="back-btn"
        >
          ← Back
        </button>
        <h2>{details?.name}</h2>
        <div style={{ width: '50px' }}></div>
      </div>

      {error && <div className="error-message">❌ {error}</div>}

      {editMode ? (
        <div className="detail-content edit-form">
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
                  <th style={{ width: '30px' }}>#</th>
                  <th style={{ width: '200px' }}>Name</th>
                  <th style={{ width: '40px' }}>%</th>
                  <th style={{ width: '80px' }}>Note</th>
                  <th style={{ width: '220px' }}>Role</th>
                  <th style={{ width: '80px' }}>Order</th>
                  <th style={{ width: '40px' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {editData.ingredients_composition?.map((ing: any, idx: number) => (
                  <tr key={idx}>
                    <td className="index-cell">{idx + 1}</td>
                    <td>
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                        className="edit-input-small"
                        placeholder="Ingredient name"
                      />
                    </td>
                    <td style={{ width: '50px' }}>
                      <input
                        type="number"
                        value={ing.percentage}
                        onChange={(e) => handleIngredientChange(idx, 'percentage', parseFloat(e.target.value) || 0)}
                        className="edit-input-small-percentage"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={ing.note || ''}
                        onChange={(e) => handleIngredientChange(idx, 'note', e.target.value)}
                        className="edit-input-small"
                        placeholder="top/middle/base"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={ ing.role || ''}
                        onChange={(e) => handleIngredientChange(idx, 'note', e.target.value)}
                        className="edit-input-small"
                        placeholder="e.g., Fixative"
                      />
                    </td>
                    <td>
                      <div className="order-buttons">
                        <button
                          onClick={() => handleMoveIngredientUp(idx)}
                          className="move-btn move-up"
                          disabled={idx === 0}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveIngredientDown(idx)}
                          className="move-btn move-down"
                          disabled={idx === editData.ingredients_composition.length - 1}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
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
        <div className="detail-content view-form">
          <p><strong>Type:</strong> {details?.type}</p>
          <p><strong>Description:</strong> {details?.description}</p>

          <p><strong>Ingredients ({details?.ingredients_composition?.length || 0})</strong></p>
          <table className="ingredients-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>%</th>
                <th>Note</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {details?.ingredients_composition?.map((ing: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ width : '40px'}}>{idx + 1}</td>
                  <td style={{ width : '220px'}}>{ing.name}</td>
                  <td style={{ width : '80px'}}>{ing.percentage}%</td>
                  <td style={{ width : '100px'}}>{ing.note || '-'}</td>
                  <td>{ing.role || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="details-info">
            <p style={{ marginBottom: '12px' }}><strong>Longevity:</strong> {details?.longevity}</p>
            <p style={{ marginBottom: '12px' }}><strong>Sillage:</strong> {details?.sillage}</p>
            {details?.stability_notes && (
              <p><strong>Stability:</strong> {details?.stability_notes}</p>
            )}
            <p style={{ marginBottom: '12px' }}><strong>Recommendation:</strong> {details?.llm_recommendation}</p>
            <p><strong>Created:</strong> {new Date(details?.created_at).toLocaleString('ko-KR')}</p>
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
  );
};

export default LibraryView;
