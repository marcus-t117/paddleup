'use client';

import { useState, useEffect } from 'react';
import { LeagueProvider } from '@/contexts/league-context';
import { isInitialized } from '@/lib/storage';
import SetupScreen from '@/components/setup-screen';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    setReady(isInitialized());
  }, []);

  // Still checking localStorage (SSR or first render)
  if (ready === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!ready) {
    return <SetupScreen onComplete={() => setReady(true)} />;
  }

  return (
    <LeagueProvider>
      {children}
    </LeagueProvider>
  );
}
