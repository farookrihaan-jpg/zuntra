import { X } from 'lucide-react';
import { useLockBodyScroll, useKeyPress } from '@/hooks';

// ─── Modal wrapper ────────────────────────────────────────────────────────────
export function Modal({ children, onClose, maxWidth = 'max-w-lg', className = '' }) {
  useLockBodyScroll(true);
  useKeyPress('Escape', onClose);
  return (
    <div className="overlay" onClick={onClose}>
      <div className={`modal ${maxWidth} w-full ${className}`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── Modal header ─────────────────────────────────────────────────────────────
export function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between p-6 border-b border-border">
      <div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {subtitle && <p className="text-text-3 text-sm mt-0.5">{subtitle}</p>}
      </div>
      <button onClick={onClose} className="btn-icon mt-0.5"><X size={16} /></button>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      className={`animate-spin text-accent ${className}`}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Loading page ──────────────────────────────────────────────────────────────
export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner size={32} />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {icon && <div className="text-text-4 opacity-40 mb-5">{icon}</div>}
      <p className="text-text-2 text-base font-medium mb-1">{title}</p>
      {description && <p className="text-text-3 text-sm mb-5">{description}</p>}
      {action}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-5 ${className}`}>
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">{title}</h1>
        {subtitle && <p className="text-text-3 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
export function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  return (
    <Modal onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6">
        <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
        <p className="text-text-3 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button className="btn btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger flex-1" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  );
}
