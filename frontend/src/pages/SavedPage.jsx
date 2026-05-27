import { useEffect, useState } from 'react';
import { pinAPI } from '@/utils/api';
import useAuthStore from '@/store/authStore';
import PinGrid from '@/components/pins/PinGrid';
import { LoadingPage, EmptyState, SectionHeader } from '@/components/common';
import { Bookmark } from 'lucide-react';

export default function SavedPage() {
  const { user }   = useAuthStore();
  const [pins,     setPins]    = useState([]);
  const [loading,  setLoading] = useState(true);
  const [category, setCategory]= useState('');

  useEffect(() => { loadSaved(); }, [user]);

  const loadSaved = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch pins saved by this user (backend filters by savedPins array)
      const res = await pinAPI.getAll({ limit: 100 });
      // Filter locally by isSaved flag (populated by backend)
      const saved = (res.data.data || []).filter(p => p.isSaved);
      setPins(saved);
    } catch {
      setPins([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(pins.map(p => p.category).filter(Boolean))];
  const filtered   = category && category !== 'All' ? pins.filter(p => p.category === category) : pins;

  if (loading) return <LoadingPage />;

  return (
    <div className="pt-6">
      <SectionHeader
        title="Saved Pins"
        subtitle={`${pins.length} pin${pins.length !== 1 ? 's' : ''} saved`}
      />

      {pins.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Heart any pin to save it here for later."
          icon={<Bookmark size={56} strokeWidth={1.2} />}
        />
      ) : (
        <>
          {/* Category filter for saved */}
          {categories.length > 2 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat === 'All' ? '' : cat)}
                  className={`chip text-xs ${(cat === 'All' ? !category : category === cat) ? 'chip-active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          <PinGrid pins={filtered} loading={false} />
        </>
      )}
    </div>
  );
}
