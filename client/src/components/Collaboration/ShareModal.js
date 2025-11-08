import React, { useState, useEffect } from 'react';
import { shareProgress, getTeams } from '../../services/api';
import './ShareModal.css';

function ShareModal({ progressId, onClose, onShare }) {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data.map(t => t.teams));
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeam) {
      setMessage('Please select a team');
      return;
    }

    setLoading(true);
    try {
      await shareProgress(progressId, null, selectedTeam, canEdit);
      setMessage('Progress shared successfully!');
      if (onShare) onShare();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage('Failed to share progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>Share Progress</h3>
          <button className="share-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="share-modal-form">
          <div className="share-form-group">
            <label>Share with Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="share-select"
            >
              <option value="">Select a team...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="share-form-group">
            <label>
              <input
                type="checkbox"
                checked={canEdit}
                onChange={(e) => setCanEdit(e.target.checked)}
              />
              Allow editing
            </label>
          </div>

          {message && (
            <div className={`share-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="share-modal-actions">
            <button type="button" onClick={onClose} className="share-cancel">
              Cancel
            </button>
            <button type="submit" className="share-submit" disabled={loading || !selectedTeam}>
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShareModal;

