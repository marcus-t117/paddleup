'use client';

import { useState } from 'react';
import { useLeague } from '@/contexts/league-context';
import { usePlayers } from '@/hooks/use-players';
import { getInitials, getAvatarColour } from '@/lib/utils';

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateLeagueModal({ isOpen, onClose }: CreateLeagueModalProps) {
  const { createLeague } = useLeague();
  const { globalPlayers, userId } = usePlayers();
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const nonUserPlayers = globalPlayers.filter(p => !p.isUser);

  const togglePlayer = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !userId) return;

    // Always include the current user
    const memberIds = [userId, ...Array.from(selectedIds)];
    createLeague(name.trim(), memberIds);

    // Reset
    setName('');
    setSelectedIds(new Set());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-[2rem] p-6 pb-10 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold font-[family-name:var(--font-headline)] tracking-tight">
            Create League
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* League Name */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
              League Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Saturday Crew, Office League..."
              className="w-full bg-surface-container-highest p-4 rounded-[0.75rem] text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline"
            />
          </div>

          {/* Member Selection */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
              Add Members
            </label>
            <p className="text-xs text-on-surface-variant mb-3">You're automatically included. Select others to add.</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {nonUserPlayers.map(player => {
                const selected = selectedIds.has(player.id);
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => togglePlayer(player.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-[1rem] transition-all ${
                      selected
                        ? 'bg-primary-container/30'
                        : 'bg-surface-container-low hover:bg-surface-container-high'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: getAvatarColour(player.name), color: '#d9ffad' }}
                    >
                      {getInitials(player.name)}
                    </div>
                    <span className="font-medium text-on-surface flex-1 text-left">{player.name}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      selected ? 'bg-primary' : 'bg-surface-container-highest'
                    }`}>
                      {selected && (
                        <span className="material-symbols-outlined text-on-primary text-sm icon-filled">check</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create League
          </button>
        </form>
      </div>
    </div>
  );
}
