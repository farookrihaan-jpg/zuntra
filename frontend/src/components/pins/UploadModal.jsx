import { useState, useRef, useCallback } from 'react';
import { X, Upload, Image, Tag, ChevronRight, Check } from 'lucide-react';
import usePinStore  from '@/store/pinStore';
import { useLockBodyScroll, useKeyPress } from '@/hooks';
import { CATEGORIES } from '@/utils/helpers';

const STEPS = ['Image', 'Details', 'Publish'];

export default function UploadModal({ onClose }) {
  const createPin = usePinStore(s => s.createPin);
  useLockBodyScroll(true);
  useKeyPress('Escape', onClose);

  const [step,     setStep]     = useState(0);
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState('');
  const [drag,     setDrag]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [form,     setForm]     = useState({
    title: '', description: '', category: '', tags: '', link: '',
  });
  const [errors, setErrors] = useState({});
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep(1);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = 'Title is required';
    if (!form.category)        e.category = 'Pick a category';
    if (!file)                 e.file     = 'Image is required';
    return e;
  };

  const handlePublish = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('category', form.category);
    fd.append('link', form.link.trim());
    fd.append('tags', JSON.stringify(
      form.tags.split(',').map(t => t.trim()).filter(Boolean)
    ));

    const res = await createPin(fd);
    setLoading(false);
    if (res.success) onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal max-w-xl w-full" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-display text-xl font-semibold">Upload a Pin</h2>
            <div className="flex items-center gap-1 mt-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors
                    ${i < step ? 'bg-success text-bg' : i === step ? 'bg-accent text-bg' : 'bg-bg-4 text-text-3'}`}>
                    {i < step ? <Check size={11} /> : i + 1}
                  </div>
                  <span className={`text-xs ${i === step ? 'text-text-2' : 'text-text-4'}`}>{s}</span>
                  {i < STEPS.length - 1 && <ChevronRight size={12} className="text-text-4 mx-0.5" />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <div className="p-6">
          {/* STEP 0 — pick image */}
          {step === 0 && (
            <>
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                  ${drag ? 'border-accent-3 bg-accent/5' : 'border-border-2 hover:border-accent-3 hover:bg-accent/3'}`}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-bg-3 flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} className="text-text-3" />
                </div>
                <p className="text-text-2 font-medium mb-1">Drop your image here</p>
                <p className="text-text-3 text-sm">or click to browse — PNG, JPG, GIF, WebP up to 20MB</p>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              </div>
              {errors.file && <p className="text-xs text-danger mt-2">{errors.file}</p>}
              <button className="btn btn-ghost w-full mt-3" onClick={() => setStep(1)}>
                Continue without image →
              </button>
            </>
          )}

          {/* STEP 1 — details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-28 h-36 rounded-lg overflow-hidden bg-bg-3 border border-border shrink-0 flex items-center justify-center">
                  {preview
                    ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    : <Image size={24} className="text-text-4" />}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="label">Title *</label>
                    <input className={`input ${errors.title ? 'border-danger' : ''}`} placeholder="Give it a title" value={form.title} onChange={set('title')} />
                    {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <label className="label">Link (optional)</label>
                    <input className="input" placeholder="https://…" value={form.link} onChange={set('link')} />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={3} placeholder="What's this about?" value={form.description} onChange={set('description')} />
              </div>

              <div>
                <label className="label">Category *</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CATEGORIES.map(c => (
                    <button key={c}
                      type="button"
                      onClick={() => { setForm(f => ({ ...f, category: c })); setErrors(er => ({ ...er, category: '' })); }}
                      className={`chip text-xs ${form.category === c ? 'chip-active' : ''}`}>{c}</button>
                  ))}
                </div>
                {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="label">Tags <span className="text-text-4">(comma separated)</span></label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-3.5 text-text-3 pointer-events-none" />
                  <input className="input pl-8" placeholder="minimal, dark, craft" value={form.tags} onChange={set('tags')} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — confirm */}
          {step === 2 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-bg-3 overflow-hidden mx-auto mb-4 border border-border">
                {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <Image size={32} className="text-text-4 m-auto mt-6" />}
              </div>
              <h3 className="font-display text-lg font-semibold mb-1">{form.title || 'Untitled pin'}</h3>
              <span className="badge">{form.category}</span>
              {form.description && <p className="text-text-3 text-sm mt-3 line-clamp-2">{form.description}</p>}
              {form.tags && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                  {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className="chip text-xs">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <button className="btn btn-ghost btn-sm" onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}>
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          <div className="flex gap-2">
            {step < 2 && (
              <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>
                Next →
              </button>
            )}
            {step === 2 && (
              <button className="btn btn-primary btn-sm" onClick={handlePublish} disabled={loading}>
                {loading ? 'Publishing…' : '🚀 Publish Pin'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
