import React, { useState, useEffect } from 'react';
import { Input } from '../../atoms/Input/Input';
import { Textarea } from '../../atoms/Textarea/Textarea';
import { Button } from '../../atoms/Button/Button';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Ingredient</h2>
          <Button
            onClick={onClose}
            className="close-modal-btn"
            disabled={loading || isAutoFilling}
          >
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="add-ingredient-form">
          {/* Basic Info */}
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-group">
              <div className="form-group-header">
                <label>Ingredient Name *</label>
                {formData.ingredient_name.trim() && (
                  <Button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={isAutoFilling || loading}
                    className="auto-fill-btn"
                  >
                    {isAutoFilling ? 'Auto-filling...' : 'Auto Fill Below Info'}
                  </Button>
                )}
              </div>
              <Input
                type="text"
                name="ingredient_name"
                value={formData.ingredient_name}
                onChange={(e) => setFormData(prev => ({ ...prev, ingredient_name: e.target.value }))}
                placeholder="e.g., Rose Absolute"
                autoComplete="off"
                onKeyPress={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAutoFill();
                }
            }}
              />
            </div>

            <div className="form-group">
              <label>INCI Name</label>
              <Input
                type="text"
                name="inci_name"
                value={formData.inci_name}
                onChange={handleChange}
                placeholder="e.g., Rosa damascena Flower Extract"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label>CAS Number</label>
              <Input
                type="text"
                name="cas_number"
                value={formData.cas_number}
                onChange={handleChange}
                placeholder="e.g., 8007-01-0"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label>Synonyms (comma-separated)</label>
              <Input
                type="text"
                value={synonyms}
                onChange={(e) => setSynonyms(e.target.value)}
                placeholder="e.g., Rose Oil, Rose Extract"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Odor Info */}
          <div className="form-section">
            <h3>Odor Information</h3>

            <div className="form-group">
              <label>Odor Description</label>
              <Textarea
                name="odor_description"
                value={formData.odor_description}
                onChange={handleChange}
                placeholder="e.g., Deep floral, honeyed, slightly spicy"
                autoComplete="off"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Note Family</label>
              <Input
                name="note_family"
                value={formData.note_family}
                onChange={handleChange}
                placeholder="e.g., Middle Note"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Usage Info */}
          <div className="form-section">
            <h3>Usage Information</h3>

            <div className="form-group">
              <label>Suggested Usage Level</label>
              <Input
                type="text"
                name="suggested_usage_level"
                value={formData.suggested_usage_level}
                onChange={handleChange}
                placeholder="e.g., 0.1-1%"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label>Max Usage Percentage (%)</label>
              <Input
                type="text"
                name="max_usage_percentage"
                value={formData.max_usage_percentage}
                onChange={handleChange}
                placeholder="e.g., 1%"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Characteristics */}
          <div className="form-section">
            <h3>Characteristics</h3>

            <div className="form-group">
              <label>Stability</label>
              <Input
                type="text"
                name="stability"
                value={formData.stability}
                onChange={handleChange}
                placeholder="e.g., Stable"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label>Tenacity</label>
              <Input
                name="tenacity"
                value={formData.tenacity}
                onChange={handleChange}
                placeholder="e.g., High"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label>Volatility</label>
              <Input
                name="volatility"
                value={formData.volatility}
                onChange={handleChange}
                placeholder="e.g., High"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading || isAutoFilling}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-submit"
              disabled={loading || isAutoFilling}
            >
              {loading ? 'Adding...' : 'Add Ingredient'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIngredientModal;
