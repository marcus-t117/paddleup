'use client';

import { getBadgeById } from '@/lib/badges';

interface BadgeUnlockCardProps {
  badgeId: string;
}

export default function BadgeUnlockCard({ badgeId }: BadgeUnlockCardProps) {
  const badge = getBadgeById(badgeId);
  if (!badge) return null;

  return (
    <div className="bg-tertiary-container p-5 rounded-[1.5rem] flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-tertiary/20 flex items-center justify-center text-on-tertiary-container">
        <span className="material-symbols-outlined text-2xl icon-filled">military_tech</span>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-on-tertiary-container uppercase tracking-wide text-sm">Level Up!</h3>
        <p className="text-on-tertiary-container/80 text-xs font-medium">
          You just unlocked the &ldquo;{badge.name}&rdquo; badge. {badge.description}.
        </p>
      </div>
    </div>
  );
}
