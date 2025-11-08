import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getProfile } from '../../services/api';
import exmineLogo from '../../assets/exmine-logo.png';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    const loadProfilePhoto = async () => {
      try {
        const profile = await getProfile();
        console.log('Loaded profile from API:', profile);
        if (profile?.avatar_url) {
          console.log('Setting photo from API:', profile.avatar_url);
          setProfilePhoto(profile.avatar_url);
          // Update localStorage to keep in sync
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            userData.avatar_url = profile.avatar_url;
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } else if (user?.avatar_url) {
          console.log('Setting photo from user context:', user.avatar_url);
          setProfilePhoto(user.avatar_url);
        } else {
          console.log('No avatar_url found');
          // Don't set to null if we already have a photo
          setProfilePhoto(prev => prev || null);
        }
      } catch (error) {
        console.error('Error loading profile photo:', error);
        // Fallback to user avatar_url from localStorage or keep existing
        if (user?.avatar_url) {
          setProfilePhoto(user.avatar_url);
        } else {
          setProfilePhoto(prev => prev || null);
        }
      }
    };

    if (user) {
      loadProfilePhoto();
      
      // Listen for custom profile update event
      const handleProfileUpdate = (event) => {
        if (event.detail?.avatar_url) {
          setProfilePhoto(event.detail.avatar_url);
        } else {
          loadProfilePhoto();
        }
      };

      window.addEventListener('profileUpdated', handleProfileUpdate);
      
      // Listen for storage events (when profile photo is updated in Settings)
      const handleStorageChange = () => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            if (userData.avatar_url) {
              setProfilePhoto(userData.avatar_url);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      
      // Also check localStorage periodically (for same-tab updates)
      const interval = setInterval(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setProfilePhoto(prevPhoto => {
              // Only update if there's an actual change
              const newPhoto = userData.avatar_url || null;
              if (newPhoto !== prevPhoto) {
                return newPhoto;
              }
              return prevPhoto;
            });
          } catch (e) {
            // Ignore parse errors
          }
        } else {
          // If no user in localStorage, clear photo
          setProfilePhoto(null);
        }
      }, 1000);

      return () => {
        window.removeEventListener('profileUpdated', handleProfileUpdate);
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, [user]);

  return (
    <header className="navbar-header">
      <div className="navbar-content">
        <div className="navbar-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="navbar-logo-container">
            <img src={exmineLogo} alt="Exmine" className="navbar-logo" />
            <div className="navbar-brand-text">
              <h1>Progres Tracker</h1>
              <p>Track your daily progress</p>
            </div>
          </div>
        </div>
        <div className="navbar-right">
          <button 
            onClick={() => navigate('/todo')} 
            className="navbar-icon-button"
            title="Todo List"
          >
            Todo List
          </button>
          <button 
            onClick={() => navigate('/analytics')} 
            className="navbar-icon-button"
            title="Analytics"
          >
            Analytics
          </button>
          <button 
            onClick={() => navigate('/achievements')} 
            className="navbar-icon-button"
            title="Achievements"
          >
            Achievements
          </button>
          <button 
            onClick={() => navigate('/games')} 
            className="navbar-icon-button"
            title="Mini Games"
          >
            Games
          </button>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            title={`Switch to ${theme === 'pink' ? 'Sky Blue' : 'Pink'} theme`}
          >
            {theme === 'pink' ? '🌤️' : '💗'}
          </button>
          <div 
            className="user-info" 
            onClick={() => navigate('/settings')}
            style={{ cursor: 'pointer' }}
          >
            <div className="user-avatar">
              {profilePhoto ? (
                <img src={profilePhoto} alt={user?.username || 'User'} />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
            </div>
            <span className="user-name">{user?.username}</span>
          </div>
          <button 
            onClick={logout} 
            className="logout-button" 
            style={{ 
              color: '#ffffff',
              backgroundColor: '#FF6B6B',
              backgroundImage: 'linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%)',
              border: '2px solid #FF5252',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              opacity: 1
            }}
          >
            <span style={{ 
              color: '#ffffff', 
              fontWeight: '700',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              opacity: 1
            }}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

