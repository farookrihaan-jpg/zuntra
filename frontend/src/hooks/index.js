import { useState, useEffect, useCallback, useRef } from 'react';

// ─── useDebounce ──────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── useClickOutside ──────────────────────────────────────────────────────────
export function useClickOutside(callback) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) callback(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [callback]);
  return ref;
}

// ─── useKeyPress ──────────────────────────────────────────────────────────────
export function useKeyPress(key, callback) {
  useEffect(() => {
    const handler = (e) => { if (e.key === key) callback(e); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback]);
}

// ─── useLockBodyScroll ────────────────────────────────────────────────────────
export function useLockBodyScroll(lock = true) {
  useEffect(() => {
    if (lock) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [lock]);
}

// ─── useLocalStorage ──────────────────────────────────────────────────────────
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; }
    catch { return initialValue; }
  });
  const set = useCallback((val) => {
    try { const v = val instanceof Function ? val(value) : val; setValue(v); localStorage.setItem(key, JSON.stringify(v)); }
    catch {}
  }, [key, value]);
  return [value, set];
}

// ─── useImageLoad ─────────────────────────────────────────────────────────────
export function useImageLoad(src) {
  const [loaded,  setLoaded]  = useState(false);
  const [error,   setError]   = useState(false);
  useEffect(() => {
    if (!src) return;
    setLoaded(false); setError(false);
    const img = new Image();
    img.onload  = () => setLoaded(true);
    img.onerror = () => setError(true);
    img.src = src;
  }, [src]);
  return { loaded, error };
}

// ─── useIntersectionObserver ──────────────────────────────────────────────────
export function useIntersectionObserver(callback, options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) callback(); }, options);
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [callback, options]);
  return ref;
}
