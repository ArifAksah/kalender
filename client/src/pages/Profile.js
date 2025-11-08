import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { useAuth } from '../context/AuthContext';
import ProfileEditor from '../components/Profile/ProfileEditor';
import '../styles/pageWrapper.css';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpdate = (updatedProfile) => {
    // Profile updated, could refresh user context here
    console.log('Profile updated:', updatedProfile);
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-main">
        <div className="profile-page">
          <header className="profile-header">
            <h1>Profile Settings</h1>
            <p>Manage your profile and preferences</p>
          </header>

          <div className="profile-content">
            <div className="profile-info-card">
              <div className="profile-info-header">
                <h2>Account Information</h2>
              </div>
              <div className="profile-info-content">
                <div className="info-item">
                  <span className="info-label">Username:</span>
                  <span className="info-value">{user?.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="profile-editor-card">
              <ProfileEditor onUpdate={handleUpdate} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;

