'use client';

import { useState } from 'react';
import { generateSyncCode, setSyncCode, pullFromServer } from '@/lib/sync';

interface SetupScreenProps {
  onComplete: () => void;
}

export default function SetupScreen({ onComplete }: SetupScreenProps) {
  const [step, setStep] = useState<'name' | 'league' | 'restore'>('name');
  const [name, setName] = useState('');
  const [leagueName, setLeagueName] = useState('');
  const [restoreCode, setRestoreCode] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const [restoring, setRestoring] = useState(false);

  const handleNext = () => {
    if (step === 'name' && name.trim()) {
      setStep('league');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !leagueName.trim()) return;

    const { initializeWithSetup } = await import('@/lib/storage');
    initializeWithSetup(name.trim(), leagueName.trim());

    // Generate and store a sync code, then push initial state
    const code = generateSyncCode();
    setSyncCode(code);
    const { pushToServer } = await import('@/lib/sync');
    pushToServer();

    onComplete();
  };

  const handleRestore = async () => {
    const code = restoreCode.trim().toUpperCase();
    if (code.length < 4) {
      setRestoreError('Code must be at least 4 characters');
      return;
    }
    setRestoring(true);
    setRestoreError('');

    const success = await pullFromServer(code);
    if (success) {
      onComplete();
    } else {
      setRestoreError('No data found for that code. Check and try again.');
      setRestoring(false);
    }
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
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              placeholder="How should we call you?"
              autoFocus
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

          <div className="text-center pt-2">
            <button
              onClick={() => setStep('restore')}
              className="text-primary text-sm font-bold uppercase tracking-widest hover:opacity-80"
            >
              Restore from sync code
            </button>
          </div>
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

      {step === 'restore' && (
        <div className="w-full max-w-sm space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
              Sync Code
            </label>
            <input
              type="text"
              value={restoreCode}
              onChange={e => { setRestoreCode(e.target.value.toUpperCase()); setRestoreError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleRestore()}
              placeholder="Enter your 6-character code"
              autoFocus
              maxLength={6}
              className="w-full bg-surface-container-highest p-4 rounded-[0.75rem] text-on-surface font-medium text-lg text-center tracking-[0.3em] uppercase outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline placeholder:tracking-normal placeholder:text-sm"
            />
            {restoreError && (
              <p className="text-error text-xs mt-2 font-medium">{restoreError}</p>
            )}
            <p className="text-xs text-on-surface-variant mt-2">
              Find this in Settings on your original device.
            </p>
          </div>

          <button
            onClick={handleRestore}
            disabled={restoreCode.trim().length < 4 || restoring}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {restoring ? 'Restoring...' : 'Restore Data'}
          </button>

          <div className="text-center">
            <button
              onClick={() => setStep('name')}
              className="text-on-surface-variant text-sm font-bold uppercase tracking-widest hover:opacity-80"
            >
              Start fresh instead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
