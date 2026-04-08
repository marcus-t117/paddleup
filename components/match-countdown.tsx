'use client';

import { useState, useEffect } from 'react';
import { getInitials, getAvatarColour } from '@/lib/utils';

export default function MatchCountdown() {
  const [time, setTime] = useState({ hours: 2, minutes: 14, seconds: 45 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) return { hours: 0, minutes: 0, seconds: 0 };
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="relative bg-inverse-surface rounded-[2rem] p-6 text-surface overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold font-[family-name:var(--font-headline)] mb-1 text-primary-fixed">
            UPCOMING MATCH
          </h2>
          <p className="text-surface-variant text-sm font-medium">Central Park Court #4</p>
        </div>
        <div className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-bold font-[family-name:var(--font-headline)]">
          PRO LEAGUE
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold border-2 border-primary-fixed"
            style={{ backgroundColor: getAvatarColour('Marcus T.'), color: '#d9ffad' }}
          >
            {getInitials('Marcus T.')}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight text-surface-variant">You</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-primary-fixed font-black italic text-2xl font-[family-name:var(--font-headline)] tracking-tighter">VS</span>
          <div className="mt-2 bg-surface/10 px-4 py-2 rounded-[1rem] text-center">
            <span className="block text-2xl font-black font-[family-name:var(--font-headline)] tabular-nums text-surface-bright">
              {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-surface-variant">Starts In</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold border-2 border-error"
            style={{ backgroundColor: getAvatarColour('Sarah K.'), color: '#ffefec' }}
          >
            {getInitials('Sarah K.')}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight text-surface-variant">Sarah K.</span>
        </div>
      </div>

      <button className="w-full bg-primary-fixed text-on-primary-fixed py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity active:scale-[0.98]">
        Check-in to Match
      </button>

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-bl from-primary-fixed/40 to-transparent" />
      </div>
    </div>
  );
}
