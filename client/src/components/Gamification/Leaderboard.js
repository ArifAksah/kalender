import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../../services/api';
import './Leaderboard.css';

function Leaderboard({ type = 'xp' }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [type]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard(type, 50);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return <div className="leaderboard-loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard-container">
      <h3>Leaderboard</h3>
      <div className="leaderboard-list">
        {leaderboard.map((entry, index) => (
          <div key={index} className={`leaderboard-item ${entry.rank <= 3 ? 'leaderboard-top' : ''}`}>
            <div className="leaderboard-rank">{getRankIcon(entry.rank)}</div>
            <div className="leaderboard-user">
              <div className="leaderboard-username">{entry.username}</div>
              <div className="leaderboard-stats">
                Level {entry.level} • {entry.xp} XP
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;

