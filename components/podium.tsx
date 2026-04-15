'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Player } from '@/types';
import { getInitials, getAvatarColour } from '@/lib/utils';

interface PodiumProps {
  players: Player[]; // top 3, sorted by ELO desc
  userId?: string | null;
  onRemove?: (playerId: string) => void;
}

function RemoveButton({ onRemove }: { onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirming) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setConfirming(false);
      onRemove();
    } else {
      setConfirming(true);
      timeoutRef.current = setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-all z-20 shadow-sm ${
        confirming
          ? 'bg-error text-on-error'
          : 'bg-surface-container-highest text-on-surface-variant hover:bg-error/30 hover:text-error'
      }`}
      title={confirming ? 'Tap again to confirm remove' : 'Remove from league'}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
        {confirming ? 'warning' : 'close'}
      </span>
    </button>
  );
}

export default function Podium({ players, userId, onRemove }: PodiumProps) {
  const router = useRouter();
  const [first, second, third] = players;

  const showRemove = (p: Player) => Boolean(onRemove && p.id !== userId);
  const goToProfile = (id: string) => router.push(`/player/${id}`);

  return (
    <div className="flex items-end justify-center gap-3 pt-8 pb-4">
      {/* 2nd Place */}
      {second && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="absolute -top-2 -left-2 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
              2ND
            </div>
            <button
              type="button"
              onClick={() => goToProfile(second.id)}
              className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-2 border-outline-variant/30 active:scale-95 transition-transform"
              style={{ backgroundColor: getAvatarColour(second.name), color: '#d9ffad' }}
            >
              {getInitials(second.name)}
            </button>
            {showRemove(second) && <RemoveButton onRemove={() => onRemove!(second.id)} />}
          </div>
          <span className="text-xs font-medium text-on-surface truncate max-w-[80px]">{second.name}</span>
          <span className="text-sm font-bold text-on-surface-variant">{second.elo.toLocaleString()}</span>
        </div>
      )}

      {/* 1st Place */}
      {first && (
        <div className="flex flex-col items-center gap-2 -mt-4">
          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="material-symbols-outlined text-primary-fixed text-2xl icon-filled">emoji_events</span>
            </div>
            <button
              type="button"
              onClick={() => goToProfile(first.id)}
              className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold border-3 border-primary-fixed bg-primary-container shadow-lg shadow-primary-fixed/20 active:scale-95 transition-transform"
              style={{ color: '#345c00' }}
            >
              {getInitials(first.name)}
            </button>
            {showRemove(first) && <RemoveButton onRemove={() => onRemove!(first.id)} />}
          </div>
          <span className="text-sm font-bold text-on-surface">{first.name}</span>
          <span className="text-lg font-black font-[family-name:var(--font-headline)] text-primary">{first.elo.toLocaleString()}</span>
        </div>
      )}

      {/* 3rd Place */}
      {third && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="absolute -top-2 -right-2 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
              3RD
            </div>
            <button
              type="button"
              onClick={() => goToProfile(third.id)}
              className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-2 border-tertiary-container/50 active:scale-95 transition-transform"
              style={{ backgroundColor: getAvatarColour(third.name), color: '#fff0ea' }}
            >
              {getInitials(third.name)}
            </button>
            {showRemove(third) && <RemoveButton onRemove={() => onRemove!(third.id)} />}
          </div>
          <span className="text-xs font-medium text-on-surface truncate max-w-[80px]">{third.name}</span>
          <span className="text-sm font-bold text-on-surface-variant">{third.elo.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
