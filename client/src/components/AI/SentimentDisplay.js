import React from 'react';
import './SentimentDisplay.css';

function SentimentDisplay({ sentiment, score }) {
  if (!sentiment) return null;

  const getEmoji = () => {
    if (sentiment === 'positive') return '😊';
    if (sentiment === 'negative') return '😔';
    return '😐';
  };

  const getColor = () => {
    if (sentiment === 'positive') return '#10b981';
    if (sentiment === 'negative') return '#ef4444';
    return '#999';
  };

  return (
    <div className="sentiment-display" style={{ borderColor: getColor() }}>
      <span className="sentiment-emoji">{getEmoji()}</span>
      <span className="sentiment-label" style={{ color: getColor() }}>
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </span>
      {score !== undefined && (
        <span className="sentiment-score" style={{ color: getColor() }}>
          {score > 0 ? '+' : ''}{score}
        </span>
      )}
    </div>
  );
}

export default SentimentDisplay;

