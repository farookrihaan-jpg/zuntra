import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '@/utils/helpers';

export default function CategoryFilter({ active, onChange }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  const all = ['All', ...CATEGORIES];

  return (
    <div className="relative flex items-center gap-1 mb-7">
      <button onClick={() => scroll(-1)} className="btn-icon shrink-0 hidden sm:flex">
        <ChevronLeft size={15} />
      </button>

      <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide py-1 flex-1">
        {all.map(cat => (
          <button
            key={cat}
            onClick={() => onChange(cat === 'All' ? '' : cat)}
            className={`chip whitespace-nowrap shrink-0 ${(cat === 'All' ? !active : active === cat) ? 'chip-active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <button onClick={() => scroll(1)} className="btn-icon shrink-0 hidden sm:flex">
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
