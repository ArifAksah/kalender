import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ bio: '', website: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setForm({ bio: data?.bio || '', website: data?.website || '' });
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await updateProfile(form);
      setProfile(updated);
      setMsg('Profile updated');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to update');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-900">Profile</h1>
        <p className="text-blue-600 text-sm mt-1">View and edit your profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.name?.[0] || user?.username?.[0] || 'U'
              )}
            </div>
            <h2 className="text-lg font-semibold text-blue-900">{user?.name || user?.username || 'User'}</h2>
            <p className="text-blue-500 text-sm">{user?.email}</p>
            {profile?.bio && <p className="text-blue-600 text-sm mt-3">{profile.bio}</p>}
          </div>
          
          <div className="mt-6 pt-4 border-t border-blue-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-blue-500">Username</span>
              <span className="text-blue-900">{user?.username}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-500">Email</span>
              <span className="text-blue-900 truncate ml-2">{user?.email}</span>
            </div>
            {profile?.website && (
              <div className="flex justify-between text-sm">
                <span className="text-blue-500">Website</span>
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate ml-2">
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Edit Profile</h3>
          
          {msg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('Failed') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-blue-600 mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows="4"
                placeholder="Tell us about yourself..."
                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-blue-600 mb-1">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default Profile;
