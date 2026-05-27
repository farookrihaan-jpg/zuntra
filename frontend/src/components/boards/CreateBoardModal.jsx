import { useState } from 'react';
import { X, Lock, Globe } from 'lucide-react';
import useBoardStore from '@/store/boardStore';
import { useLockBodyScroll, useKeyPress } from '@/hooks';
import { CATEGORIES } from '@/utils/helpers';

export default function CreateBoardModal({ onClose, onCreated }) {
  const createBoard = useBoardStore(s => s.createBoard);
  useLockBodyScroll(true);
  useKeyPress('Escape', onClose);

  const [form, setForm] = useState({ name: '', description: '', category: '', isPrivate: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Board name is required'); return; }
    setLoading(true);
    const res = await createBoard(form);
    setLoading(false);
    if (res.success) { onCreated?.(res.board); onClose(); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal max-w-md w-full p-7" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold">Create Board</h2>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Board name *</label>
            <input className={`input ${error ? 'border-danger' : ''}`} placeholder="e.g. Dark Architecture"
              value={form.name} onChange={e => { set('name')(e); setError(''); }} autoFocus />
            {error && <p className="text-xs text-danger mt-1">{error}</p>}
          </div>

          <div>
            <label className="label">Description <span className="text-text-4">(optional)</span></label>
            <textarea className="input resize-none" rows={2} placeholder="What's this board about?"
              value={form.description} onChange={set('description')} />
          </div>

          <div>
            <label className="label">Category <span className="text-text-4">(optional)</span></label>
            <select className="input bg-bg-3" value={form.category} onChange={set('category')}>
              <option value="">Select a category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div
            onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))}
            className={`flex items-center gap-3 p-3.5 rounded-md border cursor-pointer transition-all
              ${form.isPrivate ? 'border-accent-3 bg-accent/5' : 'border-border hover:border-border-2'}`}
          >
            {form.isPrivate ? <Lock size={16} className="text-accent-2" /> : <Globe size={16} className="text-text-3" />}
            <div>
              <p className="text-sm text-text">{form.isPrivate ? 'Private' : 'Public'}</p>
              <p className="text-xs text-text-3">{form.isPrivate ? 'Only you can see this board' : 'Anyone can discover this board'}</p>
            </div>
            <div className={`ml-auto w-9 h-5 rounded-full transition-colors flex items-center
              ${form.isPrivate ? 'bg-accent justify-end' : 'bg-bg-4 justify-start'}`}>
              <div className="w-3.5 h-3.5 rounded-full bg-bg mx-0.5" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading ? 'Creating…' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
