import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Edit2, Trash2 } from 'lucide-react';
import { boardAPI } from '@/utils/api';
import useAuthStore  from '@/store/authStore';
import useBoardStore from '@/store/boardStore';
import PinGrid       from '@/components/pins/PinGrid';
import Avatar        from '@/components/common/Avatar';
import { LoadingPage, EmptyState } from '@/components/common';
import { timeAgo } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function BoardPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuthStore();
  const deleteBoard = useBoardStore(s => s.deleteBoard);

  const [board,   setBoard]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await boardAPI.getOne(id);
      setBoard(res.data.data);
    } catch {
      toast.error('Board not found');
      navigate('/boards');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this board?')) return;
    await deleteBoard(board._id);
    navigate('/boards');
  };

  if (loading) return <LoadingPage />;
  if (!board)  return null;

  const isOwner = user?._id === (board.owner?._id || board.owner);
  const pins    = board.pins || [];

  return (
    <div className="pt-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-text-3 hover:text-text-2 text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Back
      </button>

      {/* Board header */}
      <div className="bg-bg-2 border border-border rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {board.isPrivate && <Lock size={14} className="text-text-3" />}
              <h1 className="font-display text-2xl font-semibold">{board.name}</h1>
            </div>
            {board.description && <p className="text-text-3 text-sm mt-1 mb-3 max-w-lg">{board.description}</p>}
            <div className="flex items-center gap-3 text-xs text-text-4">
              <span>{pins.length} pins</span>
              <span>·</span>
              <span>Created {timeAgo(board.createdAt)}</span>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2 shrink-0">
              <button className="btn-icon" title="Edit board" onClick={() => toast('Board editing coming soon')}>
                <Edit2 size={15} />
              </button>
              <button className="btn-icon text-danger hover:bg-danger/10" title="Delete board" onClick={handleDelete}>
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>

        {board.owner && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <Avatar user={board.owner} size="sm" linkTo={`/user/${board.owner.username}`} />
            <span className="text-sm text-text-2">
              by <span className="font-medium">{board.owner.name}</span>
            </span>
          </div>
        )}
      </div>

      {pins.length === 0 ? (
        <EmptyState
          title="This board is empty"
          description="Save pins and add them to this board."
          icon={<svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>}
        />
      ) : (
        <PinGrid pins={pins} loading={false} />
      )}
    </div>
  );
}
