import { useState, useRef } from 'react';
import { Camera, Save, Lock, User } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import Avatar from '@/components/common/Avatar';
import { SectionHeader } from '@/components/common';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'profile',  label: 'Profile',  Icon: User },
  { key: 'password', label: 'Password', Icon: Lock },
];

export default function SettingsPage() {
  const { user, updateProfile, loading } = useAuthStore();
  const [tab, setTab] = useState('profile');

  return (
    <div className="pt-6 max-w-2xl">
      <SectionHeader title="Settings" subtitle="Manage your account" />

      <div className="flex gap-1 bg-bg-2 p-1 rounded-lg w-fit mb-8">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all
              ${tab === key ? 'bg-bg-4 text-text shadow-sm' : 'text-text-3 hover:text-text-2'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileForm user={user} updateProfile={updateProfile} loading={loading} />}
      {tab === 'password' && <PasswordForm />}
    </div>
  );
}

function ProfileForm({ user, updateProfile, loading }) {
  const [form, setForm] = useState({
    name:     user?.name     || '',
    username: user?.username || '',
    bio:      user?.bio      || '',
    location: user?.location || '',
    website:  user?.website  || '',
  });
  const { updateAvatar } = useAuthStore();
  const fileRef = useRef(null);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(form);
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    await updateAvatar(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-4 bg-bg-2 border border-border rounded-xl p-5">
        <div className="relative">
          <Avatar user={user} size="lg" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center shadow-md hover:bg-accent-2 transition-colors">
            <Camera size={13} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </div>
        <div>
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-text-3">@{user?.username}</p>
          <p className="text-xs text-text-4 mt-1">Click camera to change avatar</p>
        </div>
      </div>

      <div className="bg-bg-2 border border-border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Username</label>
            <input className="input" value={form.username} onChange={set('username')} placeholder="your_username" />
          </div>
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input resize-none" rows={3} value={form.bio} onChange={set('bio')} placeholder="Tell the world about yourself" maxLength={200} />
          <p className="text-xs text-text-4 mt-1 text-right">{form.bio.length}/200</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={set('location')} placeholder="City, Country" />
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" value={form.website} onChange={set('website')} placeholder="https://yoursite.com" />
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        <Save size={15} /> {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}

function PasswordForm() {
  const { loading } = useAuthStore();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const set = (f) => (e) => { setForm(prev => ({ ...prev, [f]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    // Call updatePassword from authAPI
    try {
      const { authAPI } = await import('@/utils/api');
      await authAPI.updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-bg-2 border border-border rounded-xl p-5 space-y-4 max-w-md">
      <h3 className="text-sm font-medium text-text-2">Change Password</h3>
      {['currentPassword','newPassword','confirmPassword'].map((field) => (
        <div key={field}>
          <label className="label">{field === 'currentPassword' ? 'Current password' : field === 'newPassword' ? 'New password' : 'Confirm new password'}</label>
          <input className="input" type="password" value={form[field]} onChange={set(field)} autoComplete={field === 'currentPassword' ? 'current-password' : 'new-password'} />
        </div>
      ))}
      {error && <p className="text-xs text-danger">{error}</p>}
      <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
        <Save size={14} /> Update Password
      </button>
    </form>
  );
}
