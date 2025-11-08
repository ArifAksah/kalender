import React, { useState, useEffect } from 'react';
import AvatarUpload from './AvatarUpload';
import { updateProfile, getProfile } from '../../services/api';
import './ProfileEditor.css';

function ProfileEditor({ onUpdate }) {
  const [profile, setProfile] = useState({
    bio: '',
    timezone: 'UTC',
    language: 'en',
    theme_preference: 'light',
    avatar_url: null
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (file) => {
    setAvatarFile(file);
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, avatar_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('bio', profile.bio);
      formData.append('timezone', profile.timezone);
      formData.append('language', profile.language);
      formData.append('theme_preference', profile.theme_preference);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const updatedProfile = await updateProfile(formData);
      setProfile(updatedProfile);
      setMessage('Profile updated successfully!');
      
      if (onUpdate) {
        onUpdate(updatedProfile);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }

    setLoading(false);
  };

  return (
    <div className="profile-editor">
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-section">
          <h3>Avatar</h3>
          <AvatarUpload
            currentAvatar={profile.avatar_url}
            onAvatarChange={handleAvatarChange}
          />
        </div>

        <div className="profile-section">
          <h3>Bio</h3>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={4}
            className="profile-textarea"
          />
        </div>

        <div className="profile-section">
          <h3>Preferences</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Timezone</label>
              <select
                name="timezone"
                value={profile.timezone}
                onChange={handleChange}
                className="profile-select"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Shanghai">Shanghai</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
            </div>

            <div className="form-group">
              <label>Language</label>
              <select
                name="language"
                value={profile.language}
                onChange={handleChange}
                className="profile-select"
              >
                <option value="en">English</option>
                <option value="id">Indonesian</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <div className="form-group">
              <label>Theme</label>
              <select
                name="theme_preference"
                value={profile.theme_preference}
                onChange={handleChange}
                className="profile-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="midnight">Midnight</option>
                <option value="ocean">Ocean</option>
                <option value="forest">Forest</option>
                <option value="sunset">Sunset</option>
              </select>
            </div>
          </div>
        </div>

        {message && (
          <div className="profile-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="profile-message error">
            {error}
          </div>
        )}

        <button type="submit" className="profile-save-button" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default ProfileEditor;

