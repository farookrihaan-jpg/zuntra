import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Bookmark, LayoutGrid, User, LogIn, ChevronRight } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import usePinStore  from '@/store/pinStore';
import { CATEGORIES } from '@/utils/helpers';

const NAV = [
  { to: '/',       icon: Home,        label: 'Home'    },
  { to: '/saved',  icon: Bookmark,    label: 'Saved'   },
  { to: '/boards', icon: LayoutGrid,  label: 'Boards'  },
];

export default function Sidebar({ onAuthRequired }) {
  const { user }   = useAuthStore();
  const setFilters = usePinStore(s => s.setFilters);
  const fetchPins  = usePinStore(s => s.fetchPins);
  const navigate   = useNavigate();

  const selectCategory = (cat) => {
    setFilters({ category: cat === 'All' ? '' : cat });
    fetchPins(true);
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-bg-2 border-r border-border z-50 hidden md:flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border shrink-0">
        <NavLink to="/" className="font-display text-2xl font-semibold text-accent tracking-tight">
          PinVault
        </NavLink>
        <p className="text-xs text-text-3 mt-0.5">Visual inspiration</p>
      </div>

      {/* Main nav */}
      <nav className="px-3 pt-4 pb-2">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm mb-0.5 transition-all duration-150 relative
              ${isActive
                ? 'text-accent bg-accent/8 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-accent before:rounded-r'
                : 'text-text-2 hover:text-text hover:bg-bg-3'}`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
        {user && (
          <NavLink
            to={`/user/${user.username}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm mb-0.5 transition-all duration-150
              ${isActive ? 'text-accent bg-accent/8' : 'text-text-2 hover:text-text hover:bg-bg-3'}`
            }
          >
            <User size={17} /> Profile
          </NavLink>
        )}
      </nav>

      {/* Categories */}
      <div className="px-3 mt-2 flex-1">
        <p className="px-3 py-2 text-[10px] font-medium text-text-4 uppercase tracking-widest">Categories</p>
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => selectCategory(cat)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-text-2 hover:text-text hover:bg-bg-3 transition-colors text-left"
          >
            <span>{cat}</span>
            <ChevronRight size={13} className="text-text-4" />
          </button>
        ))}
      </div>

      {/* Footer */}
      {!user && (
        <div className="p-4 border-t border-border shrink-0">
          <button onClick={onAuthRequired} className="btn btn-ghost w-full text-sm">
            <LogIn size={15} /> Sign in
          </button>
        </div>
      )}
    </aside>
  );
}
