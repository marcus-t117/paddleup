'use client';

import { useState } from 'react';
import { resetAll } from '@/lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    resetAll();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-[2rem] p-6 pb-10 shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold font-[family-name:var(--font-headline)] tracking-tight">
            Settings
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
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
