import React from 'react';
import './TrendAnalysis.css';

function TrendAnalysis({ current, previous, label }) {
  if (!current && !previous) {
    return null;
  }

  const currentValue = current || 0;
  const previousValue = previous || 0;
  const difference = currentValue - previousValue;
  const percentage = previousValue > 0 ? ((difference / previousValue) * 100).toFixed(1) : 0;

  let trend = 'neutral';
  let trendIcon = '➖';

  if (difference > 0) {
    trend = 'up';
    trendIcon = '📈';
  } else if (difference < 0) {
    trend = 'down';
    trendIcon = '📉';
  }

  return (
    <div className="trend-analysis">
      <div className="trend-label">{label}</div>
      <div className="trend-value">{currentValue}</div>
      <div className={`trend-indicator ${trend}`}>
        <span className="trend-icon">{trendIcon}</span>
        <span>{Math.abs(percentage)}%</span>
        {difference !== 0 && (
          <span className="trend-difference">
            ({difference > 0 ? '+' : ''}{difference})
          </span>
        )}
      </div>
    </div>
  );
}

export default TrendAnalysis;

