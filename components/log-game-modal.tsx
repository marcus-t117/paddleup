'use client';

import { useState } from 'react';
import type { Player } from '@/types';

interface LogGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    opponentName: string;
    playerScore: number;
    opponentScore: number;
    type: 'singles' | 'doubles';
    venue?: string;
  }) => void;
  players: Player[];
}

export default function LogGameModal({ isOpen, onClose, onSubmit, players }: LogGameModalProps) {
  const [opponentName, setOpponentName] = useState('');
  const [playerScore, setPlayerScore] = useState(11);
  const [opponentScore, setOpponentScore] = useState(0);
  const [gameType, setGameType] = useState<'singles' | 'doubles'>('singles');
  const [venue, setVenue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!isOpen) return null;

  const nonUserPlayers = players.filter(p => !p.isUser);
  const filteredPlayers = opponentName.length > 0
    ? nonUserPlayers.filter(p => p.name.toLowerCase().includes(opponentName.toLowerCase()))
    : nonUserPlayers;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponentName.trim()) return;
    onSubmit({
      opponentName: opponentName.trim(),
      playerScore,
      opponentScore,
      type: gameType,
      venue: venue.trim() || undefined,
    });
    // Reset
    setOpponentName('');
    setPlayerScore(11);
    setOpponentScore(0);
    setVenue('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-[2rem] p-6 pb-10 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold font-[family-name:var(--font-headline)] tracking-tight">
            Log New Match
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Game Type Toggle */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
              Game Type
            </label>
            <div className="flex gap-2">
              {(['singles', 'doubles'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGameType(type)}
                  className={`flex-1 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all ${
                    gameType === type
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Opponent */}
          <div className="relative">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
              Opponent
            </label>
            <input
              type="text"
              value={opponentName}
              onChange={e => { setOpponentName(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Type name or select..."
              className="w-full bg-surface-container-highest p-4 rounded-[0.75rem] text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline"
            />
            {showSuggestions && filteredPlayers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-[0.75rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)] max-h-40 overflow-y-auto z-10">
                {filteredPlayers.slice(0, 5).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setOpponentName(p.name); setShowSuggestions(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-surface-container-low text-on-surface font-medium flex items-center justify-between"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-on-surface-variant">{p.elo} ELO</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                Your Score
              </label>
              <div className="flex items-center gap-3 bg-surface-container-highest rounded-[0.75rem] p-2">
                <button
                  type="button"
                  onClick={() => setPlayerScore(Math.max(0, playerScore - 1))}
                  className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="flex-1 text-center text-3xl font-black font-[family-name:var(--font-headline)] text-primary">
                  {playerScore}
                </span>
                <button
                  type="button"
                  onClick={() => setPlayerScore(playerScore + 1)}
                  className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                Their Score
              </label>
              <div className="flex items-center gap-3 bg-surface-container-highest rounded-[0.75rem] p-2">
                <button
                  type="button"
                  onClick={() => setOpponentScore(Math.max(0, opponentScore - 1))}
                  className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="flex-1 text-center text-3xl font-black font-[family-name:var(--font-headline)] text-on-surface-variant">
                  {opponentScore}
                </span>
                <button
                  type="button"
                  onClick={() => setOpponentScore(opponentScore + 1)}
                  className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Venue (optional) */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
              Venue (optional)
            </label>
            <input
              type="text"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              placeholder="Where did you play?"
              className="w-full bg-surface-container-highest p-4 rounded-[0.75rem] text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!opponentName.trim() || playerScore === opponentScore}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Log Match
          </button>
        </form>
      </div>
    </div>
  );
}
