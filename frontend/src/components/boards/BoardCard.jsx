import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { buildImageUrl } from '@/utils/helpers';

export default function BoardCard({ board }) {
  const navigate = useNavigate();
  const pins     = board.pins?.slice(0, 3) || [];

  // First pin as main cover
  const cover = board.coverImage?.url || pins[0]?.image?.url || '';

  return (
    <div
      className="card-hover cursor-pointer"
      onClick={() => navigate(`/boards/${board._id}`)}
    >
      {/* Preview grid */}
      <div className="grid grid-cols-3 gap-0.5 h-36 overflow-hidden">
        {cover ? (
          <>
            <div className="col-span-2 row-span-1 bg-bg-3 overflow-hidden h-36">
              <img src={buildImageUrl(cover, { width: 400 })} alt={board.name}
                className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="flex flex-col gap-0.5">
              {[1, 2].map(i => (
                <div key={i} className="flex-1 bg-bg-3 overflow-hidden">
                  {pins[i]?.image?.url
                    ? <img src={buildImageUrl(pins[i].image.url, { width: 200 })} alt=""
                        className="w-full h-full object-cover" loading="lazy" />
                    : <div className="w-full h-full" style={{ background: `hsl(${(i * 60 + 20) % 360},15%,14%)` }} />}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="col-span-3 flex items-center justify-center bg-bg-3 text-text-4 text-xs">
            Empty board
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          {board.isPrivate && <Lock size={12} className="text-text-3 shrink-0" />}
          <p className="text-sm font-medium text-text truncate">{board.name}</p>
        </div>
        <p className="text-xs text-text-3">{board.pins?.length || 0} pins</p>
      </div>
    </div>
  );
}
