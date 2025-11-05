import React, { useState } from 'react';

interface Props {
  onSubmit: (data: any) => void;
  loading: boolean;
}

const RecommendationForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [preferences, setPreferences] = useState({
    user_id: '',
    preference_input: '',
    preferred_notes: [] as string[],
    budget_range: 'medium',
    restrictions: [] as string[],
  });

  const noteOptions = ['Floral', 'Woody', 'Citrus', 'Musk', 'Green', 'Fresh'];
  const restrictionOptions = ['Musk', 'Citrus', 'Alcohol', 'Synthetic'];

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPreferences({
      ...preferences,
      preference_input: e.target.value,
    });
  };

  const handleNoteToggle = (note: string) => {
    setPreferences({
      ...preferences,
      preferred_notes: preferences.preferred_notes.includes(note)
        ? preferences.preferred_notes.filter(n => n !== note)
        : [...preferences.preferred_notes, note],
    });
  };

  const handleRestrictionToggle = (restriction: string) => {
    setPreferences({
      ...preferences,
      restrictions: preferences.restrictions.includes(restriction)
        ? preferences.restrictions.filter(r => r !== restriction)
        : [...preferences.restrictions, restriction],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences.preference_input.trim()) {
      alert('Please enter your fragrance preference');
      return;
    }
    onSubmit(preferences);
  };

  return (
    <form onSubmit={handleSubmit} className="recommendation-form">
      <div className="form-group">
        <label>Your Fragrance Preference:</label>
        <textarea
          value={preferences.preference_input}
          onChange={handlePreferenceChange}
          placeholder="e.g., I love warm, romantic fragrances with floral notes..."
          rows={4}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Preferred Notes:</label>
        <div className="checkbox-group">
          {noteOptions.map(note => (
            <label key={note} className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.preferred_notes.includes(note)}
                onChange={() => handleNoteToggle(note)}
                disabled={loading}
              />
              {note}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Budget Range:</label>
        <select
          value={preferences.budget_range}
          onChange={(e) =>
            setPreferences({ ...preferences, budget_range: e.target.value })
          }
          disabled={loading}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="form-group">
        <label>Restrictions (ingredients to avoid):</label>
        <div className="checkbox-group">
          {restrictionOptions.map(restriction => (
            <label key={restriction} className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.restrictions.includes(restriction)}
                onChange={() => handleRestrictionToggle(restriction)}
                disabled={loading}
              />
              {restriction}
            </label>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Generating Recommendation...' : 'Get Recommendation'}
      </button>
    </form>
  );
};

export default RecommendationForm;
