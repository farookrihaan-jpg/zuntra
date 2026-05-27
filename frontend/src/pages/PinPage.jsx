import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ExternalLink, Send, Trash2, ArrowLeft, Share2, MoreHorizontal } from 'lucide-react';
import { pinAPI, boardAPI } from '@/utils/api';
import useAuthStore  from '@/store/authStore';
import usePinStore   from '@/store/pinStore';
import useBoardStore from '@/store/boardStore';
import Avatar from '@/components/common/Avatar';
import PinGrid from '@/components/pins/PinGrid';
import { LoadingPage, EmptyState } from '@/components/common';
import { timeAgo, formatCount, buildImageUrl } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function PinPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const toggleSave = usePinStore(s => s.toggleSave);
  const deletePin  = usePinStore(s => s.deletePin);
  const { boards, fetchBoards, addPinToBoard } = useBoardStore();

  const [pin,       setPin]       = useState(null);
  const [related,   setRelated]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [comment,   setComment]   = useState('');
  const [posting,   setPosting]   = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const [pinRes, relRes] = await Promise.all([
        pinAPI.getOne(id),
        pinAPI.getRelated(id),
      ]);
      setPin(pinRes.data.data);
      setRelated(relRes.data.data || []);
    } catch {
      toast.error('Pin not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) { toast('Sign in to save pins', { icon: '🔒' }); return; }
    const res = await toggleSave(pin._id);
    if (res.isSaved !== undefined) setPin(p => ({ ...p, isSaved: res.isSaved, saves: Array(res.saveCount || 0).fill(null) }));
  };

  const handleAddToBoard = async (boardId) => {
    await addPinToBoard(boardId, pin._id);
    setBoardOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this pin permanently?')) return;
    await deletePin(pin._id);
    navigate('/');
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { toast('Sign in to comment', { icon: '🔒' }); return; }
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const res = await pinAPI.addComment(pin._id, { content: comment.trim() });
      setPin(p => ({ ...p, comments: [res.data.data, ...(p.comments || [])] }));
      setComment('');
    } catch { toast.error('Failed to post comment'); }
    finally { setPosting(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await pinAPI.deleteComment(pin._id, commentId);
      setPin(p => ({ ...p, comments: p.comments.filter(c => c._id !== commentId) }));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete comment'); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  if (loading) return <LoadingPage />;
  if (!pin) return <EmptyState title="Pin not found" />;

  const author = pin.author || {};
  const isMine = user?._id === (author._id || author);

  return (
    <div className="pt-6 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-text-3 hover:text-text-2 text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-8 lg:gap-12">
        {/* Image */}
        <div className="lg:max-w-[480px] w-full">
          <div className="rounded-xl overflow-hidden bg-bg-3 border border-border shadow-2xl shadow-black/40">
            <img
              src={buildImageUrl(pin.image?.url, { width: 960 })}
              alt={pin.title}
              className="w-full block"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Actions bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSave}
              className={`btn btn-sm gap-1.5 ${pin.isSaved ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Heart size={14} fill={pin.isSaved ? 'currentColor' : 'none'} />
              {pin.isSaved ? 'Saved' : 'Save'}
              <span className="text-xs opacity-70">{formatCount(pin.saves?.length || 0)}</span>
            </button>

            {user && (
              <button className="btn btn-ghost btn-sm" onClick={() => { fetchBoards({ owner: user._id }); setBoardOpen(v => !v); }}>
                + Add to board
              </button>
            )}
            <button className="btn-icon ml-auto" onClick={handleShare} title="Copy link">
              <Share2 size={15} />
            </button>
            {isMine && (
              <button className="btn-icon text-danger hover:bg-danger/10" onClick={handleDelete} title="Delete pin">
                <Trash2 size={15} />
              </button>
            )}
          </div>

          {/* Board picker */}
          {boardOpen && (
            <div className="bg-bg-3 border border-border rounded-lg p-4 animate-scale-in">
              <p className="text-xs text-text-3 mb-3">Add to board</p>
              {boards.length === 0
                ? <p className="text-xs text-text-4">No boards yet. Create one first.</p>
                : boards.map(b => (
                  <button key={b._id} onClick={() => handleAddToBoard(b._id)}
                    className="w-full text-left px-3 py-2 rounded text-sm text-text-2 hover:bg-bg-4 hover:text-text transition-colors">
                    {b.name} <span className="text-text-4 text-xs ml-1">{b.pins?.length || 0} pins</span>
                  </button>
                ))}
            </div>
          )}

          {/* Title + meta */}
          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight mb-2">{pin.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="badge">{pin.category}</span>
              <span className="text-xs text-text-4">{pin.views} views</span>
              <span className="text-xs text-text-4">{timeAgo(pin.createdAt)}</span>
            </div>
          </div>

          {pin.description && (
            <p className="text-text-2 text-sm leading-relaxed">{pin.description}</p>
          )}

          {pin.link && (
            <a href={pin.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-accent-2 hover:text-accent transition-colors">
              <ExternalLink size={14} /> Visit link
            </a>
          )}

          {pin.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pin.tags.map(t => <span key={t} className="chip text-xs">#{t}</span>)}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-3 py-4 border-t border-b border-border">
            <Avatar user={author} size="md" linkTo={`/user/${author.username}`} />
            <div>
              <Link to={`/user/${author.username}`} className="text-sm font-medium hover:text-accent-2 transition-colors">
                {author.name}
              </Link>
              <p className="text-xs text-text-3">@{author.username}</p>
            </div>
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-sm font-medium text-text-2 mb-4">
              Comments {pin.comments?.length > 0 && <span className="text-text-4">({pin.comments.length})</span>}
            </h3>

            <form onSubmit={handleComment} className="flex gap-2 mb-5">
              {user && <Avatar user={user} size="sm" />}
              <input
                className="input flex-1 py-2 text-sm"
                placeholder={user ? 'Add a comment…' : 'Sign in to comment'}
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={!user || posting}
              />
              {user && (
                <button type="submit" className="btn-icon" disabled={!comment.trim() || posting}>
                  <Send size={14} />
                </button>
              )}
            </form>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {(pin.comments || []).map(c => (
                <div key={c._id} className="flex gap-2.5 group">
                  <Avatar user={c.user} size="sm" linkTo={`/user/${c.user?.username}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/user/${c.user?.username}`} className="text-xs font-medium hover:text-accent-2 transition-colors">
                        {c.user?.name}
                      </Link>
                      <span className="text-[10px] text-text-4">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-text-2 mt-0.5">{c.content}</p>
                  </div>
                  {(user?._id === c.user?._id || isMine) && (
                    <button onClick={() => handleDeleteComment(c._id)}
                      className="opacity-0 group-hover:opacity-100 text-text-4 hover:text-danger transition-all shrink-0 mt-0.5">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related pins */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl font-semibold mb-6">More like this</h2>
          <PinGrid pins={related} loading={false} />
        </div>
      )}
    </div>
  );
}
