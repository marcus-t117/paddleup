'use client';

import { useState, useEffect } from 'react';
import type { Player } from '@/types';
import type { SharedSlice } from '@/lib/sync';
import { SHARED_LEAGUES } from '@/lib/constants';

interface SetupScreenProps {
  onComplete: () => void;
}

export default function SetupScreen({ onComplete }: SetupScreenProps) {
  const [step, setStep] = useState<'name' | 'league'>('name');
  const [name, setName] = useState('');
  const [leagueName, setLeagueName] = useState('');
  const [existingPlayers, setExistingPlayers] = useState<Player[] | null>(null);
  const [sharedSlice, setSharedSlice] = useState<SharedSlice | null>(null);

  useEffect(() => {
    const sharedLeagueId = SHARED_LEAGUES[0]?.id;
    if (!sharedLeagueId) return;

    import('@/lib/sync').then(({ pullShared }) =>
      pullShared(sharedLeagueId).then(result => {
        if (result.ok && result.slice.players.length > 0) {
          setExistingPlayers(result.slice.players);
          setSharedSlice(result.slice);
        } else {
          setExistingPlayers([]);
        }
      })
    );
  }, []);

  const handleSelectExisting = async (player: Player) => {
    if (!sharedSlice) return;
    const { claimExistingUser } = await import('@/lib/storage');
    claimExistingUser(player.id, sharedSlice);
    onComplete();
  };

  const handleNext = () => {
    if (step === 'name' && name.trim()) {
      setStep('league');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !leagueName.trim()) return;
    const { initializeWithSetup } = await import('@/lib/storage');
    initializeWithSetup(name.trim(), leagueName.trim());
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-12 text-center">
        <span className="text-5xl font-black italic tracking-tighter text-primary font-[family-name:var(--font-headline)]">
          PaddleUp
        </span>
        <p className="text-on-surface-variant text-sm mt-2 font-medium">
          Track games. Climb ranks. Earn badges.
        </p>
      </div>

      {step === 'name' && (
        <div className="w-full max-w-sm space-y-6">

          {/* Existing players — show when loaded and available */}
          {existingPlayers && existingPlayers.length > 0 && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">
                Who are you?
              </label>
              <div className="flex flex-wrap gap-2">
                {existingPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectExisting(player)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-primary hover:text-on-primary transition-colors active:scale-[0.97]"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      {player.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                    {player.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-xs text-on-surface-variant font-medium">or add yourself</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>
            </div>
          )}

          {/* New user name input */}
          <div>
            {(!existingPlayers || existingPlayers.length === 0) && (
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                Your Name
              </label>
            )}
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              placeholder="How should we call you?"
              autoFocus={!existingPlayers || existingPlayers.length === 0}
              className="w-full bg-surface-container-highest p-4 rounded-[0.75rem] text-on-surface font-medium text-lg outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline"
            />
          </div>
          <button
            onClick={handleNext}
            disabled={!name.trim()}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {step === 'league' && (
        <div className="w-full max-w-sm space-y-6">
          <div className="bg-surface-container-low p-4 rounded-[1.5rem] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
              {name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span className="font-bold text-on-surface">{name.trim()}</span>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
              Name Your League
            </label>
            <input
              type="text"
              value={leagueName}
              onChange={e => setLeagueName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Monday Crew, Office League..."
              autoFocus
              className="w-full bg-surface-container-highest p-4 rounded-[0.75rem] text-on-surface font-medium text-lg outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline"
            />
            <p className="text-xs text-on-surface-variant mt-2">
              You can add players and create more leagues later.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('name')}
              className="px-6 py-4 rounded-full font-bold uppercase tracking-widest text-sm text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!leagueName.trim()}
              className="flex-1 bg-primary text-on-primary py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Let's Go
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
