import React from 'react';
import { RecommendationResponse } from '../services/api';

interface Props {
  recommendation: RecommendationResponse;
}

const RecommendationResult: React.FC<Props> = ({ recommendation }) => {
  return (
    <div className="recommendation-result">
      <h2>✨ Your Fragrance Recommendation</h2>
      
      <div className="result-card">
        <div className="result-item">
          <label>Accord ID:</label>
          <span>{recommendation.recommended_accord_id}</span>
        </div>

        <div className="result-item">
          <label>Confidence Score:</label>
          <span className="confidence-score">
            {(recommendation.confidence_score! * 100).toFixed(1)}%
          </span>
        </div>

        <div className="result-item">
          <label>Your Request:</label>
          <p>{recommendation.preference_input}</p>
        </div>

        <div className="result-item">
          <label>Created:</label>
          <span>{new Date(recommendation.created_at).toLocaleString()}</span>
        </div>
      </div>

      <div className="recommendation-info">
        <h3>Next Steps:</h3>
        <ul>
          <li>View detailed ingredient breakdown</li>
          <li>Check regional compliance and regulations</li>
          <li>Request additional recommendations</li>
        </ul>
      </div>
    </div>
  );
};

export default RecommendationResult;
