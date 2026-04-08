interface StreakCardProps {
  streak: number;
}

export default function StreakCard({ streak }: StreakCardProps) {
  const isPositive = streak > 0;
  const displayStreak = Math.abs(streak);

  return (
    <div className={`p-5 rounded-[1.5rem] flex flex-col justify-between shadow-[0_0_32px_rgba(0,0,0,0.03)] transform -rotate-[2deg] ${
      isPositive
        ? 'bg-tertiary-container'
        : 'bg-surface-container-high'
    }`}>
      <span className={`text-[10px] font-bold uppercase tracking-widest block mb-4 ${
        isPositive ? 'text-on-tertiary-container' : 'text-on-surface-variant'
      }`}>
        {isPositive ? 'Hot Streak' : 'Current Form'}
      </span>
      <div className="flex items-center gap-3">
        <span
          className={`material-symbols-outlined text-4xl ${
            isPositive ? 'text-on-tertiary-container' : 'text-on-surface-variant'
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isPositive ? 'local_fire_department' : 'ac_unit'}
        </span>
        <div className={`text-4xl font-extrabold font-[family-name:var(--font-headline)] leading-none ${
          isPositive ? 'text-on-tertiary-container' : 'text-on-surface-variant'
        }`}>
          {displayStreak}
        </div>
      </div>
      <span className={`mt-4 text-[10px] font-bold opacity-80 uppercase ${
        isPositive ? 'text-on-tertiary-container' : 'text-on-surface-variant'
      }`}>
        {isPositive ? 'Matches unbeaten' : 'Losses in a row'}
      </span>
    </div>
  );
}
