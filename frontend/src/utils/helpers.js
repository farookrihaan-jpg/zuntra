import { formatDistanceToNow, format } from 'date-fns';

export const CATEGORIES = [
  'Architecture','Nature','Design','Food','Travel',
  'Fashion','Art','Technology','Minimal','Other',
];

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt',  label: 'Oldest first' },
  { value: '-saves',     label: 'Most saved'   },
  { value: '-views',     label: 'Most viewed'  },
];

export const AVATAR_COLORS = [
  '#8b6240','#4a7a6d','#6b5b8c','#7a4a5c',
  '#4a6b7a','#7a6b4a','#5c7a4a','#7a4a4a',
];

// Deterministic color from string
export function stringToColor(str = '') {
  let hash = 0;
  for (const c of str) hash = (hash << 5) - hash + c.charCodeAt(0);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Initials from full name
export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Compact number: 1200 → 1.2k
export function formatCount(n = 0) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// Relative time: "3 days ago"
export function timeAgo(date) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return ''; }
}

// Absolute date: "Jan 12, 2025"
export function formatDate(date) {
  try { return format(new Date(date), 'MMM d, yyyy'); }
  catch { return ''; }
}

// Build image URL with Cloudinary transformations
export function buildImageUrl(url = '', { width, quality = 'auto' } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url;
  const transforms = [];
  if (width)   transforms.push(`w_${width}`);
  if (quality) transforms.push(`q_${quality}`);
  if (!transforms.length) return url;
  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}

// Extract error message from Axios error
export function getErrorMessage(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
}

// Clamp a value between min and max
export function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

// Generate a random pastel color (for placeholder boards)
export function randomPlaceholderColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 20%, 14%)`;
}
