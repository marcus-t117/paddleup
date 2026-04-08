'use client';

import { LeagueProvider } from '@/contexts/league-context';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LeagueProvider>
      {children}
    </LeagueProvider>
  );
}
