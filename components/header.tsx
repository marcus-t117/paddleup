'use client';

import { usePlayers } from '@/hooks/use-players';
import { getInitials, getAvatarColour } from '@/lib/utils';

export default function Header() {
  const { currentUser } = usePlayers();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-16 bg-surface/80 backdrop-blur-[24px]">
      <div className="flex items-center gap-3">
        {currentUser && (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-on-primary"
            style={{ backgroundColor: getAvatarColour(currentUser.name) }}
          >
            {getInitials(currentUser.name)}
          </div>
        )}
        <span className="text-xl font-black italic tracking-tighter text-primary font-[family-name:var(--font-headline)]">
          PaddleUp
        </span>
      </div>
      <button className="text-primary hover:opacity-80 transition-opacity active:scale-90">
        <span className="material-symbols-outlined">notifications</span>
      </button>
    </header>
  );
}
