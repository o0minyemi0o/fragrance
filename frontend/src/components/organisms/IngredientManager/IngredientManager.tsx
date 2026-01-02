import React, { useState, useEffect } from 'react';
import { formulationApi } from '../../../services/formulation-api';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../atoms/Input/Input';
import { Textarea } from '../../atoms/Textarea/Textarea';
import AddIngredientModal from '../AddIngredientModal/AddIngredientModal';
import './IngredientManager.css';

interface Ingredient {
  id: number;
  ingredient_name: string;
  inci_name?: string;
  synonyms?: string[];
  cas_number?: string;
  odor_description?: string;
  odor_threshold?: number;
  suggested_usage_level?: string;
  note_family?: string;
  max_usage_percentage?: string;
  perfume_applications?: string[];
  stability?: string;
  tenacity?: string;
  volatility?: string;
  owned: boolean;
}

const IngredientManager: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwned, setFilterOwned] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<number>>(new Set());
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Ingredient | null>(null);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    setLoading(true);
    try {
      const response = await formulationApi.listIngredients();
      const loaded = response.ingredients.map((ing: any) => ({
        ...ing,
        owned: false,
      }));
      setIngredients(loaded);

      const saved = localStorage.getItem('owned_ingredients');
      if (saved) {
        try {
          const ownedIds = JSON.parse(saved);
          setIngredients(prev =>
            prev.map(ing => ({ ...ing, owned: ownedIds.includes(ing.id) }))
          );
        } catch (e) {
          console.log('Failed to load owned status');
        }
      }
    } catch (err) {
      console.error('Failed to load ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = async (data: any) => {
    setLoading(true);
    try {
      await formulationApi.addIngredient(data);
      alert('✓ Ingredient added successfully!');
      setShowAddModal(false);
      await loadIngredients();
    } catch (err) {
      console.error('Failed to add ingredient:', err);
      alert('Failed to add ingredient');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectForDelete = (id: number) => {
    const newSelected = new Set(selectedForDelete);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedForDelete(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedForDelete.size === 0) {
      alert('Please select ingredients to delete');
      return;
    }

    if (!window.confirm(`Delete ${selectedForDelete.size} ingredient(s)?`)) return;

    setLoading(true);
    try {
      for (const id of selectedForDelete) {
        await formulationApi.deleteIngredient(id);
      }
      alert('✓ Deleted successfully!');
      setIngredients(ingredients.filter(ing => !selectedForDelete.has(ing.id)));
      setSelectedForDelete(new Set());
      if (selectedId && selectedForDelete.has(selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      console.error('Failed to delete ingredients:', err);
      alert('Failed to delete ingredients');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedId || !editData) return;

    try {
      setLoading(true);
      const updateData = {
        ingredient_name: editData.ingredient_name,
        inci_name: editData.inci_name,
        synonyms: editData.synonyms,
        cas_number: editData.cas_number,
        odor_description: editData.odor_description,
        odor_threshold: editData.odor_threshold,
        suggested_usage_level: editData.suggested_usage_level,
        note_family: editData.note_family,
        max_usage_percentage: editData.max_usage_percentage,
        perfume_applications: editData.perfume_applications,
        stability: editData.stability,
        tenacity: editData.tenacity,
        volatility: editData.volatility,
      };

      await formulationApi.updateIngredient(selectedId, updateData);
      alert('✓ Ingredient updated successfully!');
      setEditMode(false);
      await loadIngredients();

      // 수정된 재료 다시 선택
      const updatedIngredient = ingredients.find(ing => ing.id === selectedId);
      if (updatedIngredient) {
        setEditData({ ...updatedIngredient });
      }
    } catch (err) {
      console.error('Failed to update ingredient:', err);
      alert('Failed to update ingredient');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingle = async () => {
    if (!selectedId) return;
    if (!window.confirm('Delete this ingredient?')) return;

    try {
      setLoading(true);
      await formulationApi.deleteIngredient(selectedId);
      alert('✓ Deleted successfully!');
      setIngredients(ingredients.filter(ing => ing.id !== selectedId));
      setSelectedId(null);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to delete ingredient:', err);
      alert('Failed to delete ingredient');
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterOwned || ing.owned;
    return matchesSearch && matchesFilter;
  });

  const ownedCount = ingredients.filter(ing => ing.owned).length;
  const selectedIngredient = ingredients.find(i => i.id === selectedId);

  return (
    <div className="ingredient-manager">
      {selectedId && selectedIngredient ? (
        /* Detail View */
        <div className="ingredient-detail-fullscreen">
          <div className="detail-header">
            <Button
              onClick={() => {
                setSelectedId(null);
                setEditMode(false);
              }}
              className="back-btn"
            >
              ← Back
            </Button>
            <h2>{selectedIngredient.ingredient_name}</h2>
            <div style={{ width: '50px' }}></div>
          </div>

          {editMode && editData ? (
            /* Edit Mode */
            <div className="detail-fullscreen-content edit-form">
              <div className="form-group">
                <label>Ingredient Name *</label>
                <Input
                  type="text"
                  value={editData.ingredient_name}
                  onChange={(e) => setEditData({ ...editData, ingredient_name: e.target.value })}
                  className="edit-input"
                />
              </div>

              <div className="form-group">
                <label>INCI Name</label>
                <Input
                  type="text"
                  value={editData.inci_name || ''}
                  onChange={(e) => setEditData({ ...editData, inci_name: e.target.value })}
                  className="edit-input"
                />
              </div>

              <div className="form-group">
                <label>CAS Number</label>
                <Input
                  type="text"
                  value={editData.cas_number || ''}
                  onChange={(e) => setEditData({ ...editData, cas_number: e.target.value })}
                  className="edit-input"
                />
              </div>

              <div className="form-group">
                <label>Synonyms (comma-separated)</label>
                <Input
                  type="text"
                  value={editData.synonyms ? editData.synonyms.join(', ') : ''}
                  onChange={(e) => setEditData({
                    ...editData,
                    synonyms: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')
                  })}
                  className="edit-input"
                  placeholder="synonym1, synonym2, ..."
                />
              </div>

              <div className="form-group">
                <label>Odor Description</label>
                <Textarea
                  value={editData.odor_description || ''}
                  onChange={(e) => setEditData({ ...editData, odor_description: e.target.value })}
                  className="edit-textarea"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Note Family</label>
                <Input
                  type="text"
                  value={editData.note_family || ''}
                  onChange={(e) => setEditData({ ...editData, note_family: e.target.value })}
                  className="edit-input"
                  placeholder="Top, Middle, Base"
                />
              </div>

              <div className="form-group">
                <label>Suggested Usage Level</label>
                <Input
                  type="text"
                  value={editData.suggested_usage_level || ''}
                  onChange={(e) => setEditData({ ...editData, suggested_usage_level: e.target.value })}
                  className="edit-input"
                />
              </div>

              <div className="form-group">
                <label>Max Usage Percentage</label>
                <Input
                  type="text"
                  value={editData.max_usage_percentage || ''}
                  onChange={(e) => setEditData({ ...editData, max_usage_percentage: e.target.value})}
                  className="edit-input"
                />
              </div>

              <div className="form-group">
                <label>Stability</label>
                <Input
                  type="text"
                  value={editData.stability || ''}
                  onChange={(e) => setEditData({ ...editData, stability: e.target.value })}
                  className="edit-input"
                />
              </div>

              <div className="form-group">
                <label>Tenacity</label>
                <Input
                  type="text"
                  value={editData.tenacity || ''}
                  onChange={(e) => setEditData({ ...editData, tenacity: e.target.value })}
                  className="edit-input"
                />
              </div>

              <div className="form-group">
                <label>Volatility</label>
                <Input
                  type="text"
                  value={editData.volatility || ''}
                  onChange={(e) => setEditData({ ...editData, volatility: e.target.value })}
                  className="edit-input"
                />
              </div>

              <div className="edit-buttons">
                <Button onClick={handleSaveEdit} className="save-btn" disabled={loading}>
                  ✓ Save
                </Button>
                <Button onClick={() => {
                  setEditMode(false);
                  setEditData({ ...selectedIngredient });
                }} className="cancel-btn" disabled={loading}>
                  ✕ Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="detail-fullscreen-content view-form">
              {selectedIngredient.inci_name && selectedIngredient.inci_name.trim() !== '' && (
                <div className="detail-info-row">
                  <strong>INCI Name:</strong>
                  <p>{selectedIngredient.inci_name}</p>
                </div>
              )}

              {selectedIngredient.cas_number && selectedIngredient.cas_number.trim() !== '' && (
                <div className="detail-info-row">
                  <strong>CAS Number:</strong>
                  <p>{selectedIngredient.cas_number}</p>
                </div>
              )}

              {selectedIngredient.synonyms && Array.isArray(selectedIngredient.synonyms) && selectedIngredient.synonyms.length > 0 && (
                <div className="detail-info-row">
                  <strong>Synonyms:</strong>
                  <p>{selectedIngredient.synonyms.join(', ')}</p>
                </div>
              )}

              {selectedIngredient.odor_description && selectedIngredient.odor_description.trim() !== '' && (
                <div className="detail-info-row">
                  <strong>Odor Description:</strong>
                  <p>{selectedIngredient.odor_description}</p>
                </div>
              )}

              {selectedIngredient.odor_threshold !== null && selectedIngredient.odor_threshold !== undefined && (
                <div className="detail-info-row">
                  <strong>Odor Threshold:</strong>
                  <p>{selectedIngredient.odor_threshold}</p>
                </div>
              )}

              {selectedIngredient.note_family && selectedIngredient.note_family.trim() !== '' && (
                <div className="detail-info-row">
                  <strong>Note Family:</strong>
                  <p>{selectedIngredient.note_family}</p>
                </div>
              )}

              {selectedIngredient.suggested_usage_level && selectedIngredient.suggested_usage_level.trim() !== '' && (
                <div className="detail-info-row">
                  <strong>Suggested Usage Level:</strong>
                  <p>{selectedIngredient.suggested_usage_level}</p>
                </div>
              )}

              {selectedIngredient.max_usage_percentage !== null && selectedIngredient.max_usage_percentage !== undefined && (
                <div className="detail-info-row">
                  <strong>Max Usage Percentage:</strong>
                  <p>{selectedIngredient.max_usage_percentage}%</p>
                </div>
              )}

              {selectedIngredient.perfume_applications && Array.isArray(selectedIngredient.perfume_applications) && selectedIngredient.perfume_applications.length > 0 && (
                <div className="detail-info-row">
                  <strong>Perfume Applications:</strong>
                  <p>{selectedIngredient.perfume_applications.join(', ')}</p>
                </div>
              )}

              {selectedIngredient.stability && selectedIngredient.stability.trim() !== '' && (
                <div className="detail-info-row">
                  <strong>Stability:</strong>
                  <p>{selectedIngredient.stability}</p>
                </div>
              )}

              {selectedIngredient.tenacity && selectedIngredient.tenacity.trim() !== '' && (
                <div className="detail-info-row">
                  <strong>Tenacity:</strong>
                  <p>{selectedIngredient.tenacity}</p>
                </div>
              )}

              {selectedIngredient.volatility && selectedIngredient.volatility.trim() !== '' && (
                <div className="detail-info-row">
                  <strong>Volatility:</strong>
                  <p>{selectedIngredient.volatility}</p>
                </div>
              )}

              {!selectedIngredient.inci_name &&
               !selectedIngredient.cas_number &&
               !selectedIngredient.odor_description &&
               (!selectedIngredient.note_family || selectedIngredient.note_family === 'Top') && (
                <div className="detail-info-row">
                  <p style={{ textAlign: 'center', color: '#999' }}>No additional details available</p>
                </div>
              )}

              <div className="detail-actions">
                <label className="detail-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIngredient.owned}
                    onChange={() => {
                      const updated = ingredients.map(ing =>
                        ing.id === selectedIngredient.id ? { ...ing, owned: !ing.owned } : ing
                      );
                      setIngredients(updated);
                      const ownedIds = updated.filter(i => i.owned).map(i => i.id);
                      localStorage.setItem('owned_ingredients', JSON.stringify(ownedIds));
                    }}
                  />
                  I have this ingredient
                </label>
              </div>

              <div className="action-buttons">
                <Button onClick={() => setEditMode(true)} className="edit-btn">
                  ✏️ Edit
                </Button>
                <Button onClick={handleDeleteSingle} className="delete-btn">
                  🗑 Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <>
          <h2>My Ingredients ({ownedCount}/{ingredients.length})</h2>

          <div className="ingredient-header">
            <div className="ingredient-controls">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="search-input"
              />
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filterOwned}
                  onChange={(e) => setFilterOwned(e.target.checked)}
                />
                Only owned ingredients
              </label>
              <Button
                onClick={() => setShowAddModal(true)}
                className="add-ingredient-open-btn"
                disabled={loading}
              >
                + Add Ingredient
              </Button>
            </div>
          </div>

          {/* ✅ 선택된 항목이 있을 때만 표시 - 하단 고정 바 */}
          {selectedForDelete.size > 0 && (
            <div className="ingredient-delete-bar">
              <span className="selected-info">{selectedForDelete.size} selected</span>
              <Button
                onClick={handleDeleteSelected}
                className="delete-action-btn"
                disabled={loading}
              >
                🗑 Delete
              </Button>
            </div>
          )}

          <div className="ingredient-grid">
            {filteredIngredients.length === 0 ? (
              <p className="empty-message">No ingredients found</p>
            ) : (
              filteredIngredients.map((ing) => (
                <div
                  key={ing.id}
                  className={`ingredient-card ${ing.owned ? 'owned' : ''}`}
                  onClick={() => {
                    setSelectedId(ing.id);
                    setEditData({ ...ing });
                    setEditMode(false);
                  }}
                >
                  <div className="ingredient-content">
                    <span className="ingredient-name">{ing.ingredient_name}</span>
                    {ing.note_family && (
                      <div className="ingredient-note-family">{ing.note_family}</div>
                    )}
                  </div>

                  {/* ✅ 체크박스만 */}
                  <input
                    type="checkbox"
                    checked={selectedForDelete.has(ing.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectForDelete(ing.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="ingredient-checkbox"
                  />
                </div>
              ))
            )}
          </div>

          <AddIngredientModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddIngredient}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default IngredientManager;
