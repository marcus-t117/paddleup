'use client';

import { useState } from 'react';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export default function AddPlayerModal({ isOpen, onClose, onAdd }: AddPlayerModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-[2rem] p-6 pb-10 shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold font-[family-name:var(--font-headline)] tracking-tight">
            Add Player
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
              Player Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter player name..."
              autoFocus
              className="w-full bg-surface-container-highest p-4 rounded-[0.75rem] text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-outline"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add to League
          </button>
        </form>
      </div>
    </div>
  );
}
