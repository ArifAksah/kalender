import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, getAllProgress } from '../services/api';
import { exportToPDF, exportToExcel } from '../utils/export';
import { compressImage } from '../utils/imageOptimization';
import { uploadProfilePhoto, deleteProfilePhoto } from '../utils/supabaseStorage';
import Card from '../components/Card';
import Button from '../components/Button';

function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('general');
  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        if (data?.avatar_url) setPhoto(data.avatar_url);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (profile?.avatar_url) setPhoto(profile.avatar_url);
    else if (user?.avatar_url) setPhoto(user.avatar_url);
  }, [profile, user]);

  const showMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return showMsg('Please select an image');
    if (file.size > 5 * 1024 * 1024) return showMsg('Max file size is 5MB');

    try {
      setUploading(true);
      const compressed = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.9 });
      const ext = file.name.split('.').pop() || 'jpg';
      const newFile = new File([compressed], `profile.${ext}`, { type: compressed.type || 'image/jpeg' });
      
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(compressed);

      const url = await uploadProfilePhoto(newFile, user?.id || 'user');
      await updateProfile({ photo: url });
      
      const saved = localStorage.getItem('user');
      if (saved) {
        const data = JSON.parse(saved);
        data.avatar_url = url;
        localStorage.setItem('user', JSON.stringify(data));
      }
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { avatar_url: url } }));
      showMsg('Photo updated');
    } catch (err) {
      showMsg(err.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Remove profile photo?')) return;
    try {
      setUploading(true);
      if (profile?.avatar_url) await deleteProfilePhoto(profile.avatar_url);
      await updateProfile({ photo: null });
      setPhoto(null);
      
      const saved = localStorage.getItem('user');
      if (saved) {
        const data = JSON.parse(saved);
        data.avatar_url = null;
        localStorage.setItem('user', JSON.stringify(data));
      }
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { avatar_url: null } }));
      showMsg('Photo removed');
    } catch (err) {
      showMsg('Failed to remove');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const data = await getAllProgress();
      if (format === 'pdf') await exportToPDF(data, 'Progress Export');
      else if (format === 'excel') await exportToExcel(data, 'Progress Export');
      else if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `progress-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
      }
      showMsg('Exported!');
    } catch {
      showMsg('Export failed');
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'data', label: 'Data & Privacy' },
    { id: 'account', label: 'Account' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-900">Settings</h1>
        <p className="text-blue-600 text-sm mt-1">Manage your preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <Card className="lg:w-56 p-2 h-fit">
          <nav className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${tab === t.id ? 'bg-blue-100 text-blue-700' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <Card className="flex-1 p-6">
          {msg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('failed') || msg.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {msg}
            </div>
          )}

          {tab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-3">General Settings</h2>
              
              {/* Photo */}
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-blue-100 shadow-inner">
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-blue-400">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  {uploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
                </div>
                <div className="space-y-2">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {photo ? 'Change' : 'Upload'}
                    </Button>
                    {photo && <Button variant="danger" size="sm" onClick={handleRemovePhoto} disabled={uploading}>Remove</Button>}
                  </div>
                  <p className="text-xs text-blue-400">Max 5MB</p>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-blue-600 mb-1">Username</label>
                  <input type="text" value={user?.username || ''} disabled className="w-full bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-blue-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-blue-600 mb-1">Email</label>
                  <input type="email" value={user?.email || ''} disabled className="w-full bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-blue-400 text-sm" />
                </div>
              </div>
            </div>
          )}

          {tab === 'data' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-3">Data & Privacy</h2>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">Export Data</h3>
                <p className="text-blue-500 text-sm mb-3">Download your progress data</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleExport('pdf')}>PDF</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleExport('excel')}>Excel</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleExport('json')}>JSON</Button>
                </div>
              </div>
            </div>
          )}

          {tab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-3">Account</h2>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">Password</h3>
                <Button variant="secondary" size="sm" onClick={() => navigate('/forgot-password')}>Reset Password</Button>
              </div>
              <div className="pt-4 border-t border-blue-100">
                <h3 className="text-sm font-medium text-red-500 mb-2">Danger Zone</h3>
                <p className="text-blue-500 text-sm mb-3">Permanently delete your account</p>
                <Button variant="danger" size="sm" onClick={() => alert('Feature requires backend')}>Delete Account</Button>
              </div>
              <div className="pt-4 border-t border-blue-100">
                <Button variant="secondary" className="w-full" onClick={logout}>Logout</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Settings;
