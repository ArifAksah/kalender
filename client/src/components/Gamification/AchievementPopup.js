import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AchievementPopup.css';

function AchievementPopup({ achievement, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        className="achievement-popup"
      >
        <div className="achievement-popup-content">
          <div className="achievement-icon">{achievement.icon || '🏆'}</div>
          <div className="achievement-text">
            <div className="achievement-title">Achievement Unlocked!</div>
            <div className="achievement-name">{achievement.name}</div>
            <div className="achievement-description">{achievement.description}</div>
            <div className="achievement-xp">+{achievement.xp_reward} XP</div>
          </div>
          <button className="achievement-close" onClick={onClose}>×</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AchievementPopup;

