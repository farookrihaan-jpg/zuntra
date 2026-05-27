import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import usePinStore  from '@/store/pinStore';
import useAuthStore from '@/store/authStore';
import PinGrid, { PinGridSkeleton } from '@/components/pins/PinGrid';
import CategoryFilter from '@/components/pins/CategoryFilter';
import { Spinner } from '@/components/common';

export default function HomePage() {
  const { openAuth } = useOutletContext() || {};
  const { user }   = useAuthStore();
  const { pins, loading, hasMore, filters, fetchPins, setFilters } = usePinStore();
  const [category, setCategory] = useState(filters.category || '');

  // Initial load
  useEffect(() => {
    if (!pins.length) fetchPins(true);
  }, []);

  const handleCategoryChange = useCallback((cat) => {
    setCategory(cat);
    setFilters({ category: cat });
    fetchPins(true);
  }, [setFilters, fetchPins]);

  return (
    <div className="pt-6">
      <CategoryFilter active={category} onChange={handleCategoryChange} />

      <InfiniteScroll
        dataLength={pins.length}
        next={() => fetchPins(false)}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        }
        endMessage={
          pins.length > 0 && (
            <p className="text-center text-text-4 text-xs py-8">
              You've seen all {pins.length} pins ✦
            </p>
          )
        }
        scrollThreshold={0.85}
      >
        <PinGrid
          pins={pins}
          loading={loading}
          onAuthRequired={openAuth}
        />
      </InfiniteScroll>
    </div>
  );
}
