import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MoreHorizontal, Trash2, ExternalLink } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import usePinStore  from '@/store/pinStore';
import { getInitials, stringToColor, formatCount, buildImageUrl } from '@/utils/helpers';
import { useClickOutside } from '@/hooks';

export default function PinCard({ pin, onAuthRequired }) {
  const navigate    = useNavigate();
  const { user }    = useAuthStore();
  const toggleSave  = usePinStore(s => s.toggleSave);
  const deletePin   = usePinStore(s => s.deletePin);

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [imgLoaded,  setImgLoaded]  = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false));

  const isMine  = user?._id === (pin.author?._id || pin.author);
  const isSaved = pin.isSaved;

  const handleSave = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { onAuthRequired?.(); return; }
    await toggleSave(pin._id);
  };

  const handleDelete = async (e) => {
    e.preventDefault(); e.stopPropagation();
    setMenuOpen(false);
    if (confirm('Delete this pin?')) await deletePin(pin._id);
  };

  const author = pin.author || {};

  return (
    <div className="masonry-item group">
      <div
        className="relative rounded-lg overflow-hidden bg-bg-3 border border-border cursor-pointer
                   transition-all duration-200 hover:border-border-2 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40"
        onClick={() => navigate(`/pin/${pin._id}`)}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ minHeight: 120 }}>
          {!imgLoaded && <div className="skeleton absolute inset-0" style={{ height: pin.image?.height ? `${pin.image.height * 0.4}px` : '160px' }} />}
          <img
            src={buildImageUrl(pin.image?.url, { width: 600 })}
            alt={pin.title}
            className={`w-full block transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Actions overlay */}
          <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleSave}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                         border transition-all duration-150 backdrop-blur-sm
                         ${isSaved
                           ? 'bg-accent text-bg border-accent'
                           : 'bg-bg/80 text-text border-white/10 hover:bg-accent hover:text-bg hover:border-accent'}`}
            >
              <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
            </button>

            {isMine && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(v => !v); }}
                  className="w-8 h-8 rounded-full bg-bg/80 border border-white/10 flex items-center justify-center text-text backdrop-blur-sm hover:bg-bg transition-colors"
                >
                  <MoreHorizontal size={14} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-9 w-40 bg-bg-2 border border-border rounded-lg shadow-xl py-1 z-30 animate-scale-in"
                    onClick={e => e.stopPropagation()}>
                    <Link to={`/pin/${pin._id}`}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-text-2 hover:bg-bg-3 hover:text-text transition-colors">
                      <ExternalLink size={13} /> View pin
                    </Link>
                    <button onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors">
                      <Trash2 size={13} /> Delete pin
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category badge */}
          <div className="absolute bottom-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="badge text-[10px] backdrop-blur-sm">{pin.category}</span>
          </div>
        </div>

        {/* Info */}
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium text-text truncate mb-1">{pin.title}</p>
          <div className="flex items-center justify-between">
            <Link
              to={`/user/${author.username}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 group/author min-w-0"
            >
              <div
                className="avatar w-5 h-5 text-[9px] shrink-0"
                style={{ background: stringToColor(author.name || '') }}
              >
                {author.avatar?.url
                  ? <img src={author.avatar.url} className="w-full h-full rounded-full object-cover" alt="" />
                  : getInitials(author.name || '')}
              </div>
              <span className="text-xs text-text-3 truncate group-hover/author:text-text-2 transition-colors">
                {author.name || 'Unknown'}
              </span>
            </Link>
            <span className="text-[11px] text-text-4 shrink-0 ml-2">
              {formatCount(pin.saves?.length || 0)} ♥
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
