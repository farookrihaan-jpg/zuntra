import { Link } from 'react-router-dom';
import { getInitials, stringToColor } from '@/utils/helpers';

const SIZES = { xs: 'w-6 h-6 text-[9px]', sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };

export default function Avatar({ user, size = 'md', linkTo, className = '' }) {
  const sizeClass = SIZES[size] || SIZES.md;
  const color     = stringToColor(user?.name || '');
  const initials  = getInitials(user?.name || '?');

  const inner = (
    <div
      className={`avatar ${sizeClass} ${className} border-2 border-border`}
      style={{ background: user?.avatar?.url ? undefined : color }}
    >
      {user?.avatar?.url
        ? <img src={user.avatar.url} alt={user.name} className="w-full h-full rounded-full object-cover" />
        : initials}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="hover:opacity-90 transition-opacity shrink-0">{inner}</Link>;
  }
  return <div className="shrink-0">{inner}</div>;
}
