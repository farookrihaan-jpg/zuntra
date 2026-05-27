import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useLockBodyScroll, useKeyPress } from '@/hooks';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, register, loading } = useAuthStore();
  useLockBodyScroll(true);
  useKeyPress('Escape', onClose);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (mode === 'register') {
      if (!form.name.trim())                          e.name     = 'Name is required';
      if (!form.username.trim())                      e.username = 'Username is required';
      if (!/^[a-z0-9_]+$/.test(form.username))        e.username = 'Letters, numbers, underscores only';
    }
    if (!form.email.trim())                           e.email    = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email))             e.email    = 'Enter a valid email';
    if (!form.password || form.password.length < 6)   e.password = 'At least 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fn = mode === 'login' ? login : register;
    const payload = mode === 'login'
      ? { email: form.email, password: form.password }
      : { name: form.name, username: form.username.toLowerCase(), email: form.email, password: form.password };

    const res = await fn(payload);
    if (res.success) onClose();
  };

  const Field = ({ id, label, type = 'text', placeholder, error }) => (
    <div>
      <label className="label">{label}</label>
      <input
        id={id}
        type={type === 'password' && showPass ? 'text' : type}
        className={`input ${error ? 'border-danger' : ''}`}
        placeholder={placeholder}
        value={form[id]}
        onChange={set(id)}
        autoComplete={id}
      />
      {id === 'password' && (
        <button type="button" onClick={() => setShowPass(v => !v)}
          className="absolute right-3 top-9 text-text-3 hover:text-text-2">
          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-accent">PinVault</h2>
            <p className="text-text-3 text-sm mt-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon mt-1"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <>
              <Field id="name"     label="Full name"  placeholder="Ada Lovelace"  error={errors.name} />
              <Field id="username" label="Username"   placeholder="ada_lovelace"  error={errors.username} />
            </>
          )}
          <Field id="email"    label="Email"     type="email"    placeholder="ada@example.com" error={errors.email} />
          <div className="relative">
            <Field id="password" label="Password" type="password" placeholder="Min. 6 characters"  error={errors.password} />
          </div>

          <button type="submit" className="btn btn-primary w-full py-3 mt-2" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <button type="button"
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErrors({}); }}
            className="text-sm text-text-3 hover:text-text-2 transition-colors text-center">
            {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
          </button>
        </form>

        {/* Demo hint */}
        <p className="text-xs text-text-4 text-center mt-5">
          Demo: use <span className="text-text-3">mira@demo.com</span> / <span className="text-text-3">password123</span>
        </p>
      </div>
    </div>
  );
}
