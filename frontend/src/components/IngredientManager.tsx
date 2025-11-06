import React, { useState, useEffect } from 'react';
import { formulationApi } from '../services/formulation-api';
import AddIngredientModal from './AddIngredientModal';

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
  max_usage_percentage?: number;
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
      await loadIngredients();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add ingredient:', err);
      alert('Failed to add ingredient');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOwned = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();

    const updated = ingredients.map(ing =>
      ing.id === id ? { ...ing, owned: !ing.owned } : ing
    );
    setIngredients(updated);

    const ownedIds = updated.filter(i => i.owned).map(i => i.id);
    localStorage.setItem('owned_ingredients', JSON.stringify(ownedIds));
  };

  const handleDeleteIngredient = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this ingredient?')) return;

    setLoading(true);
    try {
      await formulationApi.deleteIngredient(id);
      alert('✓ Ingredient deleted successfully!');
      setIngredients(ingredients.filter(ing => ing.id !== id));
      if (selectedId === id) setSelectedId(null);
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
        /* ✓ Detail View */
        <div className="ingredient-detail-fullscreen">
          <div className="detail-header">
            <button
              onClick={() => setSelectedId(null)}
              className="back-btn"
            >
              ← Back
            </button>
            <h2>{selectedIngredient.ingredient_name}</h2>
            <div style={{ width: '50px' }}></div>
          </div>

          <div className="detail-fullscreen-content">
            {selectedIngredient.inci_name && (
              <div className="detail-info-row">
                <strong>INCI Name:</strong>
                <p>{selectedIngredient.inci_name}</p>
              </div>
            )}

            {selectedIngredient.cas_number && (
              <div className="detail-info-row">
                <strong>CAS Number:</strong>
                <p>{selectedIngredient.cas_number}</p>
              </div>
            )}

            {selectedIngredient.synonyms && selectedIngredient.synonyms.length > 0 && (
              <div className="detail-info-row">
                <strong>Synonyms:</strong>
                <p>{selectedIngredient.synonyms.join(', ')}</p>
              </div>
            )}

            {selectedIngredient.odor_description && (
              <div className="detail-info-row">
                <strong>Odor Description:</strong>
                <p>{selectedIngredient.odor_description}</p>
              </div>
            )}

            {selectedIngredient.odor_threshold && (
              <div className="detail-info-row">
                <strong>Odor Threshold:</strong>
                <p>{selectedIngredient.odor_threshold}</p>
              </div>
            )}

            {selectedIngredient.note_family && (
              <div className="detail-info-row">
                <strong>Note Family:</strong>
                <p>{selectedIngredient.note_family}</p>
              </div>
            )}

            {selectedIngredient.suggested_usage_level && (
              <div className="detail-info-row">
                <strong>Suggested Usage Level:</strong>
                <p>{selectedIngredient.suggested_usage_level}</p>
              </div>
            )}

            {selectedIngredient.max_usage_percentage && (
              <div className="detail-info-row">
                <strong>Max Usage Percentage:</strong>
                <p>{selectedIngredient.max_usage_percentage}%</p>
              </div>
            )}

            {selectedIngredient.perfume_applications && selectedIngredient.perfume_applications.length > 0 && (
              <div className="detail-info-row">
                <strong>Perfume Applications:</strong>
                <p>{selectedIngredient.perfume_applications.join(', ')}</p>
              </div>
            )}

            {selectedIngredient.stability && (
              <div className="detail-info-row">
                <strong>Stability:</strong>
                <p>{selectedIngredient.stability}</p>
              </div>
            )}

            {selectedIngredient.tenacity && (
              <div className="detail-info-row">
                <strong>Tenacity:</strong>
                <p>{selectedIngredient.tenacity}</p>
              </div>
            )}

            {selectedIngredient.volatility && (
              <div className="detail-info-row">
                <strong>Volatility:</strong>
                <p>{selectedIngredient.volatility}</p>
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

              <button
                onClick={(e) => handleDeleteIngredient(selectedIngredient.id, e)}
                className="detail-delete-btn"
                disabled={loading}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ✓ List View */
        <>
          <h2>My Ingredients</h2>

          <div className="ingredient-header">
            <div className="ingredient-controls">
              <input
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
              <button 
                onClick={() => setShowAddModal(true)}
                className="add-ingredient-open-btn"
                disabled={loading}
              >
                + Add Ingredient
              </button>
            </div>
          </div>

          <div className="ingredient-grid">
            {filteredIngredients.length === 0 ? (
              <p className="empty-message">No ingredients found</p>
            ) : (
              filteredIngredients.map((ing) => (
                <div
                  key={ing.id}
                  className={`ingredient-card ${ing.owned ? 'owned' : ''}`}
                  onClick={() => setSelectedId(ing.id)}
                >
                  <div className="ingredient-content">
                    <label 
                      className="ingredient-checkbox"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={ing.owned}
                        onChange={(e) => handleToggleOwned(ing.id, e)}
                      />
                      <span className="ingredient-name">{ing.ingredient_name}</span>
                    </label>
                    {ing.note_family && (
                      <div className="ingredient-category">{ing.note_family}</div>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDeleteIngredient(ing.id, e)}
                    className="delete-ingredient-btn"
                    title="Delete"
                  >
                    🗑
                  </button>
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
