'use client';

import { useState } from 'react';
import { resetAll } from '@/lib/storage';
import { mergePlayers } from '@/lib/player-merge';
import { backfillBadges } from '@/lib/badge-backfill';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [mergeFrom, setMergeFrom] = useState('');
  const [mergeTo, setMergeTo] = useState('');
  const [mergeResult, setMergeResult] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);
  const [backfilling, setBackfilling] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    resetAll();
    window.location.reload();
  };

  const handleMerge = () => {
    if (!mergeFrom.trim() || !mergeTo.trim()) return;
    setMerging(true);
    const result = mergePlayers(mergeFrom.trim(), mergeTo.trim());
    setMergeResult(result);
    setMerging(false);

    if (result.includes('Merged')) {
      // Give the push a moment to land before reloading
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleBackfill = () => {
    setBackfilling(true);
    const result = backfillBadges();
    setBackfillResult(result.message);
    setBackfilling(false);
    if (result.totalAwarded > 0) {
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-[2rem] p-6 pb-10 shadow-[0_-8px_32px_rgba(0,0,0,0.1)] max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold font-[family-name:var(--font-headline)] tracking-tight">
            Settings
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Merge Players */}
          <div className="p-4 rounded-[1rem] bg-surface-container-low space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">merge</span>
              <div>
                <span className="font-bold block text-sm">Merge Players</span>
                <span className="text-xs text-on-surface-variant">Re-attribute all games from one player to another</span>
              </div>
            </div>
            {mergeResult ? (
              <p className={`text-sm font-medium p-3 rounded-[0.75rem] ${
                mergeResult.includes('Merged')
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-error/10 text-error'
              }`}>
                {mergeResult}
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={mergeFrom}
                    onChange={e => setMergeFrom(e.target.value)}
                    placeholder="Existing player name (e.g. Alex)"
                    className="w-full bg-surface-container-highest p-3 rounded-[0.75rem] text-on-surface text-sm font-medium outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline"
                  />
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <div className="flex-1 h-px bg-surface-container-highest" />
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    <div className="flex-1 h-px bg-surface-container-highest" />
                  </div>
                  <input
                    type="text"
                    value={mergeTo}
                    onChange={e => setMergeTo(e.target.value)}
                    placeholder="Merge into (e.g. Alex N)"
                    className="w-full bg-surface-container-highest p-3 rounded-[0.75rem] text-on-surface text-sm font-medium outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline"
                  />
                </div>
                <button
                  onClick={handleMerge}
                  disabled={!mergeFrom.trim() || !mergeTo.trim() || merging}
                  className="w-full py-3 rounded-full font-bold text-sm uppercase tracking-widest bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Merge
                </button>
              </>
            )}
          </div>

          {/* Backfill Badges */}
          <div className="p-4 rounded-[1rem] bg-surface-container-low space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">workspace_premium</span>
              <div>
                <span className="font-bold block text-sm">Backfill Badges</span>
                <span className="text-xs text-on-surface-variant">Award badges retroactively for past games (all players, all leagues)</span>
              </div>
            </div>
            {backfillResult ? (
              <p className={`text-sm font-medium p-3 rounded-[0.75rem] ${
                backfillResult.includes('Awarded')
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {backfillResult}
              </p>
            ) : (
              <button
                onClick={handleBackfill}
                disabled={backfilling}
                className="w-full py-3 rounded-full font-bold text-sm uppercase tracking-widest bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {backfilling ? 'Working...' : 'Run Backfill'}
              </button>
            )}
          </div>

          {/* Reset */}
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center gap-3 p-4 rounded-[1rem] bg-error/10 text-error hover:bg-error/20 transition-colors"
            >
              <span className="material-symbols-outlined">delete_forever</span>
              <div className="text-left">
                <span className="font-bold block">Reset All Data</span>
                <span className="text-xs opacity-70">Clear all players, games, and leagues</span>
              </div>
            </button>
          ) : (
            <div className="p-4 rounded-[1rem] bg-error/10 space-y-3">
              <p className="text-error font-bold text-sm">
                This will delete all your data. Are you sure?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-3 rounded-full font-bold text-sm uppercase tracking-widest bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-full font-bold text-sm uppercase tracking-widest bg-error text-on-error hover:opacity-90 transition-opacity"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
