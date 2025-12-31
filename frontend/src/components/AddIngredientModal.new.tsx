import React, { useState, useEffect } from 'react';
import { Modal } from './organisms/Modal/Modal';
import { FormField } from './molecules/FormField/FormField';
import { Button } from './atoms/Button/Button';
import './AddIngredientModal.css';

const API_URL = import.meta.env.VITE_API_URL;

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
    note_family: '',
    max_usage_percentage: '',
    stability: '',
    tenacity: '',
    volatility: '',
    perfume_applications: [''],
  });

  const [synonyms, setSynonyms] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ingredient_name: '',
        inci_name: '',
        cas_number: '',
        odor_description: '',
        suggested_usage_level: '',
        note_family: '',
        max_usage_percentage: '',
        stability: '',
        tenacity: '',
        volatility: '',
        perfume_applications: [''],
      });
      setSynonyms('');
      setIsAutoFilling(false);
    }
  }, [isOpen]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_usage_percentage' ? parseFloat(value) || 0 : value,
    }));
  };

  // Auto Fill 함수
  const handleAutoFill = async () => {
    if (!formData.ingredient_name.trim()) {
      alert('Please enter ingredient name first');
      return;
    }

    setIsAutoFilling(true);
    try {
      const response = await fetch(`${API_URL}/api/ingredients/auto-fill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.ingredient_name }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          inci_name: result.data.inci_name || '',
          cas_number: result.data.cas_number || '',
          odor_description: result.data.odor_description || '',
          note_family: result.data.note_family || '',
          suggested_usage_level: result.data.suggested_usage_level || '',
          max_usage_percentage: result.data.max_usage_percentage || '',
          stability: result.data.stability || '',
          tenacity: result.data.tenacity || '',
          volatility: result.data.volatility || '',
        }));

        if (result.data.synonyms) {
          setSynonyms(result.data.synonyms);
        }

        alert('Success! Information auto-filled.');
      } else {
        alert('Could not find ingredient information');
      }
    } catch (err) {
      console.error('Auto-fill failed:', err);
      alert('Failed to auto-fill. Please enter details manually.');
    } finally {
      setIsAutoFilling(false);
    }
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
    } catch (err) {
      console.error('Failed to add ingredient:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Ingredient"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="add-ingredient-form">
        {/* Basic Info */}
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <div className="form-group-header">
              <label>Ingredient Name *</label>
              {formData.ingredient_name.trim() && (
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={isAutoFilling || loading}
                  className="auto-fill-btn"
                >
                  {isAutoFilling ? 'Auto-filling...' : 'Auto Fill Below Info'}
                </button>
              )}
            </div>
            <input
              type="text"
              name="ingredient_name"
              value={formData.ingredient_name}
              onChange={(e) => handleChange('ingredient_name', e.target.value)}
              placeholder="e.g., Rose Absolute"
              autoComplete="off"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAutoFill();
                }
              }}
              className="form-group input"
            />
          </div>

          <FormField
            label="INCI Name"
            type="input"
            value={formData.inci_name}
            onChange={(e) => handleChange('inci_name', e.target.value)}
            placeholder="e.g., Rosa damascena Flower Extract"
          />

          <FormField
            label="CAS Number"
            type="input"
            value={formData.cas_number}
            onChange={(e) => handleChange('cas_number', e.target.value)}
            placeholder="e.g., 8007-01-0"
          />

          <FormField
            label="Synonyms (comma-separated)"
            type="input"
            value={synonyms}
            onChange={(e) => setSynonyms(e.target.value)}
            placeholder="e.g., Rose Oil, Rose Extract"
          />
        </div>

        {/* Odor Info */}
        <div className="form-section">
          <h3>Odor Information</h3>

          <FormField
            label="Odor Description"
            type="textarea"
            value={formData.odor_description}
            onChange={(e) => handleChange('odor_description', e.target.value)}
            placeholder="e.g., Deep floral, honeyed, slightly spicy"
            rows={3}
          />

          <FormField
            label="Note Family"
            type="input"
            value={formData.note_family}
            onChange={(e) => handleChange('note_family', e.target.value)}
            placeholder="e.g., Middle Note"
          />
        </div>

        {/* Usage Info */}
        <div className="form-section">
          <h3>Usage Information</h3>

          <FormField
            label="Suggested Usage Level"
            type="input"
            value={formData.suggested_usage_level}
            onChange={(e) => handleChange('suggested_usage_level', e.target.value)}
            placeholder="e.g., 0.1-1%"
          />

          <FormField
            label="Max Usage Percentage (%)"
            type="input"
            value={formData.max_usage_percentage}
            onChange={(e) => handleChange('max_usage_percentage', e.target.value)}
            placeholder="e.g., 1%"
          />
        </div>

        {/* Characteristics */}
        <div className="form-section">
          <h3>Characteristics</h3>

          <FormField
            label="Stability"
            type="input"
            value={formData.stability}
            onChange={(e) => handleChange('stability', e.target.value)}
            placeholder="e.g., Stable"
          />

          <FormField
            label="Tenacity"
            type="input"
            value={formData.tenacity}
            onChange={(e) => handleChange('tenacity', e.target.value)}
            placeholder="e.g., High"
          />

          <FormField
            label="Volatility"
            type="input"
            value={formData.volatility}
            onChange={(e) => handleChange('volatility', e.target.value)}
            placeholder="e.g., High"
          />
        </div>

        <div className="modal-actions">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={loading || isAutoFilling}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || isAutoFilling}
          >
            {loading ? 'Adding...' : 'Add Ingredient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddIngredientModal;
