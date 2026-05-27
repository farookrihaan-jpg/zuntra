import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, Bell, LogOut, Settings, User, X } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import usePinStore  from '@/store/pinStore';
import { useDebounce, useClickOutside } from '@/hooks';
import { getInitials, stringToColor } from '@/utils/helpers';

export default function Navbar({ onAuthRequired, onUpload }) {
  const navigate    = useNavigate();
  const { user, logout } = useAuthStore();
  const setFilters  = usePinStore(s => s.setFilters);
  const fetchPins   = usePinStore(s => s.fetchPins);

  const [search,      setSearch]      = useState('');
  const [menuOpen,    setMenuOpen]    = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false));
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setFilters({ search: debouncedSearch });
    fetchPins(true);
  }, [debouncedSearch]);

  const handleUpload = () => {
    if (!user) { onAuthRequired(); return; }
    onUpload();
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[220px] h-[60px] bg-bg/95 backdrop-blur border-b border-border z-40 flex items-center px-4 md:px-6 gap-3">
      {/* Mobile logo */}
      <Link to="/" className="md:hidden font-display text-xl font-semibold text-accent mr-2 shrink-0">
        PV
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-lg relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none" />
        <input
          className="input pl-9 pr-9 py-2 text-sm rounded-full"
          placeholder="Search pins, categories, tags…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          onClick={handleUpload}
          className="btn btn-primary btn-sm hidden sm:inline-flex"
        >
          <Plus size={15} /> Upload
        </button>
        <button onClick={handleUpload} className="btn-icon sm:hidden">
          <Plus size={16} />
        </button>

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="avatar w-9 h-9 text-sm border-2 border-border hover:border-accent-3 transition-colors"
              style={{ background: stringToColor(user.name) }}
            >
              {user.avatar?.url
                ? <img src={user.avatar.url} alt={user.name} className="w-full h-full rounded-full object-cover" />
                : getInitials(user.name)
              }
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 w-52 bg-bg-2 border border-border rounded-lg shadow-2xl shadow-black/50 py-1 animate-scale-in z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-text truncate">{user.name}</p>
                  <p className="text-xs text-text-3 truncate">@{user.username}</p>
                </div>
                <Link to={`/user/${user.username}`} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-2 hover:bg-bg-3 hover:text-text transition-colors">
                  <User size={15} /> Profile
                </Link>
                <Link to="/settings" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-2 hover:bg-bg-3 hover:text-text transition-colors">
                  <Settings size={15} /> Settings
                </Link>
                <div className="border-t border-border mt-1 pt-1">
                  <button onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onAuthRequired} className="btn btn-ghost btn-sm">
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
