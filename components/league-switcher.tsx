'use client';

import { useState } from 'react';
import { useLeague } from '@/contexts/league-context';
import CreateLeagueModal from './create-league-modal';

export default function LeagueSwitcher() {
  const { leagues, activeLeagueId, setActiveLeagueId } = useLeague();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {leagues.map(league => (
          <button
            key={league.id}
            onClick={() => setActiveLeagueId(league.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              league.id === activeLeagueId
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {league.name}
          </button>
        ))}
        <button
          onClick={() => setShowCreate(true)}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high flex items-center justify-center transition-all"
        >
          <span className="material-symbols-outlined text-lg">add</span>
        </button>
      </div>

      <CreateLeagueModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </>
  );
}
