import React, { useState, useEffect } from 'react';
import { getReactions, addReaction } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Reactions.css';

const REACTION_TYPES = ['👍', '❤️', '😊', '🎉', '🔥', '💯'];

function Reactions({ progressId }) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState(new Set());

  useEffect(() => {
    loadReactions();
  }, [progressId]);

  const loadReactions = async () => {
    try {
      const data = await getReactions(progressId);
      setReactions(data);
      
      // Track user's reactions
      const userReactionSet = new Set();
      Object.values(data).flat().forEach(reaction => {
        if (reaction.user_id === user?.id) {
          userReactionSet.add(reaction.reaction_type);
        }
      });
      setUserReactions(userReactionSet);
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      if (userReactions.has(reactionType)) {
        // Remove reaction (would need delete endpoint)
        setUserReactions(prev => {
          const newSet = new Set(prev);
          newSet.delete(reactionType);
          return newSet;
        });
      } else {
        await addReaction(progressId, reactionType);
        setUserReactions(prev => new Set(prev).add(reactionType));
        loadReactions();
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  return (
    <div className="reactions-container">
      <div className="reactions-buttons">
        {REACTION_TYPES.map(type => {
          const count = reactions[type]?.length || 0;
          const isActive = userReactions.has(type);
          
          return (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              className={`reaction-button ${isActive ? 'reaction-active' : ''}`}
              title={`${count} ${type}`}
            >
              <span className="reaction-emoji">{type}</span>
              {count > 0 && <span className="reaction-count">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Reactions;

