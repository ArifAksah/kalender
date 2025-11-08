import React, { useState, useEffect } from 'react';
import { getUserXP } from '../../services/api';
import './XPBar.css';

function XPBar() {
  const [xpData, setXpData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadXP();
  }, []);

  const loadXP = async () => {
    try {
      const data = await getUserXP();
      setXpData(data);
    } catch (error) {
      console.error('Error loading XP:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !xpData) {
    return <div className="xp-bar-loading">Loading...</div>;
  }

  return (
    <div className="xp-bar-container">
      <div className="xp-bar-header">
        <span className="xp-level">Level {xpData.level}</span>
        <span className="xp-points">{xpData.xp} XP</span>
      </div>
      <div className="xp-bar-wrapper">
        <div 
          className="xp-bar-fill" 
          style={{ width: `${xpData.progress}%` }}
        />
      </div>
      <div className="xp-bar-footer">
        <span>{xpData.xpForNextLevel} XP to next level</span>
      </div>
    </div>
  );
}

export default XPBar;

