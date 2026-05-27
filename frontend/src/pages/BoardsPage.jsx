import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import useBoardStore from '@/store/boardStore';
import useAuthStore  from '@/store/authStore';
import BoardCard     from '@/components/boards/BoardCard';
import CreateBoardModal from '@/components/boards/CreateBoardModal';
import { LoadingPage, EmptyState, SectionHeader } from '@/components/common';

export default function BoardsPage() {
  const { user }                  = useAuthStore();
  const { boards, loading, fetchBoards } = useBoardStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (user) fetchBoards({ owner: user._id });
  }, [user]);

  if (loading && !boards.length) return <LoadingPage />;

  return (
    <div className="pt-6">
      <SectionHeader
        title="My Boards"
        subtitle={`${boards.length} board${boards.length !== 1 ? 's' : ''}`}
        action={
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Board
          </button>
        }
      />

      {boards.length === 0 ? (
        <EmptyState
          title="No boards yet"
          description="Boards help you organise your saved pins into collections."
          action={
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> Create your first board
            </button>
          }
          icon={
            <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18M3 9h18"/>
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* New board button card */}
          <div
            onClick={() => setShowCreate(true)}
            className="cursor-pointer rounded-lg border-2 border-dashed border-border-2 hover:border-accent-3
                       hover:bg-accent/3 transition-all duration-200 flex flex-col items-center justify-center
                       min-h-[200px] text-text-3 hover:text-accent-2"
          >
            <Plus size={28} className="mb-2 opacity-60" />
            <p className="text-sm font-medium">New Board</p>
          </div>

          {boards.map(board => (
            <BoardCard key={board._id} board={board} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBoardModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
