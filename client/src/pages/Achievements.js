import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { getAllAchievements } from '../services/api';
import XPBar from '../components/Gamification/XPBar';
import BadgeCollection from '../components/Gamification/BadgeCollection';
import Leaderboard from '../components/Gamification/Leaderboard';
import '../styles/pageWrapper.css';
import './Achievements.css';

function Achievements() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await getAllAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="page-main">
          <div className="achievements-loading">Loading achievements...</div>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-main">
        <div className="achievements-page">
          <header className="achievements-header">
            <div className="achievements-title-section">
              <h1>🏆 Gamification</h1>
              <p className="achievements-subtitle">Track your progress, earn achievements, and compete on the leaderboard</p>
            </div>
          </header>

          <div className="achievements-content">
            <div className="achievements-main">
              <XPBar />

              <div className="achievements-section">
                <h2>Achievements ({unlockedCount}/{totalCount})</h2>
                <div className="achievements-grid">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`achievement-card ${achievement.unlocked ? 'achievement-unlocked' : 'achievement-locked'}`}
                    >
                      <div className="achievement-card-icon">
                        {achievement.unlocked ? achievement.icon : '🔒'}
                      </div>
                      <div className="achievement-card-content">
                        <div className="achievement-card-name">{achievement.name}</div>
                        <div className="achievement-card-description">{achievement.description}</div>
                        <div className="achievement-card-xp">+{achievement.xp_reward} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <BadgeCollection />
            </div>

            <div className="achievements-sidebar">
              <Leaderboard type="xp" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Achievements;

