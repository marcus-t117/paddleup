'use client';

import { useState } from 'react';

interface SetupScreenProps {
  onComplete: () => void;
}

export default function SetupScreen({ onComplete }: SetupScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [leagueName, setLeagueName] = useState('');

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
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

      {step === 1 && (
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
        </div>
      )}

      {step === 2 && (
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
              onClick={() => setStep(1)}
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
