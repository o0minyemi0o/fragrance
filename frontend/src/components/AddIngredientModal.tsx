import React, { useState } from 'react';

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    ingredient_name: '',
    inci_name: '',
    cas_number: '',
    odor_description: '',
    suggested_usage_level: '',
    note_family: 'Top',
    max_usage_percentage: 2,
    stability: 'Good',
    tenacity: 'Medium',
    volatility: 'Medium',
    perfume_applications: ['Fragrance'],
  });

  const [synonyms, setSynonyms] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_usage_percentage' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ingredient_name.trim()) {
      alert('Ingredient name is required');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        synonyms: synonyms.split(',').map(s => s.trim()).filter(s => s),
      });
      
      setFormData({
        ingredient_name: '',
        inci_name: '',
        cas_number: '',
        odor_description: '',
        suggested_usage_level: '',
        note_family: 'Top',
        max_usage_percentage: 2,
        stability: 'Good',
        tenacity: 'Medium',
        volatility: 'Medium',
        perfume_applications: ['Fragrance'],
      });
      setSynonyms('');
      onClose();
    } catch (err) {
      console.error('Failed to add ingredient:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Ingredient</h2>
          <button
            onClick={onClose}
            className="close-modal-btn"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-ingredient-form">
          {/* Basic Info */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Ingredient Name *</label>
              <input
                type="text"
                name="ingredient_name"
                value={formData.ingredient_name}
                onChange={handleChange}
                placeholder="e.g., Rose Absolute"
                required
              />
            </div>

            <div className="form-group">
              <label>INCI Name</label>
              <input
                type="text"
                name="inci_name"
                value={formData.inci_name}
                onChange={handleChange}
                placeholder="e.g., Rosa damascena Flower Extract"
              />
            </div>

            <div className="form-group">
              <label>CAS Number</label>
              <input
                type="text"
                name="cas_number"
                value={formData.cas_number}
                onChange={handleChange}
                placeholder="e.g., 8007-01-0"
              />
            </div>

            <div className="form-group">
              <label>Synonyms (comma-separated)</label>
              <input
                type="text"
                value={synonyms}
                onChange={(e) => setSynonyms(e.target.value)}
                placeholder="e.g., Rose Oil, Rose Extract"
              />
            </div>
          </div>

          {/* Odor Info */}
          <div className="form-section">
            <h3>Odor Information</h3>
            
            <div className="form-group">
              <label>Odor Description</label>
              <textarea
                name="odor_description"
                value={formData.odor_description}
                onChange={handleChange}
                placeholder="e.g., Deep floral, honeyed, slightly spicy"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Note Family</label>
              <select
                name="note_family"
                value={formData.note_family}
                onChange={handleChange}
              >
                <option>Top</option>
                <option>Heart/Base</option>
                <option>Base</option>
                <option>Middle</option>
              </select>
            </div>
          </div>

          {/* Usage Info */}
          <div className="form-section">
            <h3>Usage Information</h3>
            
            <div className="form-group">
              <label>Suggested Usage Level</label>
              <input
                type="text"
                name="suggested_usage_level"
                value={formData.suggested_usage_level}
                onChange={handleChange}
                placeholder="e.g., 0.1-1%"
              />
            </div>

            <div className="form-group">
              <label>Max Usage Percentage (%)</label>
              <input
                type="number"
                name="max_usage_percentage"
                value={formData.max_usage_percentage}
                onChange={handleChange}
                step="0.1"
              />
            </div>
          </div>

          {/* Characteristics */}
          <div className="form-section">
            <h3>Characteristics</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Stability</label>
                <select
                  name="stability"
                  value={formData.stability}
                  onChange={handleChange}
                >
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tenacity</label>
                <select
                  name="tenacity"
                  value={formData.tenacity}
                  onChange={handleChange}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Very High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Volatility</label>
                <select
                  name="volatility"
                  value={formData.volatility}
                  onChange={handleChange}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Very High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Ingredient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIngredientModal;
