import React from 'react';
import './InsightCard.css';

function InsightCard({ insight }) {
  if (!insight) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'pattern': return '📊';
      case 'sentiment': return '😊';
      case 'activity': return '🔥';
      case 'reminder': return '⏰';
      default: return '💡';
    }
  };

  return (
    <div className="insight-card">
      <div className="insight-icon">{getIcon(insight.type)}</div>
      <div className="insight-content">
        <div className="insight-title">{insight.content?.title || 'Insight'}</div>
        <div className="insight-message">{insight.content?.message}</div>
        {insight.content?.suggestions && (
          <ul className="insight-suggestions">
            {insight.content.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default InsightCard;

