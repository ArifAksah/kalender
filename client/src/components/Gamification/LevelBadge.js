import React from 'react';
import './LevelBadge.css';

function LevelBadge({ level, size = 'medium' }) {
  const sizeClasses = {
    small: 'level-badge-small',
    medium: 'level-badge-medium',
    large: 'level-badge-large'
  };

  return (
    <div className={`level-badge ${sizeClasses[size]}`}>
      <span className="level-number">{level}</span>
      <span className="level-label">LVL</span>
    </div>
  );
}

export default LevelBadge;

