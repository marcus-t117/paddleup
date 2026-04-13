'use client';

import { useState } from 'react';
import { resetAll } from '@/lib/storage';
import { getSyncCode, clearSyncCode } from '@/lib/sync';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [copied, setCopied] = useState(false);
  const syncCode = isOpen ? getSyncCode() : null;

  if (!isOpen) return null;

  const handleReset = () => {
    clearSyncCode();
    resetAll();
    window.location.reload();
  };

  const handleCopy = async () => {
    if (!syncCode) return;
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
    }
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
          {/* Sync Code */}
          {syncCode && (
            <div className="p-4 rounded-[1rem] bg-surface-container-low">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Sync Code
                </span>
                <button
                  onClick={handleCopy}
                  className="text-primary text-xs font-bold uppercase tracking-widest hover:opacity-80"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-2xl font-black tracking-[0.3em] text-on-surface font-[family-name:var(--font-headline)] text-center">
                {syncCode}
              </p>
              <p className="text-xs text-on-surface-variant mt-2 text-center">
                Use this code to restore your data if you clear your browser or switch devices.
              </p>
            </div>
          )}

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
