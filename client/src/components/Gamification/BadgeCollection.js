import React, { useState, useEffect } from 'react';
import { getUserBadges } from '../../services/api';
import './BadgeCollection.css';

function BadgeCollection() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const data = await getUserBadges();
      setBadges(data.map(b => b.badges));
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="badge-collection-loading">Loading badges...</div>;
  }

  if (badges.length === 0) {
    return (
      <div className="badge-collection-empty">
        <p>No badges earned yet. Keep tracking your progress!</p>
      </div>
    );
  }

  return (
    <div className="badge-collection">
      <h3>Your Badges</h3>
      <div className="badge-grid">
        {badges.map((badge, index) => (
          <div key={index} className={`badge-item badge-${badge.rarity}`}>
            <div className="badge-icon">{badge.icon || '🎖️'}</div>
            <div className="badge-name">{badge.name}</div>
            <div className="badge-description">{badge.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BadgeCollection;

