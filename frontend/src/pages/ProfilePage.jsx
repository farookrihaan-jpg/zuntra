import { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Grid3X3, Bookmark, LayoutGrid, MapPin, Globe, UserPlus, UserMinus } from 'lucide-react';
import { userAPI } from '@/utils/api';
import useAuthStore from '@/store/authStore';
import Avatar from '@/components/common/Avatar';
import PinGrid from '@/components/pins/PinGrid';
import BoardCard from '@/components/boards/BoardCard';
import { LoadingPage, EmptyState, SectionHeader } from '@/components/common';
import { formatCount, timeAgo } from '@/utils/helpers';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'pins',   label: 'Pins',   Icon: Grid3X3   },
  { key: 'boards', label: 'Boards', Icon: LayoutGrid },
  { key: 'saved',  label: 'Saved',  Icon: Bookmark  },
];

export default function ProfilePage() {
  const { username }  = useParams();
  const { openAuth }  = useOutletContext() || {};
  const { user: me }  = useAuthStore();

  const [profile,    setProfile]    = useState(null);
  const [pins,       setPins]       = useState([]);
  const [boards,     setBoards]     = useState([]);
  const [savedPins,  setSavedPins]  = useState([]);
  const [tab,        setTab]        = useState('pins');
  const [loading,    setLoading]    = useState(true);
  const [following,  setFollowing]  = useState(false);

  const isMe = me?.username === username;

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, pinsRes] = await Promise.all([
        userAPI.getProfile(username),
        userAPI.getUserPins(username),
      ]);
      setProfile(profileRes.data.data);
      setPins(pinsRes.data.data || []);
      setFollowing(profileRes.data.data.isFollowing);
    } catch {
      toast.error('User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!me) { openAuth?.(); return; }
    try {
      const res = await userAPI.toggleFollow(profile._id);
      setFollowing(res.data.isFollowing);
      setProfile(p => ({
        ...p,
        followers: Array(res.data.followerCount).fill(null),
        isFollowing: res.data.isFollowing,
      }));
    } catch { toast.error('Failed to update follow'); }
  };

  if (loading) return <LoadingPage />;
  if (!profile) return <EmptyState title="User not found" />;

  return (
    <div className="pt-8 max-w-5xl mx-auto">
      {/* Profile header */}
      <div className="bg-bg-2 border border-border rounded-xl p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar user={profile} size="xl" className="shrink-0" />

          <div className="flex-1 text-center sm:text-left min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-semibold mb-0.5">{profile.name}</h1>
            <p className="text-text-3 text-sm mb-3">@{profile.username}</p>

            {profile.bio && <p className="text-text-2 text-sm leading-relaxed mb-4 max-w-lg">{profile.bio}</p>}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-5 text-xs text-text-3">
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin size={12} />{profile.location}</span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-accent-2 hover:text-accent transition-colors">
                  <Globe size={12} />{profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mb-5">
              {[
                { label: 'Pins',      value: pins.length },
                { label: 'Followers', value: profile.followers?.length || 0 },
                { label: 'Following', value: profile.following?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center sm:text-left">
                  <p className="text-lg font-semibold text-text">{formatCount(value)}</p>
                  <p className="text-xs text-text-3">{label}</p>
                </div>
              ))}
            </div>

            {!isMe && (
              <button
                onClick={handleFollow}
                className={`btn btn-sm ${following ? 'btn-ghost' : 'btn-primary'}`}
              >
                {following ? <><UserMinus size={14} /> Unfollow</> : <><UserPlus size={14} /> Follow</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-2 p-1 rounded-lg w-fit mb-6">
        {TABS.filter(t => isMe || t.key !== 'saved').map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all
              ${tab === key ? 'bg-bg-4 text-text shadow-sm' : 'text-text-3 hover:text-text-2'}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'pins' && (
        pins.length === 0
          ? <EmptyState title="No pins yet" description={isMe ? 'Upload your first pin!' : `${profile.name} hasn't uploaded any pins yet.`} />
          : <PinGrid pins={pins} loading={false} onAuthRequired={openAuth} />
      )}

      {tab === 'boards' && (
        boards.length === 0
          ? <EmptyState title="No boards" description={isMe ? 'Create a board to organize your saves.' : `${profile.name} has no public boards.`} />
          : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {boards.map(b => <BoardCard key={b._id} board={b} />)}
            </div>
      )}

      {tab === 'saved' && isMe && (
        savedPins.length === 0
          ? <EmptyState title="Nothing saved yet" description="Heart pins to add them here." />
          : <PinGrid pins={savedPins} loading={false} onAuthRequired={openAuth} />
      )}
    </div>
  );
}
