'use client';

import { useState, useRef } from 'react';
import type { Player } from '@/types';

export interface LogGameData {
  opponentName: string;
  opponent2Name?: string;
  partnerName?: string;
  playerScore: number;
  opponentScore: number;
  type: 'singles' | 'doubles';
  venue?: string;
}

interface LogGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LogGameData) => void;
  players: Player[];
}

function PlayerInput({
  label,
  value,
  onChange,
  players,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  players: Player[];
  placeholder: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const trimmed = value.trim().toLowerCase();
  const filtered = trimmed.length > 0
    ? players.filter(p => p.name.toLowerCase().includes(trimmed))
    : players;

  // Check if the current value matches an existing player
  const exactMatch = players.find(p => p.name.toLowerCase() === trimmed);
  const isNewPlayer = trimmed.length > 0 && !exactMatch;

  // On blur, auto-correct to existing player's canonical name if there's a case-insensitive match
  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
      if (exactMatch && value !== exactMatch.name) {
        onChange(exactMatch.name);
      }
    }, 200);
  };

  return (
    <div className="relative">
      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setShowSuggestions(true); }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full bg-surface-container-highest p-4 rounded-[0.75rem] text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline"
      />
      {/* New player indicator */}
      {isNewPlayer && !showSuggestions && (
        <span className="absolute right-4 top-[38px] text-[10px] font-bold text-tertiary uppercase tracking-widest">
          New player
        </span>
      )}
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest rounded-[0.75rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)] max-h-40 overflow-y-auto z-10">
          {filtered.slice(0, 5).map(p => (
            <button
              key={p.id}
              type="button"
              onMouseDown={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
              onClick={() => { onChange(p.name); setShowSuggestions(false); }}
              className="w-full text-left px-4 py-3 hover:bg-surface-container-low text-on-surface font-medium flex items-center justify-between"
            >
              <span>{p.name}</span>
              <span className="text-xs text-on-surface-variant">{p.elo} ELO</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LogGameModal({ isOpen, onClose, onSubmit, players }: LogGameModalProps) {
  const [opponentName, setOpponentName] = useState('');
  const [opponent2Name, setOpponent2Name] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [playerScore, setPlayerScore] = useState(11);
  const [opponentScore, setOpponentScore] = useState(0);
  const [gameType, setGameType] = useState<'singles' | 'doubles'>('singles');
  const [venue, setVenue] = useState('');

  if (!isOpen) return null;

  const nonUserPlayers = players.filter(p => !p.isUser);
  const isDoubles = gameType === 'doubles';

  const canSubmit = opponentName.trim()
    && playerScore !== opponentScore
    && (!isDoubles || (partnerName.trim() && opponent2Name.trim()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      opponentName: opponentName.trim(),
      opponent2Name: isDoubles ? opponent2Name.trim() : undefined,
      partnerName: isDoubles ? partnerName.trim() : undefined,
      playerScore,
      opponentScore,
      type: gameType,
      venue: venue.trim() || undefined,
    });
    // Reset
    setOpponentName('');
    setOpponent2Name('');
    setPartnerName('');
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

          {/* Doubles: Your Partner */}
          {isDoubles && (
            <PlayerInput
              label="Your Partner"
              value={partnerName}
              onChange={setPartnerName}
              players={nonUserPlayers}
              placeholder="Who's on your team?"
            />
          )}

          {/* Opponent 1 */}
          <PlayerInput
            label={isDoubles ? 'Opponent 1' : 'Opponent'}
            value={opponentName}
            onChange={setOpponentName}
            players={nonUserPlayers}
            placeholder="Type name or select..."
          />

          {/* Doubles: Opponent 2 */}
          {isDoubles && (
            <PlayerInput
              label="Opponent 2"
              value={opponent2Name}
              onChange={setOpponent2Name}
              players={nonUserPlayers}
              placeholder="Their partner..."
            />
          )}

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                {isDoubles ? 'Your Team' : 'Your Score'}
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
                {isDoubles ? 'Their Team' : 'Their Score'}
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
            disabled={!canSubmit}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Log Match
          </button>
        </form>
      </div>
    </div>
  );
}