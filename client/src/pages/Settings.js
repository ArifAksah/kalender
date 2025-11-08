import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import { getAllProgress } from '../services/api';
import { exportToPDF, exportToExcel } from '../utils/export';
import { compressImage } from '../utils/imageOptimization';
import { uploadProfilePhoto, deleteProfilePhoto } from '../utils/supabaseStorage';
import '../styles/pageWrapper.css';
import './Settings.css';

function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile?.avatar_url) {
      setPhotoPreview(profile.avatar_url);
    } else if (user?.avatar_url) {
      setPhotoPreview(user.avatar_url);
    }
  }, [profile, user]);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      if (data?.avatar_url) {
        setPhotoPreview(data.avatar_url);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Compress image
      const compressedBlob = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9
      });

      // Create File object from blob with proper name and type
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `profile-photo.${fileExt}`;
      const compressedFile = new File([compressedBlob], fileName, {
        type: compressedBlob.type || file.type || 'image/jpeg',
        lastModified: Date.now()
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(compressedBlob);

      // Upload to Supabase Storage
      const photoUrl = await uploadProfilePhoto(compressedFile, user?.id || 'user');

      // Update profile with photo URL
      const updatedProfile = await updateProfile({ photo: photoUrl });
      setProfile(updatedProfile);
      
      // Update localStorage user data
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userData.avatar_url = photoUrl;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // Dispatch custom event to update navbar
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { avatar_url: photoUrl } 
      }));

      setMessage('Profile photo updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage(error.message || 'Failed to upload profile photo');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    try {
      setUploadingPhoto(true);

      // Delete old photo from Supabase Storage if exists
      const oldPhotoUrl = profile?.avatar_url || user?.avatar_url;
      if (oldPhotoUrl) {
        await deleteProfilePhoto(oldPhotoUrl);
      }

      // Update profile to remove photo URL
      const updatedProfile = await updateProfile({ photo: null });
      setProfile(updatedProfile);
      setPhotoPreview(null);

      // Update localStorage user data
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userData.avatar_url = null;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // Dispatch custom event to update navbar
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { avatar_url: null } 
      }));

      setMessage('Profile photo removed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error removing photo:', error);
      setMessage(error.message || 'Failed to remove profile photo');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleExportData = async (format) => {
    try {
      setLoading(true);
      const progressData = await getAllProgress();
      
      if (format === 'pdf') {
        await exportToPDF(progressData, 'Progress Export');
      } else if (format === 'excel') {
        await exportToExcel(progressData, 'Progress Export');
      } else if (format === 'json') {
        const dataStr = JSON.stringify(progressData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `progress-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      setMessage('Data exported successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setMessage('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!window.confirm('This will permanently delete all your data. Type DELETE to confirm.')) {
      return;
    }

    // In a real app, you'd call an API endpoint to delete the account
    alert('Account deletion feature requires backend implementation');
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-main">
        <div className="settings-page">
          <header className="settings-header">
      
          </header>

          <div className="settings-content">
            <div className="settings-tabs">
              <button
                className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                General
              </button>
              <button
                className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                Appearance
              </button>
              <button
                className={`settings-tab ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => setActiveTab('data')}
              >
                Data & Privacy
              </button>
              <button
                className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                Account
              </button>
            </div>

            <div className="settings-panel">
              {message && (
                <div className={`settings-message ${message.includes('success') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              {activeTab === 'general' && (
                <div className="settings-section">
                  <h2>General Settings</h2>
                  
                  {/* Profile Photo Section */}
                  <div className="settings-item">
                    <label>Profile Photo</label>
                    <div className="profile-photo-container">
                      <div className="profile-photo-preview">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Profile" />
                        ) : (
                          <div className="profile-photo-placeholder">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        {uploadingPhoto && (
                          <div className="photo-upload-overlay">
                            <div className="photo-upload-spinner"></div>
                          </div>
                        )}
                      </div>
                      <div className="profile-photo-actions">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          style={{ display: 'none' }}
                          disabled={uploadingPhoto}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="photo-upload-button"
                        >
                          {photoPreview ? 'Change Photo' : 'Upload Photo'}
                        </button>
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            disabled={uploadingPhoto}
                            className="photo-remove-button"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                      <small>Recommended size: 400x400px. Max file size: 5MB</small>
                    </div>
                  </div>

                  <div className="settings-item">
                    <label>Username</label>
                    <input type="text" value={user?.username || ''} disabled />
                    <small>Username cannot be changed</small>
                  </div>
                  <div className="settings-item">
                    <label>Email</label>
                    <input type="email" value={user?.email || ''} disabled />
                    <small>Email cannot be changed</small>
                  </div>
                  <div className="settings-item">
                    <label>Timezone</label>
                    <select defaultValue={profile?.timezone || 'UTC'}>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="settings-section">
                  <h2>Appearance</h2>
                  <p className="settings-description">Theme customization has been removed for simplicity.</p>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="settings-section">
                  <h2>Data & Privacy</h2>
                  <div className="settings-item">
                    <h3>Export Data</h3>
                    <p>Download all your progress data</p>
                    <div className="export-buttons">
                      <button onClick={() => handleExportData('pdf')} disabled={loading}>
                        Export as PDF
                      </button>
                      <button onClick={() => handleExportData('excel')} disabled={loading}>
                        Export as Excel
                      </button>
                      <button onClick={() => handleExportData('json')} disabled={loading}>
                        Export as JSON
                      </button>
                    </div>
                  </div>
                  <div className="settings-item">
                    <h3>Privacy</h3>
                    <label>
                      <input type="checkbox" defaultChecked />
                      Make profile visible to other users
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="settings-section">
                  <h2>Account Management</h2>
                  <div className="settings-item">
                    <h3>Change Password</h3>
                    <button onClick={() => navigate('/forgot-password')}>
                      Reset Password
                    </button>
                  </div>
                  <div className="settings-item">
                    <h3>Danger Zone</h3>
                    <button onClick={handleDeleteAccount} className="danger-button">
                      Delete Account
                    </button>
                    <small>This action cannot be undone</small>
                  </div>
                  <div className="settings-item">
                    <button onClick={logout} className="logout-button">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Settings;

