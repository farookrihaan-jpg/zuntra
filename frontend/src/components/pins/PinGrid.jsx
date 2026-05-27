import PinCard from './PinCard';

// Skeleton loader cards
export function PinGridSkeleton({ count = 12 }) {
  const heights = [160, 220, 180, 260, 200, 240, 180, 300, 220, 190, 250, 210];
  return (
    <div className="masonry">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="masonry-item">
          <div className="rounded-lg overflow-hidden bg-bg-2 border border-border">
            <div className="skeleton" style={{ height: heights[i % heights.length] }} />
            <div className="px-3 py-2.5 space-y-1.5">
              <div className="skeleton h-3 rounded w-3/4" />
              <div className="skeleton h-2.5 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PinGrid({ pins, loading, onAuthRequired }) {
  if (loading && !pins.length) return <PinGridSkeleton />;

  if (!loading && !pins.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-text-3">
        <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="mb-4 opacity-30">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <p className="text-text-2 text-base mb-1">No pins found</p>
        <p className="text-sm">Try a different category or search term</p>
      </div>
    );
  }

  return (
    <div className="masonry">
      {pins.map(pin => (
        <PinCard key={pin._id} pin={pin} onAuthRequired={onAuthRequired} />
      ))}
    </div>
  );
}
